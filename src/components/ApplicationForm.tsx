import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Send, Loader2, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { applicationFees } from "@/config/applicationFees";

export const ApplicationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    age: "",
    hasPassport: false,
    agreeTerms: false,
  });

  const selectedCountry = applicationFees.find((c) => c.value === formData.country);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.hasPassport) {
      toast({
        title: "Passport Required",
        description: "A valid passport is mandatory for all applicants.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCountry) {
      toast({
        title: "Country Required",
        description: "Please select your country.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create application in database
      const { data: application, error } = await supabase
        .from("applications")
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          age: parseInt(formData.age),
          has_passport: formData.hasPassport,
          processing_fee: selectedCountry.displayFee,
          recruitment_cycle: "January 2025",
        })
        .select()
        .single();

      if (error) throw error;

      setApplicationId(application.id);

      // Subscribe to ManyChat
      try {
        await supabase.functions.invoke("manychat", {
          body: {
            action: "subscribe",
            applicationId: application.id,
            phone: formData.phone,
            email: formData.email,
            fullName: formData.fullName,
          },
        });
      } catch (mcError) {
        console.error("ManyChat subscription error:", mcError);
      }

      toast({
        title: "Application Saved! 📝",
        description: "Please complete your payment to finalize your application.",
      });
    } catch (error: any) {
      console.error("Application error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!applicationId || !selectedCountry) return;

    setIsProcessingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke("flutterwave", {
        body: {
          action: "initialize",
          applicationId,
          amount: parseFloat(selectedCountry.fee),
          currency: selectedCountry.currency,
          email: formData.email,
          phone: formData.phone,
          fullName: formData.fullName,
          redirectUrl: `${window.location.origin}/payment-callback`,
        },
      });

      if (error) throw error;

      if (data.success && data.paymentLink) {
        // Redirect to Flutterwave payment page
        window.location.href = data.paymentLink;
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <section id="apply" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
              Start Your Journey
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Apply Now
            </h2>
            <p className="text-muted-foreground text-lg">
              Fill in your details below. You'll be contacted during our next recruitment cycle in January.
            </p>
          </div>

          <div className="bg-card rounded-3xl p-8 md:p-10 shadow-lg border border-border">
            {!applicationId ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground font-medium">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+256 700 000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Country & Age */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData({ ...formData, country: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {applicationFees.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-foreground font-medium">
                      Age *
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="49"
                      placeholder="Enter your age (18-49)"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Fee Display */}
                {selectedCountry && (
                  <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
                    <p className="text-sm text-foreground">
                      <strong>Processing Fee:</strong>{" "}
                      <span className="text-secondary font-bold">{selectedCountry.displayFee}</span>
                    </p>
                  </div>
                )}

                {/* Checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="passport"
                      checked={formData.hasPassport}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hasPassport: checked as boolean })
                      }
                      className="mt-1"
                    />
                    <Label htmlFor="passport" className="text-sm text-muted-foreground cursor-pointer">
                      I confirm that I have a valid passport or will obtain one before deployment.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, agreeTerms: checked as boolean })
                      }
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                      I agree to the terms and conditions and understand the loan-based placement model.
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Application...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Continue to Payment
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    Application Saved!
                  </h3>
                  <p className="text-muted-foreground">
                    Complete your payment to finalize your application.
                  </p>
                </div>

                <div className="bg-muted rounded-xl p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium text-foreground">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country:</span>
                    <span className="font-medium text-foreground">{selectedCountry?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Fee:</span>
                    <span className="font-bold text-secondary">{selectedCountry?.displayFee}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirecting to Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay {selectedCountry?.displayFee}
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Secure payment powered by Flutterwave
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
