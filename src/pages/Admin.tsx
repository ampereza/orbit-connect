import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
import { Loader2, LogOut, Search, Users, CheckCircle, Clock, XCircle, RefreshCw, Shield, AlertTriangle, MessageSquare } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Application = Database['public']['Tables']['applications']['Row'];
type ApplicationStatus = Database['public']['Enums']['application_status'];
type InsuranceSubscription = Database['public']['Tables']['insurance_subscriptions']['Row'];

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

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
      fetchInsuranceSubscriptions();
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const countries = [...new Set(applications.map(app => app.country))];

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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Applications
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
