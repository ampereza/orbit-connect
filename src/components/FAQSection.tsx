import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How much does it cost to apply?",
    answer: "We charge a small country-specific application processing fee (e.g., UGX 50,000 for Uganda, KES 1,750 for Kenya). This covers verification, applicant management, and communication throughout the recruitment process.",
  },
  {
    question: "What is the loan-based deployment model?",
    answer: "Orbit Employ covers your deployment expenses upfront, including visa, travel, and documentation costs. Once you start working, we deduct our commission in manageable portions from your salary. This removes the financial burden of large upfront payments.",
  },
  {
    question: "What documents do I need?",
    answer: "You'll need a valid passport, international police clearance report, CV, and professional references. If you don't have a passport yet, you can still apply—we'll guide you through obtaining one before deployment.",
  },
  {
    question: "How long does the process take?",
    answer: "The timeline varies based on your recruitment cycle and job matching. Typically, from application to deployment can take 2-4 months, depending on employer needs and document processing times.",
  },
  {
    question: "Which countries do you deploy to?",
    answer: "We primarily connect candidates with employers in the Middle East, including UAE (Dubai, Abu Dhabi), Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman. New destinations are added regularly.",
  },
  {
    question: "What types of jobs are available?",
    answer: "We offer opportunities in hospitality, healthcare, domestic work, security, construction, retail, and various service industries. Specific roles depend on your skills, experience, and employer requirements.",
  },
  {
    question: "Is Orbit Employ legitimate?",
    answer: "Yes, Orbit Employ is a registered recruitment agency. We only partner with verified employers and maintain transparency throughout the process. We never ask for large upfront payments and provide full support from application to employment.",
  },
  {
    question: "What support do I get after deployment?",
    answer: "We offer $35/year insurance covering emergencies like deportation, severe illness, loss of contract, and other problems. Our team also provides ongoing support through WhatsApp and can assist with workplace issues.",
  },
];

export const FAQSection = () => {
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
            Find answers to frequently asked questions about our recruitment process.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-2xl border border-border px-6 shadow-sm data-[state=open]:border-secondary/30"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-secondary py-6 hover:no-underline">
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
