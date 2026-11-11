import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, Users } from "lucide-react";
import logo from "@/assets/logo.png";

const Hero = () => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"freelancers" | "jobs">("jobs");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = encodeURIComponent(query.trim());
    if (mode === "jobs") navigate(`/jobs?search=${q}`);
    else navigate(`/freelancers?search=${q}`);
  };

  const popular = ["React developer", "Graphic Designer", "SEO Specialist", "UI/UX Design", "Content Writer"];

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#101B32] via-[#1e3a8a] to-[#2563EB] text-white min-h-[70vh] md:min-h-[80vh] lg:min-h-[90vh]"
    >
      <div className="container mx-auto px-4 py-20 md:py-28 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center relative">
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            Great Talent. Great Work. One Orbit.
          </h1>
          <p className="text-base md:text-lg text-white/80 mb-8">
            Connect with skilled professionals, discover exciting opportunities and build successful working relationships without boundaries.
          </p>

          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setMode("jobs")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition 
                ${mode === "jobs" ? "bg-white text-[#101B32]" : "bg-white/10 text-white"}
              `}
            >
              Find Jobs
            </button>
            <button
              onClick={() => setMode("freelancers")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition 
                ${mode === "freelancers" ? "bg-white text-[#101B32]" : "bg-white/10 text-white"}
              `}
            >
              Find Freelancers
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 bg-white rounded-2xl p-2 shadow-lg max-w-2xl mx-auto mt-6">
            <div className="flex items-center pl-3 text-muted-foreground">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try 'React developer', 'Graphic Designer', 'SEO Specialist'..."
              className="flex-1 outline-none text-foreground text-sm md:text-base bg-transparent"
            />
            <Button type="submit" variant="hero" className="rounded-xl">
              Search
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2 mb-8">
            {popular.map((p) => (
              <button
                key={p}
                onClick={() => { setQuery(p); }}
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button
              variant="hero"
              size="lg"
              asChild
              className="bg-[#101B32] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-transform"
            >
              <a href="/freelancers" className="flex items-center gap-2">Find Talent</a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl"
            >
              <a href="/jobs" className="flex items-center gap-2">Find Work</a>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Global Talent Network</span>
            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> Remote Opportunities</span>
            <span className="flex items-center gap-1"><Search className="w-4 h-4" /> Professional Collaboration</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;