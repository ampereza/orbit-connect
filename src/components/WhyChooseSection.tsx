import { Globe, UserCheck, Search, Shield, MessageSquare, Star } from "lucide-react";

const benefits = [
  { icon: Globe, title: "Global Talent Access", desc: "Connect with professionals worldwide." },
  { icon: UserCheck, title: "Professional Profiles", desc: "Showcase skills, portfolios and reviews." },
  { icon: Search, title: "Intelligent Matching", desc: "Find the right fit for your project." },
  { icon: Shield, title: "Transparent Hiring", desc: "Clear processes and expectations." },
  { icon: MessageSquare, title: "Collaboration Tools", desc: "Communicate and manage projects." },
  { icon: Star, title: "Reviews & Reputation", desc: "Build trust through verified reviews." },
];

export const WhyChooseSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">Why Choose Orbit Employ</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((b) => (
            <div key={b.title} className="bg-card border border-border rounded-2xl p-6">
              <b.icon className="w-8 h-8 text-secondary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};