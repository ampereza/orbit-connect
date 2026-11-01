import { Link } from "react-router-dom";

export const LatestJobsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Latest Freelance Jobs</h2>
          <Link to="/jobs" className="text-primary font-medium hover:underline">Explore All Jobs →</Link>
        </div>
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          No active job listings yet. Check back soon or post the first job.
        </div>
      </div>
    </section>
  );
};