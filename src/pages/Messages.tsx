import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { MessagesList } from '@/components/messaging/MessagesList';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Application {
  id: string;
  status: string;
  created_at: string;
  job_id: string | null;
  country: string;
  jobs?: { title: string; country: string } | null;
}

interface Message {
  id: string;
  application_id: string;
  sender_id: string;
  recipient_type: 'staff' | 'user';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

interface Thread {
  application: Application;
  lastMessage: Message | null;
  unreadCount: number;
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

const Messages = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/messages');
    }
  }, [user, authLoading, navigate]);

  const loadThreads = useCallback(async () => {
    if (!user) return;

    try {
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('id, status, created_at, job_id, country, jobs(title, country)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      const applications = (applicationsData ?? []) as Application[];
      const applicationIds = applications.map((application) => application.id);

      let messages: Message[] = [];
      if (applicationIds.length > 0) {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .in('application_id', applicationIds)
          .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;

        messages = (messagesData ?? []) as Message[];
      }

      const viewerRecipientType = isAdmin ? 'staff' : 'user';
      const lastByApplication = new Map<string, Message>();
      const unreadByApplication = new Map<string, number>();

      for (const message of messages) {
        if (!lastByApplication.has(message.application_id)) {
          lastByApplication.set(message.application_id, message);
        }
        if (
          !message.read &&
          message.sender_id !== user.id &&
          message.recipient_type === viewerRecipientType
        ) {
          unreadByApplication.set(
            message.application_id,
            (unreadByApplication.get(message.application_id) ?? 0) + 1,
          );
        }
      }

      setThreads(
        applications.map((application) => ({
          application,
          lastMessage: lastByApplication.get(application.id) ?? null,
          unreadCount: unreadByApplication.get(application.id) ?? 0,
        })),
      );
    } catch (error) {
      console.error('Error loading message threads:', error);
      toast({
        title: 'Could not load messages',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user) return;

    loadThreads();

    const channel = supabase
      .channel('messages-thread-list')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, () => {
        loadThreads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadThreads]);

  return (
    <>
      <Helmet>
        <title>Messages | Orbit Connect</title>
        <meta name="description" content="View and reply to conversations about your job applications with the Orbit Connect team." />
        <link rel="canonical" href="https://orbitconnect.com/messages" />
      </Helmet>

      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">
              Conversations about your applications
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading conversations...</p>
            </div>
          ) : threads.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Message threads appear once you apply for a job.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/jobs">Browse jobs</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <button
                  key={thread.application.id}
                  onClick={() => setActiveApplication(thread.application)}
                  className="w-full text-left"
                >
                  <Card className="transition-colors hover:border-primary/40">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="rounded-full bg-primary/10 p-3">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold">
                            {thread.application.jobs?.title || 'Application'}
                          </h3>
                          <Badge className={getApplicationStatusColor(thread.application.status)}>
                            {thread.application.status}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {thread.lastMessage?.message || 'No messages yet'}
                        </p>
                        {thread.lastMessage && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(thread.lastMessage.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        )}
                      </div>
                      {thread.unreadCount > 0 && (
                        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
                          {thread.unreadCount}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </main>

        <Dialog
          open={Boolean(activeApplication)}
          onOpenChange={(open) => {
            if (!open) {
              setActiveApplication(null);
              loadThreads();
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {activeApplication?.jobs?.title
                  ? `${activeApplication.jobs.title} messages`
                  : 'Application messages'}
              </DialogTitle>
              <DialogDescription>
                Talk directly with the Orbit Connect team about this application.
              </DialogDescription>
            </DialogHeader>
            {activeApplication && (
              <MessagesList applicationId={activeApplication.id} className="max-h-[60vh]" />
            )}
          </DialogContent>
        </Dialog>

        <MobileBottomNav />
      </div>
    </>
  );
};

export default Messages;
