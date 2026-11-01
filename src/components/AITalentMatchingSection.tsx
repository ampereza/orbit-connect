import { Button } from "@/components/ui/button";
import { Heart, Zap, Sparkles, Brain, Shield } from "lucide-react";

const AITalentMatchingSection = () => {
  // Check if AI functionality is implemented in the app
  const hasAIIntegration = false; // Placeholder - check actual implementation

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            AI-Powered
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Meet Your Next Perfect Match.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover smarter hiring with intelligent recommendations that connect
            projects with the right skills, experience and professional expertise.
          </p>
        </div>

        {hasAIIntegration ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-card border border-border text-center">
              <div className="w-14 h-14 bg-primary/5 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                AI-Powered Job Matching
              </h3>
              <p className="text-muted-foreground mb-4">
                Our algorithm analyzes project requirements and matches them with
                the most suitable freelancers based on skills, experience and rates.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-card border border-border text-center">
              <div className="w-14 h-14 bg-primary/5 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                AI Freelancer Recommendations
              </h3>
              <p className="text-muted-foreground mb-4">
                Get personalized freelancer recommendations based on your project
                needs and past collaborations.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-card border border-border text-center">
              <div className="w-14 h-14 bg-primary/5 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                AI-Assisted Job Descriptions
              </h3>
              <p className="text-muted-foreground mb-4">
                Let AI help you write compelling job descriptions that attract the
                right talent.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-8 shadow-card border border-border text-center">
            <div className="w-14 h-14 bg-primary/5 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-3">
              Intelligent Talent Matching (Coming Soon)
            </h3>
            <p className="text-muted-foreground mb-4">
              AI-powered recommendations will be available soon. In the meantime,
              our marketplace connects you with thousands of verified professionals.
            </p>
            <p className="text-muted-foreground text-sm">
              The AI matching feature is currently in development and will launch
              shortly to help you find the perfect match faster.
            </p>
          </div>
        )}

        <div className="text-center mt-8">
          <Button
            variant="hero"
            size="lg"
            className="bg-[#101B32] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-transform"
          >
            Discover Intelligent Hiring
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AITalentMatchingSection;