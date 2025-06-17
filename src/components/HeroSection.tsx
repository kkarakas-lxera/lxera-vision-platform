
import { ArrowDown, ArrowRight } from "lucide-react";
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
        {/* Main headline content */}
        <div className="mb-12">
          <HeroContent />
        </div>
        
        {/* CTA Section with side-by-side layout */}
        <div className="mb-16">
          <CTASection />
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
