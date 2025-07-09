
import HeroVideoPreview from "./HeroVideoPreview";
import { Button } from "@/components/ui/button";
import DemoModal from "@/components/DemoModal";
import InlineEmailCapture from "@/components/forms/InlineEmailCapture";
import { useState } from "react";

const CTASection = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(true);
  const [emailCaptured, setEmailCaptured] = useState(false);

  const handleRequestDemo = () => {
    setIsDemoModalOpen(true);
  };

  const handleEmailSuccess = (email: string) => {
    setEmailCaptured(true);
    setShowEmailCapture(false);
  };

  const handleBusinessClick = () => {
    // Could navigate to a business page or open another modal
    // For now, just scroll to contact section
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-12">
        {/* Left side - CTA content */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Quote snippet */}
          <div className="text-left">
            <span className="block text-business-black/70 text-base font-medium italic leading-tight">
              "Built with real teams. Designed for transformation."
            </span>
          </div>
          
          <div className="text-left animate-fade-in-up animate-delay-600 space-y-4">
            <p className="text-base text-business-black/75 font-medium">
              🚀 <strong className="text-business-black">Early access open</strong> for innovative teams
            </p>
            {showEmailCapture && !emailCaptured ? (
              <div className="space-y-4 max-w-md">
                <InlineEmailCapture 
                  source="cta_section"
                  buttonText="Get Early Access"
                  onSuccess={handleEmailSuccess}
                />
                <p className="text-xs text-gray-500">
                  No credit card required • Join 200+ teams
                </p>
                <div className="flex gap-3 text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRequestDemo}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Prefer a demo?
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBusinessClick}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Enterprise solutions
                  </Button>
                </div>
              </div>
            ) : emailCaptured ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
                <p className="text-green-800 font-medium">✓ Check your email to continue!</p>
                <p className="text-green-600 text-sm mt-1">We sent you a magic link</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-future-green text-business-black hover:bg-future-green/90 font-medium px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 min-h-[48px]"
                  onClick={handleRequestDemo}
                  aria-label="Request a demo"
                >
                  Request a Demo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-medium px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2 min-h-[48px]"
                  onClick={handleBusinessClick}
                  aria-label="LXERA for Business"
                >
                  LXERA for Business
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Video */}
        <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
          <HeroVideoPreview />
        </div>
      </div>

      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)}
        source="CTA Section"
      />
    </>
  );
};

export default CTASection;
