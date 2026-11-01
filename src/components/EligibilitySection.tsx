import { CheckCircle } from "lucide-react";

const items = [
  "Create a complete professional profile",
  "Showcase your skills and portfolio",
  "Set your hourly rate or project pricing",
  "Verify your identity and contact details",
  "Maintain a strong reputation and reviews",
  "Communicate professionally with clients",
];

export const EligibilitySection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Who Can Join Orbit Employ?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">We welcome professionals worldwide who are ready to deliver quality work.</p>
        </div>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <div key={it} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <span className="text-foreground">{it}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};