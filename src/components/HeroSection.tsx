
import { ArrowDown } from "lucide-react";
import HeroContent from "./HeroContent";
import CTASection from "./CTASection";
import HeroStats from "./HeroStats";

const HeroSection = () => {
  return (
    <section className="hero w-full pt-32 pb-20 px-6 lg:px-12 bg-gradient-to-br from-smart-beige/50 via-future-green/5 to-smart-beige/70 relative overflow-hidden">
      {/* Animated background elements with consistent colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/8 via-transparent to-smart-beige/20"></div>
      <div className="absolute top-20 right-10 w-40 h-40 rounded-full blur-xl animate-pulse bg-gradient-to-br from-future-green/15 to-smart-beige/10"></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full blur-md animate-pulse bg-gradient-to-r from-future-green/12 to-smart-beige/15 animate-delay-2000"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full blur-lg animate-pulse bg-gradient-to-l from-smart-beige/18 to-future-green/10 animate-delay-500"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Combined hero content and CTA in one horizontal layout */}
        <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-center lg:gap-12 mb-16">
          {/* Left side - Text content */}
          <div className="w-full lg:w-1/2 space-y-8">
            <HeroContent />
            
            {/* CTA content integrated here */}
            <div className="space-y-6">
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
                  <button
                    className="bg-future-green text-business-black hover:bg-future-green/90 font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 flex items-center gap-2"
                    onClick={() => {
                      const el = document.getElementById("contact");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    aria-label="Request a demo"
                  >
                    Request a demo
                    <ArrowRight size={18} />
                  </button>
                  <button
                    className="border-2 border-business-black bg-white text-business-black hover:bg-business-black hover:text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2"
                    aria-label="LXERA for Business"
                  >
                    LXERA for Business
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Video */}
          <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
            <div className="max-w-xl mx-auto lg:mx-0">
              <div
                onClick={() => {/* Video modal logic */}}
                className="relative w-full rounded-2xl shadow-xl border border-future-green/30 overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                aria-label="Watch LXERA in Action (video demonstration)"
                tabIndex={0}
                role="button"
              >
                <video
                  className="w-full object-cover aspect-video"
                  src="your-demo-video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/placeholder.svg"
                />
                {/* Video Overlay Label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/75 text-business-black/75 text-xs font-semibold rounded-full shadow-sm border border-future-green/30 transition-all group-hover:bg-white group-hover:text-business-black/90 z-20 select-none">
                    Watch how LXERA works
                  </span>
                </div>
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition">
                  <span className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-20 w-20 rounded-full bg-future-green/60 opacity-30 animate-ping" />
                    <span className="flex items-center justify-center bg-white/90 rounded-full shadow-md w-16 h-16 border-2 border-future-green drop-shadow-xl animate-pulse-slow">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#6cd4b4" strokeWidth="2"><polygon points="9.5,7.5 16.5,12 9.5,16.5" fill="#40b69e" /></svg>
                    </span>
                  </span>
                </div>
              </div>
              {/* Video caption */}
              <div className="mt-2 flex flex-col items-center">
                <span className="block h-0.5 w-16 bg-gradient-to-r from-transparent via-future-green to-transparent mb-1 rounded-full opacity-80" />
                <span className="text-sm text-business-black/60 font-medium tracking-wide">
                  Watch how LXERA works in 90 seconds
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats section - centered */}
        <div className="text-center">
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
