import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Orbit Employ" 
              className={`h-10 w-auto transition-all duration-300 ${!isScrolled ? 'brightness-0 invert' : ''}`} 
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("process")}
              className={`font-medium transition-colors ${isScrolled ? 'text-foreground hover:text-secondary' : 'text-card/80 hover:text-card'}`}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("apply")}
              className={`font-medium transition-colors ${isScrolled ? 'text-foreground hover:text-secondary' : 'text-card/80 hover:text-card'}`}
            >
              Apply
            </button>
            <Button
              variant={isScrolled ? "default" : "hero"}
              size="sm"
              onClick={() => scrollToSection("apply")}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-card'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-card'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card rounded-2xl shadow-lg p-6 mb-4 animate-fade-up">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("process")}
                className="text-foreground font-medium py-2 text-left hover:text-secondary transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("apply")}
                className="text-foreground font-medium py-2 text-left hover:text-secondary transition-colors"
              >
                Apply
              </button>
              <Button
                variant="hero"
                className="w-full mt-2"
                onClick={() => scrollToSection("apply")}
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
