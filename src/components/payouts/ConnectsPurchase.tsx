import { useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MIN_CONNECTS_PURCHASE_USD = 13;
const MAX_CONNECTS_PURCHASE_USD = 100;

const PRESET_AMOUNTS = [13, 26, 50, 100];

export const ConnectsPurchase = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>(String(MIN_CONNECTS_PURCHASE_USD));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const parsedAmount = Number(amount);
  const isValidAmount =
    Number.isFinite(parsedAmount) && parsedAmount >= MIN_CONNECTS_PURCHASE_USD && parsedAmount <= MAX_CONNECTS_PURCHASE_USD;

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in to buy Connects.');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount < MIN_CONNECTS_PURCHASE_USD || parsedAmount > MAX_CONNECTS_PURCHASE_USD) {
      toast.error(`Connects purchases must be between $${MIN_CONNECTS_PURCHASE_USD} and $${MAX_CONNECTS_PURCHASE_USD} USD.`);
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('flutterwave', {
        body: {
          action: 'initialize',
          amount: parsedAmount,
          currency: 'USD',
          email: user.email || '',
          phone: (user.user_metadata?.phone as string) || '',
          fullName:
            (user.user_metadata?.full_name as string) || user.email || 'Orbit Connect Worker',
          userId: user.id,
          redirectUrl: `${window.location.origin}/payment-callback`,
        },
      });

      if (error) throw error;

      if (!data?.paymentLink) throw new Error('Payment link unavailable');

      setIsRedirecting(true);
      window.location.href = data.paymentLink;
    } catch (purchaseError) {
      console.error('Error starting Connects purchase:', purchaseError);
      toast.error('Could not start the Connects purchase. Please try again.');
      setIsProcessing(false);
      setIsRedirecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Buy Connects
        </CardTitle>
        <CardDescription>
          Purchase Connects to apply for jobs. Minimum purchase is $13 USD, maximum is $100 USD.
          Purchases are refundable within 45 days if you are not hired.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="connects-amount" className="text-sm font-medium">
            Amount (USD)
          </label>
          <input
            id="connects-amount"
            type="number"
            min={MIN_CONNECTS_PURCHASE_USD}
            max={MAX_CONNECTS_PURCHASE_USD}
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={Number(amount) === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAmount(String(preset))}
              >
                ${preset}
              </Button>
            ))}
          </div>
          {!isValidAmount && (
            <p className="text-sm text-destructive">
              Connects purchases must be between ${MIN_CONNECTS_PURCHASE_USD} and ${MAX_CONNECTS_PURCHASE_USD} USD.
            </p>
          )}
        </div>

        <Button
          className="w-full"
          onClick={handlePurchase}
          disabled={isProcessing || !isValidAmount || isRedirecting}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting payment...
            </>
          ) : (
            <>Proceed to payment · ${Number(amount) > 0 ? Number(amount) : MIN_CONNECTS_PURCHASE_USD}</>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Refunds: if you are not hired within 45 days of purchase, the Connects purchase is refundable. Purchases made
          after a hire are non-refundable.
        </p>
      </CardContent>
    </Card>
  );
};

export default ConnectsPurchase;
