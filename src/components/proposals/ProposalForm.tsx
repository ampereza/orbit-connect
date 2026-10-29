import { useEffect, useMemo, useState } from 'react';
import { FileText, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getCountryFlag } from '@/config/jobCountries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ProposalFormProps {
  jobId?: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
  className?: string;
}

interface ProposalJob {
  id: string;
  title: string;
  country: string;
  created_by: string | null;
}

export const ProposalForm = ({
  jobId,
  onSubmitted,
  onCancel,
  className,
}: ProposalFormProps) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ProposalJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(jobId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposedFee, setProposedFee] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (jobId) {
      setSelectedJobId(jobId);
    }
  }, [jobId]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);

      try {
        if (jobId) {
          const { data, error } = await supabase
            .from('jobs')
            .select('id, title, country, created_by')
            .eq('id', jobId)
            .maybeSingle();

          if (error) throw error;
          setJobs(data ? [data] : []);
        } else {
          const { data, error } = await supabase
            .from('jobs')
            .select('id, title, country, created_by')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setJobs((data ?? []) as ProposalJob[]);
        }
      } catch (error) {
        console.error('Error loading jobs for proposal:', error);
        toast.error('Could not load available jobs.');
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [jobId]);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) || null,
    [jobs, selectedJobId],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error('Please sign in to submit a proposal.');
      return;
    }

    if (!selectedJobId) {
      toast.error('Please select a job.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Proposal title and description are required.');
      return;
    }

    const fee = Number(proposedFee);
    if (!Number.isFinite(fee) || fee <= 0) {
      toast.error('Enter a proposed fee greater than zero.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('proposals').insert({
        job_id: selectedJobId,
        freelancer_id: user.id,
        title: title.trim(),
        description: description.trim(),
        proposed_fee: fee,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already submitted a proposal for this job.');
        }
        throw error;
      }

      // Notify the employer who posted the job. Notifications are best-effort:
      // the proposal itself has already been saved.
      if (selectedJob?.created_by) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', user.id)
            .maybeSingle();

          const freelancerName =
            profile?.full_name || profile?.email || user.email || 'A freelancer';

          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: selectedJob.created_by,
              title: 'New proposal received',
              message: `${freelancerName} submitted a proposal for "${selectedJob.title}".`,
              type: 'info',
            });

          if (notificationError) {
            console.error('Error notifying employer:', notificationError);
          }
        } catch (notificationError) {
          console.error('Error notifying employer:', notificationError);
        }
      }

      toast.success('Proposal submitted. The employer has been notified.');

      setTitle('');
      setDescription('');
      setProposedFee('');
      if (!jobId) {
        setSelectedJobId('');
      }
      onSubmitted?.();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast.error(
        error instanceof Error ? error.message : 'Could not submit the proposal.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="proposal-job">Job *</Label>
          {loadingJobs ? (
            <div className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading jobs...
            </div>
          ) : (
            <Select
              value={selectedJobId}
              onValueChange={setSelectedJobId}
              disabled={Boolean(jobId) || jobs.length === 0}
            >
              <SelectTrigger id="proposal-job">
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true">{getCountryFlag(job.country)}</span>
                      <span>{job.title}</span>
                      <span className="text-muted-foreground">· {job.country}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!loadingJobs && jobs.length === 0 && (
            <p className="text-xs text-destructive">
              No active jobs are available for proposals right now.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposal-title">Proposal title *</Label>
          <Input
            id="proposal-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Full-stack developer for your dashboard"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposal-description">Proposal description *</Label>
          <Textarea
            id="proposal-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explain how you will approach the work, your relevant experience, and your timeline."
            rows={6}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposal-fee">Proposed fee (USD) *</Label>
          <Input
            id="proposal-fee"
            type="number"
            min="0"
            step="0.01"
            value={proposedFee}
            onChange={(event) => setProposedFee(event.target.value)}
            placeholder="e.g. 1500"
            required
          />
        </div>

        <div className="flex gap-2 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
          <FileText className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            One proposal per job. You can withdraw a pending proposal from your freelancer
            dashboard.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || loadingJobs || jobs.length === 0}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send proposal
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProposalForm;
