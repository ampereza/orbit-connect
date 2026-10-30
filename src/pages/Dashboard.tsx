import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  CalendarClock,
  Check,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileSignature,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getCountryFlag, getCountryLabel } from '@/config/jobCountries';
import {
  formatMoney as formatAmount,
  formatPayType,
  formatPayoutMethodSummary,
  getWithdrawalAvailability,
  payoutMethodLabels,
} from '@/config/payouts';
import type { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MessagesList } from '@/components/messaging/MessagesList';
import { JobCreationForm } from '@/components/job-creation/JobCreationForm';
import {
  PayoutMethodForm,
  type WorkerPayoutMethod,
} from '@/components/payouts/PayoutMethodForm';
import { WithdrawalRequestForm } from '@/components/payouts/WithdrawalRequestForm';
import { ConnectsPurchase } from '@/components/payouts/ConnectsPurchase';
import { ContractForm } from '@/components/contracts/ContractForm';

type Contract = Database['public']['Tables']['contracts']['Row'];
type WithdrawalRequest = Database['public']['Tables']['withdrawal_requests']['Row'];
type WorkerBalance = Database['public']['Tables']['worker_balances']['Row'];

interface Application {
  id: string;
  status: string;
  created_at: string;
  job_id: string | null;
  country: string;
  jobs?: { title: string; country: string } | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface Proposal {
  id: string;
  job_id: string;
  freelancer_id: string;
  title: string;
  description: string;
  proposed_fee: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  jobs?: { title: string; country: string } | null;
}

interface PostedJob {
  id: string;
  title: string;
  country: string;
  description: string | null;
  salary_range: string | null;
  contract_type: string | null;
  is_active: boolean | null;
  created_at: string;
}

interface FreelancerProfile {
  user_id: string;
  hourly_rate: number | null;
  skills: string[];
  portfolio: string | null;
  availability: string | null;
  ratings: number;
}

const getApplicationStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
    case 'verified':
      return 'bg-green-500';
    case 'matched':
    case 'deployed':
      return 'bg-blue-500';
    case 'rejected':
      return 'bg-red-500';
    default:
      return 'bg-yellow-500';
  }
};

const getProposalStatusColor = (status: Proposal['status']) => {
  switch (status) {
    case 'accepted':
      return 'bg-green-500';
    case 'rejected':
      return 'bg-red-500';
    case 'withdrawn':
      return 'bg-slate-500';
    default:
      return 'bg-amber-500';
  }
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<Proposal[]>([]);
  const [freelancerNames, setFreelancerNames] = useState<Record<string, string>>({});
  const [freelancerProfile, setFreelancerProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [messagingApplication, setMessagingApplication] = useState<Application | null>(null);
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingProposalId, setUpdatingProposalId] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payoutMethod, setPayoutMethod] = useState<WorkerPayoutMethod | null>(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [workerBalance, setWorkerBalance] = useState<WorkerBalance | null>(null);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [contractProposal, setContractProposal] = useState<Proposal | null>(null);
  const [profileForm, setProfileForm] = useState({
    hourlyRate: '',
    skills: '',
    portfolio: '',
    availability: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    const handleSwitchTab = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setActiveTab(customEvent.detail);
    };
    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, []);

  // Allow deep-linking to specific dashboard sections, e.g. /dashboard?tab=payouts
  // (used to send users to the Buy Connects page).
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const [
        appsResult,
        notifsResult,
        proposalsResult,
        jobsResult,
        freelancerResult,
        contractsResult,
        payoutResult,
        withdrawalsResult,
      ] = await Promise.all([
          supabase
            .from('applications')
            .select('*, jobs(title, country)')
            .or(`user_id.eq.${user.id},email.eq.${user.email ?? ''}`)
            .order('created_at', { ascending: false }),
          supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('proposals')
            .select('*, jobs(title, country)')
            .eq('freelancer_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('jobs')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('freelancer_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('contracts')
            .select('*')
            .or(`worker_id.eq.${user.id},employer_id.eq.${user.id}`)
            .order('created_at', { ascending: false }),
          supabase
            .from('worker_payout_methods')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('requested_at', { ascending: false }),
        ]);

      if (appsResult.error) throw appsResult.error;
      if (notifsResult.error) throw notifsResult.error;
      if (proposalsResult.error) throw proposalsResult.error;
      if (jobsResult.error) throw jobsResult.error;
      if (freelancerResult.error) throw freelancerResult.error;
      if (contractsResult.error) throw contractsResult.error;
      if (payoutResult.error) throw payoutResult.error;
      if (withdrawalsResult.error) throw withdrawalsResult.error;

      const userJobs = (jobsResult.data ?? []) as PostedJob[];

      setApplications((appsResult.data ?? []) as Application[]);
      setNotifications((notifsResult.data ?? []) as Notification[]);
      setProposals((proposalsResult.data ?? []) as Proposal[]);
      setPostedJobs(userJobs);
      setFreelancerProfile(freelancerResult.data as FreelancerProfile | null);
      setContracts((contractsResult.data ?? []) as Contract[]);
      setPayoutMethod((payoutResult.data as WorkerPayoutMethod | null) ?? null);
      setWithdrawalRequests((withdrawalsResult.data ?? []) as WithdrawalRequest[]);

      const { data: balanceResult } = await supabase
        .from('worker_balances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setWorkerBalance((balanceResult as WorkerBalance | null) ?? null);

      if (userJobs.length > 0) {
        const { data: received, error: receivedError } = await supabase
          .from('proposals')
          .select('*, jobs(title, country)')
          .in(
            'job_id',
            userJobs.map((job) => job.id),
          )
          .order('created_at', { ascending: false });

        if (receivedError) throw receivedError;

        const receivedRows = (received ?? []) as Proposal[];
        setReceivedProposals(receivedRows);

        const freelancerIds = [...new Set(receivedRows.map((proposal) => proposal.freelancer_id))];

        if (freelancerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name, email')
            .in('user_id', freelancerIds);

          setFreelancerNames(
            Object.fromEntries(
              (profiles ?? []).map((profile) => [
                profile.user_id,
                profile.full_name || profile.email || 'Freelancer',
              ]),
            ),
          );
        } else {
          setFreelancerNames({});
        }
      } else {
        setReceivedProposals([]);
        setFreelancerNames({});
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification,
        ),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const openProfileEditor = () => {
    setProfileForm({
      hourlyRate: freelancerProfile?.hourly_rate ? String(freelancerProfile.hourly_rate) : '',
      skills: freelancerProfile?.skills?.join(', ') || '',
      portfolio: freelancerProfile?.portfolio || '',
      availability: freelancerProfile?.availability || '',
    });
    setProfileDialogOpen(true);
  };

  const saveFreelancerProfile = async () => {
    if (!user) return;

    setSavingProfile(true);

    try {
      const hourlyRate = profileForm.hourlyRate ? Number(profileForm.hourlyRate) : null;

      if (hourlyRate !== null && (!Number.isFinite(hourlyRate) || hourlyRate < 0)) {
        throw new Error('Hourly rate must be a positive number.');
      }

      const skills = profileForm.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

      const { error } = await supabase.from('freelancer_profiles').upsert(
        {
          user_id: user.id,
          hourly_rate: hourlyRate,
          skills,
          portfolio: profileForm.portfolio.trim() || null,
          availability: profileForm.availability.trim() || null,
        },
        { onConflict: 'user_id' },
      );

      if (error) throw error;

      toast.success('Freelancer profile saved.');
      setProfileDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving freelancer profile:', error);
      toast.error(
        error instanceof Error ? error.message : 'Could not save your freelancer profile.',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const updateProposalStatus = async (proposalId: string, status: 'accepted' | 'rejected') => {
    setUpdatingProposalId(proposalId);

    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status })
        .eq('id', proposalId);

      if (error) throw error;

      setReceivedProposals((previous) =>
        previous.map((proposal) =>
          proposal.id === proposalId ? { ...proposal, status } : proposal,
        ),
      );
      setProposals((previous) =>
        previous.map((proposal) =>
          proposal.id === proposalId ? { ...proposal, status } : proposal,
        ),
      );
      toast.success(`Proposal ${status}. The freelancer has been notified.`);
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast.error('Could not update the proposal.');
    } finally {
      setUpdatingProposalId(null);
    }
  };

  const startContract = async (contractId: string) => {
    const { error } = await supabase
      .from('contracts')
      .update({ status: 'active' })
      .eq('id', contractId);

    if (error) {
      toast.error('Failed to start the contract.');
      return;
    }

    toast.success('Contract started.');
    fetchData();
  };

  const markContractCompleted = async (contractId: string) => {
    const { error } = await supabase
      .from('contracts')
      .update({ status: 'completed' })
      .eq('id', contractId);

    if (error) {
      toast.error('Failed to complete the contract.');
      return;
    }

    toast.success('Contract marked as completed.');
    fetchData();
  };

  const withdrawProposal = async (proposalId: string) => {
    setUpdatingProposalId(proposalId);

    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'withdrawn' })
        .eq('id', proposalId);

      if (error) throw error;

      setProposals((previous) =>
        previous.map((proposal) =>
          proposal.id === proposalId ? { ...proposal, status: 'withdrawn' } : proposal,
        ),
      );
      toast.success('Proposal withdrawn.');
    } catch (error) {
      console.error('Error withdrawing proposal:', error);
      toast.error('Could not withdraw the proposal.');
    } finally {
      setUpdatingProposalId(null);
    }
  };

  const workerContracts = useMemo(
    () => contracts.filter((contract) => contract.worker_id === user?.id),
    [contracts, user?.id],
  );

  const eligibleWithdrawalContracts = useMemo(
    () =>
      workerContracts.filter((contract) =>
        ['signed', 'active', 'completed'].includes(contract.status),
      ),
    [workerContracts],
  );

  const pendingWithdrawals = withdrawalRequests.filter(
    (withdrawal) => withdrawal.status === 'pending',
  ).length;
  const totalPaidOut = withdrawalRequests
    .filter((withdrawal) => withdrawal.status === 'paid')
    .reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);

  const stats = useMemo(() => {
    const acceptedProposals = proposals.filter((proposal) => proposal.status === 'accepted');
    const totalEarnings = acceptedProposals.reduce(
      (sum, proposal) => sum + Number(proposal.proposed_fee),
      0,
    );
    const activeApplications = applications.filter(
      (application) => !['rejected', 'deployed'].includes(application.status),
    ).length;

    return {
      totalApplications: applications.length,
      activeApplications,
      proposalsSent: proposals.length,
      pendingProposals: proposals.filter((proposal) => proposal.status === 'pending').length,
      acceptedProposals: acceptedProposals.length,
      totalEarnings,
      postedJobs: postedJobs.length,
      receivedProposals: receivedProposals.length,
      pendingReceived: receivedProposals.filter((proposal) => proposal.status === 'pending').length,
    };
  }, [applications, postedJobs.length, proposals, receivedProposals]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const recentApplications = applications.slice(0, 3);
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b bg-card/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">Dashboard</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Applications, proposals, and earnings
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setPostJobOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Post Job
            </Button>
            <Button variant="outline" asChild>
              <Link to="/kyc">Profile</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/complete-profile">Complete profile</Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="freelancer" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Freelancer
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              My Jobs
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalApplications}</p>
                    <p className="text-sm text-muted-foreground">Applications</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-blue-500/10 p-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeApplications}</p>
                    <p className="text-sm text-muted-foreground">Active applications</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-amber-500/10 p-3">
                    <Send className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.proposalsSent}</p>
                    <p className="text-sm text-muted-foreground">Proposals sent</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-green-500/10 p-3">
                    <Wallet className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatMoney(stats.totalEarnings)}</p>
                    <p className="text-sm text-muted-foreground">Accepted earnings</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-6 md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Recent Applications
                    </CardTitle>
                    <CardDescription>Track your placement applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentApplications.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="mb-4 text-muted-foreground">Start your first application</p>
                        <Button asChild>
                          <Link to="/jobs">Browse Available Jobs</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentApplications.map((application) => (
                          <div
                            key={application.id}
                            className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <h3 className="font-semibold">
                                {application.jobs?.title || 'Application'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {application.jobs?.country || application.country} • Applied on{' '}
                                {new Date(application.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getApplicationStatusColor(application.status)}>
                                {application.status}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setMessagingApplication(application)}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Messages
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Recent Proposals
                    </CardTitle>
                    <CardDescription>Your latest freelance submissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {proposals.length === 0 ? (
                      <div className="py-6 text-center">
                        <p className="mb-4 text-muted-foreground">
                          You have not submitted any proposals yet.
                        </p>
                        <Button asChild variant="outline">
                          <Link to="/jobs">Find freelance work</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {proposals.slice(0, 3).map((proposal) => (
                          <div
                            key={proposal.id}
                            className="flex items-center justify-between gap-3 rounded-lg border p-3"
                          >
                            <div>
                              <p className="font-medium">{proposal.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {proposal.jobs?.title || 'Job'} •{' '}
                                {proposal.jobs?.country
                                  ? getCountryLabel(proposal.jobs.country)
                                  : 'Remote'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">
                                {formatMoney(Number(proposal.proposed_fee))}
                              </p>
                              <Badge className={getProposalStatusColor(proposal.status)}>
                                {proposal.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Message Center
                    </CardTitle>
                    <CardDescription>Latest activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentNotifications.length === 0 ? (
                      <p className="py-4 text-center text-muted-foreground">
                        No new notifications
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {recentNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`cursor-pointer rounded-lg border p-3 ${
                              !notification.read ? 'bg-muted/50' : ''
                            }`}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                          >
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Quick Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/jobs">
                        <Briefcase className="mr-2 h-4 w-4" />
                        View All Jobs
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setPostJobOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Post a Job
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('payouts')}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Payouts & Contracts
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/kyc">
                        <FileText className="mr-2 h-4 w-4" />
                        Finish KYC
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Applications */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Tracking
                </CardTitle>
                <CardDescription>
                  Every placement application and its current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-muted-foreground">No applications yet</p>
                    <Button asChild>
                      <Link to="/jobs">Browse Available Jobs</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {application.jobs?.title || 'Application'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getCountryFlag(application.jobs?.country || application.country)}{' '}
                            {application.jobs?.country || application.country} • Applied on{' '}
                            {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getApplicationStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMessagingApplication(application)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Messages
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Freelancer */}
          <TabsContent value="freelancer" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-amber-500/10 p-3">
                    <Send className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pendingProposals}</p>
                    <p className="text-sm text-muted-foreground">Pending proposals</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-green-500/10 p-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.acceptedProposals}</p>
                    <p className="text-sm text-muted-foreground">Accepted</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatMoney(stats.totalEarnings)}</p>
                    <p className="text-sm text-muted-foreground">Earnings</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Freelancer Profile
                  </CardTitle>
                  <CardDescription>
                    Showcase your skills and availability to employers
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={openProfileEditor}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                {freelancerProfile ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Hourly rate
                      </p>
                      <p className="font-medium">
                        {freelancerProfile.hourly_rate
                          ? `${formatMoney(freelancerProfile.hourly_rate)}/hr`
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Availability
                      </p>
                      <p className="font-medium">{freelancerProfile.availability || 'Not set'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Skills
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {freelancerProfile.skills.length > 0 ? (
                          freelancerProfile.skills.map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No skills added</span>
                        )}
                      </div>
                    </div>
                    {freelancerProfile.portfolio && (
                      <div className="sm:col-span-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Portfolio
                        </p>
                        <a
                          href={freelancerProfile.portfolio}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {freelancerProfile.portfolio}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="mb-4 text-sm text-muted-foreground">
                      Create a freelancer profile so employers can learn more about you.
                    </p>
                    <Button onClick={openProfileEditor}>Set up freelancer profile</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  My Proposals
                </CardTitle>
                <CardDescription>Proposals you have submitted to employers</CardDescription>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-muted-foreground">No proposals submitted yet</p>
                    <Button asChild>
                      <Link to="/jobs">Find freelance work</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold">{proposal.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {proposal.jobs?.title || 'Job'} •{' '}
                            {getCountryFlag(proposal.jobs?.country)} {proposal.jobs?.country}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Submitted {new Date(proposal.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatMoney(Number(proposal.proposed_fee))}
                            </p>
                            <Badge className={getProposalStatusColor(proposal.status)}>
                              {proposal.status}
                            </Badge>
                          </div>
                          {proposal.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => withdrawProposal(proposal.id)}
                              disabled={updatingProposalId === proposal.id}
                            >
                              {updatingProposalId === proposal.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="mr-1 h-4 w-4" />
                              )}
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Jobs */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.postedJobs}</p>
                    <p className="text-sm text-muted-foreground">Jobs posted</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-amber-500/10 p-3">
                    <Send className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pendingReceived}</p>
                    <p className="text-sm text-muted-foreground">Proposals to review</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-green-500/10 p-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.receivedProposals}</p>
                    <p className="text-sm text-muted-foreground">Total proposals received</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    My Posted Jobs
                  </CardTitle>
                  <CardDescription>Jobs you published on Orbit Connect</CardDescription>
                </div>
                <Button size="sm" onClick={() => setPostJobOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post Job
                </Button>
              </CardHeader>
              <CardContent>
                {postedJobs.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-muted-foreground">
                      You have not posted any jobs yet.
                    </p>
                    <Button onClick={() => setPostJobOpen(true)}>Post your first job</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {postedJobs.map((job) => {
                      const jobProposals = receivedProposals.filter(
                        (proposal) => proposal.job_id === job.id,
                      );

                      return (
                        <div
                          key={job.id}
                          className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{job.title}</h3>
                              <Badge variant={job.is_active ? 'default' : 'secondary'}>
                                {job.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {getCountryFlag(job.country)} {job.country} •{' '}
                              {job.contract_type || 'full-time'} • Posted{' '}
                              {new Date(job.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{jobProposals.length} proposals</Badge>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/jobs/${job.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Proposals Received
                </CardTitle>
                <CardDescription>Review and respond to freelancer proposals</CardDescription>
              </CardHeader>
              <CardContent>
                {receivedProposals.length === 0 ? (
                  <p className="py-6 text-center text-muted-foreground">
                    No proposals received yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {receivedProposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{proposal.title}</p>
                            <Badge className={getProposalStatusColor(proposal.status)}>
                              {proposal.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {freelancerNames[proposal.freelancer_id] || 'Freelancer'} •{' '}
                            {proposal.jobs?.title || 'Job'}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {proposal.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <p className="font-semibold">
                            {formatMoney(Number(proposal.proposed_fee))}
                          </p>
                          {proposal.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateProposalStatus(proposal.id, 'accepted')}
                                disabled={updatingProposalId === proposal.id}
                              >
                                <Check className="mr-1 h-4 w-4" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateProposalStatus(proposal.id, 'rejected')}
                                disabled={updatingProposalId === proposal.id}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                          {proposal.status === 'accepted' &&
                            (() => {
                              const contract = contracts.find(
                                (item) => item.proposal_id === proposal.id,
                              );

                              return contract ? (
                                <>
                                  <Button size="sm" variant="outline" asChild>
                                    <Link to={`/contracts/${contract.id}/sign`}>
                                      <FileSignature className="mr-1 h-4 w-4" />
                                      View contract
                                    </Link>
                                  </Button>
                                  {contract.status === 'signed' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => startContract(contract.id)}
                                    >
                                      Start work
                                    </Button>
                                  )}
                                  {contract.status === 'active' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => markContractCompleted(contract.id)}
                                    >
                                      Mark completed
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setContractProposal(proposal)}
                                >
                                  <FileSignature className="mr-1 h-4 w-4" />
                                  Create contract
                                </Button>
                              );
                            })()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts */}
          <TabsContent value="payouts" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-secondary/10 p-3">
                    <Wallet className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {formatAmount(
                        Number(workerBalance?.balance ?? 0),
                        workerBalance?.currency || payoutMethod?.currency || 'USD',
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Available balance</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {payoutMethod ? payoutMethodLabels[payoutMethod.method] : 'Not set'}
                    </p>
                    <p className="text-sm text-muted-foreground">Payout method</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-green-500/10 p-3">
                    <FileSignature className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{eligibleWithdrawalContracts.length}</p>
                    <p className="text-sm text-muted-foreground">Signed contracts</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-amber-500/10 p-3">
                    <CalendarClock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingWithdrawals}</p>
                    <p className="text-sm text-muted-foreground">Pending withdrawals</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {formatAmount(totalPaidOut, payoutMethod?.currency || 'USD')}
                    </p>
                    <p className="text-sm text-muted-foreground">Paid out</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Withdrawal method
                    </CardTitle>
                    <CardDescription>
                      Where your earnings are sent. Required before signing a contract.
                    </CardDescription>
                  </div>
                  {payoutMethod && (
                    <Button variant="outline" size="sm" onClick={() => setPayoutDialogOpen(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {payoutMethod ? (
                    <div className="space-y-2">
                      <Badge variant="secondary">
                        {payoutMethodLabels[payoutMethod.method]}
                      </Badge>
                      <p className="font-medium">
                        {formatPayoutMethodSummary(payoutMethod)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payoutMethod.account_name}
                        {payoutMethod.country ? ` · ${payoutMethod.country}` : ''} ·{' '}
                        {payoutMethod.currency}
                      </p>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="mb-4 text-sm text-muted-foreground">
                        Add mobile money, bank transfer, or PayPal details before you sign a
                        contract.
                      </p>
                      <Button onClick={() => setPayoutDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Set up payout method
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5" />
                    Withdrawal schedule
                  </CardTitle>
                  <CardDescription>How and when you can withdraw</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-semibold">Hourly contracts</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        One withdrawal every 7 days per contract.
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-semibold">Fixed-rate contracts</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Withdraw any time, up to the remaining contract value.
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (!payoutMethod) {
                        toast.error('Set up a payout method first.');
                        setPayoutDialogOpen(true);
                        return;
                      }
                      if (eligibleWithdrawalContracts.length === 0) {
                        toast.error('You need a signed contract before requesting a withdrawal.');
                        return;
                      }
                      setWithdrawalDialogOpen(true);
                    }}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Request withdrawal
                  </Button>
                </CardContent>
              </Card>
            </div>

            <ConnectsPurchase />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  My Contracts
                </CardTitle>
                <CardDescription>Review, sign, and track your work agreements</CardDescription>
              </CardHeader>
              <CardContent>
                {workerContracts.length === 0 ? (
                  <p className="py-6 text-center text-muted-foreground">
                    No contracts yet. An employer creates a contract after accepting your
                    proposal.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {workerContracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{contract.title}</p>
                            <Badge variant={contract.status === 'signed' ? 'default' : 'secondary'}>
                              {contract.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatPayType(contract.pay_type)} ·{' '}
                            {formatAmount(
                              Number(
                                contract.pay_type === 'hourly'
                                  ? contract.hourly_rate || 0
                                  : contract.fixed_amount || 0,
                              ),
                              contract.currency,
                            )}
                            {contract.pay_type === 'hourly' ? '/hr' : ''}
                            {contract.signed_at
                              ? ` · Signed ${new Date(contract.signed_at).toLocaleDateString()}`
                              : ''}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/contracts/${contract.id}/sign`}>
                            {contract.status === 'signed' || contract.status === 'active'
                              ? 'View contract'
                              : 'Review & sign'}
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Withdrawal History
                </CardTitle>
                <CardDescription>Requests and payouts from your contracts</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawalRequests.length === 0 ? (
                  <p className="py-6 text-center text-muted-foreground">
                    No withdrawal requests yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {withdrawalRequests.map((withdrawal) => {
                      const contract = workerContracts.find(
                        (item) => item.id === withdrawal.contract_id,
                      );

                      return (
                        <div
                          key={withdrawal.id}
                          className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-semibold">
                              {formatAmount(Number(withdrawal.amount), withdrawal.currency)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {contract?.title || 'Contract'} ·{' '}
                              {payoutMethodLabels[withdrawal.method]} ·{' '}
                              {new Date(withdrawal.requested_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              withdrawal.status === 'paid'
                                ? 'default'
                                : withdrawal.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {withdrawal.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Status updates and proposal activity</CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    You have no notifications yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`cursor-pointer rounded-lg border p-4 ${
                          !notification.read ? 'bg-muted/50' : ''
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={postJobOpen} onOpenChange={setPostJobOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a job</DialogTitle>
            <DialogDescription>
              Publish a freelance project or overseas placement.
            </DialogDescription>
          </DialogHeader>
          <JobCreationForm
            onCreated={() => {
              setPostJobOpen(false);
              fetchData();
            }}
            onCancel={() => setPostJobOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payout method</DialogTitle>
            <DialogDescription>
              Choose how you want to receive your earnings. You must save this before
              signing a contract.
            </DialogDescription>
          </DialogHeader>
          <PayoutMethodForm
            initial={payoutMethod}
            onSaved={(saved) => {
              setPayoutMethod(saved);
              setPayoutDialogOpen(false);
              fetchData();
            }}
            onCancel={() => setPayoutDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request a withdrawal</DialogTitle>
            <DialogDescription>
              Hourly contracts can withdraw once every 7 days. Fixed-rate contracts can
              withdraw any time.
            </DialogDescription>
          </DialogHeader>
          {payoutMethod && (
            <WithdrawalRequestForm
              contracts={workerContracts}
              payoutMethod={payoutMethod}
              withdrawals={withdrawalRequests}
              onSubmitted={() => {
                setWithdrawalDialogOpen(false);
                fetchData();
              }}
              onCancel={() => setWithdrawalDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(contractProposal)}
        onOpenChange={(open) => {
          if (!open) setContractProposal(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create contract</DialogTitle>
            <DialogDescription>
              Set the pay type, rate, and terms. The worker will set up a payout method and
              sign before the contract starts.
            </DialogDescription>
          </DialogHeader>
          {contractProposal && (
            <ContractForm
              proposal={contractProposal}
              onCreated={() => {
                setContractProposal(null);
                fetchData();
              }}
              onCancel={() => setContractProposal(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Freelancer profile</DialogTitle>
            <DialogDescription>
              These details help employers evaluate your proposals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hourly-rate">Hourly rate (USD)</Label>
              <Input
                id="hourly-rate"
                type="number"
                min="0"
                step="0.01"
                value={profileForm.hourlyRate}
                onChange={(event) =>
                  setProfileForm((previous) => ({
                    ...previous,
                    hourlyRate: event.target.value,
                  }))
                }
                placeholder="e.g. 25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="freelancer-skills">Skills</Label>
              <Input
                id="freelancer-skills"
                value={profileForm.skills}
                onChange={(event) =>
                  setProfileForm((previous) => ({ ...previous, skills: event.target.value }))
                }
                placeholder="React, Node.js, UI design"
              />
              <p className="text-xs text-muted-foreground">Separate skills with commas.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="freelancer-availability">Availability</Label>
              <Input
                id="freelancer-availability"
                value={profileForm.availability}
                onChange={(event) =>
                  setProfileForm((previous) => ({
                    ...previous,
                    availability: event.target.value,
                  }))
                }
                placeholder="e.g. Available 20 hrs/week"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="freelancer-portfolio">Portfolio URL</Label>
              <Input
                id="freelancer-portfolio"
                value={profileForm.portfolio}
                onChange={(event) =>
                  setProfileForm((previous) => ({
                    ...previous,
                    portfolio: event.target.value,
                  }))
                }
                placeholder="https://your-portfolio.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setProfileDialogOpen(false)}
                disabled={savingProfile}
              >
                Cancel
              </Button>
              <Button onClick={saveFreelancerProfile} disabled={savingProfile}>
                {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(messagingApplication)}
        onOpenChange={(open) => {
          if (!open) setMessagingApplication(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {messagingApplication?.jobs?.title
                ? `${messagingApplication.jobs.title} messages`
                : 'Application messages'}
            </DialogTitle>
            <DialogDescription>
              Talk directly with the Orbit Connect team about this application.
            </DialogDescription>
          </DialogHeader>
          {messagingApplication && (
            <MessagesList applicationId={messagingApplication.id} className="max-h-[60vh]" />
          )}
        </DialogContent>
      </Dialog>

      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;
