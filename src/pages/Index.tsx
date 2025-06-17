
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import WhyLXERASection from "@/components/WhyLXERASection";
import TransformationStartsSection from "@/components/TransformationStartsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PlatformHighlightsSection from "@/components/PlatformHighlightsSection";
import BuiltForInnovatorsSection from "@/components/BuiltForInnovatorsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <WhyLXERASection />
      <TransformationStartsSection />
      <HowItWorksSection />
      <PlatformHighlightsSection />
      <BuiltForInnovatorsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
