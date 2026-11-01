import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Search, User, Gift } from "lucide-react";
import logo from "@/assets/logo.png";

const centerLinks = [
  { label: "Find Work", to: "/jobs" },
  { label: "Find Talent", to: "/freelancers" },
  { label: "Categories", to: "/categories" },
  { label: "How It Works", to: "/how-it-works" },
];

const resourceLinks = [
  { label: "Blog", to: "/blog" },
  { label: "Help Center", to: "/help" },
  { label: "Career Guides", to: "/guides" },
  { label: "FAQs", to: "/faq" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-card/95 backdrop-blur-md shadow-md"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Orbit Employ" className="h-9 w-auto" />
            <span className="font-display font-bold text-lg text-foreground hidden sm:inline">Orbit Employ</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {centerLinks.map((l) => (
              <Link key={l.label} to={l.to} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="relative">
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                Resources <ChevronDown className="w-4 h-4" />
              </button>
              {resourcesOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg p-2">
                  {resourceLinks.map((l) => (
                    <Link
                      key={l.label}
                      to={l.to}
                      onClick={() => setResourcesOpen(false)}
                      className="block px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Log In</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/auth?mode=signup">Join Orbit</Link>
            </Button>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-card rounded-2xl shadow-lg p-4 mb-4 animate-fade-up">
            <div className="flex flex-col gap-2">
              {centerLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 text-foreground font-medium"
                >
                  {l.label}
                </Link>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                {resourceLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-foreground/80"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" className="flex-1" asChild onClick={() => setIsMobileMenuOpen(false)}>
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button variant="hero" className="flex-1" asChild onClick={() => setIsMobileMenuOpen(false)}>
                  <Link to="/auth?mode=signup">Join Orbit</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
