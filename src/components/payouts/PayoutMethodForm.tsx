import { useEffect, useState } from 'react';
import { Loader2, Save, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  payoutCurrencyOptions,
  payoutMethodOptions,
  type PayoutMethodValue,
} from '@/config/payouts';
import type { Database } from '@/integrations/supabase/types';
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

export type WorkerPayoutMethod =
  Database['public']['Tables']['worker_payout_methods']['Row'];

export interface PayoutMethodFormProps {
  initial?: WorkerPayoutMethod | null;
  onSaved?: (method: WorkerPayoutMethod) => void;
  onCancel?: () => void;
  className?: string;
}

const emptyForm = {
  method: 'mobile_money' as PayoutMethodValue,
  accountName: '',
  accountNumber: '',
  mobileNetwork: '',
  bankName: '',
  routingNumber: '',
  paypalEmail: '',
  country: '',
  currency: 'USD',
};

export const PayoutMethodForm = ({
  initial,
  onSaved,
  onCancel,
  className,
}: PayoutMethodFormProps) => {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!initial) {
      setForm(emptyForm);
      return;
    }

    setForm({
      method: initial.method,
      accountName: initial.account_name || '',
      accountNumber: initial.account_number || '',
      mobileNetwork: initial.mobile_network || '',
      bankName: initial.bank_name || '',
      routingNumber: initial.routing_number || '',
      paypalEmail: initial.paypal_email || '',
      country: initial.country || '',
      currency: initial.currency || 'USD',
    });
  }, [initial]);

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error('Please sign in to save a payout method.');
      return;
    }

    if (!form.accountName.trim()) {
      toast.error('Enter the name on the payout account.');
      return;
    }

    if (form.method === 'mobile_money') {
      if (!form.mobileNetwork.trim() || !form.accountNumber.trim()) {
        toast.error('Enter the mobile network and phone number.');
        return;
      }
    }

    if (form.method === 'bank_transfer') {
      if (!form.bankName.trim() || !form.accountNumber.trim()) {
        toast.error('Enter the bank name and account number.');
        return;
      }
    }

    if (form.method === 'paypal') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.paypalEmail.trim())) {
        toast.error('Enter a valid PayPal email address.');
        return;
      }
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('worker_payout_methods')
        .upsert(
          {
            user_id: user.id,
            method: form.method,
            account_name: form.accountName.trim(),
            account_number:
              form.method === 'paypal' ? null : form.accountNumber.trim() || null,
            mobile_network:
              form.method === 'mobile_money' ? form.mobileNetwork.trim() : null,
            bank_name: form.method === 'bank_transfer' ? form.bankName.trim() : null,
            routing_number:
              form.method === 'bank_transfer' ? form.routingNumber.trim() || null : null,
            paypal_email:
              form.method === 'paypal' ? form.paypalEmail.trim() : null,
            country: form.country.trim() || null,
            currency: form.currency,
          },
          { onConflict: 'user_id' },
        )
        .select('*')
        .single();

      if (error) throw error;

      toast.success('Payout method saved.');
      onSaved?.(data as WorkerPayoutMethod);
    } catch (error) {
      console.error('Error saving payout method:', error);
      toast.error(
        error instanceof Error ? error.message : 'Could not save your payout method.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <div className="flex gap-2 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
          <Wallet className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            This is where Orbit Connect will send your earnings. You must save a payout
            method before signing a work contract.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payout-method">Payout method *</Label>
          <Select
            value={form.method}
            onValueChange={(value) => updateField('method', value as PayoutMethodValue)}
          >
            <SelectTrigger id="payout-method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {payoutMethodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payout-account-name">Account holder name *</Label>
          <Input
            id="payout-account-name"
            value={form.accountName}
            onChange={(event) => updateField('accountName', event.target.value)}
            placeholder="Full name on the account"
            required
          />
        </div>

        {form.method === 'mobile_money' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payout-network">Mobile network *</Label>
              <Input
                id="payout-network"
                value={form.mobileNetwork}
                onChange={(event) => updateField('mobileNetwork', event.target.value)}
                placeholder="e.g. M-Pesa"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-phone">Phone number *</Label>
              <Input
                id="payout-phone"
                value={form.accountNumber}
                onChange={(event) => updateField('accountNumber', event.target.value)}
                placeholder="e.g. +254 700 000 000"
                required
              />
            </div>
          </div>
        )}

        {form.method === 'bank_transfer' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="payout-bank-name">Bank name *</Label>
              <Input
                id="payout-bank-name"
                value={form.bankName}
                onChange={(event) => updateField('bankName', event.target.value)}
                placeholder="e.g. Equity Bank"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payout-account-number">Account number *</Label>
                <Input
                  id="payout-account-number"
                  value={form.accountNumber}
                  onChange={(event) => updateField('accountNumber', event.target.value)}
                  placeholder="Bank account number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payout-routing">Routing / SWIFT code</Label>
                <Input
                  id="payout-routing"
                  value={form.routingNumber}
                  onChange={(event) => updateField('routingNumber', event.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </>
        )}

        {form.method === 'paypal' && (
          <div className="space-y-2">
            <Label htmlFor="payout-paypal">PayPal email *</Label>
            <Input
              id="payout-paypal"
              type="email"
              value={form.paypalEmail}
              onChange={(event) => updateField('paypalEmail', event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="payout-country">Country</Label>
            <Input
              id="payout-country"
              value={form.country}
              onChange={(event) => updateField('country', event.target.value)}
              placeholder="e.g. Kenya"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payout-currency">Currency</Label>
            <Select
              value={form.currency}
              onValueChange={(value) => updateField('currency', value)}
            >
              <SelectTrigger id="payout-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {payoutCurrencyOptions.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save payout method
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PayoutMethodForm;
