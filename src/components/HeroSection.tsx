
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
    <section className="hero w-full pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-8 sm:pb-12 px-2 sm:px-6 lg:px-12 bg-gradient-to-br from-business-black via-business-black/95 to-business-black/90 relative overflow-hidden font-inter transition-all duration-1000 ease-in-out">
      {/* Writer-inspired gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/20 via-transparent to-business-black/80"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(122,229,198,0.15),transparent)] opacity-60"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main content - side by side layout with much bigger video */}
        <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-6 mb-8 sm:mb-12">
          {/* Left side - Headline and CTA content */}
          <div className="w-full lg:w-2/5 space-y-3 sm:space-y-4 px-2 sm:px-0">
            {/* Writer-inspired headline with better contrast */}
            <div className="animate-fade-in-up">
              <h1 className="headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight font-inter">
                <span className="block">
                  LXERA: The First
                </span>
                <span className="block bg-gradient-to-r from-future-green to-light-green bg-clip-text text-transparent">
                  Learning &amp; Innovation
                </span>
                <span className="block text-white">
                  Experience Platform
                </span>
              </h1>
            </div>

            {/* Subheadline with better contrast */}
            <div className="animate-fade-in-up animate-delay-200">
              <p className="subheadline text-sm sm:text-base md:text-lg lg:text-xl text-white/90 font-normal leading-relaxed font-inter">
                Empower your teams to{" "}
                <span className="text-future-green font-medium">learn faster,</span>{" "}
                <span className="text-future-green font-medium">innovate deeper,</span>{" "}
                and <span className="text-future-green font-medium">lead transformation</span>—
                within one intelligent ecosystem.
              </p>
            </div>

            {/* Writer-inspired accent line */}
            <div className="animate-fade-in-scale animate-delay-400">
              <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-future-green via-light-green to-future-green shadow-lg"></div>
            </div>

            {/* Quote snippet with better contrast */}
            <div className="text-left">
              <span className="block text-white/70 text-xs sm:text-sm md:text-base font-normal italic leading-tight font-inter">
                "Designed for the new world of work, where speed, innovation, and learning are inseparable."
              </span>
            </div>
            
            <div className="text-left animate-fade-in-up animate-delay-600 space-y-2 sm:space-y-3">
              <p className="text-sm sm:text-base text-white/80 font-normal font-inter">
                🚀 <strong className="text-future-green font-medium">Early access open</strong> for innovative teams
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                <Button
                  size="lg"
                  className="bg-future-green text-business-black hover:bg-light-green hover:text-business-black font-medium px-6 py-4 text-sm sm:text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 font-inter min-h-[48px] touch-manipulation"
                  onClick={handleRequestDemo}
                  aria-label="Request a demo"
                >
                  Request a demo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 bg-white/10 text-white hover:bg-white hover:text-business-black font-medium px-6 py-4 text-sm sm:text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-white/50 focus:ring-offset-2 font-inter min-h-[48px] touch-manipulation backdrop-blur-sm"
                  aria-label="LXERA for Business"
                >
                  LXERA for Business
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Video (responsive sizing) */}
          <div className="w-full lg:w-3/5 lg:pl-8 mt-6 sm:mt-8 lg:mt-6 px-2 sm:px-0">
            <div className="transform lg:scale-110 lg:translate-x-4 lg:translate-y-2">
              <HeroVideoPreview />
            </div>
          </div>
        </div>
        
        {/* Stats section - centered */}
        <div className="text-center mb-6 sm:mb-8 px-2 sm:px-0">
          <HeroStats />
        </div>
        
        {/* Scroll indicator with Writer-inspired styling */}
        <div className="mt-4 sm:mt-6 animate-fade-in-up animate-delay-1200 text-center">
          <button
            onClick={handleScrollToContact}
            className="flex flex-col items-center space-y-2 group focus:outline-none focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 rounded-lg p-2 transition-all duration-300 hover:scale-105"
            aria-label="Scroll down to discover more content"
          >
            <p className="text-xs sm:text-sm text-white/60 font-normal font-inter group-hover:text-white/80 transition-colors">
              Discover more
            </p>
            <div className="relative">
              <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce drop-shadow-lg text-future-green group-hover:text-light-green transition-colors" />
              <div className="absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full blur-sm animate-ping bg-future-green/25"></div>
            </div>
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
