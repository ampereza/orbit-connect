import { Link } from "react-router-dom";

const skills = ["React.js","Next.js","Python","Node.js","WordPress","UI/UX Design","Figma","SEO","Digital Marketing","Artificial Intelligence","Data Analysis","Blockchain Development","Video Editing","Content Writing"];

export const TrendingSkillsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">Trending Skills</h2>
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {skills.map((s) => (
            <Link key={s} to={`/skills/${s.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`} className="px-4 py-2 bg-card border border-border rounded-full text-sm hover:bg-muted transition">
              {s}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};