
import HeroVideoPreview from "./HeroVideoPreview";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  // Smooth scroll to #contact
  const handleScrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
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
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-future-green text-business-black hover:bg-future-green/90 font-medium px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 min-h-[48px]"
              onClick={handleScrollToContact}
              aria-label="Request a demo"
            >
              Request a Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-medium px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2 min-h-[48px]"
              aria-label="LXERA for Business"
            >
              LXERA for Business
            </Button>
          </div>
        </div>
      </div>

      {/* Right side - Video */}
      <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
        <HeroVideoPreview />
      </div>
    </div>
  );
};

export default CTASection;
