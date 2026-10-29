import { useState } from 'react';
import { Briefcase, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { jobCountries } from '@/config/jobCountries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface JobCreationFormProps {
  onCreated?: (jobId: string) => void;
  onCancel?: () => void;
  className?: string;
}

const contractTypes = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'remote', label: 'Remote' },
];

const initialForm = {
  title: '',
  country: '',
  description: '',
  requirements: '',
  salaryRange: '',
  contractType: 'full-time',
};

export const JobCreationForm = ({ onCreated, onCancel, className }: JobCreationFormProps) => {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error('Please sign in to post a job.');
      return;
    }

    if (!form.title.trim() || !form.country || !form.description.trim()) {
      toast.error('Title, country, and description are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const requirements = form.requirements
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);

      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: form.title.trim(),
          country: form.country,
          description: form.description.trim(),
          requirements: requirements.length > 0 ? requirements : null,
          salary_range: form.salaryRange.trim() || null,
          contract_type: form.contractType,
          is_active: true,
          created_by: user.id,
        })
        .select('id')
        .single();

      if (error) throw error;

      toast.success('Job posted successfully.');
      setForm(initialForm);
      onCreated?.(data.id);
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error(
        error instanceof Error ? error.message : 'Could not post the job. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="job-title">Job title *</Label>
          <Input
            id="job-title"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="e.g. Frontend Developer"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="job-country">Country *</Label>
            <Select
              value={form.country}
              onValueChange={(value) => updateField('country', value)}
            >
              <SelectTrigger id="job-country">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {jobCountries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true">{country.flag}</span>
                      <span>{country.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-contract">Contract type</Label>
            <Select
              value={form.contractType}
              onValueChange={(value) => updateField('contractType', value)}
            >
              <SelectTrigger id="job-contract">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contractTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-description">Description *</Label>
          <Textarea
            id="job-description"
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Describe the role, responsibilities, and what success looks like."
            rows={5}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-requirements">Requirements</Label>
          <Textarea
            id="job-requirements"
            value={form.requirements}
            onChange={(event) => updateField('requirements', event.target.value)}
            placeholder={'One requirement per line\ne.g. 3+ years React experience'}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Separate requirements with a new line or comma.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-salary">Salary range</Label>
          <Input
            id="job-salary"
            value={form.salaryRange}
            onChange={(event) => updateField('salaryRange', event.target.value)}
            placeholder="e.g. $2,500 - $3,500/month"
          />
        </div>

        <div className="flex gap-2 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
          <Briefcase className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Posted jobs are public and can receive proposals from freelancers. You can
            manage them from your dashboard.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Post job
          </Button>
        </div>
      </div>
    </form>
  );
};

export default JobCreationForm;
