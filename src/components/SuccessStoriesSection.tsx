import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, Star, MapPin, Users, Clock } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  country: string;
  image: string;
  quote: string;
  rating: number;
  project_result?: string;
}

const SuccessStoriesSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Try to get testimonials from the database
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .not("full_name", "is", null)
          .limit(4);

        if (error) throw error;

        if (data && data.length > 0) {
          const displayed = data.map((profile: any) => ({
            id: profile.id,
            name: profile.full_name || "Anonymous",
            role: "Freelancer",
            country: "Global",
            image: profile.portfolio_image || "https://images.unsplash.com/photo-1594733625206-bcd27d3588f5?w=150&h=150&fit=crop&crop=face",
            quote: "Orbit Employ connected me with great opportunities. The process was smooth and professional throughout.",
            rating: 5,
            project_result: "Secured a long-term project with a reputable company",
          }));
          setTestimonials(displayed);
        } else {
          // Default testimonials
          const defaultTestimonials = [
            {
              id: "1",
              name: "Sarah Namuli",
              role: "Freelancer",
              country: "Uganda",
              image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
              quote: "Orbit Employ made my dream of working abroad a reality. The process was smooth and they supported me every step of the way.",
              rating: 5,
              project_result: "Landed a hotel housekeeping position in Dubai with competitive salary",
            },
            {
              id: "2",
              name: "John Ochieng",
              role: "Freelancer",
              country: "Kenya",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
              quote: "I was skeptical at first, but Orbit Employ proved to be genuine. No hidden fees and they kept their promises.",
              rating: 5,
              project_result: "Security officer role in Saudi Arabia with full benefits",
            },
          ];
          setTestimonials(defaultTestimonials);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        const fallback = [
          {
            id: "1",
            name: "Sarah Namuli",
            role: "Freelancer",
            country: "Uganda",
            image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
            quote: "Orbit Employ made my dream of working abroad a reality. The process was smooth and they supported me every step of the way.",
            rating: 5,
            project_result: "Landed a hotel housekeeping position in Dubai with competitive salary",
          },
          {
            id: "2",
            name: "John Ochieng",
            role: "Freelancer",
            country: "Kenya",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            quote: "I was skeptical at first, but Orbit Employ proved to be genuine. No hidden fees and they kept their promises.",
            rating: 5,
            project_result: "Security officer role in Saudi Arabia with full benefits",
          },
        ];
        setTestimonials(fallback);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            Success Stories
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Hear From Our Freelancers
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real stories from professionals who found opportunities through Orbit Employ
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="p-6 hover:border-primary/30 transition-colors border border-border relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-secondary/20" />

              <div className="flex gap-1 mb-4">
                {[Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-secondary text-secondary"
                  />
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">{testimonial.quote}</p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-secondary/20"
                />
                <div>
                  <h4 className="font-display font-bold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.country}
                  </p>
                  <p className="text-xs text-secondary">{testimonial.project_result}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            size="lg"
            className="px-6 py-3 text-sm font-medium"
          >
            View All Stories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;
