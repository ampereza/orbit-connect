import { useCallback, useEffect, useRef, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Loader2, MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface MessagesListProps {
  applicationId: string;
  className?: string;
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

const typeStyles: Record<Message['type'], string> = {
  info: '',
  success: 'border-green-200 bg-green-50 text-green-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
  error: 'border-red-200 bg-red-50 text-red-950',
};

export const MessagesList = ({ applicationId, className }: MessagesListProps) => {
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadIds, setUnreadIds] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(
    async (showSpinner = false) => {
      if (!user) {
        setMessages([]);
        setLoading(false);
        return;
      }

      if (showSpinner) {
        setLoading(true);
      }

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('application_id', applicationId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const rows = (data ?? []) as Message[];
        setMessages(rows);

        // Incoming messages are the ones addressed to the current viewer's side
        // of the conversation: 'user' for applicants, 'staff' for admins.
        const viewerRecipientType = isAdmin ? 'staff' : 'user';
        const incomingUnread = rows.filter(
          (message) =>
            !message.read &&
            message.sender_id !== user.id &&
            message.recipient_type === viewerRecipientType,
        );

        if (incomingUnread.length > 0) {
          const ids = incomingUnread.map((message) => message.id);
          setUnreadIds((previous) => Array.from(new Set([...previous, ...ids])));

          const { error: readError } = await supabase
            .from('messages')
            .update({ read: true })
            .in('id', ids);

          if (readError) {
            console.error('Error marking messages as read:', readError);
          } else {
            setMessages((previous) =>
              previous.map((message) =>
                ids.includes(message.id) ? { ...message, read: true } : message,
              ),
            );
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: 'Could not load messages',
          description: 'Please try again in a moment.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [applicationId, isAdmin, user],
  );

  useEffect(() => {
    loadMessages(true);
  }, [loadMessages]);

  useEffect(() => {
    if (!applicationId) return;

    const channel = supabase
      .channel(`application-messages-${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `application_id=eq.${applicationId}`,
        },
        () => {
          loadMessages();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applicationId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  const handleSend = async () => {
    const text = draft.trim();

    if (!text || isSending) return;

    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'You need to be signed in to send a message.',
        variant: 'destructive',
      });
      return;
    }

    // Check Connects balance before message send
    const { data: balanceResult } = await supabase
      .from('worker_balances')
      .select('balance, currency')
      .eq('user_id', user.id)
      .single();

    const balance = Number(balanceResult?.balance ?? 0);
    const messageFee = 1; // 1 Connects per message

    if (balance < messageFee) {
      toast({
        title: 'Insufficient Connects',
        description: `You need ${messageFee} Connects to send a message. Your current balance is ${balance}.`,
        variant: 'destructive',
      });
      setIsSending(false);
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          application_id: applicationId,
          sender_id: user.id,
          recipient_type: isAdmin ? 'user' : 'staff',
          message: text,
          type: 'info',
          read: false,
        })
        .select()
        .single();

      if (error) throw error;

      setDraft('');
      setMessages((previous) => {
        if (previous.some((message) => message.id === (data as Message).id)) {
          return previous;
        }
        return [...previous, data as Message];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Message not sent',
        description:
          error instanceof Error ? error.message : 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const unreadCount = messages.filter(
    (message) =>
      !message.read &&
      message.sender_id !== user?.id &&
      message.recipient_type === (isAdmin ? 'staff' : 'user'),
  ).length;

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-start justify-between gap-3 border-b pb-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            <MessageSquare className="h-4 w-4" />
            Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                {unreadCount} new
              </Badge>
            )}
          </h3>
          <p className="text-xs text-muted-foreground">
            Chat with the Orbit Connect team about this application.
          </p>
        </div>
      </div>

      <div className="min-h-[220px] flex-1 space-y-3 overflow-y-auto py-4">
        {loading ? (
          <div className="flex h-full min-h-[180px] items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Send a message if you have a question about your application. Staff replies
              will appear here.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === user?.id;
            const isUnread = unreadIds.includes(message.id);
            const senderLabel = isMine
              ? 'You'
              : isAdmin
                ? 'Applicant'
                : 'Orbit Connect Staff';

            return (
              <div
                key={message.id}
                className={cn('flex flex-col gap-1', isMine ? 'items-end' : 'items-start')}
              >
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium">{senderLabel}</span>
                  {isUnread && (
                    <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                      New
                    </Badge>
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[85%] whitespace-pre-wrap rounded-2xl border px-3.5 py-2.5 text-sm',
                    isMine
                      ? 'rounded-br-sm border-primary bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-muted text-foreground',
                    !isMine && typeStyles[message.type],
                  )}
                >
                  {message.message}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span title={format(new Date(message.created_at), 'PPpp')}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                  {isMine &&
                    (message.read ? (
                      <span className="flex items-center gap-0.5" title="Read">
                        <CheckCheck className="h-3 w-3" />
                        Read
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5" title="Sent">
                        <Check className="h-3 w-3" />
                        Sent
                      </span>
                    ))}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t pt-3">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={3}
          disabled={isSending}
          className="resize-none"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            Press Enter to send, Shift + Enter for a new line.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={!draft.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="ml-2">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessagesList;
