import { Check, AlertCircle } from "lucide-react";
import { eligibilityCountries, flatApplicationFee } from "@/config/applicationFees";

const requirements = [
  { text: "Age between 18 and 49 years", required: true },
  { text: "Valid passport (mandatory)", required: true },
  { text: "East African nationality", required: true },
  { text: "Uganda, Kenya, Tanzania, Rwanda, or Burundi", required: false },
  { text: "Willingness to work abroad", required: true },
  { text: "Basic communication skills", required: false },
];

export const EligibilitySection = () => {
  return (
    <section className="py-24 bg-primary">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Requirements */}
          <div>
            <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
              Eligibility
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-card mb-6">
              Who Can Apply?
            </h2>
            <p className="text-card/70 text-lg mb-8">
              We welcome applications from motivated individuals across East Africa who meet our basic requirements.
            </p>

            <div className="space-y-4">
              {requirements.map((req, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-card/5 backdrop-blur-sm rounded-xl p-4 border border-card/10"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${req.required ? 'bg-secondary' : 'bg-card/20'}`}>
                    <Check className={`w-4 h-4 ${req.required ? 'text-secondary-foreground' : 'text-card'}`} />
                  </div>
                  <span className="text-card font-medium">{req.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Application Fees */}
          <div>
            <div className="bg-card rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-secondary" />
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Connects Fee
                </h3>
              </div>
              <p className="text-muted-foreground mb-8">
                A small connects fee supports verification, applicant management, and communication throughout your recruitment journey.
              </p>

              <div className="space-y-4">
                {eligibilityCountries.map((country) => (
                  <div
                    key={country.name}
                    className="flex items-center justify-between bg-background rounded-xl p-5 border border-border hover:border-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{country.flag}</span>
                      <span className="font-semibold text-foreground">{country.name}</span>
                    </div>
                    <span className="font-display font-bold text-xl text-primary">
                      {flatApplicationFee.displayFee}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                <p className="text-sm text-foreground/80">
                  <strong className="text-secondary">No large upfront fees!</strong> Orbit Employ covers deployment expenses. Commission is deducted from your salary after you start working.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
