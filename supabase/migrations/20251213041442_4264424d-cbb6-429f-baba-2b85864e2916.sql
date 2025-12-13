-- Create support messages table for storing all bot conversations
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id),
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'telegram')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT NOT NULL CHECK (message_type IN ('user_message', 'bot_response', 'push_notification', 'payment_reminder')),
  content TEXT NOT NULL,
  sender_id TEXT,
  metadata JSONB,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification templates table for admin-configured messages
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('payment_reminder', 'official_update', 'recruitment_update', 'custom')),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create push notification logs
CREATE TABLE public.push_notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id),
  template_id UUID REFERENCES public.notification_templates(id),
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'telegram')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_messages
CREATE POLICY "Admins can view all support messages"
ON public.support_messages FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service can insert support messages"
ON public.support_messages FOR INSERT
WITH CHECK (true);

-- RLS policies for notification_templates
CREATE POLICY "Admins can manage notification templates"
ON public.notification_templates FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active templates"
ON public.notification_templates FOR SELECT
USING (is_active = true);

-- RLS policies for push_notification_logs
CREATE POLICY "Admins can view all notification logs"
ON public.push_notification_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service can insert notification logs"
ON public.push_notification_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service can update notification logs"
ON public.push_notification_logs FOR UPDATE
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_notification_templates_updated_at
BEFORE UPDATE ON public.notification_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add telegram_chat_id and whatsapp_phone to applications for messaging
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;