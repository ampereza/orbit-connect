const destinations = [
  {
    country: "United Arab Emirates",
    city: "Dubai & Abu Dhabi",
    flag: "🇦🇪",
    roles: ["Hospitality", "Construction", "Security"],
  },
  {
    country: "Saudi Arabia",
    city: "Riyadh & Jeddah",
    flag: "🇸🇦",
    roles: ["Healthcare", "Domestic Work", "Retail"],
  },
  {
    country: "Qatar",
    city: "Doha",
    flag: "🇶🇦",
    roles: ["Construction", "Hospitality", "Services"],
  },
  {
    country: "Kuwait",
    city: "Kuwait City",
    flag: "🇰🇼",
    roles: ["Domestic Work", "Healthcare", "Retail"],
  },
  {
    country: "Bahrain",
    city: "Manama",
    flag: "🇧🇭",
    roles: ["Hospitality", "Construction", "Security"],
  },
  {
    country: "Oman",
    city: "Muscat",
    flag: "🇴🇲",
    roles: ["Healthcare", "Retail", "Services"],
  },
];

export const DestinationsSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            Destinations
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Where You Could Work
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We connect candidates with verified employers across the Middle East.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {destinations.map((destination) => (
            <div
              key={destination.country}
              className="bg-card rounded-2xl p-6 shadow-card border border-border hover:border-secondary/30 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{destination.flag}</span>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-foreground mb-1">
                    {destination.country}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {destination.city}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {destination.roles.map((role) => (
                      <span
                        key={role}
                        className="text-xs bg-primary/5 text-primary px-2 py-1 rounded-full group-hover:bg-secondary/10 group-hover:text-secondary transition-colors"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
