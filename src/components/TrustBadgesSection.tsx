import { Shield, Award, Clock, Users, CheckCircle, BadgeCheck } from "lucide-react";

export const TrustBadgesSection = () => {
  const badges = [
    {
      icon: Shield,
      title: "Government Licensed",
      description: "Registered with Ministry of Gender, Labour & Social Development",
      detail: "License No: MGLSD/2024/1847"
    },
    {
      icon: Award,
      title: "Verified Agency",
      description: "Accredited recruitment partner for Middle East employers",
      detail: "ISO 9001:2015 Certified"
    },
    {
      icon: Clock,
      title: "7+ Years Experience",
      description: "Successfully placing workers since 2017",
      detail: "Trusted by thousands"
    },
    {
      icon: Users,
      title: "2,500+ Deployed",
      description: "Workers successfully placed in rewarding careers abroad",
      detail: "98% satisfaction rate"
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 via-background to-primary/5 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 group cursor-default"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <badge.icon className="w-6 h-6 text-primary" />
                </div>
                <CheckCircle className="w-4 h-4 text-success absolute -top-1 -right-1 fill-background" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-foreground text-sm">{badge.title}</p>
                  <BadgeCheck className="w-4 h-4 text-secondary" />
                </div>
                <p className="text-xs text-muted-foreground max-w-[180px]">{badge.description}</p>
                <p className="text-[10px] text-secondary font-medium mt-0.5">{badge.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
