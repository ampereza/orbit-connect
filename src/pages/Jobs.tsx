import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, Search, ArrowRight } from 'lucide-react';
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

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [countries, setCountries] = useState<string[]>([]);

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
      
      setJobs(data || []);
      
      // Get unique countries
      const uniqueCountries = [...new Set((data || []).map(job => job.country))];
      setCountries(uniqueCountries);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || job.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Available Jobs</h1>
                <p className="text-muted-foreground">Overseas employment opportunities</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/dashboard">My Dashboard</Link>
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No jobs found matching your criteria</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <Badge variant="secondary">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.country}
                      </Badge>
                    </div>
                    {job.contract_type && (
                      <CardDescription>{job.contract_type}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {job.description}
                    </p>
                    {job.salary_range && (
                      <p className="text-sm font-medium mb-4">Salary: {job.salary_range}</p>
                    )}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium mb-2">Requirements:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.requirements.slice(0, 3).map((req, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {req}
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
                    <Button asChild className="w-full">
                      <Link to={`/apply?job=${job.id}`}>
                        Apply Now <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Jobs;
