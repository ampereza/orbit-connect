-- Create posts table for posted jobs
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  location TEXT,
  employment_type TEXT DEFAULT 'full-time',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'filled', 'closed')),
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_posts_job FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view active posts
CREATE POLICY "Anyone can view active posts" ON public.posts FOR SELECT USING (status = 'active');

-- Admins can manage posts
CREATE POLICY "Admins can manage posts" ON public.posts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();