import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { TrustBadgesSection } from "@/components/TrustBadgesSection";
import { StatsSection } from "@/components/StatsSection";
import { ProcessSection } from "@/components/ProcessSection";
import { EligibilitySection } from "@/components/EligibilitySection";
import { PartnersSection } from "@/components/PartnersSection";
import { DestinationsSection } from "@/components/DestinationsSection";
import { ApplicationForm } from "@/components/ApplicationForm";
import { AboutSection } from "@/components/AboutSection";
import { WhyChooseSection } from "@/components/WhyChooseSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FAQSection } from "@/components/FAQSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <TrustBadgesSection />
      <StatsSection />
      <ProcessSection />
      <EligibilitySection />
      <PartnersSection />
      <DestinationsSection />
      <ApplicationForm />
      <AboutSection />
      <WhyChooseSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <WhatsAppButton />
    </main>
  );
};

export default Index;
