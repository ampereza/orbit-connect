import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-[#101B32] to-[#2563EB] text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-white/80 max-w-2xl mx-auto mb-8">Join thousands of professionals and businesses building successful working relationships on Orbit Employ.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="hero" size="lg" asChild><a href="/auth?mode=signup">Join as a Freelancer</a></Button>
          <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white" asChild><a href="/auth?mode=signup">Hire Talent</a></Button>
        </div>
      </div>
    </section>
  );
};