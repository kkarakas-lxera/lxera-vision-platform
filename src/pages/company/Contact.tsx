import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileContact from "@/components/mobile/contact/MobileContact";
import { Suspense, lazy } from "react";

const PricingEarlyAccess = lazy(() => import("@/components/forms/PricingEarlyAccess"));

interface ContactProps {
  openDemoModal?: (source: string) => void;
  openEarlyAccessModal?: (source: string) => void;
}

const Contact: React.FC<ContactProps> = ({ openDemoModal, openEarlyAccessModal }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Show mobile version for mobile devices
  if (isMobile) {
    return <MobileContact openDemoModal={openDemoModal} openEarlyAccessModal={openEarlyAccessModal} />;
  }

  return (
    <div className="min-h-screen bg-smart-beige">
      <Navigation openDemoModal={openDemoModal} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
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

      {/* Main Actions */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Book Demo Card */}
            <Card className="hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group rounded-3xl overflow-hidden">
              <CardContent className="p-10 text-center">
                <h2 className="text-2xl font-medium text-business-black mb-4">
                  See LXERA in Action
                </h2>
                <p className="text-lg text-business-black/70 mb-6">
                  Book a personalized demo to discover how LXERA can revolutionize your workforce development
                </p>
                <ProgressiveDemoCapture
                  source="contact_page_demo"
                  buttonText="Book Demo"
                  variant="default"
                  className="w-full"
                  openDemoModal={openDemoModal}
                />
              </CardContent>
            </Card>

            {/* Early Access Card */}
            <Card className="hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group rounded-3xl overflow-hidden">
              <CardContent className="p-10 text-center">
                <h2 className="text-2xl font-medium text-business-black mb-4">
                  Request Early Access
                </h2>
                <p className="text-lg text-business-black/70 mb-6">
                  Be among the first to experience the future of organizational learning
                </p>
                <Suspense fallback={
                  <div className="w-full py-4 bg-future-green/20 rounded-full animate-pulse" />
                }>
                  <PricingEarlyAccess className="w-full" openEarlyAccessModal={openEarlyAccessModal} />
                </Suspense>
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
                We're here to help you get started. Reach us via phone, email or visit our office.
              </p>
              <div className="space-y-2 md:space-y-0 md:space-x-6 flex flex-col md:flex-row items-center justify-center">
                <a
                  href="tel:+14155551234"
                  className="text-lg text-future-green hover:text-emerald transition-colors duration-300 font-medium"
                >
                  +1 (415) 555-1234
                </a>
                <span className="hidden md:inline text-business-black/40">•</span>
                <a
                  href="mailto:sales@lxera.ai"
                  className="text-lg text-future-green hover:text-emerald transition-colors duration-300 font-medium"
                >
                  sales@lxera.ai
                </a>
                <span className="hidden md:inline text-business-black/40">•</span>
                <a
                  href="https://maps.google.com/?q=2151+Park+Blvd,+Palo+Alto,+CA+94306"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-future-green hover:text-emerald transition-colors duration-300 font-medium"
                >
                  2151 Park Blvd, Palo Alto
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>


      <Footer />
      
    </div>
  );
};

export default Contact;
