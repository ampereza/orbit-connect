import type { Database } from '@/integrations/supabase/types';

export type PayoutMethodValue = Database['public']['Enums']['payout_method'];
export type PayType = Database['public']['Enums']['pay_type'];

export interface PayoutMethodOption {
  value: PayoutMethodValue;
  label: string;
  description: string;
}

export const payoutMethodOptions: PayoutMethodOption[] = [
  {
    value: 'mobile_money',
    label: 'Mobile money',
    description: 'M-Pesa, MTN Mobile Money, Airtel Money, Orange Money',
  },
  {
    value: 'bank_transfer',
    label: 'Bank transfer',
    description: 'Local bank account or international transfer',
  },
  {
    value: 'paypal',
    label: 'PayPal',
    description: 'Receive funds to your PayPal account',
  },
];

export const payoutMethodLabels: Record<PayoutMethodValue, string> = {
  mobile_money: 'Mobile money',
  bank_transfer: 'Bank transfer',
  paypal: 'PayPal',
};

export const payoutCurrencyOptions = [
  'USD',
  'EUR',
  'GBP',
  'KES',
  'UGX',
  'TZS',
  'RWF',
  'NGN',
  'ZAR',
];

export const hourlyWithdrawalIntervalDays = 7;

export const formatPayType = (payType: PayType) =>
  payType === 'hourly' ? 'Hourly' : 'Fixed rate';

export const formatMoney = (value: number, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Non-standard currencies (e.g. "Connects") are not valid ISO 4217 codes,
    // so fall back to a plain number format instead of crashing.
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  }
};

export interface WithdrawalAvailability {
  allowed: boolean;
  nextAvailableAt: Date | null;
}

/**
 * Hourly contracts may request one withdrawal every 7 days. Fixed-rate
 * contracts can request a withdrawal at any time.
 */
export const getWithdrawalAvailability = (
  payType: PayType,
  lastRequestAt: string | null | undefined,
  now: Date = new Date(),
): WithdrawalAvailability => {
  if (payType !== 'hourly' || !lastRequestAt) {
    return { allowed: true, nextAvailableAt: null };
  }

  const nextAvailableAt = new Date(lastRequestAt);
  nextAvailableAt.setDate(nextAvailableAt.getDate() + hourlyWithdrawalIntervalDays);

  return {
    allowed: now.getTime() >= nextAvailableAt.getTime(),
    nextAvailableAt,
  };
};

export interface AccruedEarningsInput {
  pay_type: PayType;
  hourly_rate?: number | null;
  weekly_hours?: number | null;
  fixed_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  signed_at?: string | null;
}

/**
 * Accrued earnings for a contract. Hourly contracts accrue
 * (hourly_rate * weekly_hours) for every full week since the contract
 * started (falling back to the signing date). Fixed-rate contracts accrue
 * their full value.
 */
export const getAccruedEarnings = (contract: AccruedEarningsInput): number => {
  if (contract.pay_type === 'hourly') {
    const rate = Number(contract.hourly_rate ?? 0);
    const hours = Number(contract.weekly_hours ?? 0);
    const start = contract.start_date
      ? new Date(contract.start_date)
      : contract.signed_at
        ? new Date(contract.signed_at)
        : new Date();
    const end = contract.end_date ? new Date(contract.end_date) : new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const elapsedWeeks = Math.max(0, (end.getTime() - start.getTime()) / msPerWeek);
    const accrued = rate * hours * Math.floor(elapsedWeeks);
    return Math.max(0, accrued);
  }

  return Number(contract.fixed_amount ?? 0);
};

export const formatPayoutMethodSummary = (method: {
  method: PayoutMethodValue;
  account_name: string;
  account_number: string | null;
  mobile_network: string | null;
  bank_name: string | null;
  paypal_email: string | null;
  currency: string;
}) => {
  switch (method.method) {
    case 'mobile_money':
      return `${method.mobile_network || 'Mobile money'} · ${method.account_number || ''}`.trim();
    case 'bank_transfer':
      return `${method.bank_name || 'Bank'} · ${method.account_number || ''}`.trim();
    case 'paypal':
      return method.paypal_email || 'PayPal account';
    default:
      return method.account_name;
  }
};
