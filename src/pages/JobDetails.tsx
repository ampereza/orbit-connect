import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, DollarSign, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface Job {
  id: string;
  title: string;
  country: string;
  description: string | null;
  requirements: string[] | null;
  salary_range: string | null;
  contract_type: string | null;
}

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Job not found</p>
          <Button asChild>
            <Link to="/jobs">Back to Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{job.title} in {job.country} - Job Details | Orbit Connect</title>
        <meta name="description" content={job.description?.substring(0, 160) || `Apply for ${job.title} position in ${job.country}. Overseas employment opportunity with Orbit Connect.`} />
        <meta name="keywords" content={`${job.title}, jobs in ${job.country}, overseas jobs, work abroad`} />
        <link rel="canonical" href={`https://orbitconnect.com/jobs/${job.id}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/jobs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Link>
            </Button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.country}
                  </span>
                  {job.contract_type && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.contract_type}
                    </span>
                  )}
                  {job.salary_range && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {job.salary_range}
                    </span>
                  )}
                </div>
              </div>
              <Button size="lg" asChild>
                <Link to={`/apply?job=${job.id}`}>Apply for this Job</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{job.description}</p>
              </CardContent>
            </Card>

            {job.requirements && job.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Ready to Apply?</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your application process for this position
                  </p>
                  <Button size="lg" asChild>
                    <Link to={`/apply?job=${job.id}`}>Apply Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default JobDetails;
