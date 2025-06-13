
import { ArrowDown } from "lucide-react";
import HeroContent from "./HeroContent";
import CTASection from "./CTASection";
import HeroStats from "./HeroStats";

const HeroSection = () => {
  return (
    <section className="hero w-full py-20 px-6 lg:px-12 bg-smart-beige relative overflow-hidden">
      {/* Enhanced decorative elements for visual interest */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/4 via-transparent to-light-green/3"></div>
      <div className="absolute top-20 right-10 w-40 h-40 bg-gradient-to-br from-future-green/8 to-light-green/6 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-br from-light-green/12 to-future-green/8 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-future-green/5 rounded-full blur-md animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-light-green/8 rounded-full blur-lg animate-pulse" style={{animationDelay: '0.5s'}}></div>
      
      <div className="container max-w-7xl mx-auto relative z-10 space-y-16">
        <HeroContent />
        <CTASection />
        <HeroStats />
        
        {/* Enhanced scroll indicator */}
        <div className="mt-20 animate-fade-in-up" style={{animationDelay: '1.2s'}}>
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm text-business-black/60 font-medium">Discover more</p>
            <div className="relative">
              <ArrowDown className="w-8 h-8 text-future-green animate-bounce drop-shadow-lg" />
              <div className="absolute inset-0 w-8 h-8 bg-future-green/20 rounded-full blur-sm animate-ping"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
