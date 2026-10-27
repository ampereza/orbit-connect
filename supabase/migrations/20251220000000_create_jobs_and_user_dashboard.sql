-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  salary_range TEXT,
  contract_type TEXT DEFAULT 'full-time',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active jobs (for SEO/public listing)
CREATE POLICY "Anyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (is_active = true);

-- Admins can manage jobs
CREATE POLICY "Admins can manage jobs" 
ON public.jobs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add job_id to applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.jobs(id),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_email ON public.applications(email);
CREATE INDEX IF NOT EXISTS idx_jobs_country ON public.jobs(country);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public.jobs(is_active);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

-- Service/Admin can insert notifications
CREATE POLICY "Service can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Update applications RLS to allow users to view their own applications
CREATE POLICY "Users can view their own applications" 
ON public.applications 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid() OR email IN (SELECT email FROM public.profiles WHERE user_id = auth.uid()));

-- Users can update their own applications (limited)
CREATE POLICY "Users can update their own applications" 
ON public.applications 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

-- Add updated_at trigger for jobs
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notification on application status change
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, application_id, title, message, type)
    VALUES (
      NEW.user_id,
      NEW.id,
      'Application Status Updated',
      'Your application for ' || COALESCE((SELECT title FROM public.jobs WHERE id = NEW.job_id), 'job position') || ' has been updated to: ' || NEW.status,
      CASE 
        WHEN NEW.status = 'rejected' THEN 'error'
        WHEN NEW.status IN ('matched', 'deployed') THEN 'success'
        ELSE 'info'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for status notifications
CREATE TRIGGER on_application_status_change
AFTER UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.notify_application_status_change();
