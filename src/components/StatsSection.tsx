import { Users, Briefcase, FolderCheck, Layers } from "lucide-react";

const stats = [
  { icon: Users, label: "Registered Freelancers", value: "—" },
  { icon: Briefcase, label: "Active Job Listings", value: "—" },
  { icon: FolderCheck, label: "Completed Projects", value: "—" },
  { icon: Layers, label: "Professional Categories", value: "14" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 transition-colors">
                <stat.icon className="w-7 h-7 text-secondary" />
              </div>
              <div className="font-display text-3xl md:text-4xl font-bold text-card mb-2">
                {stat.value}
              </div>
              <div className="text-card/80 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;