import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { flatApplicationFee, eligibilityCountries } from "@/config/applicationFees";

type ProgressStep = "personal" | "skills" | "documents" | "payment";

const stepOrder: ProgressStep[] = ["personal", "skills", "documents", "payment"];

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  whatsappPhone: string;
  country: string;
  age: string;
  hasPassport: boolean;
  agreeTerms: boolean;
  skills: string;
  hasNationalId: boolean;
  hasPassportPhoto: boolean;
}

const emptyProfile: ProfileData = {
  fullName: "",
  email: "",
  phone: "",
  whatsappPhone: "",
  country: "",
  age: "",
  hasPassport: false,
  agreeTerms: false,
  skills: "",
  hasNationalId: false,
  hasPassportPhoto: false,
};

const CompleteProfile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("job");
  const [progressStep, setProgressStep] = useState<ProgressStep>("personal");
  const [formData, setFormData] = useState<ProfileData>(emptyProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [sameAsPhone, setSameAsPhone] = useState(false);

  const calculateProgress = (): number => {
    let completed = 0;
    const total = stepOrder.length;
    if (formData.fullName && formData.email && formData.phone && formData.country && formData.age) completed += 1;
    if (formData.skills && formData.skills.trim()) completed += 1;
    if (formData.hasPassport) completed += 1;
    if (formData.agreeTerms) completed += 1;
    return Math.round((completed / total) * 100);
  };

  const stepTitles: Record<ProgressStep, string> = {
    personal: "Personal Information",
    skills: "Skills & Qualifications",
    documents: "Documents",
    payment: "Payment & Submit",
  };

  const stepDescriptions: Record<ProgressStep, string> = {
    personal: "Add your basic personal information",
    skills: "List your skills and experience",
    documents: "Upload required documents",
    payment: "Complete payment to submit application",
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?redirect=/complete-profile" + (jobId ? "?job=" + jobId : ""));
    }
  }, [user, loading, navigate, jobId]);

  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData((previous) => ({ ...previous, email: user.email || "" }));
    }
  }, [user]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const type = target.type;
    const checked = target.checked;
    setFormData((previous) => ({
      ...previous,
      [target.name]: type === "checkbox" ? Boolean(checked) : value,
    }));
  };

  const goToStep = (step: ProgressStep) => setProgressStep(step);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (progressStep === "personal" && (!formData.fullName || !formData.email || !formData.phone || !formData.country || !formData.age)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all personal information fields.",
        variant: "destructive",
      });
      return;
    }
    if (progressStep === "skills" && (!formData.skills || formData.skills.trim() === "")) {
      toast({
        title: "Skills Required",
        description: "Please add your skills.",
        variant: "destructive",
      });
      return;
    }
    if (progressStep === "documents" && (!formData.hasPassport || !formData.hasNationalId || !formData.hasPassportPhoto)) {
      toast({
        title: "Documents Required",
        description: "Please confirm you have all required documents.",
        variant: "destructive",
      });
      return;
    }
    if (progressStep === "payment" && !formData.agreeTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: kycCheck, error: kycError } = await supabase
        .from('applications')
        .select('kyc_completed')
        .eq('user_id', user.id)
        .eq('kyc_completed', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!kycError && (!kycCheck || kycCheck.length === 0)) {
        toast({
          title: 'KYC required',
          description: 'Please complete your KYC verification before submitting an application.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.from("applications").insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        whatsapp_phone: sameAsPhone ? formData.phone : (formData.whatsappPhone || formData.phone),
        country: formData.country,
        age: parseInt(formData.age, 10),
        has_passport: formData.hasPassport,
        status: "pending",
        processing_fee: flatApplicationFee.displayFee,
        recruitment_cycle: "orbit_connect",
        job_id: jobId || null,
        user_id: user?.id || null,
      });

      const insertedId = (data as { id?: string } | null | undefined)?.id;

      if (error) throw error;

      setApplicationId(insertedId ?? null);
      if (progressStep === "personal") setProgressStep("skills");
      else if (progressStep === "skills") setProgressStep("documents");
      else if (progressStep === "documents") setProgressStep("payment");
      else navigate("/application-success?application_id=" + (insertedId ?? ""));
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create application.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const progressPercentage = calculateProgress();
  const isComplete = progressPercentage === 100;
  const currentStepIndex = stepOrder.indexOf(progressStep);

  return (
    <>
      <Helmet>
        <title>Complete Profile - Orbit Connect</title>
        <meta name="description" content="Complete your Orbit Connect profile to apply for jobs." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" asChild>
              <Link to={jobId ? `/jobs/${jobId}` : "/jobs"}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Link>
            </Button>
          </div>
        </header>
        <main className="py-8 pb-24">
          <div className="container mx-auto">
            <div className="mb-8">
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                Complete Your Profile
              </h2>
              <p className="text-muted-foreground mb-4">{progressPercentage}% complete</p>
              <div className="bg-muted rounded-full h-4">
                <div
                  className="bg-primary rounded-full h-4 transition-width"
                  style={{
                    width: isComplete ? "100%" : `${progressPercentage}%`,
                  }}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPercentage}
                />
              </div>
              {isComplete && (
                <p className="text-sm text-success mt-2">Profile complete! Ready to apply.</p>
              )}
            </div>

            <div className="mb-6">
              <div className="flex gap-2">
                {stepOrder.map((step, index) => (
                  <div
                    key={step}
                    className={`flex-1 rounded-md py-2 text-center text-sm ${
                      index <= currentStepIndex
                        ? "bg-primary text-white"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {stepTitles[step]}
                  </div>
                ))}
              </div>
            </div>

            {progressStep === "personal" && (
              <Card>
                <CardHeader>
                  <CardTitle>{stepTitles.personal}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+256 700 000000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsappPhone">WhatsApp number</Label>
                      <Input
                        id="whatsappPhone"
                        name="whatsappPhone"
                        type="tel"
                        value={formData.whatsappPhone}
                        onChange={handleInputChange}
                        disabled={sameAsPhone}
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={sameAsPhone}
                          onCheckedChange={(checked) => setSameAsPhone(checked === true)}
                        />
                        Same as phone number
                      </label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => setFormData((previous) => ({ ...previous, country: value }))}
                      >
                        <SelectTrigger id="country" className="w-full">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          {eligibilityCountries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        min={18}
                        max={49}
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="18 - 49"
                      />
                    </div>
                  </div>
                  <Button onClick={() => goToStep("skills")} type="button" className="w-full">
                    Next →
                  </Button>
                </CardContent>
              </Card>
            )}

            {progressStep === "skills" && (
              <Card>
                <CardHeader>
                  <CardTitle>{stepTitles.skills}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g., Driving, Cooking, Cleaning"
                    />
                  </div>
                  <Button onClick={() => goToStep("documents")} type="button" className="w-full">
                    Next →
                  </Button>
                </CardContent>
              </Card>
            )}

            {progressStep === "documents" && (
              <Card>
                <CardHeader>
                  <CardTitle>{stepTitles.documents}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.hasPassport}
                      onCheckedChange={(checked) => setFormData((previous) => ({ ...previous, hasPassport: checked === true }))}
                    />
                    <Label>Have Passport</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.hasNationalId}
                      onCheckedChange={(checked) => setFormData((previous) => ({ ...previous, hasNationalId: checked === true }))}
                    />
                    <Label>Have National ID</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.hasPassportPhoto}
                      onCheckedChange={(checked) => setFormData((previous) => ({ ...previous, hasPassportPhoto: checked === true }))}
                    />
                    <Label>Have Passport Photo</Label>
                  </div>
                  <Button onClick={() => goToStep("payment")} type="button" className="w-full">
                    Next →
                  </Button>
                </CardContent>
              </Card>
            )}

            {progressStep === "payment" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{stepTitles.payment}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => setFormData((previous) => ({ ...previous, agreeTerms: checked === true }))}
                      />
                      <Label>I agree to the terms and conditions and understand the loan-based placement model</Label>
                    </div>
                    <div className="rounded-xl border border-secondary/20 bg-secondary/10 p-4">
                      <p className="text-sm text-foreground">
                        <strong>Processing fee:</strong> {flatApplicationFee.displayFee}
                      </p>
                    </div>
                    <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting || isProcessingPayment}>
                      {isSubmitting ? "Submitting application..." : "Submit Application"}
                    </Button>
                  </CardContent>
                </Card>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setProgressStep("documents")}
                >
                  Back
                </Button>
              </form>
            )}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </>
  );
};

export default CompleteProfile;
