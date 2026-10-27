import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ApplicationForm } from '@/components/ApplicationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Lock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const Apply = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?redirect=/apply' + (jobId ? '?job=' + jobId : ''));
    }
  }, [user, loading, navigate, jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Apply for Job - Orbit Connect</title>
        <meta name="description" content="Submit your job application through Orbit Connect" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" asChild>
              <Link to={jobId ? `/jobs/${jobId}` : '/jobs'}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </header>
        <main className="py-8 pb-24">
          <ApplicationForm />
        </main>
        <MobileBottomNav />
      </div>
    </>
  );
};

export default Apply;
