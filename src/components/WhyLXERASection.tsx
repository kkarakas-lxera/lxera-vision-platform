
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check } from "lucide-react";
import { capabilitiesData } from "@/data/capabilitiesData";
import CapabilityCard from "./CapabilityCard";
import { useInView } from "@/hooks/useInView";

const WhyLXERASection = () => {
  const [ref, isInView] = useInView();

  return (
    <section 
      ref={ref}
      className="w-full py-8 sm:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-gradient-to-br from-smart-beige via-white to-smart-beige/50 relative overflow-hidden z-0 font-inter"
    >
      <div className="max-w-7xl mx-auto relative z-0">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 xl:mb-16 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-medium text-business-black mb-3 sm:mb-4 lg:mb-6 xl:mb-8 font-inter px-2">
            What Makes LXERA Different
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-xl text-business-black/80 mb-2 max-w-3xl mx-auto font-normal font-inter px-4">
            Beyond traditional learning platforms — LXERA drives innovation from the ground up.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-12">
          {capabilitiesData.map((capability, index) => (
            <CapabilityCard
              key={capability.title}
              {...capability}
              index={index}
              isVisible={isInView}
            />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-8 sm:mt-12 lg:mt-16 xl:mt-20 animate-fade-in-up animate-delay-800">
          <p className="text-business-black/70 mb-3 sm:mb-4 lg:mb-6 text-sm sm:text-base lg:text-lg font-normal font-inter px-4">
            Ready to see these capabilities in action?
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <button className="bg-future-green text-business-black hover:bg-future-green/90 font-medium px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 font-inter flex items-center justify-center gap-2 w-full sm:w-auto">
              Request Demo
              <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            
            <button className="bg-business-black text-white hover:bg-business-black/90 font-medium px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2 font-inter flex items-center justify-center gap-2 w-full sm:w-auto">
              <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyLXERASection;
