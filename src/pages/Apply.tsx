import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { applicationFees } from '@/config/applicationFees';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  DollarSign,
  Loader2,
  Lock,
  MapPin,
  Send,
  UserRound,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { toast } from '@/hooks/use-toast';

interface Job {
  id: string;
  title: string;
  country: string;
  salary_range: string | null;
  contract_type: string | null;
}

interface SavedApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp_phone: string | null;
  country: string;
  age: number;
  has_passport: boolean;
}

interface ApplicantProfileRecord {
  id: string;
  application_id: string;
  previous_employer: string | null;
  job_title: string | null;
  years_of_experience: number | null;
  skills: string[] | null;
  languages: string[] | null;
  certifications: string[] | null;
  marital_status: string | null;
  number_of_dependents: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  next_of_kin_name: string | null;
  next_of_kin_phone: string | null;
  next_of_kin_relationship: string | null;
  education_level: string | null;
  education_institution: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  whatsappPhone: string;
  country: string;
  age: string;
  hasPassport: boolean;
}

const emptyProfile: ProfileData = {
  fullName: '',
  email: '',
  phone: '',
  whatsappPhone: '',
  country: '',
  age: '',
  hasPassport: false,
};

const Apply = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job');

  const [job, setJob] = useState<Job | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>(emptyProfile);
  const [savedApplication, setSavedApplication] = useState<SavedApplication | null>(null);
  const [savedApplicantProfile, setSavedApplicantProfile] =
    useState<ApplicantProfileRecord | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?redirect=/apply' + (jobId ? '?job=' + jobId : ''));
    }
  }, [user, loading, navigate, jobId]);

  useEffect(() => {
    if (jobId) {
      fetchJob(jobId);
    }
  }, [jobId]);

  useEffect(() => {
    if (user) {
      fetchSavedProfile(user.id, user.email);
    }
  }, [user]);

  const fetchJob = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, country, salary_range, contract_type')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
    }
  };

  const fetchSavedProfile = async (userId: string, userEmail?: string) => {
    setLoadingProfile(true);

    try {
      // A user's saved details live on their most recent application. The
      // applicant_profiles row extends those details with skills and KYC data.
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let latest = applications?.[0] as SavedApplication | undefined;

      // Older applications may only be linked by email.
      if (!latest && userEmail) {
        const { data: applicationsByEmail, error: emailError } = await supabase
          .from('applications')
          .select('*')
          .eq('email', userEmail)
          .order('created_at', { ascending: false })
          .limit(1);

        if (emailError) throw emailError;
        latest = applicationsByEmail?.[0] as SavedApplication | undefined;
      }

      if (latest) {
        setSavedApplication(latest);
        setProfileData({
          fullName: latest.full_name,
          email: latest.email || userEmail || '',
          phone: latest.phone,
          whatsappPhone: latest.whatsapp_phone || '',
          country: latest.country,
          age: String(latest.age),
          hasPassport: latest.has_passport,
        });

        const { data: applicantProfile } = await supabase
          .from('applicant_profiles')
          .select('*')
          .eq('application_id', latest.id)
          .maybeSingle();

        setSavedApplicantProfile(
          (applicantProfile as ApplicantProfileRecord | null) ?? null,
        );
        return;
      }

      // First-time applicants have no saved application yet. Prefill what we
      // can from the base profile and let them confirm the required details.
      const { data: baseProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', userId)
        .maybeSingle();

      setProfileData({
        ...emptyProfile,
        fullName: baseProfile?.full_name || '',
        email: baseProfile?.email || userEmail || '',
      });
    } catch (error) {
      console.error('Error fetching saved profile:', error);
      toast({
        title: 'Could not load your profile',
        description: 'Please refresh the page or complete your profile from the dashboard.',
        variant: 'destructive',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const selectedCountry = useMemo(
    () => applicationFees.find((country) => country.value === profileData.country),
    [profileData.country],
  );

  const hasSavedProfile = Boolean(savedApplication);

  const updateProfileField = (field: keyof ProfileData, value: string | boolean) => {
    setProfileData((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      navigate('/auth?redirect=/apply' + (jobId ? '?job=' + jobId : ''));
      return;
    }

    if (!coverLetter.trim()) {
      toast({
        title: 'Cover letter required',
        description: 'Tell the employer why you are a good fit for this role.',
        variant: 'destructive',
      });
      return;
    }

    if (!hasSavedProfile) {
      if (!profileData.fullName.trim() || !profileData.phone.trim()) {
        toast({
          title: 'Profile details required',
          description: 'Please add your full name and phone number.',
          variant: 'destructive',
        });
        return;
      }

      if (!selectedCountry) {
        toast({
          title: 'Country required',
          description: 'Please select your country.',
          variant: 'destructive',
        });
        return;
      }

      const age = Number.parseInt(profileData.age, 10);
      if (!Number.isFinite(age) || age < 18 || age > 49) {
        toast({
          title: 'Valid age required',
          description: 'Please enter an age between 18 and 49.',
          variant: 'destructive',
        });
        return;
      }
    }

    const age = Number.parseInt(profileData.age, 10);

    setIsSubmitting(true);

    try {
      const { data: application, error } = await supabase
        .from('applications')
        .insert({
          full_name: profileData.fullName.trim(),
          email: profileData.email || user.email || '',
          phone: profileData.phone.trim(),
          whatsapp_phone: profileData.whatsappPhone.trim() || profileData.phone.trim(),
          country: profileData.country,
          age,
          has_passport: profileData.hasPassport,
          cover_letter: coverLetter.trim(),
          processing_fee: selectedCountry?.displayFee || '13 USD',
          status: 'pending',
          job_id: jobId || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Carry the applicant's extended profile forward to the new application.
      if (savedApplicantProfile) {
        const {
          id: _id,
          application_id: _applicationId,
          created_at: _createdAt,
          updated_at: _updatedAt,
          ...profileFields
        } = savedApplicantProfile;

        const { error: profileError } = await supabase
          .from('applicant_profiles')
          .insert({
            application_id: application.id,
            ...profileFields,
          });

        if (profileError) {
          console.error('Error copying applicant profile:', profileError);
        }
      }

      // Keep the existing WhatsApp follow-up behaviour, but never block the
      // application if the ManyChat function is unavailable.
      try {
        await supabase.functions.invoke('manychat', {
          body: {
            action: 'subscribe',
            applicationId: application.id,
            phone: profileData.phone,
            email: profileData.email || user.email,
            fullName: profileData.fullName,
          },
        });
      } catch (manyChatError) {
        console.error('ManyChat subscription error:', manyChatError);
      }

      navigate(`/application-success?application_id=${application.id}`);
    } catch (error) {
      console.error('Application error:', error);
      toast({
        title: 'Could not submit application',
        description:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || (user && loadingProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const countryLabel =
    selectedCountry?.label ||
    applicationFees.find((country) => country.value === profileData.country)?.label ||
    profileData.country;

  return (
    <>
      <Helmet>
        <title>{job ? `Apply for ${job.title} - Orbit Connect` : 'Apply for Job - Orbit Connect'}</title>
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
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
                  Start Your Journey
                </span>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                  {job ? `Apply for ${job.title}` : 'Apply Now'}
                </h1>
                <p className="text-muted-foreground text-lg">
                  Your saved profile details will be used for this application. Just add a
                  cover letter to finish.
                </p>
              </div>

              {job && (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {job.title}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {job.country}
                      </span>
                      {job.salary_range && (
                        <span className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {job.salary_range}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!hasSavedProfile && (
                <div className="mb-6 flex gap-3 rounded-xl border border-secondary/30 bg-secondary/10 p-4 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 text-secondary" />
                  <p className="text-foreground">
                    We could not find a saved profile for your account yet. Confirm your
                    basic details below once, and we will reuse them for future
                    applications.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UserRound className="h-5 w-5" />
                      Your Profile
                    </CardTitle>
                    <CardDescription>
                      {hasSavedProfile
                        ? 'These details come from your saved profile.'
                        : 'Add the details we need to process your application.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hasSavedProfile ? (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Full name
                            </p>
                            <p className="font-medium text-foreground">{profileData.fullName}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Email
                            </p>
                            <p className="font-medium text-foreground break-all">
                              {profileData.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Phone
                            </p>
                            <p className="font-medium text-foreground">{profileData.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Country
                            </p>
                            <p className="font-medium text-foreground">
                              {countryLabel || 'Not set'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Age
                            </p>
                            <p className="font-medium text-foreground">{profileData.age}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Passport
                            </p>
                            <Badge variant={profileData.hasPassport ? 'default' : 'secondary'}>
                              {profileData.hasPassport ? 'Available' : 'Not confirmed'}
                            </Badge>
                          </div>
                        </div>

                        {savedApplication && (
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/kyc?application_id=${savedApplication.id}`}>
                              Edit saved profile
                            </Link>
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="fullName">Full name *</Label>
                          <Input
                            id="fullName"
                            value={profileData.fullName}
                            onChange={(event) => updateProfileField('fullName', event.target.value)}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={(event) => updateProfileField('phone', event.target.value)}
                            placeholder="+256 700 000000"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country *</Label>
                          <select
                            id="country"
                            value={profileData.country}
                            onChange={(event) => updateProfileField('country', event.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                          >
                            <option value="">Select your country</option>
                            {applicationFees.map((country) => (
                              <option key={country.value} value={country.value}>
                                {country.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age">Age *</Label>
                          <Input
                            id="age"
                            type="number"
                            min={18}
                            max={49}
                            value={profileData.age}
                            onChange={(event) => updateProfileField('age', event.target.value)}
                            placeholder="18 - 49"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Send className="h-5 w-5" />
                      Cover Letter
                    </CardTitle>
                    <CardDescription>
                      Tell the employer about your experience and why you are a good fit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      id="coverLetter"
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      placeholder="Write your cover letter here..."
                      rows={8}
                      required
                    />
                  </CardContent>
                </Card>

                {selectedCountry && (
                  <div className="rounded-xl border border-secondary/20 bg-secondary/10 p-4">
                    <p className="text-sm text-foreground">
                      <strong>Processing fee:</strong>{' '}
                      <span className="font-bold text-secondary">{selectedCountry.displayFee}</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Your application is submitted securely. You can track its status and
                    messages from your dashboard.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting application...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Submit Application
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </>
  );
};

export default Apply;
