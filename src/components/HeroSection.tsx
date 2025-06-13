
import { ArrowDown } from "lucide-react";
import HeroContent from "./HeroContent";
import CTASection from "./CTASection";
import HeroStats from "./HeroStats";

const HeroSection = () => {
  return (
    <section className="hero w-full py-20 px-6 lg:px-12 bg-smart-beige relative overflow-hidden">
      {/* Subtle decorative elements for visual interest */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/3 via-transparent to-light-green/2"></div>
      <div className="absolute top-20 right-10 w-32 h-32 bg-future-green/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-light-green/10 rounded-full blur-lg"></div>
      
      <div className="container max-w-7xl mx-auto relative z-10 space-y-12">
        <HeroContent />
        <CTASection />
        <HeroStats />
        
        <div className="mt-16 animate-fade-in-up" style={{animationDelay: '1s'}}>
          <ArrowDown className="w-8 h-8 text-business-black/60 mx-auto animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
