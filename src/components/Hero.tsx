import { Button } from "@/components/ui/button";
import { Globe, ArrowRight, Shield, Users } from "lucide-react";

export const Hero = () => {
  const scrollToApply = () => {
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen bg-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        
        {/* Orbit decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20">
          <div className="absolute inset-0 border border-secondary/30 rounded-full" />
          <div className="absolute inset-8 border border-secondary/20 rounded-full" />
          <div className="absolute inset-16 border border-secondary/10 rounded-full" />
          <div className="w-3 h-3 bg-secondary rounded-full orbit-animation" />
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-2 mb-8 animate-fade-up">
            <Globe className="w-4 h-4 text-secondary" />
            <span className="text-secondary text-sm font-medium">Next Recruitment: January 2025</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-card mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Empowering East Africans for{" "}
            <span className="text-gradient">Global Opportunities</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-card/70 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Connecting skilled workers from Uganda, Kenya, and Tanzania to verified employers 
            across the Middle East. Apply once, get matched to opportunities.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="lg" onClick={scrollToApply}>
              Apply Now
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="heroOutline" size="lg" onClick={() => document.getElementById("process")?.scrollIntoView({ behavior: "smooth" })}>
              How It Works
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-center gap-3 bg-card/5 backdrop-blur-sm rounded-xl p-4 border border-card/10">
              <Shield className="w-6 h-6 text-secondary" />
              <span className="text-card/90 font-medium">Verified Employers</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-card/5 backdrop-blur-sm rounded-xl p-4 border border-card/10">
              <Users className="w-6 h-6 text-secondary" />
              <span className="text-card/90 font-medium">5 Cycles Per Year</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-card/5 backdrop-blur-sm rounded-xl p-4 border border-card/10">
              <Globe className="w-6 h-6 text-secondary" />
              <span className="text-card/90 font-medium">No Upfront Fees</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};
