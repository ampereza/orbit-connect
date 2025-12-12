import { Shield, DollarSign, Clock, Handshake, Globe, HeartHandshake } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Verified Employers",
    description: "We partner only with legitimate, vetted employers in the Middle East.",
  },
  {
    icon: DollarSign,
    title: "No Large Upfront Fees",
    description: "Pay later after employment. We cover your deployment costs upfront.",
  },
  {
    icon: Clock,
    title: "5 Recruitment Cycles",
    description: "Regular opportunities throughout the year with structured recruitment.",
  },
  {
    icon: Handshake,
    title: "Transparent Process",
    description: "Clear communication and honest expectations at every step.",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Access to growing employment opportunities across the Middle East.",
  },
  {
    icon: HeartHandshake,
    title: "Full Support",
    description: "We guide you from application to your first day at work abroad.",
  },
];

export const WhyChooseSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            Why Orbit Employ
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Your Partner in Global Employment
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built on fairness, integrity, and the mission to improve livelihoods one opportunity at a time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group bg-card rounded-2xl p-8 shadow-card border border-border hover:border-secondary/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary transition-colors duration-300">
                <benefit.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
