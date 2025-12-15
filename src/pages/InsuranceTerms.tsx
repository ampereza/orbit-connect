import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  FileText,
  Phone,
  Mail,
  ArrowLeft
} from "lucide-react";

const InsuranceTerms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Insurance Terms & Conditions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Orbit Employ Annual Worker Protection Insurance Policy
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Effective Date: January 1, 2025 | Policy Version 2.0
          </p>
        </div>

        {/* Quick Summary Card */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-3xl p-8 mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Policy Summary
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-card/50 rounded-xl p-4">
              <p className="text-muted-foreground">Premium</p>
              <p className="text-2xl font-bold text-foreground">$35 USD</p>
              <p className="text-muted-foreground">per annum</p>
            </div>
            <div className="bg-card/50 rounded-xl p-4">
              <p className="text-muted-foreground">Coverage Period</p>
              <p className="text-2xl font-bold text-foreground">12 Months</p>
              <p className="text-muted-foreground">from activation</p>
            </div>
            <div className="bg-card/50 rounded-xl p-4">
              <p className="text-muted-foreground">Coverage Region</p>
              <p className="text-2xl font-bold text-foreground">Middle East</p>
              <p className="text-muted-foreground">all countries</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1: Coverage */}
          <section className="bg-card rounded-3xl p-8 border border-border">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              What Is Covered
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-success pl-4">
                <h3 className="font-semibold text-foreground mb-2">1. Deportation Coverage</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  If you are deported from your country of employment for reasons beyond your control, we will cover:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Return flight ticket to your home country</li>
                  <li>Emergency accommodation for up to 3 days</li>
                  <li>Transportation to the airport</li>
                  <li>Maximum benefit: $2,000 USD</li>
                </ul>
              </div>

              <div className="border-l-4 border-success pl-4">
                <h3 className="font-semibold text-foreground mb-2">2. Medical Emergency Coverage</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  Coverage for severe illness or medical emergencies requiring hospitalization:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Emergency hospitalization costs up to $5,000 USD</li>
                  <li>Emergency surgery costs up to $3,000 USD</li>
                  <li>Medical evacuation to home country if required</li>
                  <li>Prescription medication for emergency treatment</li>
                </ul>
              </div>

              <div className="border-l-4 border-success pl-4">
                <h3 className="font-semibold text-foreground mb-2">3. Death Benefits</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  In the unfortunate event of death during employment abroad:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Repatriation of remains to home country</li>
                  <li>Death benefit payment of $3,000 USD to designated beneficiary</li>
                  <li>Administrative support for documentation</li>
                </ul>
              </div>

              <div className="border-l-4 border-success pl-4">
                <h3 className="font-semibold text-foreground mb-2">4. Loss of Employment Contract</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  If your employment contract is terminated without cause by the employer:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Return flight assistance</li>
                  <li>Up to 1 month salary compensation (maximum $500 USD)</li>
                  <li>Priority re-matching with new employer through Orbit Employ</li>
                </ul>
              </div>

              <div className="border-l-4 border-success pl-4">
                <h3 className="font-semibold text-foreground mb-2">5. Legal Assistance</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  Legal support for work-related disputes:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Legal consultation for employment disputes</li>
                  <li>Document translation services</li>
                  <li>Liaison with local authorities</li>
                  <li>Maximum legal fees coverage: $1,000 USD</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Exclusions */}
          <section className="bg-card rounded-3xl p-8 border border-border">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              What Is Not Covered
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Pre-existing medical conditions",
                "Self-inflicted injuries or suicide",
                "Injuries from illegal activities",
                "Deportation due to criminal conviction",
                "Voluntary resignation from employment",
                "War, terrorism, or civil unrest",
                "Cosmetic or elective procedures",
                "Dental treatment (non-emergency)",
                "Pregnancy and childbirth",
                "Mental health treatment",
                "Alcohol or drug-related incidents",
                "Failure to maintain valid documentation"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Important Conditions */}
          <section className="bg-card rounded-3xl p-8 border border-border">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              Important Conditions
            </h2>
            
            <div className="space-y-4 text-sm">
              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">Eligibility Requirements</h3>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Must be aged between 18-49 years at time of subscription</li>
                  <li>Must hold a valid passport from an East African country</li>
                  <li>Must be deployed or seeking deployment through Orbit Employ or working independently in the Middle East</li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">Claim Process</h3>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Claims must be filed within 30 days of the incident</li>
                  <li>All claims require supporting documentation (medical reports, police reports, etc.)</li>
                  <li>Claims are processed within 14 business days of receiving complete documentation</li>
                  <li>Contact our support team immediately in case of emergency</li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">Policy Activation</h3>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Coverage begins immediately upon successful payment</li>
                  <li>You will receive a policy confirmation via email within 24 hours</li>
                  <li>Keep your policy number and emergency contact information accessible at all times</li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">Renewal</h3>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Policy must be renewed before expiry to maintain continuous coverage</li>
                  <li>We will send renewal reminders 30 days before expiry</li>
                  <li>Lapsed policies require a new application and may be subject to waiting periods</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Waiting Periods */}
          <section className="bg-card rounded-3xl p-8 border border-border">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              Waiting Periods
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-foreground font-semibold">Coverage Type</th>
                    <th className="text-left py-3 text-foreground font-semibold">Waiting Period</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-3">Deportation Coverage</td>
                    <td className="py-3">No waiting period</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3">Medical Emergency (Accident)</td>
                    <td className="py-3">No waiting period</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3">Medical Emergency (Illness)</td>
                    <td className="py-3">14 days</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3">Death Benefits</td>
                    <td className="py-3">No waiting period</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3">Loss of Contract</td>
                    <td className="py-3">30 days</td>
                  </tr>
                  <tr>
                    <td className="py-3">Legal Assistance</td>
                    <td className="py-3">7 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-3xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Emergency Contact</h2>
            <p className="text-muted-foreground mb-6">
              In case of emergency, contact our 24/7 support line immediately. Have your policy number ready when you call.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-card/50 rounded-xl p-4">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Hotline</p>
                  <p className="font-semibold text-foreground">+256 700 000 000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-card/50 rounded-xl p-4">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Support</p>
                  <p className="font-semibold text-foreground">insurance@orbitemploy.com</p>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Notice */}
          <section className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              This insurance policy is underwritten by Orbit Employ Ltd. and is subject to the laws of Uganda.
            </p>
            <p>
              By subscribing to this insurance, you acknowledge that you have read, understood, and agree to these terms and conditions.
            </p>
          </section>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button variant="hero" onClick={() => navigate("/insurance")}>
            Subscribe Now - $35/year
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceTerms;
