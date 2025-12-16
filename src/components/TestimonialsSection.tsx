import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Namuli",
    country: "Uganda",
    role: "Hotel Housekeeper",
    location: "Dubai, UAE",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
    quote: "Orbit Employ made my dream of working abroad a reality. The process was smooth and they supported me every step of the way.",
    rating: 5,
  },
  {
    name: "John Ochieng",
    country: "Kenya",
    role: "Security Officer",
    location: "Saudi Arabia",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote: "I was skeptical at first, but Orbit Employ proved to be genuine. No hidden fees and they kept their promises.",
    rating: 5,
  },
  {
    name: "Grace Mwamba",
    country: "Tanzania",
    role: "Healthcare Worker",
    location: "Qatar",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    quote: "The loan-based model helped me afford to travel without burdening my family. Now I can support them better than ever.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            Success Stories
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Hear From Our Candidates
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real stories from East Africans who found opportunities through Orbit Employ.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-card rounded-2xl p-8 shadow-card border border-border hover:border-secondary/30 transition-all duration-300 relative group"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-secondary/20 group-hover:text-secondary/40 transition-colors" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
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
                    {testimonial.role} • {testimonial.location}
                  </p>
                  <p className="text-xs text-secondary">
                    From {testimonial.country}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
