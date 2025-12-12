import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProcessSection } from "@/components/ProcessSection";
import { EligibilitySection } from "@/components/EligibilitySection";
import { ApplicationForm } from "@/components/ApplicationForm";
import { WhyChooseSection } from "@/components/WhyChooseSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ProcessSection />
      <EligibilitySection />
      <ApplicationForm />
      <WhyChooseSection />
      <Footer />
    </main>
  );
};

export default Index;
