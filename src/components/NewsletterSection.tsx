import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Mail } from "lucide-react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        setSubmitting(false);
        return;
      }

      const existingEmails = localStorage.getItem("orbit_newsletters");
      const emails = existingEmails ? JSON.parse(existingEmails) : [];

      if (emails.includes(email)) {
        setError("This email is already subscribed");
        setSubmitting(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      emails.push(email);
      localStorage.setItem("orbit_newsletters", JSON.stringify(emails));

      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError("Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Stay Ahead of Opportunities.
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Get freelance opportunities, hiring insights and professional growth
            resources delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 shadow-lg max-w-md mx-auto">
            <div className="flex gap-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 rounded-l-xl bg-white p-4 outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-r-xl bg-primary text-white px-6 py-4 font-medium hover:bg-primary/90 transition-colors"
              >
                {submitting ? "Submitting..." : "Subscribe"}
              </Button>
            </div>

            {error && (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            )}

            {success && (
              <p className="text-sm text-green-600 mt-3">
                Successfully subscribed! Check your email.
              </p>
            )}
          </form>

          <p className="text-xs text-muted-foreground/60 mt-6">
            We respect your privacy. No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
