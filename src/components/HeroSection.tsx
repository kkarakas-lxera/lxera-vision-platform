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
    <section className="hero w-full pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-20 px-6 lg:px-12 bg-gradient-to-br from-smart-beige/50 via-future-green/5 to-smart-beige/70 relative overflow-hidden">
      {/* Animated background elements with consistent colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/8 via-transparent to-smart-beige/20"></div>
      <div className="absolute top-20 right-10 w-40 h-40 rounded-full blur-xl animate-pulse bg-gradient-to-br from-future-green/15 to-smart-beige/10"></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full blur-md animate-pulse bg-gradient-to-r from-future-green/12 to-smart-beige/15 animate-delay-2000"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full blur-lg animate-pulse bg-gradient-to-l from-smart-beige/18 to-future-green/10 animate-delay-500"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main content - side by side layout with bigger video */}
        <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-8 mb-12">
          {/* Left side - Headline and CTA content - keeping lg:w-2/5 */}
          <div className="w-full lg:w-2/5 space-y-4">
            {/* Headline - consistent sizing */}
            <div className="animate-fade-in-up">
              <h1 className="headline text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-business-black leading-tight tracking-tight">
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
              <p className="subheadline text-base sm:text-lg md:text-xl lg:text-xl text-business-black/85 font-medium leading-relaxed">
                Empower your teams to{" "}
                <b className="text-business-black">learn faster,</b>{" "}
                <b className="text-business-black">innovate deeper,</b>{" "}
                and <b className="text-business-black">lead transformation</b>—
                within one intelligent ecosystem.
              </p>
            </div>

            {/* Divider - smaller */}
            <div className="animate-fade-in-scale animate-delay-400">
              <div className="w-24 h-1 animate-pulse-slow shadow-lg bg-gradient-to-r from-transparent via-future-green to-transparent"></div>
            </div>

            {/* Quote snippet - consistent text size */}
            <div className="text-left">
              <span className="block text-business-black/70 text-base font-medium italic leading-tight">
                "Designed for the new world of work, where speed, innovation, and learning are inseparable."
              </span>
            </div>
            
            <div className="text-left animate-fade-in-up animate-delay-600 space-y-3">
              <p className="text-base text-business-black/75 font-medium">
                🚀 <strong className="text-business-black">Early access open</strong> for innovative teams
              </p>
              <div className="flex flex-row gap-3">
                <Button
                  size="lg"
                  className="bg-future-green text-business-black hover:bg-future-green/90 font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
                  onClick={handleScrollToContact}
                  aria-label="Request a demo"
                >
                  Request a demo
                </Button>
                <Button
                  size="lg"
                  className="bg-business-black text-white hover:bg-business-black/90 font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2"
                  aria-label="LXERA for Business"
                >
                  LXERA for Business
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Video (bigger - takes more space) */}
          <div className="w-full lg:w-3/5 lg:pl-12 mt-8 lg:mt-6">
            <HeroVideoPreview />
          </div>
        </div>
        
        {/* Stats section - centered */}
        <div className="text-center mb-10">
          <HeroStats />
        </div>
        
        {/* Scroll indicator */}
        <div className="mt-10 animate-fade-in-up animate-delay-1200 text-center">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm text-business-black/60 font-medium">Discover more</p>
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
