-- Create messages table for job application communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_type TEXT NOT NULL DEFAULT 'staff' CHECK (recipient_type IN ('staff', 'user')),
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages related to their applications.
-- A user owns the conversation when the application belongs to them, and they
-- can always read messages they sent themselves.
CREATE POLICY "Users can view their application messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id
  OR EXISTS (
    SELECT 1
    FROM public.applications
    WHERE applications.id = messages.application_id
      AND (
        applications.user_id = auth.uid()
        OR applications.email IN (
          SELECT profiles.email
          FROM public.profiles
          WHERE profiles.user_id = auth.uid()
        )
      )
  )
);

-- Users can send messages to staff on their own applications
CREATE POLICY "Users can send messages on their applications"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND recipient_type = 'staff'
  AND EXISTS (
    SELECT 1
    FROM public.applications
    WHERE applications.id = messages.application_id
      AND (
        applications.user_id = auth.uid()
        OR applications.email IN (
          SELECT profiles.email
          FROM public.profiles
          WHERE profiles.user_id = auth.uid()
        )
      )
  )
);

-- Users can mark messages addressed to them as read
CREATE POLICY "Users can mark their messages as read"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  recipient_type = 'user'
  AND EXISTS (
    SELECT 1
    FROM public.applications
    WHERE applications.id = messages.application_id
      AND (
        applications.user_id = auth.uid()
        OR applications.email IN (
          SELECT profiles.email
          FROM public.profiles
          WHERE profiles.user_id = auth.uid()
        )
      )
  )
)
WITH CHECK (
  recipient_type = 'user'
  AND EXISTS (
    SELECT 1
    FROM public.applications
    WHERE applications.id = messages.application_id
      AND (
        applications.user_id = auth.uid()
        OR applications.email IN (
          SELECT profiles.email
          FROM public.profiles
          WHERE profiles.user_id = auth.uid()
        )
      )
  )
);

-- Staff/admins can view and manage all messages
CREATE POLICY "Staff can view all messages"
ON public.messages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Indexes for conversation lookups and unread counts
CREATE INDEX idx_messages_application_id ON public.messages(application_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_unread
  ON public.messages(application_id, recipient_type)
  WHERE read = false;

-- Keep updated_at current
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime updates for conversations where the publication exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
