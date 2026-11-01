import { Navbar } from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import FeaturedFreelancersSection from "@/components/FeaturedFreelancersSection";
import { LatestJobsSection } from "@/components/LatestJobsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import { WhyChooseSection } from "@/components/WhyChooseSection";
import AITalentMatchingSection from "@/components/AITalentMatchingSection";
import { TrendingSkillsSection } from "@/components/TrendingSkillsSection";
import SuccessStoriesSection from "@/components/SuccessStoriesSection";
import EmployerCTASection from "@/components/EmployerCTASection";
import FreelancerCTASection from "@/components/FreelancerCTASection";
import SeoContentSection from "@/components/SeoContentSection";
import FaqSection from "@/components/FaqSection";
import NewsletterSection from "@/components/NewsletterSection";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Orbit Employ | Hire Freelancers & Find Remote Jobs Worldwide</title>
        <meta name="description" content="Discover skilled freelancers, find remote jobs and hire professionals worldwide. Connect, collaborate and grow your business with Orbit Employ." />
        <meta name="keywords" content="freelance marketplace, hire freelancers online, find freelance jobs, remote jobs worldwide, hire remote developers, freelancing platform in Africa, freelance jobs for Africans, find skilled professionals, online freelance work" />
        <link rel="canonical" href="https://orbitemploy.com/" />
        <meta property="og:title" content="Orbit Employ | Hire Freelancers & Find Remote Jobs Worldwide" />
        <meta property="og:description" content="Discover skilled freelancers, find remote jobs and hire professionals worldwide. Connect, collaborate and grow your business with Orbit Employ." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://orbitemploy.com/" />
        <meta name="twitter:title" content="Orbit Employ | Hire Freelancers & Find Remote Jobs Worldwide" />
        <meta name="twitter:description" content="Discover skilled freelancers, find remote jobs and hire professionals worldwide. Connect, collaborate and grow your business with Orbit Employ." />
      </Helmet>
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <StatsSection />
        <CategoriesSection />
        <FeaturedFreelancersSection />
        <LatestJobsSection />
        <HowItWorksSection />
        <WhyChooseSection />
        <AITalentMatchingSection />
        <TrendingSkillsSection />
        <SuccessStoriesSection />
        <EmployerCTASection />
        <FreelancerCTASection />
        <SeoContentSection />
        <FaqSection />
        <NewsletterSection />
        <Footer />
        <WhatsAppButton />
      </main>
    </>
  );
};

export default Index;
