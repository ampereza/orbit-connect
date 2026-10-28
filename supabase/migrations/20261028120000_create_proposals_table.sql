-- ============================================================
-- Freelancer marketplace: proposals, freelancer profiles, and
-- employer ownership for jobs.
-- ============================================================

-- Proposal lifecycle status
DO $$
BEGIN
  CREATE TYPE public.proposal_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------
-- Freelancer profiles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.freelancer_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hourly_rate NUMERIC(12, 2) CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
  skills TEXT[] NOT NULL DEFAULT '{}',
  portfolio TEXT,
  availability TEXT,
  ratings NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (ratings >= 0 AND ratings <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;

-- Marketplace profiles are visible to signed-in users.
CREATE POLICY "Authenticated users can view freelancer profiles"
ON public.freelancer_profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Freelancers can create their own profile"
ON public.freelancer_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Freelancers can update their own profile"
ON public.freelancer_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage freelancer profiles"
ON public.freelancer_profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ------------------------------------------------------------
-- Jobs: employer ownership
-- ------------------------------------------------------------
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON public.jobs(created_by);

CREATE POLICY "Employers can view their own jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Employers can create jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Employers can update their own jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Employers can delete their own jobs"
ON public.jobs
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- ------------------------------------------------------------
-- Proposals
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposed_fee NUMERIC(12, 2) NOT NULL CHECK (proposed_fee >= 0),
  status public.proposal_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT proposals_job_freelancer_unique UNIQUE (job_id, freelancer_id)
);

CREATE INDEX IF NOT EXISTS idx_proposals_job_id ON public.proposals(job_id);
CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON public.proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals(created_at);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Freelancers can view their own proposals"
ON public.proposals
FOR SELECT
TO authenticated
USING (freelancer_id = auth.uid());

CREATE POLICY "Employers can view proposals for their jobs"
ON public.proposals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.jobs
    WHERE jobs.id = proposals.job_id
      AND jobs.created_by = auth.uid()
  )
);

CREATE POLICY "Freelancers can submit proposals"
ON public.proposals
FOR INSERT
TO authenticated
WITH CHECK (
  freelancer_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.jobs
    WHERE jobs.id = proposals.job_id
      AND jobs.is_active = true
  )
);

CREATE POLICY "Freelancers can update their pending proposals"
ON public.proposals
FOR UPDATE
TO authenticated
USING (freelancer_id = auth.uid() AND status = 'pending')
WITH CHECK (
  freelancer_id = auth.uid()
  AND status IN ('pending', 'withdrawn')
);

CREATE POLICY "Employers can update proposals for their jobs"
ON public.proposals
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.jobs
    WHERE jobs.id = proposals.job_id
      AND jobs.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.jobs
    WHERE jobs.id = proposals.job_id
      AND jobs.created_by = auth.uid()
  )
);

CREATE POLICY "Freelancers can delete their pending proposals"
ON public.proposals
FOR DELETE
TO authenticated
USING (freelancer_id = auth.uid() AND status = 'pending');

CREATE POLICY "Staff can manage all proposals"
ON public.proposals
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Employers may only change proposal status, not the freelancer's content.
CREATE OR REPLACE FUNCTION public.protect_proposal_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = OLD.freelancer_id THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = OLD.job_id AND jobs.created_by = auth.uid()
  ) THEN
    IF NEW.job_id IS DISTINCT FROM OLD.job_id
      OR NEW.freelancer_id IS DISTINCT FROM OLD.freelancer_id
      OR NEW.title IS DISTINCT FROM OLD.title
      OR NEW.description IS DISTINCT FROM OLD.description
      OR NEW.proposed_fee IS DISTINCT FROM OLD.proposed_fee
    THEN
      RAISE EXCEPTION 'Employers can only update the proposal status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_proposal_fields
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.protect_proposal_fields();

-- Notify freelancers when a proposal is accepted, rejected, or withdrawn.
CREATE OR REPLACE FUNCTION public.notify_proposal_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.freelancer_id,
      'Proposal ' || NEW.status,
      'Your proposal "' || NEW.title || '" has been ' || NEW.status || '.',
      CASE NEW.status
        WHEN 'accepted' THEN 'success'
        WHEN 'rejected' THEN 'error'
        WHEN 'withdrawn' THEN 'warning'
        ELSE 'info'
      END
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_proposal_status_change
AFTER UPDATE OF status ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.notify_proposal_status_change();

-- ------------------------------------------------------------
-- Applications: optional link to an accepted proposal
-- ------------------------------------------------------------
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_applications_proposal_id ON public.applications(proposal_id);

-- ------------------------------------------------------------
-- Staff can read profiles so they can review proposals
-- ------------------------------------------------------------
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Employers can see the profile of freelancers who proposed to their jobs.
CREATE POLICY "Employers can view proposal freelancer profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.proposals
    JOIN public.jobs ON jobs.id = proposals.job_id
    WHERE proposals.freelancer_id = profiles.user_id
      AND jobs.created_by = auth.uid()
  )
);

-- ------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------
CREATE TRIGGER update_freelancer_profiles_updated_at
BEFORE UPDATE ON public.freelancer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
