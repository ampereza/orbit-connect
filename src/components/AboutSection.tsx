import { MapPin, Phone, Mail, Clock, Users, Award } from "lucide-react";

export const AboutSection = () => {
  const team = [
    {
      name: "Sarah Nakato",
      role: "Founder & CEO",
      description: "10+ years in international recruitment",
      initials: "SN"
    },
    {
      name: "James Okello",
      role: "Operations Director",
      description: "Former HR Manager at Emirates",
      initials: "JO"
    },
    {
      name: "Grace Achieng",
      role: "Client Relations",
      description: "Specializes in applicant support",
      initials: "GA"
    }
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - About Content */}
          <div>
            <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">
              About Orbit Employ
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Real People, Real Opportunities
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We're not just another recruitment agency. Orbit Employ was founded by East Africans 
              who understand the challenges of finding legitimate work abroad. Our mission is to 
              provide safe, transparent, and rewarding career opportunities in the Middle East.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Family-Owned Business</h4>
                  <p className="text-sm text-muted-foreground">Run by people who genuinely care about your success abroad</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Zero Hidden Fees</h4>
                  <p className="text-sm text-muted-foreground">Transparent pricing with no surprise charges - ever</p>
                </div>
              </div>
            </div>

            {/* Office Info */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                Visit Our Office
              </h4>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Plot 42, Kampala Road<br />
                  Orbit Towers, 3rd Floor<br />
                  Kampala, Uganda
                </p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Mon - Fri: 8:00 AM - 5:00 PM
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  +256 700 123 456
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  info@orbitemploy.com
                </div>
              </div>
            </div>
          </div>

          {/* Right - Team */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6">Meet Our Team</h3>
            <div className="space-y-4">
              {team.map((member, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-secondary/30 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {member.initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{member.name}</h4>
                    <p className="text-sm text-secondary font-medium">{member.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-card rounded-xl border border-border">
                <p className="text-2xl font-bold text-secondary">7+</p>
                <p className="text-xs text-muted-foreground">Years Active</p>
              </div>
              <div className="text-center p-4 bg-card rounded-xl border border-border">
                <p className="text-2xl font-bold text-secondary">2,500+</p>
                <p className="text-xs text-muted-foreground">Workers Placed</p>
              </div>
              <div className="text-center p-4 bg-card rounded-xl border border-border">
                <p className="text-2xl font-bold text-secondary">98%</p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
