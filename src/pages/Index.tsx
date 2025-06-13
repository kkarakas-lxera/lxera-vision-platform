
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import WhyLXERASection from "@/components/WhyLXERASection";
import TransformationStartsSection from "@/components/TransformationStartsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PlatformHighlightsSection from "@/components/PlatformHighlightsSection";
import BuiltForInnovatorsSection from "@/components/BuiltForInnovatorsSection";
import JoinTheMovementSection from "@/components/JoinTheMovementSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  console.log("Index page rendering");
  
  return (
    <div className="min-h-screen bg-smart-beige">
      <Navigation />
      <HeroSection />
      <WhyLXERASection />
      <TransformationStartsSection />
      <HowItWorksSection />
      <PlatformHighlightsSection />
      <BuiltForInnovatorsSection />
      <JoinTheMovementSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
