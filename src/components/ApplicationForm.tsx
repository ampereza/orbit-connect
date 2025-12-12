import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";

const countries = [
  { value: "uganda", label: "Uganda 🇺🇬", fee: "UGX 10,000" },
  { value: "kenya", label: "Kenya 🇰🇪", fee: "KES 350" },
  { value: "tanzania", label: "Tanzania 🇹🇿", fee: "TZS 7,000" },
  { value: "rwanda", label: "Rwanda 🇷🇼", fee: "Contact Us" },
  { value: "burundi", label: "Burundi 🇧🇮", fee: "Contact Us" },
];

export const ApplicationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    age: "",
    hasPassport: false,
    agreeTerms: false,
  });

  const selectedCountry = countries.find((c) => c.value === formData.country);

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

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Application Submitted! 🎉",
      description: "Thank you for applying. We'll contact you during the next recruitment cycle.",
    });

    setIsSubmitting(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      country: "",
      age: "",
      hasPassport: false,
      agreeTerms: false,
    });
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
                      {countries.map((country) => (
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
                    <span className="text-secondary font-bold">{selectedCountry.fee}</span>
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
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
