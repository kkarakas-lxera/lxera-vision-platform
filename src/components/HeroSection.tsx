
import { ArrowDown } from "lucide-react";
import HeroVideoPreview from "./HeroVideoPreview";
import { Button } from "@/components/ui/button";
import HeroStats from "./HeroStats";

const HeroSection = () => {
  // Smooth scroll to #contact
  const handleScrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero w-full pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 px-6 lg:px-12 bg-gradient-to-br from-smart-beige/50 via-future-green/5 to-smart-beige/70 relative overflow-hidden font-inter">
      {/* Simple background gradient without animated elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/8 via-transparent to-smart-beige/20"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main content - side by side layout with much bigger video */}
        <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-6 mb-12">
          {/* Left side - Headline and CTA content - keeping lg:w-2/5 */}
          <div className="w-full lg:w-2/5 space-y-4">
            {/* Headline - consistent sizing */}
            <div className="animate-fade-in-up">
              <h1 className="headline text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-medium text-business-black leading-tight tracking-tight font-inter">
                <span className="block">
                  LXERA: The First
                </span>
                <span className="block whitespace-nowrap" style={{ color: '#B1B973' }}>
                  Learning & Innovation
                </span>
                <span className="block whitespace-nowrap">
                  <span style={{ color: '#B1B973' }}>Experience </span>
                  <span className="text-business-black">Platform</span>
                </span>
              </h1>
            </div>

            {/* Subheadline - consistent sizing */}
            <div className="animate-fade-in-up animate-delay-200">
              <p className="subheadline text-base sm:text-lg md:text-xl lg:text-xl text-business-black/85 font-normal leading-relaxed font-inter">
                Empower your teams to{" "}
                <b className="text-business-black font-medium">learn faster,</b>{" "}
                <b className="text-business-black font-medium">innovate deeper,</b>{" "}
                and <b className="text-business-black font-medium">lead transformation</b>—
                within one intelligent ecosystem.
              </p>
            </div>

            {/* Divider - smaller */}
            <div className="animate-fade-in-scale animate-delay-400">
              <div className="w-24 h-1 animate-pulse-slow shadow-lg bg-gradient-to-r from-transparent via-future-green to-transparent"></div>
            </div>

            {/* Quote snippet - consistent text size */}
            <div className="text-left">
              <span className="block text-business-black/70 text-base font-normal italic leading-tight font-inter">
                "Designed for the new world of work, where speed, innovation, and learning are inseparable."
              </span>
            </div>
            
            <div className="text-left animate-fade-in-up animate-delay-600 space-y-3">
              <p className="text-base text-business-black/75 font-normal font-inter">
                🚀 <strong className="text-business-black font-medium">Early access open</strong> for innovative teams
              </p>
              <div className="flex flex-row gap-3">
                <Button
                  size="lg"
                  className="bg-future-green text-business-black hover:bg-future-green/90 font-medium px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 font-inter"
                  onClick={handleScrollToContact}
                  aria-label="Request a demo"
                >
                  Request a demo
                </Button>
                <Button
                  size="lg"
                  className="bg-business-black text-white hover:bg-business-black/90 font-medium px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2 font-inter"
                  aria-label="LXERA for Business"
                >
                  LXERA for Business
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Video (much bigger - takes more space) */}
          <div className="w-full lg:w-3/5 lg:pl-8 mt-8 lg:mt-6">
            <div className="transform lg:scale-110 lg:translate-x-4 lg:translate-y-2">
              <HeroVideoPreview />
            </div>
          </div>
        </div>
        
        {/* Stats section - centered */}
        <div className="text-center mb-8">
          <HeroStats />
        </div>
        
        {/* Scroll indicator */}
        <div className="mt-6 animate-fade-in-up animate-delay-1200 text-center">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm text-business-black/60 font-normal font-inter">Discover more</p>
            <div className="relative">
              <ArrowDown className="w-6 h-6 animate-bounce drop-shadow-lg text-future-green" />
              <div className="absolute inset-0 w-6 h-6 rounded-full blur-sm animate-ping bg-future-green/25"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
