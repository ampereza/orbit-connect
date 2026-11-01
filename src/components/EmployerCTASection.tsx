import { Button } from "@/components/ui/button";

const EmployerCTASection = () => {
  return (
    <section
      className="py-24 bg-primary relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #101B32 0%, #1e3a8a 100%)" }}
    >
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-card mb-6">
          Build Your Team Without Boundaries.
        </h2>
        <p className="text-card/70 text-lg max-w-2xl mx-auto mb-10">
          Access skilled professionals, find the right expertise and move your business forward.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="hero"
            size="lg"
            className="bg-secondary text-secondary-foreground font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-transform"
          >
            Hire Freelancers
          </Button>
          <Button
            variant="heroOutline"
            size="lg"
            className="border-card/30 text-card hover:bg-card/10"
          >
            Post a Job
          </Button>
        </div>

        <p className="text-card/50 text-sm mt-8">
          Start hiring or get hired today
        </p>
      </div>
    </section>
  );
};

export default EmployerCTASection;
