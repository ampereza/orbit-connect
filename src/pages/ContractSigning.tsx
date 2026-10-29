import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileSignature,
  Loader2,
  Printer,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  formatMoney,
  formatPayType,
  formatPayoutMethodSummary,
} from '@/config/payouts';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PayoutMethodForm, type WorkerPayoutMethod } from '@/components/payouts/PayoutMethodForm';

type Contract = Database['public']['Tables']['contracts']['Row'];
type ContractStatus = Database['public']['Enums']['contract_status'];

const statusColors: Record<ContractStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_signature: 'bg-amber-500/15 text-amber-700',
  signed: 'bg-green-500/15 text-green-700',
  active: 'bg-blue-500/15 text-blue-700',
  completed: 'bg-primary/15 text-primary',
  cancelled: 'bg-destructive/15 text-destructive',
};

const formatStatus = (status: ContractStatus) => status.replace(/_/g, ' ');

const ContractSigning = () => {
  const { id } = useParams();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<WorkerPayoutMethod | null>(null);
  const [employerName, setEmployerName] = useState('Employer');
  const [workerName, setWorkerName] = useState('Worker');
  const [signatureName, setSignatureName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?redirect=/contracts/${id}/sign`);
    }
  }, [authLoading, id, navigate, user]);

  useEffect(() => {
    if (user && id) {
      fetchContract();
    }
  }, [user, id]);

  const fetchContract = async () => {
    if (!user || !id) return;

    setLoading(true);
    setNotFound(false);

    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
        return;
      }

      const contractRow = data as Contract;

      const canView =
        isAdmin ||
        contractRow.worker_id === user.id ||
        contractRow.employer_id === user.id;
      if (!canView) {
        setNotFound(true);
        return;
      }

      setContract(contractRow);

      if (contractRow.worker_id === user.id) {
        const { data: payoutRow, error: payoutError } = await supabase
          .from('worker_payout_methods')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (payoutError) throw payoutError;
        setPayoutMethod((payoutRow as WorkerPayoutMethod | null) ?? null);
      }

      const profileIds = [contractRow.employer_id, contractRow.worker_id].filter(
        Boolean,
      ) as string[];

      if (profileIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', profileIds);

        const employerProfile = (profiles || []).find(
          (profile) => profile.user_id === contractRow.employer_id,
        );
        const workerProfile = (profiles || []).find(
          (profile) => profile.user_id === contractRow.worker_id,
        );

        setEmployerName(
          employerProfile?.full_name || employerProfile?.email || 'Employer',
        );
        setWorkerName(
          workerProfile?.full_name || workerProfile?.email || 'Worker',
        );
        setSignatureName((current) => current || workerProfile?.full_name || '');
      }
    } catch (error) {
      console.error('Error loading contract:', error);
      toast.error('Could not load the contract.');
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!contract || !user) return;

    if (!payoutMethod) {
      toast.error('Save a payout method before signing the contract.');
      return;
    }

    if (!signatureName.trim()) {
      toast.error('Enter your full legal name as your signature.');
      return;
    }

    if (!agreed) {
      toast.error('Please confirm that you agree to the contract terms.');
      return;
    }

    setSigning(true);

    try {
      const { data, error } = await supabase
        .from('contracts')
        .update({
          status: 'signed',
          signature_name: signatureName.trim(),
          signed_at: new Date().toISOString(),
        })
        .eq('id', contract.id)
        .select('*')
        .single();

      if (error) throw error;

      setContract(data as Contract);
      toast.success('Contract signed successfully.');
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error(
        error instanceof Error ? error.message : 'Could not sign the contract.',
      );
    } finally {
      setSigning(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !contract) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Contract not found</CardTitle>
            <CardDescription>
              This contract does not exist or you do not have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isWorker = contract.worker_id === user?.id;
  const isSigned = ['signed', 'active', 'completed'].includes(contract.status);
  const canSign = contract.status === 'draft' || contract.status === 'pending_signature';
  const paymentAmount =
    contract.pay_type === 'hourly'
      ? `${formatMoney(Number(contract.hourly_rate || 0), contract.currency)}/hr`
      : formatMoney(Number(contract.fixed_amount || 0), contract.currency);

  return (
    <>
      <Helmet>
        <title>{contract.title} - Contract | Orbit Connect</title>
        <meta
          name="description"
          content="Review and sign your Orbit Connect work contract."
        />
      </Helmet>

      <div className="min-h-screen bg-muted/20 pb-12">
        <header className="border-b bg-card print:hidden">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">Contract</h1>
                <p className="text-xs text-muted-foreground">
                  Review the terms before signing
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </header>

        <main className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl">{contract.title}</CardTitle>
                  <CardDescription>
                    {contract.description || 'Work agreement between both parties'}
                  </CardDescription>
                </div>
                <Badge className={statusColors[contract.status]}>
                  {formatStatus(contract.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Employer
                  </p>
                  <p className="font-medium">{employerName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Worker
                  </p>
                  <p className="font-medium">{workerName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Pay
                  </p>
                  <p className="font-medium">
                    {formatPayType(contract.pay_type)} · {paymentAmount}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Schedule
                  </p>
                  <p className="font-medium">
                    {contract.pay_type === 'hourly'
                      ? 'Weekly withdrawals'
                      : 'Withdraw any time'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Start date
                  </p>
                  <p className="font-medium">
                    {contract.start_date
                      ? new Date(contract.start_date).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    End date
                  </p>
                  <p className="font-medium">
                    {contract.end_date
                      ? new Date(contract.end_date).toLocaleDateString()
                      : 'Open-ended'}
                  </p>
                </div>
                {contract.pay_type === 'hourly' && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Weekly hours
                    </p>
                    <p className="font-medium">{contract.weekly_hours || 'Not set'}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Currency
                  </p>
                  <p className="font-medium">{contract.currency}</p>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <h2 className="mb-2 flex items-center gap-2 font-semibold">
                  <FileSignature className="h-5 w-5" />
                  Terms and conditions
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {contract.terms || 'No additional terms were provided.'}
                </p>
              </div>

              <div className="flex gap-2 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  {contract.pay_type === 'hourly'
                    ? 'Hourly workers can request one withdrawal every 7 days after the contract is signed.'
                    : 'Fixed-rate workers can request a withdrawal at any time after the contract is signed, up to the remaining contract value.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {isWorker && (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Payout method
                  </CardTitle>
                  <CardDescription>
                    Required before you sign. Earnings are sent using this method.
                  </CardDescription>
                </div>
                {payoutMethod && !showPayoutForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPayoutForm(true)}
                    className="print:hidden"
                  >
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {payoutMethod && !showPayoutForm ? (
                  <div className="rounded-xl border bg-green-500/5 p-4">
                    <div className="flex items-center gap-2 font-medium text-green-700">
                      <ShieldCheck className="h-5 w-5" />
                      Payout method saved
                    </div>
                    <p className="mt-2 text-sm">
                      {formatPayoutMethodSummary(payoutMethod)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payoutMethod.account_name} · {payoutMethod.currency}
                    </p>
                  </div>
                ) : (
                  <PayoutMethodForm
                    initial={payoutMethod}
                    onSaved={(saved) => {
                      setPayoutMethod(saved);
                      setShowPayoutForm(false);
                    }}
                    onCancel={
                      payoutMethod ? () => setShowPayoutForm(false) : undefined
                    }
                  />
                )}
              </CardContent>
            </Card>
          )}

          <Card className="print:hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                {isSigned ? 'Signed contract' : 'Sign contract'}
              </CardTitle>
              <CardDescription>
                {isSigned
                  ? 'This contract has been signed and stored securely.'
                  : isWorker
                    ? 'Type your full legal name and confirm your agreement.'
                    : 'The worker must set up a payout method and sign this contract.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSigned ? (
                <div className="rounded-xl border bg-green-500/5 p-4">
                  <div className="flex items-center gap-2 font-medium text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    Signed by {contract.signature_name || workerName}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {contract.signed_at
                      ? `Signed on ${new Date(contract.signed_at).toLocaleString()}`
                      : 'Signature recorded'}
                  </p>
                </div>
              ) : isWorker && canSign ? (
                <form onSubmit={handleSign} className="space-y-4">
                  {!payoutMethod && (
                    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700">
                      Save a payout method above before signing the contract.
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signature-name">Full legal name *</Label>
                    <Input
                      id="signature-name"
                      value={signatureName}
                      onChange={(event) => setSignatureName(event.target.value)}
                      placeholder="Type your full name as your signature"
                      required
                    />
                  </div>

                  <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                    <Checkbox
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked === true)}
                      className="mt-0.5"
                    />
                    <span>
                      I have read and agree to the contract terms. I confirm that my payout
                      details are correct and that I am authorised to receive payments using
                      this method.
                    </span>
                  </label>

                  <Button
                    type="submit"
                    disabled={signing || !payoutMethod || !agreed}
                    className="w-full sm:w-auto"
                  >
                    {signing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileSignature className="mr-2 h-4 w-4" />
                    )}
                    Sign contract
                  </Button>
                </form>
              ) : (
                <div className="flex gap-2 rounded-xl border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    {contract.status === 'cancelled'
                      ? 'This contract has been cancelled and can no longer be signed.'
                      : 'Waiting for the worker to save a payout method and sign. You will be notified when the contract is signed.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default ContractSigning;
