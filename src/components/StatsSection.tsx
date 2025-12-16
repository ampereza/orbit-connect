import { Users, Globe, Calendar, Award } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "2,500+",
    label: "Applicants Processed",
  },
  {
    icon: Globe,
    value: "8+",
    label: "Destination Countries",
  },
  {
    icon: Calendar,
    value: "5",
    label: "Recruitment Cycles/Year",
  },
  {
    icon: Award,
    value: "95%",
    label: "Success Rate",
  },
];

export const StatsSection = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center group"
            >
              <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 transition-colors">
                <stat.icon className="w-7 h-7 text-secondary" />
              </div>
              <div className="font-display text-3xl md:text-4xl font-bold text-card mb-2">
                {stat.value}
              </div>
              <div className="text-card/70 text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
