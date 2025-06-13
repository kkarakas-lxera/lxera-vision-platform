
import { ArrowDown, Sparkles, Zap } from "lucide-react";
import HeroContent from "./HeroContent";
import CTASection from "./CTASection";
import HeroStats from "./HeroStats";
import TrustIndicators from "./TrustIndicators";
import { useScrollOffset } from "@/hooks/useScrollOffset";

const HeroSection = () => {
  const { scrollToSection } = useScrollOffset();

  const handleScrollDown = () => {
    scrollToSection('#platform');
  };

  return (
    <section className="hero w-full pt-32 pb-16 px-6 lg:px-12 bg-smart-beige relative overflow-hidden">
      {/* Enhanced dynamic background with parallax effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/8 via-transparent to-future-green/6"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(122,229,198,0.15)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(122,229,198,0.12)_0%,transparent_50%)]"></div>
      
      {/* Floating decorative elements with improved animations */}
      <div className="absolute top-20 right-10 w-40 h-40 rounded-full blur-xl animate-float-gentle bg-gradient-to-br from-future-green/15 to-emerald/10">
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent animate-pulse-slow"></div>
      </div>
      <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full blur-lg animate-float-gentle bg-gradient-to-br from-future-green/18 to-future-green/12 animate-delay-1000">
        <Sparkles className="absolute top-4 left-4 w-6 h-6 text-future-green/60 animate-pulse animate-delay-500" />
      </div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full blur-md animate-bounce-slow bg-future-green/10 animate-delay-2000"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full blur-lg animate-pulse-slow bg-future-green/15 animate-delay-500">
        <Zap className="absolute top-2 left-2 w-4 h-4 text-future-green/70 animate-pulse" />
      </div>
      
      {/* Subtle geometric patterns */}
      <div className="absolute top-10 left-20 w-2 h-2 bg-future-green/30 rounded-full animate-pulse animate-delay-300"></div>
      <div className="absolute top-40 right-40 w-1 h-1 bg-future-green/40 rounded-full animate-pulse animate-delay-700"></div>
      <div className="absolute bottom-40 left-40 w-3 h-3 bg-future-green/25 rounded-full animate-pulse animate-delay-1100"></div>
      
      <div className="container max-w-7xl mx-auto relative z-10 space-y-16">
        <HeroContent />
        
        {/* Value proposition section */}
        <div className="animate-fade-in-up animate-delay-500">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-business-black/70 font-medium mb-3">
              <div className="w-8 h-px bg-future-green"></div>
              <span>Trusted by Innovation Leaders</span>
              <div className="w-8 h-px bg-future-green"></div>
            </div>
            <p className="text-base text-business-black/80 font-medium">
              Join forward-thinking organizations already transforming their learning ecosystems with LXERA's intelligent platform.
            </p>
          </div>
        </div>

        <CTASection />
        <TrustIndicators />
        <HeroStats />
        
        {/* Enhanced interactive scroll indicator */}
        <div className="mt-16 animate-fade-in-up animate-delay-1200">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-business-black/60 font-medium">Discover the platform</p>
            <button
              onClick={handleScrollDown}
              className="group relative p-4 rounded-full bg-white/80 backdrop-blur-sm border border-future-green/30 hover:bg-white hover:border-future-green/50 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
              aria-label="Scroll to platform section"
            >
              <ArrowDown className="w-6 h-6 text-future-green animate-bounce group-hover:animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-future-green/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
