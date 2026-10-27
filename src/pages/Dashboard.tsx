import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, FileText, Briefcase, LogOut, Loader2, LayoutDashboard } from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { toast } from 'sonner';

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

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

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
    const handleSwitchTab = (e: any) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch applications
      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select('*, jobs(title, country)')
        .or(`user_id.eq.${user?.id},email.eq.${user?.email}`)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;
      setApplications(apps || []);

      // Fetch notifications
      const { data: notifs, error: notifsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notifsError) throw notifsError;
      setNotifications(notifs || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getStatusColor = (status: string) => {
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pb-20 md:pb-0">
      <header className="border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Track your application progress</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="default" asChild>
              <Link to="/kyc">Profile</Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Applications */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  My Applications
                </CardTitle>
                <CardDescription>Track your job applications and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Start your job application</p>
                    <Button asChild>
                      <Link to="/jobs">Browse Available Jobs</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">
                            {app.jobs?.title || 'Application'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {app.jobs?.country || app.country} • Applied on {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
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
                {notifications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No new notifications</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-lg border cursor-pointer ${!notif.read ? 'bg-muted/50' : ''}`}
                        onClick={() => !notif.read && markAsRead(notif.id)}
                      >
                        <h4 className="font-medium text-sm">{notif.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notif.created_at).toLocaleDateString()}
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
                    <Briefcase className="h-4 w-4 mr-2" />
                    View All Jobs
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/kyc">
                    <FileText className="h-4 w-4 mr-2" />
                    Finish KYC
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;
