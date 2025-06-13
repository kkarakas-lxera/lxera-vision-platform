
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import WhyLXERASection from "@/components/WhyLXERASection";
import TransformationStartsSection from "@/components/TransformationStartsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PlatformHighlightsSection from "@/components/PlatformHighlightsSection";
import SmartKnowledgeDeliverySection from "@/components/SmartKnowledgeDeliverySection";
import BuiltForInnovatorsSection from "@/components/BuiltForInnovatorsSection";
import JoinTheMovementSection from "@/components/JoinTheMovementSection";
import WhyWereBuildingSection from "@/components/WhyWereBuildingSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-smart-beige">
      <Navigation />
      <HeroSection />
      <WhyLXERASection />
      <TransformationStartsSection />
      <HowItWorksSection />
      <PlatformHighlightsSection />
      <SmartKnowledgeDeliverySection />
      <BuiltForInnovatorsSection />
      <JoinTheMovementSection />
      <WhyWereBuildingSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
