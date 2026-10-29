import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  LayoutDashboard,
  Loader2,
  MailQuestion,
  MapPin,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessagesList } from '@/components/messaging/MessagesList';
import { MobileBottomNav } from '@/components/MobileBottomNav';

interface ApplicationSummary {
  id: string;
  status: string;
  created_at: string;
  country: string;
  processing_fee: string | null;
  full_name: string;
  email: string;
  jobs?: { title: string; country: string } | null;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-500',
  paid: 'bg-green-500',
  verified: 'bg-green-500',
  matched: 'bg-blue-500',
  deployed: 'bg-blue-500',
  rejected: 'bg-red-500',
};

const ApplicationSuccess = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('application_id');

  const [application, setApplication] = useState<ApplicationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/application-success');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!applicationId || !user) {
      if (!authLoading) {
        setLoading(false);
      }
      return;
    }

    const fetchApplication = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*, jobs(title, country)')
          .eq('id', applicationId)
          .maybeSingle();

        if (error) throw error;
        setApplication(data as ApplicationSummary | null);
      } catch (error) {
        console.error('Error fetching application:', error);
        toast({
          title: 'Could not load application',
          description: 'Your application was submitted, but we could not load its details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, authLoading, user]);

  const copyApplicationId = async () => {
    if (!applicationId) return;

    try {
      await navigator.clipboard.writeText(applicationId);
      toast({
        title: 'Application ID copied',
        description: 'Keep this reference for your records.',
      });
    } catch {
      toast({
        title: 'Could not copy',
        description: 'Please copy the application ID manually.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!applicationId || !application) {
    return (
      <>
        <Helmet>
          <title>Application Not Found - Orbit Connect</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Application not found</CardTitle>
              <CardDescription>
                We could not find an application with that reference.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/jobs">Browse jobs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const jobTitle = application.jobs?.title || 'Job application';
  const jobCountry = application.jobs?.country || application.country;

  return (
    <>
      <Helmet>
        <title>Application Submitted - Orbit Connect</title>
        <meta name="description" content="Your Orbit Connect job application was submitted successfully." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pb-24">
        <header className="border-b bg-card/80 backdrop-blur">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Application Complete</h1>
              <p className="text-xs text-muted-foreground">
                Keep your application ID handy for future enquiries.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl space-y-6">
            <Card className="overflow-hidden">
              <div className="bg-primary/5 px-6 py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-9 w-9 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  Application submitted!
                </h2>
                <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                  Thanks, {application.full_name.split(' ')[0]}. Your application for{' '}
                  <strong>{jobTitle}</strong> is now in our queue.
                </p>
              </div>

              <CardContent className="space-y-5 pt-6">
                <div className="rounded-xl border bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Application ID
                      </p>
                      <p className="break-all font-mono text-sm font-medium">
                        {application.id}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyApplicationId}
                    >
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Briefcase className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Position
                      </p>
                      <p className="font-medium">{jobTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Destination
                      </p>
                      <p className="font-medium">{jobCountry}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ClipboardCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Status
                      </p>
                      <Badge className={statusStyles[application.status] || 'bg-amber-500'}>
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Submitted
                    </p>
                    <p className="font-medium">
                      {format(new Date(application.created_at), 'PPP')}
                    </p>
                  </div>
                  {application.processing_fee && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Connects fee
                      </p>
                      <p className="font-medium">{application.processing_fee}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-secondary/20 bg-secondary/10 p-4 text-sm">
                  <p className="font-medium text-foreground">What happens next?</p>
                  <ul className="mt-2 space-y-1.5 text-muted-foreground">
                    <li>Our team reviews your profile and cover letter.</li>
                    <li>
                      You will usually hear back within <strong>3–5 business days</strong>.
                    </li>
                    <li>
                      Staff replies and status updates appear in your dashboard and in the
                      messages section below.
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button className="flex-1" asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Track application
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/jobs">
                      Browse more jobs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MailQuestion className="h-5 w-5" />
                  Questions?
                </CardTitle>
                <CardDescription>
                  Send a message to our team about this application. Replies will show up here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MessagesList applicationId={application.id} className="max-h-[520px]" />
              </CardContent>
            </Card>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </>
  );
};

export default ApplicationSuccess;
