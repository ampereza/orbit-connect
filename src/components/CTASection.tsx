import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

export const CTASection = () => {
  const scrollToApply = () => {
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-card mb-6">
          Ready to Start Your Journey?
        </h2>
        <p className="text-card/70 text-lg max-w-2xl mx-auto mb-10">
          Join thousands of East Africans who have found global opportunities through Orbit Employ. 
          Apply today and take the first step toward a better future.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="hero"
            size="lg"
            onClick={scrollToApply}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Apply Now
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            variant="heroOutline"
            size="lg"
            className="border-card/30 text-card hover:bg-card/10"
            onClick={() => window.open("https://wa.me/256790331326", "_blank")}
          >
            <Phone className="w-5 h-5" />
            Contact Us
          </Button>
        </div>

        <p className="text-card/50 text-sm mt-8">
          Next recruitment cycle starts <span className="text-secondary font-semibold">January 2025</span>
        </p>
      </div>
    </section>
  );
};
