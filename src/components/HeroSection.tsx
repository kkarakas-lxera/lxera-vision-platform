
import { ArrowDown } from "lucide-react";
import HeroVideoPreview from "./HeroVideoPreview";
import { Button } from "@/components/ui/button";
import HeroStats from "./HeroStats";
import DemoModal from "./DemoModal";
import { useState } from "react";

const HeroSection = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Smooth scroll to #contact
  const handleScrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRequestDemo = () => {
    setIsDemoModalOpen(true);
  };

  return (
    <section className="hero w-full pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-8 sm:pb-12 px-2 sm:px-6 lg:px-12 bg-white relative overflow-hidden font-inter transition-all duration-1000 ease-in-out">
      {/* Minimal geometric background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-1 h-20 bg-future-green/20"></div>
        <div className="absolute top-40 right-20 w-20 h-1 bg-future-green/20"></div>
        <div className="absolute bottom-40 left-1/3 w-2 h-2 rounded-full bg-future-green/30"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main content - cleaner layout */}
        <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-12 mb-12 sm:mb-16">
          {/* Left side - Simplified headline */}
          <div className="w-full lg:w-2/5 space-y-6 sm:space-y-8 px-2 sm:px-0">
            {/* Clean headline */}
            <div className="animate-fade-in-up">
              <h1 className="headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-business-black leading-tight tracking-tight font-inter">
                <span className="block">
                  AI-Powered Learning
                </span>
                <span className="block font-medium" style={{ color: '#7AE5C6' }}>
                  Made Human
                </span>
              </h1>
            </div>

            {/* Simplified subheadline */}
            <div className="animate-fade-in-up animate-delay-200">
              <p className="subheadline text-lg sm:text-xl lg:text-2xl text-business-black/70 font-light leading-relaxed font-inter max-w-lg">
                Where technology meets humanity. Learn faster, innovate deeper, grow together.
              </p>
            </div>

            {/* Minimal divider */}
            <div className="animate-fade-in-scale animate-delay-400">
              <div className="w-12 h-px bg-future-green"></div>
            </div>

            {/* Human-centric copy */}
            <div className="text-left animate-fade-in-up animate-delay-600 space-y-4">
              <p className="text-base text-business-black/60 font-light font-inter">
                Join forward-thinking teams already transforming how they learn and innovate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-business-black text-white hover:bg-business-black/90 font-normal px-8 py-4 text-base rounded-lg shadow-sm transition-all duration-300 hover:shadow-md font-inter min-h-[48px] touch-manipulation border-0"
                  onClick={handleRequestDemo}
                  aria-label="See how it works"
                >
                  See how it works
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border border-business-black/20 bg-transparent text-business-black hover:bg-business-black hover:text-white font-normal px-8 py-4 text-base rounded-lg shadow-sm transition-all duration-300 hover:shadow-md font-inter min-h-[48px] touch-manipulation"
                  aria-label="Talk to our team"
                >
                  Talk to our team
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Cleaner video presentation */}
          <div className="w-full lg:w-3/5 lg:pl-12 mt-8 lg:mt-0 px-2 sm:px-0">
            <div className="relative">
              <HeroVideoPreview />
              {/* Subtle tech accent */}
              <div className="absolute -top-4 -right-4 w-8 h-8 border border-future-green/30 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Minimal scroll indicator */}
        <div className="mt-8 sm:mt-12 animate-fade-in-up animate-delay-1200 text-center">
          <button
            onClick={handleScrollToContact}
            className="flex flex-col items-center space-y-3 group focus:outline-none focus:ring-1 focus:ring-future-green/30 focus:ring-offset-4 rounded-lg p-3 transition-all duration-300"
            aria-label="Discover more"
          >
            <div className="w-px h-8 bg-business-black/20 group-hover:bg-future-green/50 transition-colors"></div>
            <ArrowDown className="w-4 h-4 animate-bounce text-business-black/40 group-hover:text-future-green/70 transition-colors" />
          </button>
        </div>
      </div>

      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </section>
  );
};

export default HeroSection;
