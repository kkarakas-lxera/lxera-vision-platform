
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import WhyLXERASection from "@/components/WhyLXERASection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PlatformHighlightsSection from "@/components/PlatformHighlightsSection";
import IndustryUseCases from "@/components/IndustryUseCases";
import TransformationStartsSection from "@/components/TransformationStartsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, userProfile } = useAuth();

  const getAuthSection = () => {
    if (user && userProfile) {
      const dashboardLink = userProfile.role === 'super_admin' ? '/admin' : 
                           userProfile.role === 'company_admin' ? '/dashboard' : '/learner';
      
      return (
        <div className="fixed top-4 right-4 z-50">
          <Link to={dashboardLink}>
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      );
    }

    return null; // Remove the duplicate Sign In button - the Navigation component handles this
  };

  return (
    <>
      <SEO />
      <ScrollProgress />
      <div className="min-h-screen bg-white">
        <Navigation />
        {getAuthSection()}
        <HeroSection />
        <WhyLXERASection />
        <HowItWorksSection />
        <PlatformHighlightsSection />
        <IndustryUseCases />
        <TransformationStartsSection />
        <CTASection />
        <Footer />
        <BackToTop />
      </div>
    </>
  );
};

export default Index;
