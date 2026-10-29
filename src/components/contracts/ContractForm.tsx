import { useMemo, useState } from 'react';
import { FileSignature, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatMoney, formatPayType, payoutCurrencyOptions, type PayType } from '@/config/payouts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ContractProposal {
  id: string;
  job_id: string;
  freelancer_id: string;
  title: string;
  proposed_fee: number;
  jobs?: { title: string; country: string } | null;
}

export interface ContractFormProps {
  proposal: ContractProposal;
  onCreated?: (contractId: string) => void;
  onCancel?: () => void;
  className?: string;
}

const defaultTerms = `1. Scope of work
The freelancer will deliver the services described in this contract to a professional standard.

2. Payment
The worker will be paid according to the pay type and rate stated above. Hourly contracts may request a withdrawal once every 7 days. Fixed-rate contracts may request a withdrawal at any time, up to the remaining contract value.

3. Payout method
The worker must save a mobile money, bank transfer, or PayPal payout method before signing this contract.

4. Confidentiality
Both parties agree to keep confidential information private during and after the engagement.

5. Completion
Work is considered complete when the agreed deliverables have been provided and accepted by the employer.`;

export const ContractForm = ({
  proposal,
  onCreated,
  onCancel,
  className,
}: ContractFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(
    proposal.jobs?.title || `Contract for ${proposal.title}`,
  );
  const [payType, setPayType] = useState<PayType>('fixed');
  const [fixedAmount, setFixedAmount] = useState(String(proposal.proposed_fee ?? ''));
  const [hourlyRate, setHourlyRate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('40');
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [terms, setTerms] = useState(defaultTerms);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentSummary = useMemo(() => {
    if (payType === 'hourly') {
      const rate = Number(hourlyRate);
      return Number.isFinite(rate) && rate > 0
        ? `${formatMoney(rate, currency)}/hr`
        : 'Hourly rate not set';
    }

    const value = Number(fixedAmount);
    return Number.isFinite(value) && value > 0
      ? formatMoney(value, currency)
      : 'Fixed amount not set';
  }, [currency, fixedAmount, hourlyRate, payType]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error('Please sign in to create a contract.');
      return;
    }

    if (!title.trim()) {
      toast.error('Enter a contract title.');
      return;
    }

    if (payType === 'hourly') {
      const rate = Number(hourlyRate);
      const hours = Number(weeklyHours);
      if (!Number.isFinite(rate) || rate <= 0) {
        toast.error('Enter a valid hourly rate.');
        return;
      }
      if (!Number.isFinite(hours) || hours <= 0) {
        toast.error('Enter valid weekly hours.');
        return;
      }
    } else {
      const value = Number(fixedAmount);
      if (!Number.isFinite(value) || value <= 0) {
        toast.error('Enter a valid fixed contract amount.');
        return;
      }
    }

    if (endDate && startDate && endDate < startDate) {
      toast.error('The end date must be after the start date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('contracts')
        .insert({
          proposal_id: proposal.id,
          job_id: proposal.job_id,
          employer_id: user.id,
          worker_id: proposal.freelancer_id,
          title: title.trim(),
          description: proposal.title,
          terms: terms.trim() || null,
          pay_type: payType,
          hourly_rate: payType === 'hourly' ? Number(hourlyRate) : null,
          fixed_amount: payType === 'fixed' ? Number(fixedAmount) : null,
          weekly_hours: payType === 'hourly' ? Number(weeklyHours) : null,
          currency,
          start_date: startDate || null,
          end_date: endDate || null,
          status: 'pending_signature',
        })
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('A contract already exists for this proposal.');
        }
        throw error;
      }

      // Best-effort notification; the contract is already saved.
      try {
        await supabase.from('notifications').insert({
          user_id: proposal.freelancer_id,
          title: 'Contract ready for signature',
          message: `A ${formatPayType(payType).toLowerCase()} contract "${title.trim()}" is ready. Set up your payout method and sign it from your dashboard.`,
          type: 'info',
        });
      } catch (notificationError) {
        console.error('Error notifying worker about contract:', notificationError);
      }

      toast.success('Contract created. The worker has been notified to sign.');
      onCreated?.(data.id);
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error(
        error instanceof Error ? error.message : 'Could not create the contract.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contract-title">Contract title *</Label>
          <Input
            id="contract-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Frontend development contract"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contract-pay-type">Pay type *</Label>
            <Select
              value={payType}
              onValueChange={(value) => setPayType(value as PayType)}
            >
              <SelectTrigger id="contract-pay-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed rate</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract-currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="contract-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {payoutCurrencyOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {payType === 'fixed' ? (
          <div className="space-y-2">
            <Label htmlFor="contract-fixed-amount">Contract amount *</Label>
            <Input
              id="contract-fixed-amount"
              type="number"
              min="0"
              step="0.01"
              value={fixedAmount}
              onChange={(event) => setFixedAmount(event.target.value)}
              required
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract-hourly-rate">Hourly rate *</Label>
              <Input
                id="contract-hourly-rate"
                type="number"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={(event) => setHourlyRate(event.target.value)}
                placeholder="e.g. 25"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-weekly-hours">Weekly hours *</Label>
              <Input
                id="contract-weekly-hours"
                type="number"
                min="1"
                step="0.5"
                value={weeklyHours}
                onChange={(event) => setWeeklyHours(event.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contract-start">Start date</Label>
            <Input
              id="contract-start"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract-end">End date</Label>
            <Input
              id="contract-end"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contract-terms">Contract terms</Label>
          <Textarea
            id="contract-terms"
            value={terms}
            onChange={(event) => setTerms(event.target.value)}
            rows={8}
          />
        </div>

        <div className="flex gap-2 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
          <FileSignature className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            The worker will review and sign this contract. They must save a payout method
            first. Pay summary: <strong>{paymentSummary}</strong>.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSignature className="mr-2 h-4 w-4" />
            )}
            Create contract
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ContractForm;
