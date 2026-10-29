import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Lock } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { MobileBottomNav } from "@/components/MobileBottomNav";
const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("job");
  const [progressStep, setProgressStep] = useState<ProgressStep>("personal");
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    phone: "",
    whatsappPhone: "",
    country: "",
    age: "",
    hasPassport: false,
    agreeTerms: false,
    skills: "" as string,
    hasNationalId: false,
    hasPassportPhoto: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const calculateProgress = (): number => {
    let completed = 0;
    const total = 5;
    if (formData.fullName && formData.email && formData.phone && formData.country && formData.age) completed += 1;
    if (formData.skills && formData.skills.trim()) completed += 1;
    if (formData.hasPassport) completed += 1;
    if (formData.hasNationalId) completed += 1;
    if (formData.hasPassportPhoto) completed += 1;
    if (formData.agreeTerms) completed += 1;
    return Math.round((completed / total) * 100);
  };

  const stepTitles = {
    personal: "Personal Information",
    skills: "Skills & Qualifications",
    documents: "Documents",
    payment: "Payment & Submit",
  };
  const stepDescriptions = {
    personal: "Add your basic personal information",
    skills: "List your skills and experience",
    documents: "Upload required documents",
    payment: "Complete payment to submit application",
  };

  useEffect(() => {
    if (!loading && !user) navigate("/auth?redirect=/complete-profile" + (jobId ? "?job=" + jobId : ""));
  }, [user, loading, navigate, jobId]);

  useEffect(() => {
    if (user?.email && !formData.email) setFormData(prev => ({ ...prev, email: user.email || "" }));
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (progressStep === "personal" && (!formData.fullName || !formData.email || !formData.phone || !formData.country || !formData.age)) {
      toast({ title: "Missing Information", description: "Please fill in all personal information fields.", variant: "destructive" });
      return;
    }
    if (progressStep === "skills" && (!formData.skills || formData.skills.trim() === "")) {
      toast({ title: "Skills Required", description: "Please add your skills.", variant: "destructive" });
      return;
    }
    if (progressStep === "documents" && (!formData.hasPassport || !formData.hasNationalId || !formData.hasPassportPhoto)) {
      toast({ title: "Documents Required", description: "Please confirm you have all required documents.", variant: "destructive" });
      return;
    }
    if (progressStep === "payment" && !formData.agreeTerms) {
      toast({ title: "Terms Required", description: "Please agree to the terms and conditions.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const countryFee = eligibilityCountries.find((c) => c.value === formData.country);
      const displayFee = countryFee?.displayFee || "13 USD";
      const { data: application, error } = await supabase.from("applications").insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        whatsapp_phone: sameAsPhone ? formData.phone : (formData.whatsappPhone || formData.phone),
        country: formData.country,
        age: parseInt(formData.age),
        has_passport: formData.hasPassport,
        has_national_id: formData.hasNationalId,
        has_passport_photo: formData.hasPassportPhoto,
        skills: formData.skills ? formData.skills.split(",").map((s: string) => s.trim()) : null,
        processing_fee: displayFee,
        recruitment_cycle: "orbit_connect",
        status: "pending",
      });
      if (error) throw error;
      setApplicationId(data.id);
      if (progressStep === "personal") setProgressStep("skills");
      else if (progressStep === "skills") setProgressStep("documents");
      else if (progressStep === "documents") setProgressStep("payment");
      else navigate("/application-success?application_id=" + data.id);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to create application.", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const goToStep = (step: ProgressStep) => setProgressStep(step);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (!user) return null;

  const progressPercentage = calculateProgress();
  const isComplete = progressPercentage === 100;

  return (
    <>
      <Helmet><title>Complete Profile - Orbit Connect</title></Helmet>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card"><div className="container mx-auto px-4 py-4"><Button variant="ghost" asChild><Link to={jobId ? "/jobs/" + jobId : "/jobs"}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link></Button></div></header>
        <main className="py-8 pb-24"><div className="container mx-auto px-4"><div className="mb-8"><h2 className="font-display text-xl font-bold text-foreground mb-2">Complete Your Profile</h2><p className="text-muted-foreground mb-4">{progressPercentage}% complete</p><div className="bg-muted rounded-full h-4"><div className="bg-primary rounded-full h-4 transition-width" style={{ width: isComplete ? "100%" : progressPercentage + "%" }} aria-valuemin="0" aria-valuemax="100" aria-valuenow={progressPercentage} /></div>{isComplete && <p className="text-sm text-success mt-2">Profile complete! Ready to apply.</p>}</div><div className="mb-6"><div className="flex justify-between text-sm text-muted-foreground mb-2"><span>Personal</span><span>Skills</span><span>Documents</span><span>Payment</span></div><div className="flex gap-2">{["personal", "skills", "documents", "payment"].map((step, index) => <div key={step} className="flex-1 rounded-md " + (index <= ["personal", "skills", "documents", "payment"].indexOf(progressStep) ? "bg-primary text-white" : "bg-muted/50") + (index <= ["personal", "skills", "documents", "payment"].indexOf(progressStep) ? "text-white" : "text-muted-foreground") + " py-2 transition-colors">{step}</div>)}</div></div>){progressStep === "personal" && <div className="space-y-4"><h3 className="font-display text-lg font-semibold text-foreground mb-4">Personal Information</h3><ApplicationForm user={user} jobId={jobId as string} defaultData={{ fullName: formData.fullName, email: formData.email, phone: formData.phone, country: formData.country, age: formData.age }} /></div>}{progressStep === "skills" && <div className="space-y-4"><h3 className="font-display text-lg font-semibold text-foreground mb-4">Skills & Qualifications</h3><div className="space-y-4"><Label htmlFor="skills">Skills (comma-separated)</Label><Input id="skills" name="skills" value={formData.skills || ""} onChange={(e) => handleInputChange(e)} placeholder="e.g., Driving, Cooking, Cleaning" required />{progressStep === "skills" && <p className="text-xs text-muted-foreground">Skills help match you with suitable job opportunities</p>}<Button onClick={() => goToStep("skills")} type="button" variant="outline" className="w-full mt-4">{progressStep === "skills" ? "Done" : "Next →"}</Button></div></div>){progressStep === "documents" && <div className="space-y-4"><h3 className="font-display text-lg font-semibold text-foreground mb-4">Documents</h3><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="hasPassport">Have Passport</Label><Input type="checkbox" id="hasPassport" name="hasPassport" checked={formData.hasPassport} onChange={(e) => handleInputChange(e)} /></div><div><Label htmlFor="hasNationalId">Have National ID</Label><Input type="checkbox" id="hasNationalId" name="hasNationalId" checked={formData.hasNationalId} onChange={(e) => handleInputChange(e)} /></div><div><Label htmlFor="hasPassportPhoto">Have Passport Photo</Label><Input type="checkbox" id="hasPassportPhoto" name="hasPassportPhoto" checked={formData.hasPassportPhoto} onChange={(e) => handleInputChange(e)} /></div></div><Button onClick={() => goToStep("documents")} type="button" variant="outline" className="w-full mt-4">{progressStep === "documents" ? "Done" : "Next →"}</Button></div></div>){progressStep === "payment" && <div className="space-y-4"><h3 className="font-display text-lg font-semibold text-foreground mb-4">Payment & Submit</h3>{jobId && applicationFees.length > 0 && <div><Label htmlFor="country">Country</Label><Select id="country" name="country" value={formData.country || "uganda"} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}><option>{eligibilityCountries.map((country) => <SelectItem key={country.value} value={country.value}><span className="flex items-center gap-2"><span className="text-xl">{country.flag}</span><span>{country.label}</span></span></SelectItem>)}</option></Select></div><p className="text-muted-foreground">Application fee: 10 Connects</p><div className="flex items-center gap-2"><Input type="checkbox" id="agreeTerms" name="agreeTerms" checked={formData.agreeTerms} onChange={(e) => handleInputChange(e)} /><Label htmlFor="agreeTerms" className="text-sm cursor-pointer">I agree to the terms and conditions and understand the loan-based placement model</Label></div><p className="text-xs text-muted-foreground mt-2">Payment of 10 Connects is required to finalize your application.</p><Button onClick={() => goToStep("payment")} type="button" variant="outline" className="w-full mt-4">{progressStep === "payment" ? "Submit Application" : "Next →"}</Button></div>}{progressStep === "payment" && formData.agreeTerms && applicationFees.length > 0 && <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isProcessingPayment}>{isProcessingPayment ? "<Loader2 className=\"w-5 h-5 animate-spin\" /> Redirecting to Payment...</>" : "<CreditCard className=\"w-5 h-5\" /> Pay " + (flatApplicationFee.displayFee)}</></Button>}</div></main><MobileBottomNav /></div></>\n);
