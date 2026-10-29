import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarClock, Loader2, Send, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  formatMoney,
  formatPayType,
  formatPayoutMethodSummary,
  getAccruedEarnings,
  getWithdrawalAvailability,
} from '@/config/payouts';
import type { Database } from '@/integrations/supabase/types';
import type { WorkerPayoutMethod } from '@/components/payouts/PayoutMethodForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Contract = Database['public']['Tables']['contracts']['Row'];
type WithdrawalRequest = Database['public']['Tables']['withdrawal_requests']['Row'];

export interface WithdrawalRequestFormProps {
  contracts: Contract[];
  payoutMethod: WorkerPayoutMethod;
  withdrawals: WithdrawalRequest[];
  onSubmitted?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const WithdrawalRequestForm = ({
  contracts,
  payoutMethod,
  withdrawals,
  onSubmitted,
  onCancel,
  className,
}: WithdrawalRequestFormProps) => {
  const { user } = useAuth();
  const eligibleContracts = useMemo(
    () =>
      contracts.filter((contract) =>
        ['signed', 'active', 'completed'].includes(contract.status),
      ),
    [contracts],
  );
  const [selectedContractId, setSelectedContractId] = useState(
    eligibleContracts[0]?.id || '',
  );
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedContract = eligibleContracts.find(
    (contract) => contract.id === selectedContractId,
  );

  const contractWithdrawals = useMemo(
    () =>
      withdrawals
        .filter((withdrawal) => withdrawal.contract_id === selectedContractId)
        .sort(
          (a, b) =>
            new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime(),
        ),
    [selectedContractId, withdrawals],
  );

  const lastRequest = contractWithdrawals.find(
    (withdrawal) => withdrawal.status !== 'rejected',
  );

  const availability = selectedContract
    ? getWithdrawalAvailability(selectedContract.pay_type, lastRequest?.requested_at)
    : { allowed: false, nextAvailableAt: null };

  const remainingFixedBalance = useMemo(() => {
    if (!selectedContract || selectedContract.pay_type !== 'fixed') return null;

    const requested = contractWithdrawals
      .filter((withdrawal) => withdrawal.status !== 'rejected')
      .reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);

    return Math.max(Number(selectedContract.fixed_amount || 0) - requested, 0);
  }, [contractWithdrawals, selectedContract]);

  const accruedEarnings = selectedContract ? getAccruedEarnings(selectedContract) : 0;

  const maxWithdrawal = selectedContract
    ? selectedContract.pay_type === 'hourly'
      ? accruedEarnings
      : remainingFixedBalance
    : null;

  useEffect(() => {
    setAmount('');
  }, [selectedContractId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error('Please sign in to request a withdrawal.');
      return;
    }

    if (!selectedContract) {
      toast.error('Select a signed contract.');
      return;
    }

    if (!availability.allowed) {
      toast.error(
        availability.nextAvailableAt
          ? `Hourly withdrawals are available again on ${availability.nextAvailableAt.toLocaleDateString()}.`
          : 'This withdrawal is not available yet.',
      );
      return;
    }

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Enter a withdrawal amount greater than zero.');
      return;
    }

    if (maxWithdrawal !== null && value > maxWithdrawal) {
      toast.error(`You can withdraw at most ${formatMoney(maxWithdrawal, selectedContract.currency)}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('withdrawal_requests').insert({
        user_id: user.id,
        contract_id: selectedContract.id,
        amount: value,
        currency: selectedContract.currency,
        method: payoutMethod.method,
        payout_details: {
          account_name: payoutMethod.account_name,
          account_number: payoutMethod.account_number,
          mobile_network: payoutMethod.mobile_network,
          bank_name: payoutMethod.bank_name,
          routing_number: payoutMethod.routing_number,
          paypal_email: payoutMethod.paypal_email,
          country: payoutMethod.country,
        },
      });

      if (error) throw error;

      toast.success('Withdrawal request submitted. Staff will review it shortly.');
      setAmount('');
      onSubmitted?.();
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      toast.error(
        error instanceof Error ? error.message : 'Could not submit the withdrawal request.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (eligibleContracts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 rounded-xl border bg-muted/40 p-3 text-sm text-muted-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            You need a signed contract before requesting a withdrawal. Contracts appear
            here once an employer creates one for you.
          </p>
        </div>
        {onCancel && (
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Close
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="withdrawal-contract">Contract *</Label>
          <Select value={selectedContractId} onValueChange={setSelectedContractId}>
            <SelectTrigger id="withdrawal-contract">
              <SelectValue placeholder="Select a contract" />
            </SelectTrigger>
            <SelectContent>
              {eligibleContracts.map((contract) => (
                <SelectItem key={contract.id} value={contract.id}>
                  {contract.title} · {formatPayType(contract.pay_type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedContract && (
          <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Pay type
              </p>
              <p className="font-medium">{formatPayType(selectedContract.pay_type)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {selectedContract.pay_type === 'hourly' ? 'Hourly rate' : 'Contract value'}
              </p>
              <p className="font-medium">
                {formatMoney(
                  Number(
                    selectedContract.pay_type === 'hourly'
                      ? selectedContract.hourly_rate || 0
                      : selectedContract.fixed_amount || 0,
                  ),
                  selectedContract.currency,
                )}
                {selectedContract.pay_type === 'hourly' ? '/hr' : ''}
              </p>
            </div>
            {selectedContract.pay_type === 'hourly' && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Accrued earnings
                </p>
                <p className="font-medium">
                  {formatMoney(accruedEarnings, selectedContract.currency)}
                </p>
              </div>
            )}
            {remainingFixedBalance !== null && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Remaining balance
                </p>
                <p className="font-medium">
                  {formatMoney(remainingFixedBalance, selectedContract.currency)}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Schedule
              </p>
              <p className="font-medium">
                {selectedContract.pay_type === 'hourly'
                  ? 'Once every 7 days'
                  : 'Any time'}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {selectedContract?.pay_type === 'hourly'
              ? 'Hourly contracts can request a withdrawal once every 7 days.'
              : 'Fixed-rate contracts can request a withdrawal at any time, up to the remaining contract balance.'}
          </p>
        </div>

        {!availability.allowed && availability.nextAvailableAt && (
          <div className="flex gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Next withdrawal available on{' '}
              <strong>{availability.nextAvailableAt.toLocaleDateString()}</strong>.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="withdrawal-amount">Amount ({selectedContract?.currency || payoutMethod.currency}) *</Label>
          <Input
            id="withdrawal-amount"
            type="number"
            min="0"
            step="0.01"
            max={maxWithdrawal ?? undefined}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="rounded-xl border p-3 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <Wallet className="h-4 w-4" />
            {formatPayoutMethodSummary(payoutMethod)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {payoutMethod.account_name} · {payoutMethod.currency}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !availability.allowed || eligibleContracts.length === 0}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Request withdrawal
          </Button>
        </div>
      </div>
    </form>
  );
};

export default WithdrawalRequestForm;
