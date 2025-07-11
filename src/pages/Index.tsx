
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import MobileHeroSection from "@/components/landing/MobileHeroSection";
import WhyLXERASection from "@/components/WhyLXERASection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PlatformHighlightsSection from "@/components/PlatformHighlightsSection";
import TransformationStartsSection from "@/components/TransformationStartsSection";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import { useEffect, useState } from "react";

// Mobile-optimized components
import MobileWhyLXERA from "@/components/mobile/MobileWhyLXERA";
import MobileHowItWorks from "@/components/mobile/MobileHowItWorks";
import MobilePlatformHighlights from "@/components/mobile/MobilePlatformHighlights";

interface IndexProps {
  openDemoModal?: (source: string) => void;
  openEarlyAccessModal?: (source: string) => void;
}

const Index = ({ openDemoModal, openEarlyAccessModal }: IndexProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile version with optimized components
  if (isMobile) {
    return (
      <>
        <SEO />
        <ScrollProgress />
        <div className="min-h-screen bg-white">
          <Navigation openDemoModal={openDemoModal} />
          <MobileHeroSection openDemoModal={openDemoModal} openEarlyAccessModal={openEarlyAccessModal} />
          <MobileWhyLXERA />
          <MobileHowItWorks openDemoModal={openDemoModal} />
          <MobilePlatformHighlights />
          <TransformationStartsSection openDemoModal={openDemoModal} openEarlyAccessModal={openEarlyAccessModal} />
          <Footer />
          <BackToTop />
        </div>
      </>
    );
  }

  // Desktop version
  return (
    <>
      <SEO />
      <ScrollProgress />
      <div className="min-h-screen bg-white">
        <Navigation openDemoModal={openDemoModal} />
        <HeroSection openDemoModal={openDemoModal} openEarlyAccessModal={openEarlyAccessModal} />
        <WhyLXERASection />
        <HowItWorksSection openDemoModal={openDemoModal} />
        <PlatformHighlightsSection />
        <TransformationStartsSection openDemoModal={openDemoModal} openEarlyAccessModal={openEarlyAccessModal} />
        <Footer />
        <BackToTop />
      </div>
    </>
  );
};

export default Index;
