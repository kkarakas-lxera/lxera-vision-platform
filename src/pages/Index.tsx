
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import WhyLXERASection from "@/components/WhyLXERASection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PlatformHighlightsSection from "@/components/PlatformHighlightsSection";
import TransformationStartsSection from "@/components/TransformationStartsSection";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";

const Index = () => {
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
