import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileContact from "@/components/mobile/contact/MobileContact";
import { Suspense, lazy, useState, useEffect } from "react";
import { ChevronRight, Calendar, Users, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingEarlyAccess = lazy(() => import("@/components/forms/PricingEarlyAccess"));

interface ContactProps {
  openDemoModal?: (source: string) => void;
  openEarlyAccessModal?: (source: string) => void;
  openContactSalesModal?: (source: string) => void;
}

const Contact: React.FC<ContactProps> = ({ openDemoModal, openEarlyAccessModal, openContactSalesModal }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showSecondaryOptions, setShowSecondaryOptions] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Progressive disclosure - show secondary options after delay or scroll
  useEffect(() => {
    const timer = setTimeout(() => setShowSecondaryOptions(true), 2000);
    
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowSecondaryOptions(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Show mobile version for mobile devices
  if (isMobile) {
    return <MobileContact 
      openDemoModal={openDemoModal} 
      openEarlyAccessModal={openEarlyAccessModal} 
      openContactSalesModal={openContactSalesModal} 
    />;
  }

  return (
    <div className="min-h-screen bg-smart-beige">
      <Navigation openDemoModal={openDemoModal} />
      
      {/* Hero Section with Progress Indicator */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          {/* Progress Indicator - Goal Gradient Effect */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-2 text-sm text-business-black/60">
              <span className="font-medium">Step 1 of 3:</span>
              <span>Choose how to connect</span>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight">
            Get Started with
            <span className="block bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">
              LXERA
            </span>
          </h1>
          <p className="text-lg text-business-black/70 max-w-3xl mx-auto mb-8 leading-relaxed">
            Transform your organization's learning experience with AI-powered workforce development
          </p>
        </div>
      </section>

      {/* Main Actions - Hick's Law + Fitts's Law Implementation */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Primary Action - Always Visible */}
          <div className="max-w-2xl mx-auto mb-12">
            <Card 
              className="hover:shadow-2xl transition-all duration-300 border-0 bg-white backdrop-blur-sm group rounded-3xl overflow-hidden cursor-pointer transform hover:scale-[1.02]"
              onClick={() => openDemoModal && openDemoModal('contact_page_primary')}
              onMouseEnter={() => setHoveredCard('demo')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-12 text-center relative">
                {/* Visual hierarchy - larger primary CTA */}
                <div className="absolute top-4 right-4 bg-future-green/20 text-future-green px-3 py-1 rounded-full text-sm font-medium">
                  Recommended
                </div>
                <Calendar className="w-12 h-12 mx-auto mb-4 text-future-green" />
                <h2 className="text-3xl font-medium text-business-black mb-4">
                  See LXERA in Action
                </h2>
                <p className="text-lg text-business-black/70 mb-8">
                  Book a personalized demo to discover how LXERA can revolutionize your workforce development
                </p>
                
                {/* Show next steps on hover - Goal Gradient */}
                <div className={`transition-all duration-300 ${hoveredCard === 'demo' ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'} overflow-hidden mb-4`}>
                  <div className="flex items-center justify-center gap-2 text-sm text-business-black/60">
                    <span>15-min call</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>Custom demo</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>Tailored plan</span>
                  </div>
                </div>

                <ProgressiveDemoCapture
                  source="contact_page_demo"
                  buttonText="Book Demo"
                  variant="default"
                  openDemoModal={openDemoModal}
                  className="text-lg py-6 px-10"
                />
              </CardContent>
            </Card>
          </div>

          {/* Secondary Actions - Progressive Disclosure */}
          <div className={`grid md:grid-cols-2 gap-8 transition-all duration-700 ${showSecondaryOptions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Early Access Card */}
            <Card 
              className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group rounded-3xl overflow-hidden cursor-pointer"
              onClick={() => openEarlyAccessModal && openEarlyAccessModal('contact_page_early_access')}
              onMouseEnter={() => setHoveredCard('early-access')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-8 text-center">
                <Users className="w-8 h-8 mx-auto mb-3 text-emerald" />
                <h2 className="text-xl font-medium text-business-black mb-3">
                  Request Early Access
                </h2>
                <p className="text-base text-business-black/70 mb-6">
                  Be among the first to experience the future of organizational learning
                </p>
                
                {/* Show next steps on hover */}
                <div className={`transition-all duration-300 ${hoveredCard === 'early-access' ? 'opacity-100 max-h-16' : 'opacity-0 max-h-0'} overflow-hidden mb-3 text-sm text-business-black/60`}>
                  Quick signup → Priority access → Exclusive benefits
                </div>

                <Suspense fallback={
                  <div className="w-full py-3 bg-future-green/20 rounded-full animate-pulse" />
                }>
                  <PricingEarlyAccess className="w-full" openEarlyAccessModal={openEarlyAccessModal} />
                </Suspense>
              </CardContent>
            </Card>

            {/* Contact Sales Card */}
            <Card 
              className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group rounded-3xl overflow-hidden cursor-pointer"
              onClick={() => openContactSalesModal && openContactSalesModal('contact_page_sales')}
              onMouseEnter={() => setHoveredCard('sales')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-8 text-center">
                <Headphones className="w-8 h-8 mx-auto mb-3 text-business-black" />
                <h2 className="text-xl font-medium text-business-black mb-3">
                  Contact Sales
                </h2>
                <p className="text-base text-business-black/70 mb-6">
                  Get custom pricing and solutions for enterprise teams
                </p>
                
                {/* Show next steps on hover */}
                <div className={`transition-all duration-300 ${hoveredCard === 'sales' ? 'opacity-100 max-h-16' : 'opacity-0 max-h-0'} overflow-hidden mb-3 text-sm text-business-black/60`}>
                  Share needs → Get proposal → Enterprise support
                </div>

                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    openContactSalesModal && openContactSalesModal('contact_page_sales');
                  }}
                  className="w-full bg-business-black text-white hover:bg-business-black/90 rounded-full py-3"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section id="contact-info" className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-10">
              <h3 className="text-2xl font-medium text-business-black mb-4">
                Have Questions?
              </h3>
              <p className="text-lg text-business-black/70 mb-4">
                We're here to help you get started
              </p>
              <a 
                href="mailto:sales@lxera.ai" 
                className="text-lg text-future-green hover:text-emerald transition-colors duration-300 font-medium"
              >
                sales@lxera.ai
              </a>
            </CardContent>
          </Card>
        </div>
      </section>


      <Footer />
      
    </div>
  );
};

export default Contact;
