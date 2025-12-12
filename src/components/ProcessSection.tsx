import { FileText, Search, Briefcase, Plane, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Apply Once",
    description: "Submit a single application with your details. No need to apply for specific jobs.",
  },
  {
    icon: Search,
    title: "We Match You",
    description: "Our team reviews your profile and matches you with suitable opportunities.",
  },
  {
    icon: Briefcase,
    title: "Get Contacted",
    description: "During recruitment cycles, eligible candidates receive job offers directly.",
  },
  {
    icon: Plane,
    title: "Deploy Abroad",
    description: "We cover deployment costs upfront. Repay gradually from your salary.",
  },
  {
    icon: CheckCircle,
    title: "Start Working",
    description: "Begin your new career with a verified employer in the Middle East.",
  },
];

export const ProcessSection = () => {
  return (
    <section id="process" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Your Journey to Global Employment
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A simple, transparent process designed to get you working abroad without the financial burden.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-gold z-10">
                  {index + 1}
                </div>

                <div className="bg-card rounded-2xl p-6 shadow-card border border-border hover:border-secondary/30 transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary/10 transition-colors">
                    <step.icon className="w-7 h-7 text-primary group-hover:text-secondary transition-colors" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
