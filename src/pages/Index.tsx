
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

const Index = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile version with optimized hero
  if (isMobile) {
    return (
      <>
        <SEO />
        <ScrollProgress />
        <div className="min-h-screen bg-white">
          <Navigation />
          <MobileHeroSection />
          <WhyLXERASection />
          <HowItWorksSection />
          <PlatformHighlightsSection />
          <TransformationStartsSection />
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
        <Navigation />
        <HeroSection />
        <WhyLXERASection />
        <HowItWorksSection />
        <PlatformHighlightsSection />
        <TransformationStartsSection />
        <Footer />
        <BackToTop />
      </div>
    </>
  );
};

export default Index;
