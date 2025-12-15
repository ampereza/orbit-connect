import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  CheckCircle, 
  Loader2,
  Heart,
  Plane,
  FileText,
  AlertTriangle,
  Briefcase
} from "lucide-react";

const coverageItems = [
  { icon: Plane, title: "Deportation Coverage", description: "Full support and costs covered if you face deportation" },
  { icon: Heart, title: "Medical Emergencies", description: "Coverage for severe sickness and medical emergencies" },
  { icon: AlertTriangle, title: "Death Benefits", description: "Financial support for your family in case of death" },
  { icon: Briefcase, title: "Loss of Contract", description: "Protection if your employment contract is terminated" },
  { icon: FileText, title: "Legal Support", description: "Legal assistance for work-related issues abroad" }
];

const Insurance = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const applicationId = searchParams.get("application_id");
  const isClient = searchParams.get("client") === "true";
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: ""
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubscribe = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("flutterwave", {
        body: {
          action: "initialize_insurance",
          applicationId: applicationId || null,
          amount: 35,
          currency: "USD",
          email: formData.email,
          phone: formData.phone,
          fullName: formData.fullName,
          isClient: isClient,
          redirectUrl: `${window.location.origin}/insurance-callback`
        }
      });

      if (error) throw error;

      if (data?.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error("Failed to get payment link");
      }
    } catch (error: any) {
      console.error("Insurance payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Orbit Employ Insurance
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Protect yourself while working abroad. Our comprehensive insurance covers life emergencies 
            so you can focus on your career with peace of mind.
          </p>
        </div>

        {/* Price Card */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-3xl p-8 text-center mb-12">
          <p className="text-sm font-medium text-primary mb-2">ANNUAL SUBSCRIPTION</p>
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-5xl font-bold text-foreground">$35</span>
            <span className="text-muted-foreground">/year</span>
          </div>
          <p className="text-muted-foreground">Full coverage for 12 months</p>
          {isClient && (
            <div className="mt-4 bg-warning/10 border border-warning/20 rounded-xl p-3">
              <p className="text-sm text-warning font-medium">
                ⚠️ Insurance is mandatory for all deployed workers
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Coverage Section */}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">What's Covered</h2>
            <div className="space-y-4">
              {coverageItems.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 bg-card rounded-2xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Form */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-lg">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Subscribe Now</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="flex items-start space-x-3 pt-4">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the <a href="#" className="text-primary underline">Terms and Conditions</a> and 
                  understand that this insurance is valid for 12 months from the date of subscription.
                </label>
              </div>

              <Button 
                variant="hero" 
                className="w-full mt-6" 
                onClick={handleSubscribe}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Subscribe for $35/year
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Secure payment via Flutterwave</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Coverage starts immediately after payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Button variant="ghost" onClick={() => navigate("/")}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Insurance;
