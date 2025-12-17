import { Building2, Plane, Building, Globe, Briefcase, Hotel } from "lucide-react";

export const PartnersSection = () => {
  const partners = [
    { name: "Emirates Group", icon: Plane, type: "Airline Partner" },
    { name: "Rotana Hotels", icon: Hotel, type: "Hospitality Partner" },
    { name: "Al Futtaim Group", icon: Building2, type: "Retail Partner" },
    { name: "Qatar Airways", icon: Plane, type: "Airline Partner" },
    { name: "Emaar Properties", icon: Building, type: "Real Estate Partner" },
    { name: "Dubai Tourism", icon: Globe, type: "Government Partner" },
  ];

  return (
    <section className="py-16 bg-card border-y border-border/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">
            Trusted Partnerships
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Our Employer Network
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            We work with leading companies and organizations across the Middle East
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="group flex flex-col items-center justify-center p-6 rounded-xl bg-background border border-border/50 hover:border-secondary/50 hover:shadow-md transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors">
                <partner.icon className="w-8 h-8 text-primary group-hover:text-secondary transition-colors" />
              </div>
              <p className="font-semibold text-foreground text-sm text-center">{partner.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{partner.type}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-border">
            <Briefcase className="w-4 h-4" />
            50+ Active Employers
          </span>
          <span className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-border">
            <Globe className="w-4 h-4" />
            UAE, Saudi, Qatar, Kuwait
          </span>
          <span className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-border">
            <Building2 className="w-4 h-4" />
            Hotels, Retail, Healthcare, Domestic
          </span>
        </div>
      </div>
    </section>
  );
};
