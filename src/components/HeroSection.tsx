
import { ArrowDown, ArrowRight } from "lucide-react";
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
    <section className="hero w-full pt-32 pb-20 px-6 lg:px-12 bg-gradient-to-br from-smart-beige/50 via-future-green/5 to-smart-beige/70 relative overflow-hidden">
      {/* Animated background elements with consistent colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/8 via-transparent to-smart-beige/20"></div>
      <div className="absolute top-20 right-10 w-40 h-40 rounded-full blur-xl animate-pulse bg-gradient-to-br from-future-green/15 to-smart-beige/10"></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full blur-md animate-pulse bg-gradient-to-r from-future-green/12 to-smart-beige/15 animate-delay-2000"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full blur-lg animate-pulse bg-gradient-to-l from-smart-beige/18 to-future-green/10 animate-delay-500"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main content - side by side layout */}
        <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-12 mb-16">
          {/* Left side - Headline and CTA content */}
          <div className="w-full lg:w-1/2 space-y-8">
            {/* Headline */}
            <div className="animate-fade-in-up">
              <h1 className="headline text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-business-black leading-tight tracking-tight">
                <span>
                  LXERA is the first
                </span>
                <br />
                <span
                  className="block drop-shadow-sm"
                  style={{ color: '#B1B973' }}
                >
                  Learning & Innovation
                </span>
                <span>
                  Experience Platform
                </span>
              </h1>
            </div>

            {/* Subheadline */}
            <div className="animate-fade-in-up animate-delay-200">
              <p className="subheadline text-base xs:text-lg sm:text-xl lg:text-xl text-business-black/85 font-medium leading-relaxed">
                Empower teams to{" "}
                <b className="text-business-black">learn faster,</b>{" "}
                <b className="text-business-black">innovate deeper,</b>{" "}
                and <b className="text-business-black">grow</b> from the frontline—
                in one intelligent ecosystem.
              </p>
            </div>

            {/* Divider */}
            <div className="animate-fade-in-scale animate-delay-400">
              <div className="w-32 h-1 animate-pulse-slow shadow-lg bg-gradient-to-r from-transparent via-future-green to-transparent"></div>
            </div>

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
          <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
            <HeroVideoPreview />
          </div>
        </div>
        
        {/* Stats section - centered */}
        <div className="text-center mb-12">
          <HeroStats />
        </div>
        
        {/* Scroll indicator */}
        <div className="mt-12 animate-fade-in-up animate-delay-1200 text-center">
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm text-business-black/60 font-medium">Discover more</p>
            <div className="relative">
              <ArrowDown className="w-8 h-8 animate-bounce drop-shadow-lg text-future-green" />
              <div className="absolute inset-0 w-8 h-8 rounded-full blur-sm animate-ping bg-future-green/25"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
