import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SeoContentSection = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(4);

        if (error) throw error;

        if (data && data.length > 0) {
          setArticles(data as any[]);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
        // Static fallback content
        setArticles([]);
      }
    };

    fetchArticles();
  }, []);

  // Sample articles for demonstration - in production, these come from the database
  const sampleArticles = [
    {
      id: "1",
      title: "How to Start Freelancing in Uganda",
      excerpt: "A comprehensive guide to getting your first freelance client from Uganda",
      category: "Getting Started",
      date: "2024-01-15",
      reading_time: "8 min read",
    },
    {
      id: "2",
      title: "How to Find Your First Freelance Client",
      excerpt: "Proven strategies for finding your first freelance project",
      category: "Getting Started",
      date: "2024-01-10",
      reading_time: "6 min read",
    },
    {
      id: "3",
      title: "Best Skills for Remote Work",
      excerpt: "Top skills that are in demand for remote work worldwide",
      category: "Skills",
      date: "2024-01-05",
      reading_time: "10 min read",
    },
    {
      id: "4",
      title: "How to Hire a Freelance Developer",
      excerpt: "Step-by-step guide to hiring the right developer for your project",
      category: "Hiring",
      date: "2024-01-20",
      reading_time: "7 min read",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            Blog & Resources
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Latest Articles
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Insights and guides for freelancers and employers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {sampleArticles.map((article) => (
            <div
              key={article.id}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="h-48 bg-primary/5 rounded-md mb-4 flex items-center justify-center"><span className="text-muted-foreground">Featured Image</span></div>
              <h3 className="font-display font-bold text-foreground mb-2">{article.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{article.category}</span>
                <span>{article.date}</span>
                <span>{article.reading_time}</span>
              </div>
              <Button
                asChild
                href={`/blog/${article.id}`}
                className="w-full text-primary text-sm font-medium mt-3"
              >
                Read More
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            size="lg"
            className="px-6 py-3 text-sm font-medium"
          >
            Explore All Resources
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SeoContentSection;
