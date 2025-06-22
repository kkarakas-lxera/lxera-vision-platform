
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import WhyLXERASection from "@/components/WhyLXERASection";
import TransformationStartsSection from "@/components/TransformationStartsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PlatformHighlightsSection from "@/components/PlatformHighlightsSection";
import BuiltForInnovatorsSection from "@/components/BuiltForInnovatorsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import StickyDemoButton from "@/components/StickyDemoButton";
import EnhancedSectionSeparator from "@/components/EnhancedSectionSeparator";
import ConversionCTA from "@/components/ConversionCTA";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="LXERA - The First Learning & Innovation Experience Platform"
        description="Empower your teams to learn faster, innovate deeper, and lead transformation within one intelligent ecosystem. AI-powered learning platform for modern organizations."
        keywords="AI learning platform, innovation platform, personalized learning, workforce development, digital transformation"
      />
      <Navigation />
      <StickyDemoButton />
      
      <div className="transition-all duration-1000 ease-in-out">
        <HeroSection />
      </div>
      
      <EnhancedSectionSeparator variant="gradient" />
      
      <div className="transition-all duration-1000 ease-in-out">
        <WhyLXERASection />
      </div>
      
      <EnhancedSectionSeparator variant="wave" />
      
      <div className="transition-all duration-1000 ease-in-out">
        <TransformationStartsSection />
      </div>
      
      <EnhancedSectionSeparator />
      
      <div className="transition-all duration-1000 ease-in-out">
        <HowItWorksSection />
      </div>
      
      <EnhancedSectionSeparator variant="gradient" />
      
      <div className="transition-all duration-1000 ease-in-out">
        <PlatformHighlightsSection />
      </div>
      
      {/* Mid-page conversion opportunity */}
      <section className="py-16 px-6 lg:px-12 bg-gradient-to-br from-smart-beige/20 to-future-green/10">
        <div className="max-w-4xl mx-auto">
          <ConversionCTA 
            variant="primary"
            title="See LXERA in action"
            subtitle="Discover how leading teams are transforming learning and innovation"
            showUrgency={true}
          />
        </div>
      </section>
      
      <EnhancedSectionSeparator variant="wave" />
      
      <div className="transition-all duration-1000 ease-in-out">
        <BuiltForInnovatorsSection />
      </div>
      
      <EnhancedSectionSeparator />
      
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
