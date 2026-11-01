import { Button } from "@/components/ui/button";

const FreelancerCTASection = () => {
  return (
    <section
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
          Your Skills Deserve the World.
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
          Showcase your expertise, discover opportunities and build a successful freelance career with Orbit Employ.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="hero"
            size="lg"
            className="bg-[#101B32] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-transform"
          >
            Join as a Freelancer
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl"
          >
            Explore Jobs
          </Button>
        </div>

        <p className="text-muted-foreground text-sm mt-8">
          Find your next opportunity today
        </p>
      </div>
    </section>
  );
};

export default FreelancerCTASection;
