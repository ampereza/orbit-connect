import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  published_at: string | null;
}

const SeoContentSection = () => {
  const [articles, setArticles] = useState<Article[]>([]);

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
          setArticles(data as Article[]);
        }
        // If no data, articles stays [] - depends on database only
      } catch (error) {
        console.error("Error fetching articles:", error);
        // Keep articles as [] - depends on database only, no fallback
      }
    };

    fetchArticles();
  }, []);

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
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="h-48 bg-primary/5 rounded-md mb-4 flex items-center justify-center"><span className="text-muted-foreground">Featured Image</span></div>
              <h3 className="font-display font-bold text-foreground mb-2">{article.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{article.category}</span>
                <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}</span>
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
