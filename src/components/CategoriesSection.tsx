import { Code, Palette, Megaphone, PenTool, Briefcase, Headphones, Wrench, Brain, BarChart3, TrendingUp, Video, Coins, GraduationCap, Scale } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { icon: Code, name: "Development & IT", slug: "development-it" },
  { icon: Palette, name: "Design & Creative", slug: "design-creative" },
  { icon: Megaphone, name: "Digital Marketing", slug: "digital-marketing" },
  { icon: PenTool, name: "Writing & Translation", slug: "writing-translation" },
  { icon: Briefcase, name: "Business & Finance", slug: "business-finance" },
  { icon: Headphones, name: "Virtual Assistance", slug: "virtual-assistance" },
  { icon: Wrench, name: "Engineering & Architecture", slug: "engineering-architecture" },
  { icon: Brain, name: "AI & Machine Learning", slug: "ai-ml" },
  { icon: BarChart3, name: "Data Science & Analytics", slug: "data-science" },
  { icon: TrendingUp, name: "Sales & Business Development", slug: "sales" },
  { icon: Video, name: "Video, Photography & Audio", slug: "video-photo-audio" },
  { icon: Coins, name: "Blockchain & Web3", slug: "blockchain-web3" },
  { icon: GraduationCap, name: "Education & Tutoring", slug: "education-tutoring" },
  { icon: Scale, name: "Legal & Professional Services", slug: "legal" },
];

export const CategoriesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">Popular Professional Categories</h2>
        <p className="text-muted-foreground text-center mb-12">Explore opportunities across in-demand fields.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {categories.map((c) => (
            <Link key={c.slug} to={`/categories/${c.slug}`} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition flex items-center gap-3">
              <c.icon className="w-6 h-6 text-secondary shrink-0" />
              <span className="text-sm font-medium text-foreground">{c.name}</span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/categories" className="text-primary font-medium hover:underline">Explore All Categories →</Link>
        </div>
      </div>
    </section>
  );
};