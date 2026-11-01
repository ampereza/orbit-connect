import { User, Briefcase, Search, Send, CheckCircle, Building2, FileText, Users, Handshake } from "lucide-react";

const freelancerSteps = [
  { icon: User, title: "Create Your Profile", description: "Build a professional profile and showcase your skills." },
  { icon: Search, title: "Discover Opportunities", description: "Find projects matching your expertise." },
  { icon: Send, title: "Submit Proposals", description: "Connect with employers and present your offers." },
  { icon: CheckCircle, title: "Deliver and Earn", description: "Complete projects, receive payments and grow your reputation." },
];

const employerSteps = [
  { icon: Building2, title: "Create Your Account", description: "Register your business or employer profile." },
  { icon: FileText, title: "Publish a Job", description: "Describe the project, requirements and budget." },
  { icon: Users, title: "Find the Right Talent", description: "Review applications and discover suitable freelancers." },
  { icon: Handshake, title: "Hire and Collaborate", description: "Manage projects, milestones and payments." },
];

const Column = ({ title, cta, steps }: { title: string; cta: string; steps: typeof freelancerSteps }) => (
  <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
    <h3 className="font-display text-xl font-bold text-foreground mb-6">{title}</h3>
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{i + 1}</div>
          <div>
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <s.icon className="w-4 h-4 text-secondary" /> {s.title}
            </div>
            <p className="text-sm text-muted-foreground">{s.description}</p>
          </div>
        </li>
      ))}
    </ol>
    <button className="mt-6 w-full py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition">{cta}</button>
  </div>
);

export const ProcessSection = () => {
  return (
    <section id="process" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">How It Works</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">How Orbit Employ Works</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Column title="For Freelancers" cta="Start Freelancing" steps={freelancerSteps} />
          <Column title="For Employers" cta="Hire Talent" steps={employerSteps} />
        </div>
      </div>
    </section>
  );
};