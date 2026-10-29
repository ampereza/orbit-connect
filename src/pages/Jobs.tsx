import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Briefcase,
  FilterX,
  MapPin,
  Plus,
  Search,
  Send,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getCountryFlag, getCountryLabel } from '@/config/jobCountries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { JobCreationForm } from '@/components/job-creation/JobCreationForm';
import { ProposalForm } from '@/components/proposals/ProposalForm';
import { MobileBottomNav } from '@/components/MobileBottomNav';

interface Job {
  id: string;
  title: string;
  country: string;
  description: string | null;
  requirements: string[] | null;
  salary_range: string | null;
  contract_type: string | null;
  created_by: string | null;
  created_at: string;
}

const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [proposalJob, setProposalJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setJobs((data ?? []) as Job[]);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const countries = useMemo(
    () => [...new Set(jobs.map((job) => job.country))].sort((a, b) => a.localeCompare(b)),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.country.toLowerCase().includes(query) ||
        job.contract_type?.toLowerCase().includes(query) ||
        job.requirements?.some((requirement) => requirement.toLowerCase().includes(query));

      const matchesCountry = selectedCountry === 'all' || job.country === selectedCountry;

      return matchesSearch && matchesCountry;
    });
  }, [jobs, searchTerm, selectedCountry]);

  const hasActiveFilters = searchTerm.trim().length > 0 || selectedCountry !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCountry('all');
  };

  const openPostJob = () => {
    if (!user) {
      navigate('/auth?redirect=/jobs');
      return;
    }
    setPostJobOpen(true);
  };

  const openProposal = (job: Job) => {
    if (!user) {
      navigate('/auth?redirect=/jobs');
      return;
    }
    setProposalJob(job);
  };

  return (
    <>
      <Helmet>
        <title>Available Jobs Abroad - Overseas Employment Opportunities | Orbit Connect</title>
        <meta name="description" content="Browse available overseas job opportunities by country. Find work abroad with visa sponsorship, competitive salaries. Apply now for international employment." />
        <meta name="keywords" content="jobs abroad, overseas jobs, international employment, work abroad, visa sponsorship jobs, overseas recruitment" />
        <link rel="canonical" href="https://orbitconnect.com/jobs" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Available Jobs</h1>
                <p className="text-muted-foreground">
                  Overseas placements and freelance projects
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={openPostJob}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post Job
                </Button>
                <Button asChild variant="outline">
                  <Link to="/dashboard">My Dashboard</Link>
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title, country, skill, or contract type..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true">{getCountryFlag(country)}</span>
                        <span>{country}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="outline" onClick={resetFilters}>
                  <FilterX className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredJobs.length} job{filteredJobs.length === 1 ? '' : 's'} found
            </span>
            {selectedCountry !== 'all' && <span>{getCountryLabel(selectedCountry)}</span>}
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No jobs found matching your criteria</p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="flex flex-col transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-xl">
                        <Link to={`/jobs/${job.id}`} className="hover:underline">
                          {job.title}
                        </Link>
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0">
                        <MapPin className="mr-1 h-3 w-3" />
                        {getCountryFlag(job.country)} {job.country}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2 capitalize">
                      {job.contract_type || 'Full-time'}
                      {job.created_by === user?.id && (
                        <Badge variant="outline" className="text-[10px]">
                          Your post
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                      {job.description}
                    </p>
                    {job.salary_range && (
                      <p className="mb-4 text-sm font-medium">Salary: {job.salary_range}</p>
                    )}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-2 text-xs font-medium">Requirements:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.requirements.slice(0, 3).map((requirement, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {requirement}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto grid grid-cols-2 gap-2">
                      <Button asChild>
                        <Link to={`/apply?job=${job.id}`}>
                          Apply
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" onClick={() => openProposal(job)}>
                        <Send className="mr-2 h-4 w-4" />
                        Proposal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        <Dialog open={postJobOpen} onOpenChange={setPostJobOpen}>
          <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post a job</DialogTitle>
              <DialogDescription>
                Publish a freelance project or overseas placement for applicants.
              </DialogDescription>
            </DialogHeader>
            <JobCreationForm
              onCreated={() => {
                setPostJobOpen(false);
                fetchJobs();
              }}
              onCancel={() => setPostJobOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(proposalJob)}
          onOpenChange={(open) => {
            if (!open) setProposalJob(null);
          }}
        >
          <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit a proposal</DialogTitle>
              <DialogDescription>
                {proposalJob
                  ? `Send your proposal for "${proposalJob.title}".`
                  : 'Send your proposal to the employer.'}
              </DialogDescription>
            </DialogHeader>
            {proposalJob && (
              <ProposalForm
                jobId={proposalJob.id}
                onSubmitted={() => setProposalJob(null)}
                onCancel={() => setProposalJob(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        <MobileBottomNav />
      </div>
    </>
  );
};

export default Jobs;
