import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  CheckCircle, 
  FileText, 
  User, 
  Briefcase, 
  Users, 
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

type Step = "bio" | "documents" | "references" | "complete";

interface BioData {
  previous_employer: string;
  job_title: string;
  years_of_experience: string;
  skills: string;
  languages: string;
  certifications: string;
  education_level: string;
  education_institution: string;
  marital_status: string;
  number_of_dependents: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_relationship: string;
}

interface Reference {
  reference_name: string;
  reference_phone: string;
  reference_email: string;
  relationship: string;
  company_or_organization: string;
}

interface DocumentUpload {
  type: string;
  label: string;
  file: File | null;
  uploaded: boolean;
  required: boolean;
}

const educationLevels = [
  "Primary School",
  "Secondary School (O-Level)",
  "High School (A-Level)",
  "Certificate",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD"
];

const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];

const KYC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const applicationId = searchParams.get("application_id");
  
  const [currentStep, setCurrentStep] = useState<Step>("bio");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [bioData, setBioData] = useState<BioData>({
    previous_employer: "",
    job_title: "",
    years_of_experience: "",
    skills: "",
    languages: "",
    certifications: "",
    education_level: "",
    education_institution: "",
    marital_status: "",
    number_of_dependents: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
    next_of_kin_relationship: ""
  });
  
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: "cv", label: "CV / Resume", file: null, uploaded: false, required: true },
    { type: "national_id", label: "National ID Photo", file: null, uploaded: false, required: true },
    { type: "passport_photo", label: "Passport Photo", file: null, uploaded: false, required: true },
    { type: "education_cert", label: "Education Certificate", file: null, uploaded: false, required: false },
    { type: "medical_cert", label: "Medical Certificate", file: null, uploaded: false, required: false }
  ]);
  
  const [references, setReferences] = useState<Reference[]>([
    { reference_name: "", reference_phone: "", reference_email: "", relationship: "", company_or_organization: "" },
    { reference_name: "", reference_phone: "", reference_email: "", relationship: "", company_or_organization: "" }
  ]);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!applicationId) {
        toast({
          title: 'No Application',
          description: 'No application ID found. Please start a new application first.',
          variant: 'destructive',
        });
        navigate('/apply');
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .eq("id", applicationId)
          .single();
          
        if (error) throw error;
        setApplicationData(data);
      } catch (error) {
        console.error("Error fetching application:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplication();
  }, [applicationId]);

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBioData({ ...bioData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...documents];
    updated[index].file = file;
    setDocuments(updated);
  };

  const handleReferenceChange = (index: number, field: keyof Reference, value: string) => {
    const updated = [...references];
    updated[index][field] = value;
    setReferences(updated);
  };

  const addReference = () => {
    if (references.length < 5) {
      setReferences([...references, { reference_name: "", reference_phone: "", reference_email: "", relationship: "", company_or_organization: "" }]);
    }
  };

  const uploadDocument = async (doc: DocumentUpload, index: number) => {
    if (!doc.file || !applicationId) return false;
    
    try {
      const fileExt = doc.file.name.split(".").pop();
      const filePath = `${applicationId}/${doc.type}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(filePath, doc.file);
        
      if (uploadError) throw uploadError;
      
      const { error: dbError } = await supabase
        .from("applicant_documents")
        .insert({
          application_id: applicationId,
          document_type: doc.type,
          file_name: doc.file.name,
          file_path: filePath,
          file_size: doc.file.size,
          mime_type: doc.file.type
        });
        
      if (dbError) throw dbError;
      
      const updated = [...documents];
      updated[index].uploaded = true;
      setDocuments(updated);
      
      return true;
    } catch (error) {
      console.error(`Error uploading ${doc.type}:`, error);
      return false;
    }
  };

  const saveBioData = async () => {
    if (!applicationId) return false;
    
    // Validate skills are provided
    if (!bioData.skills || bioData.skills.trim() === "") {
      toast({
        title: "Error",
        description: "Please select at least one skill",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return false;
    }
    
    try {
      const { error } = await supabase
        .from("applicant_profiles")
        .upsert({
          application_id: applicationId,
          previous_employer: bioData.previous_employer || null,
          job_title: bioData.job_title || null,
          years_of_experience: bioData.years_of_experience ? parseInt(bioData.years_of_experience) : null,
          skills: bioData.skills ? bioData.skills.split(",").map(s => s.trim()) : null,
          languages: bioData.languages ? bioData.languages.split(",").map(l => l.trim()) : null,
          certifications: bioData.certifications ? bioData.certifications.split(",").map(c => c.trim()) : null,
          education_level: bioData.education_level || null,
          education_institution: bioData.education_institution || null,
          marital_status: bioData.marital_status || null,
          number_of_dependents: bioData.number_of_dependents ? parseInt(bioData.number_of_dependents) : null,
          emergency_contact_name: bioData.emergency_contact_name || null,
          emergency_contact_phone: bioData.emergency_contact_phone || null,
          emergency_contact_relationship: bioData.emergency_contact_relationship || null,
          next_of_kin_name: bioData.next_of_kin_name || null,
          next_of_kin_phone: bioData.next_of_kin_phone || null,
          next_of_kin_relationship: bioData.next_of_kin_relationship || null
        });
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error saving bio:", error);
      return false;
    }
  };

  const saveReferences = async () => {
    if (!applicationId) return false;
    
    try {
      const validRefs = references.filter(r => r.reference_name && r.reference_phone);
      
      if (validRefs.length < 2) {
        toast({
          title: "Error",
          description: "Please provide at least 2 references",
          variant: "destructive"
        });
        return false;
      }
      
      const { error } = await supabase
        .from("applicant_references")
        .insert(validRefs.map(ref => ({
          application_id: applicationId,
          ...ref
        })));
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error saving references:", error);
      return false;
    }
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    
    try {
      if (currentStep === "bio") {
        const success = await saveBioData();
        if (success) {
          setCurrentStep("documents");
        } else {
          toast({ title: "Error", description: "Failed to save bio information", variant: "destructive" });
        }
      } else if (currentStep === "documents") {
        const requiredDocs = documents.filter(d => d.required);
        const missingRequired = requiredDocs.filter(d => !d.file && !d.uploaded);
        
        if (missingRequired.length > 0) {
          toast({
            title: "Missing Documents",
            description: `Please upload: ${missingRequired.map(d => d.label).join(", ")}`,
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        for (let i = 0; i < documents.length; i++) {
          if (documents[i].file && !documents[i].uploaded) {
            await uploadDocument(documents[i], i);
          }
        }
        
        setCurrentStep("references");
      } else if (currentStep === "references") {
        const success = await saveReferences();
        if (success) {
          await supabase
            .from("applications")
            .update({ kyc_completed: true })
            .eq("id", applicationId);
            
          setCurrentStep("complete");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!applicationId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-3xl p-8 shadow-lg border border-border text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Invalid Link</h1>
          <p className="text-muted-foreground mb-6">No application ID found. Please complete your application first.</p>
          <Button variant="hero" onClick={() => navigate("/#apply")}>Apply Now</Button>
        </div>
      </div>
    );
  }

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-card rounded-3xl p-8 shadow-lg border border-border text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">KYC Completed!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for submitting your documents. Our team will review your application and contact you when the recruitment cycle begins.
          </p>
          
          {/* Insurance Reminder */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Protect Yourself Abroad</h3>
                <p className="text-sm text-muted-foreground">Insurance is mandatory for deployed workers</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Get comprehensive coverage for deportation, medical emergencies, death benefits, and loss of contract for just <strong className="text-foreground">$35/year</strong>.
            </p>
            <Button 
              variant="hero" 
              className="w-full" 
              onClick={() => navigate(`/insurance?application_id=${applicationId}&client=true`)}
            >
              Get Insurance Now
            </Button>
          </div>
          
          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-foreground">
              <strong>Next Steps:</strong> You will receive updates via WhatsApp/SMS about your application status.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="w-full">Return Home</Button>
        </div>
      </div>
    );
  }

  const steps = [
    { key: "bio", label: "Bio Information", icon: User },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "references", label: "References", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            {applicationData?.full_name}, please provide additional information to complete your application.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                currentStep === step.key 
                  ? "bg-primary text-primary-foreground" 
                  : steps.findIndex(s => s.key === currentStep) > index 
                    ? "bg-success/20 text-success"
                    : "bg-muted text-muted-foreground"
              }`}>
                <step.icon className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  steps.findIndex(s => s.key === currentStep) > index ? "bg-success" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-3xl p-6 md:p-8 shadow-lg border border-border">
          {/* Bio Step */}
          {currentStep === "bio" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold text-foreground">Work Experience</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="previous_employer">Previous Employer</Label>
                  <Input 
                    id="previous_employer" 
                    name="previous_employer" 
                    value={bioData.previous_employer}
                    onChange={handleBioChange}
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input 
                    id="job_title" 
                    name="job_title" 
                    value={bioData.job_title}
                    onChange={handleBioChange}
                    placeholder="Your role"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years_of_experience">Years of Experience</Label>
                  <Input 
                    id="years_of_experience" 
                    name="years_of_experience" 
                    type="number"
                    value={bioData.years_of_experience}
                    onChange={handleBioChange}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated) *</Label>
                  <Input 
                    id="skills" 
                    name="skills" 
                    value={bioData.skills}
                    onChange={handleBioChange}
                    placeholder="e.g., Driving, Cooking, Cleaning"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Select at least one skill to match with jobs</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages (comma-separated)</Label>
                  <Input 
                    id="languages" 
                    name="languages" 
                    value={bioData.languages}
                    onChange={handleBioChange}
                    placeholder="e.g., English, Swahili, Arabic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                  <Input 
                    id="certifications" 
                    name="certifications" 
                    value={bioData.certifications}
                    onChange={handleBioChange}
                    placeholder="e.g., First Aid, IELTS"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6 mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Personal Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="education_level">Education Level</Label>
                    <select
                      id="education_level"
                      name="education_level"
                      value={bioData.education_level}
                      onChange={handleBioChange}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select level</option>
                      {educationLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education_institution">Institution Name</Label>
                    <Input 
                      id="education_institution" 
                      name="education_institution" 
                      value={bioData.education_institution}
                      onChange={handleBioChange}
                      placeholder="School/University name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marital_status">Marital Status</Label>
                    <select
                      id="marital_status"
                      name="marital_status"
                      value={bioData.marital_status}
                      onChange={handleBioChange}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select status</option>
                      {maritalStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number_of_dependents">Number of Dependents</Label>
                    <Input 
                      id="number_of_dependents" 
                      name="number_of_dependents" 
                      type="number"
                      value={bioData.number_of_dependents}
                      onChange={handleBioChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6 mt-6">
                <h3 className="font-medium text-foreground mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Name</Label>
                    <Input 
                      id="emergency_contact_name" 
                      name="emergency_contact_name" 
                      value={bioData.emergency_contact_name}
                      onChange={handleBioChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Phone</Label>
                    <Input 
                      id="emergency_contact_phone" 
                      name="emergency_contact_phone" 
                      value={bioData.emergency_contact_phone}
                      onChange={handleBioChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                    <Input 
                      id="emergency_contact_relationship" 
                      name="emergency_contact_relationship" 
                      value={bioData.emergency_contact_relationship}
                      onChange={handleBioChange}
                      placeholder="e.g., Spouse, Parent"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6 mt-6">
                <h3 className="font-medium text-foreground mb-4">Next of Kin</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="next_of_kin_name">Name</Label>
                    <Input 
                      id="next_of_kin_name" 
                      name="next_of_kin_name" 
                      value={bioData.next_of_kin_name}
                      onChange={handleBioChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next_of_kin_phone">Phone</Label>
                    <Input 
                      id="next_of_kin_phone" 
                      name="next_of_kin_phone" 
                      value={bioData.next_of_kin_phone}
                      onChange={handleBioChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next_of_kin_relationship">Relationship</Label>
                    <Input 
                      id="next_of_kin_relationship" 
                      name="next_of_kin_relationship" 
                      value={bioData.next_of_kin_relationship}
                      onChange={handleBioChange}
                      placeholder="e.g., Spouse, Parent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Step */}
          {currentStep === "documents" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Upload Documents</h2>
                  <p className="text-sm text-muted-foreground">Upload clear scans or photos of your documents</p>
                </div>
              </div>

              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <div key={doc.type} className={`border rounded-xl p-4 ${doc.uploaded ? "border-success bg-success/5" : "border-border"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{doc.label}</span>
                        {doc.required && <span className="text-xs text-destructive">*Required</span>}
                      </div>
                      {doc.uploaded && <CheckCircle className="w-5 h-5 text-success" />}
                    </div>
                    
                    {!doc.uploaded && (
                      <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer">
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
                            <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">
                              {doc.file ? doc.file.name : "Click to upload"}
                            </span>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References Step */}
          {currentStep === "references" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">References</h2>
                  <p className="text-sm text-muted-foreground">Provide at least 2 professional or personal references</p>
                </div>
              </div>

              <div className="space-y-6">
                {references.map((ref, index) => (
                  <div key={index} className="border border-border rounded-xl p-4">
                    <h3 className="font-medium text-foreground mb-4">Reference {index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input 
                          value={ref.reference_name}
                          onChange={(e) => handleReferenceChange(index, "reference_name", e.target.value)}
                          placeholder="Reference name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number *</Label>
                        <Input 
                          value={ref.reference_phone}
                          onChange={(e) => handleReferenceChange(index, "reference_phone", e.target.value)}
                          placeholder="+256..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                          type="email"
                          value={ref.reference_email}
                          onChange={(e) => handleReferenceChange(index, "reference_email", e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Relationship *</Label>
                        <Input 
                          value={ref.relationship}
                          onChange={(e) => handleReferenceChange(index, "relationship", e.target.value)}
                          placeholder="e.g., Former Employer, Teacher"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Company/Organization</Label>
                        <Input 
                          value={ref.company_or_organization}
                          onChange={(e) => handleReferenceChange(index, "company_or_organization", e.target.value)}
                          placeholder="Where they work"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {references.length < 5 && (
                <Button variant="outline" onClick={addReference} className="w-full">
                  + Add Another Reference
                </Button>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep === "documents") setCurrentStep("bio");
                else if (currentStep === "references") setCurrentStep("documents");
              }}
              disabled={currentStep === "bio" || isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button variant="hero" onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : currentStep === "references" ? (
                <>
                  Complete
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYC;