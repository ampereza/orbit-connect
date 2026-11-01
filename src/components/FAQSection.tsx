import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "What is Orbit Employ?", a: "Orbit Employ is a global freelancing marketplace connecting businesses with freelancers, independent professionals and agencies." },
  { q: "How do I register as a freelancer?", a: "Click Join Orbit, choose Freelancer, and complete your profile with skills, portfolio and rates." },
  { q: "How do I hire a freelancer?", a: "Create an employer account, post a job, review proposals and hire the right talent." },
  { q: "Is Orbit Employ available internationally?", a: "Yes, Orbit Employ supports global clients and freelancers." },
  { q: "How do freelancers find jobs?", a: "Browse the jobs marketplace, filter by skills, budget and category, then submit proposals." },
  { q: "How does the payment system work?", a: "Payments are managed per project milestones as implemented in the platform." },
  { q: "Does Orbit Employ charge commissions?", a: "Commission terms are defined in the platform's payment policy." },
  { q: "How do I create an employer account?", a: "Register via Join Orbit and select Employer during onboarding." },
  { q: "Can I work remotely with international clients?", a: "Yes, remote collaboration is a core feature of Orbit Employ." },
  { q: "How does freelancer verification work?", a: "Verification follows the platform's KYC and profile review process." },
  { q: "How are disputes handled?", a: "Disputes are handled per the platform's dispute policy." },
  { q: "How can I contact support?", a: "Use the Help Center or contact support via the footer links." },
];

export const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="border border-border rounded-xl bg-card">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between items-center p-4 text-left font-medium">
                {f.q} <ChevronDown className={`w-5 h-5 transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="px-4 pb-4 text-muted-foreground text-sm">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};