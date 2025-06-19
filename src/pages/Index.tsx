
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
    <div className="min-h-screen">
      <Navigation />
      <div className="transition-all duration-1000 ease-in-out">
        <HeroSection />
      </div>
      <div className="transition-all duration-1000 ease-in-out">
        <WhyLXERASection />
      </div>
      <div className="transition-all duration-1000 ease-in-out">
        <TransformationStartsSection />
      </div>
      <div className="transition-all duration-1000 ease-in-out">
        <HowItWorksSection />
      </div>
      <div className="transition-all duration-1000 ease-in-out">
        <PlatformHighlightsSection />
      </div>
      <div className="transition-all duration-1000 ease-in-out">
        <BuiltForInnovatorsSection />
      </div>
      <div className="transition-all duration-1000 ease-in-out">
        <ContactSection />
      </div>
      <div className="transition-all duration-1000 ease-in-out">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
