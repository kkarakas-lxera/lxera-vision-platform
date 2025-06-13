
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const TransformationStartsSection = () => {
  const scrollToHowItWorks = () => {
    const howItWorksSection = document.querySelector('[data-section="how-it-works"]');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-16 px-6 lg:px-12 bg-gradient-to-br from-future-green/15 via-smart-beige/80 to-light-green/20 relative overflow-hidden">
      {/* Subtle LXERA logo pattern background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="w-full h-full flex items-center justify-center">
          <div className="grid grid-cols-3 gap-4 transform rotate-12 scale-150">
            {/* LXERA logo pattern inspired by the uploaded images */}
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-4 w-20 bg-business-black rounded"></div>
                <div className="h-4 w-16 bg-business-black rounded"></div>
                <div className="h-4 w-12 bg-business-black rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Horizontal progress line divider */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-future-green to-transparent"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Enhanced typography with better contrast */}
        <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6 tracking-tight">
          Your Transformation 
          <span className="block text-future-green">Starts Here</span>
        </h2>
        
        {/* Emotional validation quote */}
        <div className="mb-6">
          <p className="text-lg lg:text-xl text-future-green font-semibold italic">
            "This platform is 3 steps ahead of where L&D is going."
          </p>
        </div>
        
        {/* Enhanced messaging */}
        <div className="mb-8">
          <h3 className="text-xl lg:text-2xl font-bold text-business-black mb-4">
            Discover What's Behind the Results
          </h3>
          <p className="text-lg lg:text-xl text-business-black/80 max-w-3xl mx-auto leading-relaxed">
            Organizations aren't just learning—they're innovating.
            <span className="block mt-2 font-semibold text-business-black">
              Let's break down how LXERA helps teams evolve in 4 smart steps.
            </span>
          </p>
        </div>
        
        {/* Mini CTA Button with scroll animation */}
        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={scrollToHowItWorks}
            className="bg-business-black text-white hover:bg-business-black/90 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
          >
            See How It Works
            <ChevronDown className="ml-2 w-4 h-4" />
          </Button>
          
          {/* Animated scroll indicator */}
          <div className="animate-pulse">
            <ChevronDown className="w-6 h-6 text-future-green" />
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="mt-8 flex justify-center">
          <div className="w-24 h-1 bg-gradient-to-r from-future-green to-light-green rounded-full"></div>
        </div>
      </div>
      
      {/* Bottom progress line divider */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-future-green to-transparent"></div>
    </section>
  );
};

export default TransformationStartsSection;
