import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { payoutMethodLabels, formatMoney as formatCurrencyAmount, formatPayType } from '@/config/payouts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessagesList } from '@/components/messaging/MessagesList';
import { toast } from 'sonner';
import { Loader2, LogOut, Search, Users, CheckCircle, Clock, XCircle, RefreshCw, Shield, AlertTriangle, MessageSquare, Briefcase, Send, DollarSign, Wallet } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Application = Database['public']['Tables']['applications']['Row'];
type ApplicationStatus = Database['public']['Enums']['application_status'];
type InsuranceSubscription = Database['public']['Tables']['insurance_subscriptions']['Row'];
type Proposal = Database['public']['Tables']['proposals']['Row'];
type ProposalStatus = Database['public']['Enums']['proposal_status'];
type Job = Database['public']['Tables']['jobs']['Row'];
type Contract = Database['public']['Tables']['contracts']['Row'];
type ContractStatus = Database['public']['Enums']['contract_status'];
type WithdrawalRequest = Database['public']['Tables']['withdrawal_requests']['Row'];
type WithdrawalStatus = Database['public']['Enums']['withdrawal_status'];

type ProposalWithJob = Proposal & {
  jobs: { title: string; country: string } | null;
};

const PROPOSAL_STATUS_COLORS: Record<ProposalStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  accepted: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive',
  withdrawn: 'bg-secondary text-secondary-foreground'
};

const WITHDRAWAL_STATUS_COLORS: Record<WithdrawalStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  approved: 'bg-primary/20 text-primary',
  paid: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive'
};

const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_signature: 'bg-secondary text-secondary-foreground',
  signed: 'bg-success/20 text-success',
  active: 'bg-primary/20 text-primary',
  completed: 'bg-gold/20 text-gold-dark',
  cancelled: 'bg-destructive/20 text-destructive'
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

const STATUS_OPTIONS: ApplicationStatus[] = ['pending', 'paid', 'verified', 'matched', 'deployed', 'rejected'];

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  paid: 'bg-success/20 text-success',
  verified: 'bg-primary/20 text-primary',
  matched: 'bg-secondary text-secondary-foreground',
  deployed: 'bg-gold/20 text-gold-dark',
  rejected: 'bg-destructive/20 text-destructive'
};

const INSURANCE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  active: 'bg-success/20 text-success',
  expired: 'bg-destructive/20 text-destructive',
  cancelled: 'bg-muted text-muted-foreground'
};

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>('pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [messagingApplication, setMessagingApplication] = useState<Application | null>(null);
  
  // Insurance state
  const [insuranceSubscriptions, setInsuranceSubscriptions] = useState<InsuranceSubscription[]>([]);
  const [filteredInsurance, setFilteredInsurance] = useState<InsuranceSubscription[]>([]);
  const [insuranceLoading, setInsuranceLoading] = useState(true);
  const [insuranceSearch, setInsuranceSearch] = useState('');
  const [insuranceStatusFilter, setInsuranceStatusFilter] = useState<string>('all');

  // Proposals state
  const [proposals, setProposals] = useState<ProposalWithJob[]>([]);
  const [proposalSearch, setProposalSearch] = useState('');
  const [proposalStatusFilter, setProposalStatusFilter] = useState<string>('all');
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [freelancerNames, setFreelancerNames] = useState<Record<string, string>>({});
  const [updatingProposalId, setUpdatingProposalId] = useState<string | null>(null);

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobSearch, setJobSearch] = useState('');
  const [jobsLoading, setJobsLoading] = useState(true);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  // Payouts state
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [payoutNames, setPayoutNames] = useState<Record<string, string>>({});
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState('all');
  const [updatingWithdrawalId, setUpdatingWithdrawalId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
      fetchInsuranceSubscriptions();
      fetchProposals();
      fetchJobs();
      fetchPayouts();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter, countryFilter]);

  useEffect(() => {
    filterInsurance();
  }, [insuranceSubscriptions, insuranceSearch, insuranceStatusFilter]);

  const fetchApplications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch applications');
    } else {
      setApplications(data || []);
    }
    setIsLoading(false);
  };

  const fetchProposals = async () => {
    setProposalsLoading(true);
    const { data, error } = await supabase
      .from('proposals')
      .select('*, jobs(title, country)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch proposals');
      setProposalsLoading(false);
      return;
    }

    const rows = (data || []) as ProposalWithJob[];
    setProposals(rows);

    const freelancerIds = [...new Set(rows.map((proposal) => proposal.freelancer_id))];
    if (freelancerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', freelancerIds);

      setFreelancerNames(
        Object.fromEntries(
          (profiles || []).map((profile) => [
            profile.user_id,
            profile.full_name || profile.email || 'Freelancer'
          ])
        )
      );
    } else {
      setFreelancerNames({});
    }

    setProposalsLoading(false);
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch jobs');
    } else {
      setJobs(data || []);
    }
    setJobsLoading(false);
  };

  const fetchPayouts = async () => {
    setPayoutsLoading(true);

    const [contractsResult, withdrawalsResult] = await Promise.all([
      supabase.from('contracts').select('*').order('created_at', { ascending: false }),
      supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false })
    ]);

    if (contractsResult.error || withdrawalsResult.error) {
      toast.error('Failed to fetch payout data');
      setPayoutsLoading(false);
      return;
    }

    const contractRows = (contractsResult.data || []) as Contract[];
    const withdrawalRows = (withdrawalsResult.data || []) as WithdrawalRequest[];

    setContracts(contractRows);
    setWithdrawals(withdrawalRows);

    const userIds = [
      ...new Set(
        [
          ...contractRows.map((contract) => contract.worker_id),
          ...contractRows.map((contract) => contract.employer_id),
          ...withdrawalRows.map((withdrawal) => withdrawal.user_id)
        ].filter(Boolean) as string[]
      )
    ];

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      setPayoutNames(
        Object.fromEntries(
          (profiles || []).map((profile) => [
            profile.user_id,
            profile.full_name || profile.email || 'User'
          ])
        )
      );
    } else {
      setPayoutNames({});
    }

    setPayoutsLoading(false);
  };

  const fetchInsuranceSubscriptions = async () => {
    setInsuranceLoading(true);
    const { data, error } = await supabase
      .from('insurance_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to fetch insurance subscriptions');
    } else {
      setInsuranceSubscriptions(data || []);
    }
    setInsuranceLoading(false);
  };

  const filterApplications = () => {
    let filtered = [...applications];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.full_name.toLowerCase().includes(query) ||
        app.email.toLowerCase().includes(query) ||
        app.phone.includes(query)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    if (countryFilter !== 'all') {
      filtered = filtered.filter(app => app.country === countryFilter);
    }
    
    setFilteredApplications(filtered);
  };

  const filterInsurance = () => {
    let filtered = [...insuranceSubscriptions];
    
    if (insuranceSearch) {
      const query = insuranceSearch.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.customer_name.toLowerCase().includes(query) ||
        sub.customer_email.toLowerCase().includes(query) ||
        sub.customer_phone.includes(query)
      );
    }
    
    if (insuranceStatusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === insuranceStatusFilter);
    }
    
    setFilteredInsurance(filtered);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredApplications.map(app => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one application');
      return;
    }

    setIsUpdating(true);
    const { error } = await supabase
      .from('applications')
      .update({ status: bulkStatus })
      .in('id', selectedIds);

    if (error) {
      toast.error('Failed to update applications');
    } else {
      toast.success(`Updated ${selectedIds.length} applications to ${bulkStatus}`);
      setSelectedIds([]);
      fetchApplications();
    }
    setIsUpdating(false);
  };

  const handleProposalStatus = async (proposalId: string, status: 'accepted' | 'rejected') => {
    setUpdatingProposalId(proposalId);
    const { error } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', proposalId);

    if (error) {
      toast.error('Failed to update proposal');
    } else {
      setProposals((previous) =>
        previous.map((proposal) =>
          proposal.id === proposalId ? { ...proposal, status } : proposal
        )
      );
      toast.success(`Proposal ${status}`);
    }
    setUpdatingProposalId(null);
  };

  const toggleJobActive = async (job: Job) => {
    setUpdatingJobId(job.id);
    const { error } = await supabase
      .from('jobs')
      .update({ is_active: !job.is_active })
      .eq('id', job.id);

    if (error) {
      toast.error('Failed to update job');
    } else {
      setJobs((previous) =>
        previous.map((item) =>
          item.id === job.id ? { ...item, is_active: !item.is_active } : item
        )
      );
      toast.success(job.is_active ? 'Job deactivated' : 'Job activated');
    }
    setUpdatingJobId(null);
  };

  const handleWithdrawalStatus = async (withdrawalId: string, status: WithdrawalStatus) => {
    setUpdatingWithdrawalId(withdrawalId);
    const processedAt =
      status === 'paid' || status === 'rejected' ? new Date().toISOString() : null;
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({ status, processed_at: processedAt })
      .eq('id', withdrawalId);

    if (error) {
      toast.error('Failed to update withdrawal request');
    } else {
      setWithdrawals((previous) =>
        previous.map((withdrawal) =>
          withdrawal.id === withdrawalId
            ? { ...withdrawal, status, processed_at: processedAt }
            : withdrawal
        )
      );
      toast.success(`Withdrawal ${status}`);
    }
    setUpdatingWithdrawalId(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const countries = [...new Set(applications.map(app => app.country))];

  const filteredProposals = proposals.filter((proposal) => {
    const query = proposalSearch.trim().toLowerCase();
    const matchesQuery =
      !query ||
      proposal.title.toLowerCase().includes(query) ||
      proposal.description.toLowerCase().includes(query) ||
      (proposal.jobs?.title || '').toLowerCase().includes(query) ||
      (freelancerNames[proposal.freelancer_id] || '').toLowerCase().includes(query);

    const matchesStatus =
      proposalStatusFilter === 'all' || proposal.status === proposalStatusFilter;

    return matchesQuery && matchesStatus;
  });

  const filteredJobs = jobs.filter((job) => {
    const query = jobSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      job.title.toLowerCase().includes(query) ||
      job.country.toLowerCase().includes(query) ||
      (job.description || '').toLowerCase().includes(query)
    );
  });

  const proposalStats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    acceptedValue: proposals
      .filter(p => p.status === 'accepted')
      .reduce((sum, p) => sum + Number(p.proposed_fee), 0)
  };

  const jobStats = {
    total: jobs.length,
    active: jobs.filter(j => j.is_active).length,
    inactive: jobs.filter(j => !j.is_active).length
  };

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (withdrawalStatusFilter === 'all') return true;
    return withdrawal.status === withdrawalStatusFilter;
  });

  const payoutStats = {
    pending: withdrawals.filter(w => w.status === 'pending').length,
    approved: withdrawals.filter(w => w.status === 'approved').length,
    paidValue: withdrawals
      .filter(w => w.status === 'paid')
      .reduce((sum, w) => sum + Number(w.amount), 0),
    signedContracts: contracts.filter(c => ['signed', 'active', 'completed'].includes(c.status)).length
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    paid: applications.filter(a => a.status === 'paid').length,
    deployed: applications.filter(a => a.status === 'deployed').length
  };

  const insuranceStats = {
    total: insuranceSubscriptions.length,
    active: insuranceSubscriptions.filter(s => s.status === 'active').length,
    pending: insuranceSubscriptions.filter(s => s.status === 'pending').length,
    expiringSoon: insuranceSubscriptions.filter(s => {
      if (!s.expires_at || s.status !== 'active') return false;
      const expiryDate = new Date(s.expires_at);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow;
    }).length
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Proposals
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="insurance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Insurance
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.paid}</p>
                    <p className="text-sm text-muted-foreground">Paid</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-secondary/20">
                    <XCircle className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.deployed}</p>
                    <p className="text-sm text-muted-foreground">Deployed</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters & Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
                <CardDescription>Manage and filter all recruitment applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {STATUS_OPTIONS.map(status => (
                        <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchApplications}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-4 p-4 mb-4 rounded-lg bg-muted/50 border">
                    <span className="text-sm font-medium">{selectedIds.length} selected</span>
                    <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as ApplicationStatus)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(status => (
                          <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleBulkUpdate} disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Status
                    </Button>
                    <Button variant="ghost" onClick={() => setSelectedIds([])}>Cancel</Button>
                  </div>
                )}

                {/* Table */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Passport</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Messages</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                              No applications found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredApplications.map((app) => (
                            <TableRow key={app.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedIds.includes(app.id)}
                                  onCheckedChange={(checked) => handleSelectOne(app.id, !!checked)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{app.full_name}</TableCell>
                              <TableCell>{app.email}</TableCell>
                              <TableCell>{app.phone}</TableCell>
                              <TableCell>{app.country}</TableCell>
                              <TableCell>{app.age}</TableCell>
                              <TableCell>
                                <Badge variant={app.has_passport ? 'default' : 'secondary'}>
                                  {app.has_passport ? 'Yes' : 'No'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={app.payment_status === 'paid' ? 'default' : 'outline'}>
                                  {app.payment_status || 'unpaid'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={STATUS_COLORS[app.status]}>
                                  {app.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(app.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setMessagingApplication(app)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{proposalStats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{proposalStats.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{proposalStats.accepted}</p>
                    <p className="text-sm text-muted-foreground">Accepted</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-gold/10">
                    <DollarSign className="h-5 w-5 text-gold-dark" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatMoney(proposalStats.acceptedValue)}</p>
                    <p className="text-sm text-muted-foreground">Accepted Value</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Freelancer Proposals</CardTitle>
                <CardDescription>Review and manage proposals submitted by freelancers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by proposal, job or freelancer..."
                      value={proposalSearch}
                      onChange={(e) => setProposalSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={proposalStatusFilter} onValueChange={setProposalStatusFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchProposals}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {proposalsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Proposal</TableHead>
                          <TableHead>Freelancer</TableHead>
                          <TableHead>Job</TableHead>
                          <TableHead>Fee</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProposals.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No proposals found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredProposals.map((proposal) => (
                            <TableRow key={proposal.id}>
                              <TableCell className="max-w-[260px]">
                                <p className="font-medium">{proposal.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {proposal.description}
                                </p>
                              </TableCell>
                              <TableCell>
                                {freelancerNames[proposal.freelancer_id] || 'Freelancer'}
                              </TableCell>
                              <TableCell>
                                {proposal.jobs?.title || 'Job'}
                                {proposal.jobs?.country && (
                                  <span className="block text-xs text-muted-foreground">
                                    {proposal.jobs.country}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatMoney(Number(proposal.proposed_fee))}
                              </TableCell>
                              <TableCell>
                                <Badge className={PROPOSAL_STATUS_COLORS[proposal.status]}>
                                  {proposal.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(proposal.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                {proposal.status === 'pending' ? (
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleProposalStatus(proposal.id, 'accepted')}
                                      disabled={updatingProposalId === proposal.id}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleProposalStatus(proposal.id, 'rejected')}
                                      disabled={updatingProposalId === proposal.id}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">No actions</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{jobStats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Jobs</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{jobStats.active}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-muted">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{jobStats.inactive}</p>
                    <p className="text-sm text-muted-foreground">Inactive</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Jobs</CardTitle>
                <CardDescription>Manage job postings and their visibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs by title, country or description..."
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" onClick={fetchJobs}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {jobsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Contract</TableHead>
                          <TableHead>Salary</TableHead>
                          <TableHead>Proposals</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredJobs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No jobs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredJobs.map((job) => {
                            const proposalCount = proposals.filter(
                              (proposal) => proposal.job_id === job.id
                            ).length;

                            return (
                              <TableRow key={job.id}>
                                <TableCell className="font-medium max-w-[240px]">
                                  {job.title}
                                </TableCell>
                                <TableCell>{job.country}</TableCell>
                                <TableCell className="capitalize">
                                  {job.contract_type || '-'}
                                </TableCell>
                                <TableCell>{job.salary_range || '-'}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{proposalCount}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={job.is_active ? 'default' : 'secondary'}>
                                    {job.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {new Date(job.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleJobActive(job)}
                                    disabled={updatingJobId === job.id}
                                  >
                                    {updatingJobId === job.id && (
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    )}
                                    {job.is_active ? 'Deactivate' : 'Activate'}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{payoutStats.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{payoutStats.approved}</p>
                    <p className="text-sm text-muted-foreground">Approved</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatMoney(payoutStats.paidValue)}</p>
                    <p className="text-sm text-muted-foreground">Paid out</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-secondary/20">
                    <Briefcase className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{payoutStats.signedContracts}</p>
                    <p className="text-sm text-muted-foreground">Signed contracts</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Withdrawal Requests</CardTitle>
                    <CardDescription>Approve worker payouts and mark them as paid</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={withdrawalStatusFilter} onValueChange={setWithdrawalStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={fetchPayouts}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {payoutsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Worker</TableHead>
                          <TableHead>Contract</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWithdrawals.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No withdrawal requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredWithdrawals.map((withdrawal) => {
                            const contract = contracts.find(
                              (item) => item.id === withdrawal.contract_id
                            );

                            return (
                              <TableRow key={withdrawal.id}>
                                <TableCell className="font-medium">
                                  {payoutNames[withdrawal.user_id] || 'Worker'}
                                </TableCell>
                                <TableCell>{contract?.title || 'Contract'}</TableCell>
                                <TableCell className="font-medium">
                                  {formatCurrencyAmount(Number(withdrawal.amount), withdrawal.currency)}
                                </TableCell>
                                <TableCell>{payoutMethodLabels[withdrawal.method]}</TableCell>
                                <TableCell>
                                  <Badge className={WITHDRAWAL_STATUS_COLORS[withdrawal.status]}>
                                    {withdrawal.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {new Date(withdrawal.requested_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {withdrawal.status === 'pending' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleWithdrawalStatus(withdrawal.id, 'approved')}
                                        disabled={updatingWithdrawalId === withdrawal.id}
                                      >
                                        Approve
                                      </Button>
                                    )}
                                    {(withdrawal.status === 'pending' || withdrawal.status === 'approved') && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleWithdrawalStatus(withdrawal.id, 'paid')}
                                          disabled={updatingWithdrawalId === withdrawal.id}
                                        >
                                          Mark paid
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleWithdrawalStatus(withdrawal.id, 'rejected')}
                                          disabled={updatingWithdrawalId === withdrawal.id}
                                        >
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contracts</CardTitle>
                <CardDescription>All worker contracts and signature status</CardDescription>
              </CardHeader>
              <CardContent>
                {payoutsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contract</TableHead>
                          <TableHead>Worker</TableHead>
                          <TableHead>Employer</TableHead>
                          <TableHead>Pay</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Signed</TableHead>
                          <TableHead className="text-right">View</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contracts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No contracts found
                            </TableCell>
                          </TableRow>
                        ) : (
                          contracts.map((contract) => (
                            <TableRow key={contract.id}>
                              <TableCell className="font-medium max-w-[220px]">
                                {contract.title}
                              </TableCell>
                              <TableCell>{payoutNames[contract.worker_id] || 'Worker'}</TableCell>
                              <TableCell>
                                {contract.employer_id
                                  ? payoutNames[contract.employer_id] || 'Employer'
                                  : 'Orbit Connect'}
                              </TableCell>
                              <TableCell>
                                {formatPayType(contract.pay_type)} ·{' '}
                                {formatCurrencyAmount(
                                  Number(
                                    contract.pay_type === 'hourly'
                                      ? contract.hourly_rate || 0
                                      : contract.fixed_amount || 0
                                  ),
                                  contract.currency
                                )}
                                {contract.pay_type === 'hourly' ? '/hr' : ''}
                              </TableCell>
                              <TableCell>
                                <Badge className={CONTRACT_STATUS_COLORS[contract.status]}>
                                  {contract.status.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {contract.signed_at
                                  ? new Date(contract.signed_at).toLocaleDateString()
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm" asChild>
                                  <Link to={`/contracts/${contract.id}/sign`}>Open</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insurance Tab */}
          <TabsContent value="insurance" className="space-y-6">
            {/* Insurance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{insuranceStats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{insuranceStats.active}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{insuranceStats.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{insuranceStats.expiringSoon}</p>
                    <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insurance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Insurance Subscriptions</CardTitle>
                <CardDescription>Manage all insurance subscriptions and expiry dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email or phone..."
                      value={insuranceSearch}
                      onChange={(e) => setInsuranceSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={insuranceStatusFilter} onValueChange={setInsuranceStatusFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchInsuranceSubscriptions}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {insuranceLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Starts</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInsurance.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No insurance subscriptions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredInsurance.map((sub) => {
                            const isExpiringSoon = sub.expires_at && sub.status === 'active' && (() => {
                              const expiryDate = new Date(sub.expires_at);
                              const thirtyDaysFromNow = new Date();
                              thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                              return expiryDate <= thirtyDaysFromNow;
                            })();
                            
                            return (
                              <TableRow key={sub.id} className={isExpiringSoon ? 'bg-destructive/5' : ''}>
                                <TableCell className="font-medium">{sub.customer_name}</TableCell>
                                <TableCell>{sub.customer_email}</TableCell>
                                <TableCell>{sub.customer_phone}</TableCell>
                                <TableCell>${sub.amount} {sub.currency}</TableCell>
                                <TableCell>
                                  <Badge variant={sub.is_client ? 'default' : 'secondary'}>
                                    {sub.is_client ? 'Client' : 'Non-Client'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={INSURANCE_STATUS_COLORS[sub.status] || 'bg-muted text-muted-foreground'}>
                                    {sub.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {sub.starts_at ? new Date(sub.starts_at).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell className={isExpiringSoon ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                                  {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '-'}
                                  {isExpiringSoon && ' ⚠️'}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {new Date(sub.created_at).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog
        open={Boolean(messagingApplication)}
        onOpenChange={(open) => {
          if (!open) setMessagingApplication(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {messagingApplication
                ? `Messages with ${messagingApplication.full_name}`
                : 'Application messages'}
            </DialogTitle>
            <DialogDescription>
              Reply to the applicant about this application.
            </DialogDescription>
          </DialogHeader>
          {messagingApplication && (
            <MessagesList
              applicationId={messagingApplication.id}
              className="max-h-[60vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
