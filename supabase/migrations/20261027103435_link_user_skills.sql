-- Create user skills tracking migration
-- This migration adds a skills tracking mechanism and ensures skills are 
-- properly linked for job matching functionality

-- Add skill tracking column to applications if not exists
-- (Note: applicant_profiles already has skills column, this ensures tracking)

-- Create skill_match_log table to track job matches based on skills
CREATE TABLE public.skill_match_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER DEFAULT 0,
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  skills_match JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skill_match_log ENABLE ROW LEVEL SECURITY;

-- Anyone can view their own match logs
CREATE POLICY "Users can view their own skill matches" ON public.skill_match_log FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage match logs
CREATE POLICY "Admins can manage skill matches" ON public.skill_match_log FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_skill_match_log_updated_at
BEFORE UPDATE ON public.skill_match_log
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();