import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FaqSection = () => {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        // Try to get FAQs from database config if available
        const { data, error } = await supabase
          .from("faqs")
          .select("*")
          .order("order", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setFaqs(data as any[]);
        } else {
          // Default FAQs based on platform functionality
          const defaultFaqs = [
            {
              question: "What is Orbit Employ?",
              answer: "Orbit Employ is a global freelancing and remote-work marketplace connecting businesses with freelancers, independent professionals and agencies. We facilitate two-sided marketplace interactions for job posting, freelancer discovery, and project collaboration.",
            },
            {
              question: "How do I register as a freelancer?",
              answer: "To register as a freelancer, click 'Join Orbit' on the navigation, select 'Freelancer' mode, and complete the registration form with your profile information. You'll need to create a profile and can make it public or private.",
            },
            {
              question: "How do I hire a freelancer?",
              answer: "To hire a freelancer, register an employer account, create a job posting with your requirements and budget, then review applications from qualified freelancers and select the right candidate.",
            },
            {
              question: "Is Orbit Employ available internationally?",
              answer: "Yes, Orbit Employ connects talent globally. While we have strong initial opportunity for African freelancers and international clients, the platform supports worldwide operations for both freelancers and employers.",
            },
            {
              question: "How do freelancers find jobs?",
              answer: "Freelancers can browse job listings, use search and filters by category, skills, budget, and location. They can also set up profiles to be discovered by employers.",
            },
            {
              question: "How does the payment system work?",
              answer: "Payments are handled through milestone-based escrow. Funds are held securely and released upon milestone completion. Specific payment terms depend on the project agreement.",
            },
            {
              question: "Does Orbit Employ charge commissions?",
              answer: "Yes, Orbit Employ charges a transparent service fee on completed projects. The exact fee structure is outlined during the account setup and contract signing.",
            },
            {
              question: "How do I create an employer account?",
              answer: "Register via 'Join Orbit' and select 'Employer' mode. Provide your business details, verify your identity, and you can start posting jobs immediately.",
            },
            {
              question: "Can I work remotely with international clients?",
              answer: "Absolutely. Orbit Employ is designed for remote work. Freelancers can work from anywhere with international clients, and the platform supports cross-border collaboration and payments.",
            },
            {
              question: "How does freelancer verification work?",
              answer: "Freelancer verification involves profile validation, document submission (ID, certificates), and optional third-party verification. Verified freelancers display a badge on their profiles.",
            },
            {
              question: "How are disputes handled?",
              answer: "Disputes are resolved through the platform's mediation process. Funds in escrow are reviewed, and resolution follows the platform's terms. Both parties can present evidence for fair adjudication.",
            },
            {
              question: "How can I contact support?",
              answer: "Contact support through the Help Center in the footer, email support@orbitemploy.com, or via the in-app messaging system for registered users.",
            },
          ];
          setFaqs(defaultFaqs);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        const fallback = [
          {
            question: "What is Orbit Employ?",
            answer: "Orbit Employ is a global freelancing and remote-work marketplace.",
          },
          {
            question: "How do I register as a freelancer?",
            answer: "Register via Join Orbit and select Freelancer mode.",
          },
        ];
        setFaqs(fallback);
      }
    };

    fetchFaqs();
  }, []);

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            FAQ
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Common Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to frequently asked questions about our platform
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-2xl border border-border px-6 shadow-sm data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
