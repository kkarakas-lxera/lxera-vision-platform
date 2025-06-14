
import { ArrowDown } from "lucide-react";
import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";
import CTASection from "./CTASection";
import HeroStats from "./HeroStats";
import HeroMockup from "./HeroMockup";

const HeroSection = () => {
  return (
    <section className="hero w-full pt-28 pb-10 px-6 lg:px-12 bg-gradient-to-br from-smart-beige via-smart-beige/90 to-future-green/10 relative overflow-hidden min-h-[80vh] flex flex-col justify-center">
      {/* Abstract Background */}
      <HeroBackground />

      {/* Decorative gradients remain (for depth layering) */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/8 via-transparent to-smart-beige/20 z-0"></div>
      <div className="absolute top-20 right-10 w-40 h-40 rounded-full blur-xl animate-pulse bg-gradient-to-br from-future-green/15 to-smart-beige/10 z-0"></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full blur-md animate-pulse bg-gradient-to-r from-future-green/12 to-smart-beige/15 animate-delay-2000 z-0"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full blur-lg animate-pulse bg-gradient-to-l from-smart-beige/18 to-future-green/10 animate-delay-500 z-0"></div>
      
      <div className="container max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Headline + subtitle + stats */}
        <HeroContent />

        {/* Illustration or Product Mockup */}
        <HeroMockup />

        {/* Primary CTA */}
        <CTASection />

        {/* Remaining stats */}
        <HeroStats />

        {/* Scroll indicator with consistent colors */}
        <div className="mt-10 animate-fade-in-up animate-delay-1200">
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm text-business-black/60 font-medium">Discover more</p>
            <div className="relative" aria-hidden="true">
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
