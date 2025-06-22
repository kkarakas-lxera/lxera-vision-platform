
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
    <>
      <section className="hero w-full pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-16 sm:pb-20 px-2 sm:px-6 lg:px-12 bg-gradient-to-br from-smart-beige/60 via-future-green/8 to-smart-beige/80 relative overflow-hidden font-inter transition-all duration-1000 ease-in-out">
        {/* Enhanced background with subtle animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-future-green/10 via-transparent to-smart-beige/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(123,229,198,0.1)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(177,185,115,0.1)_0%,transparent_50%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main content - side by side layout with enhanced video */}
          <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-8 mb-8 sm:mb-12">
            {/* Left side - Headline and CTA content */}
            <div className="w-full lg:w-2/5 space-y-4 sm:space-y-6 px-2 sm:px-0">
              {/* Value proposition badge */}
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-future-green/20 to-emerald/20 border border-future-green/30 rounded-full">
                  <div className="w-2 h-2 bg-future-green rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-business-black font-inter">
                    The Future of Learning & Innovation
                  </span>
                </div>
              </div>

              {/* Enhanced headline with better hierarchy */}
              <div className="animate-fade-in-up animate-delay-200">
                <h1 className="headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-business-black leading-tight tracking-tight font-inter">
                  <span className="block">
                    LXERA: Where
                  </span>
                  <span className="block" style={{ color: '#B1B973' }}>
                    Learning Meets
                  </span>
                  <span className="block">
                    <span style={{ color: '#B1B973' }}>Innovation</span>
                  </span>
                </h1>
              </div>

              {/* Enhanced subheadline with specific benefits */}
              <div className="animate-fade-in-up animate-delay-400">
                <p className="subheadline text-base sm:text-lg md:text-xl lg:text-xl text-business-black/85 font-normal leading-relaxed font-inter">
                  The first platform that combines{" "}
                  <b className="text-business-black font-semibold">AI-powered learning,</b>{" "}
                  <b className="text-business-black font-semibold">real-time innovation,</b>{" "}
                  and <b className="text-business-black font-semibold">continuous transformation</b>{" "}
                  in one intelligent ecosystem.
                </p>
              </div>

              {/* Key differentiators */}
              <div className="animate-fade-in-up animate-delay-600">
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full border border-future-green/20">
                    <div className="w-1.5 h-1.5 bg-future-green rounded-full"></div>
                    <span className="text-sm text-business-black/80 font-inter">AI-Personalized</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full border border-future-green/20">
                    <div className="w-1.5 h-1.5 bg-future-green rounded-full"></div>
                    <span className="text-sm text-business-black/80 font-inter">Innovation-Driven</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full border border-future-green/20">
                    <div className="w-1.5 h-1.5 bg-future-green rounded-full"></div>
                    <span className="text-sm text-business-black/80 font-inter">Enterprise-Ready</span>
                  </div>
                </div>
              </div>

              {/* Enhanced CTAs with urgency */}
              <div className="text-left animate-fade-in-up animate-delay-800 space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-r from-future-green/10 to-emerald/10 border border-future-green/20 rounded-2xl p-4">
                  <p className="text-sm sm:text-base text-business-black/80 font-medium font-inter mb-3">
                    🚀 <strong className="text-business-black">Early Access Open</strong> - Join 500+ innovative teams
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-future-green to-emerald text-business-black hover:from-emerald hover:to-future-green font-semibold px-8 py-4 text-sm sm:text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 font-inter min-h-[52px] touch-manipulation"
                      onClick={handleRequestDemo}
                      aria-label="Request a demo"
                    >
                      Get Your Demo Now
                    </Button>
                    <Button
                      size="lg"
                      className="bg-business-black text-white hover:bg-business-black/90 font-semibold px-8 py-4 text-sm sm:text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2 font-inter min-h-[52px] touch-manipulation"
                      aria-label="Explore LXERA Platform"
                    >
                      Explore Platform
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Enhanced Video with better prominence */}
            <div className="w-full lg:w-3/5 lg:pl-8 mt-8 sm:mt-8 lg:mt-0 px-2 sm:px-0">
              <div className="relative">
                {/* Video enhancement overlay */}
                <div className="absolute -inset-4 bg-gradient-to-r from-future-green/20 to-emerald/20 rounded-3xl blur-xl"></div>
                <div className="relative transform lg:scale-110 lg:translate-x-4 lg:translate-y-2">
                  <HeroVideoPreview />
                </div>
                
                {/* Video call-out */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-future-green/30 rounded-full px-4 py-2 shadow-lg">
                  <span className="text-xs font-medium text-business-black/80 font-inter">
                    👆 See LXERA in 2 minutes
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Stats section */}
          <div className="text-center mb-6 sm:mb-8 px-2 sm:px-0">
            <HeroStats />
          </div>
          
          {/* Enhanced scroll indicator */}
          <div className="mt-8 sm:mt-12 animate-fade-in-up animate-delay-1200 text-center">
            <div className="inline-flex flex-col items-center space-y-3 group">
              <p className="text-sm sm:text-base text-business-black/70 font-medium font-inter group-hover:text-business-black/90 transition-colors">
                Discover how LXERA transforms learning
              </p>
              <button
                onClick={handleScrollToContact}
                className="flex flex-col items-center space-y-2 focus:outline-none focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 rounded-lg p-2 transition-all duration-300 hover:scale-105"
                aria-label="Scroll down to discover more content"
              >
                <div className="relative">
                  <ArrowDown className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce drop-shadow-lg text-future-green group-hover:text-emerald transition-colors" />
                  <div className="absolute inset-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full blur-sm animate-ping bg-future-green/25"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <DemoModal 
          isOpen={isDemoModalOpen} 
          onClose={() => setIsDemoModalOpen(false)} 
        />
      </section>
    </>
  );
};

export default HeroSection;
