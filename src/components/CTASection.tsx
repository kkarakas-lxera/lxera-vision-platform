
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
    <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-center lg:gap-12">
      {/* Left side - CTA content */}
      <div className="w-full lg:w-1/2 space-y-6 lg:order-1">
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
              className="bg-future-green text-business-black hover:bg-future-green/90 font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
              onClick={handleScrollToContact}
              aria-label="Request a demo"
            >
              Request a demo
              <ArrowRight size={18} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-business-black bg-white text-business-black hover:bg-business-black hover:text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2"
              aria-label="LXERA for Business"
            >
              LXERA for Business
            </Button>
          </div>
        </div>
      </div>

      {/* Right side - Video */}
      <div className="w-full lg:w-1/2 lg:order-2 mt-8 lg:mt-0">
        <HeroVideoPreview />
      </div>
    </div>
  );
};

export default CTASection;
