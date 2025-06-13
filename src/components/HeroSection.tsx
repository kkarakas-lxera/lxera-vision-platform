
import { ArrowDown } from "lucide-react";
import HeroContent from "./HeroContent";
import CTASection from "./CTASection";
import HeroStats from "./HeroStats";

const HeroSection = () => {
  return (
    <section className="hero w-full py-20 px-6 lg:px-12 lxera-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 via-transparent to-light-green/5"></div>
      
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
