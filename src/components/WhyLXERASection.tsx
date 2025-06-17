
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check } from "lucide-react";
import { capabilitiesData } from "@/data/capabilitiesData";
import CapabilityCard from "./CapabilityCard";
import { useInView } from "@/hooks/useInView";

const WhyLXERASection = () => {
  const { ref, isInView } = useInView();

  return (
    <section 
      ref={ref}
      className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-smart-beige via-white to-smart-beige/50 relative overflow-hidden z-0 font-inter"
    >
      <div className="max-w-7xl mx-auto relative z-0">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-4 sm:mb-6 lg:mb-8 font-inter px-2">
            What Makes LXERA Different
          </h2>
          <p className="text-lg sm:text-xl lg:text-xl text-business-black/80 mb-2 max-w-3xl mx-auto font-normal font-inter px-4">
            Beyond traditional learning platforms — LXERA drives innovation from the ground up.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="space-y-6 sm:space-y-8 lg:space-y-12">
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
        <div className="text-center mt-12 sm:mt-16 lg:mt-20 animate-fade-in-up animate-delay-800">
          <p className="text-business-black/70 mb-4 sm:mb-6 text-base sm:text-lg font-normal font-inter px-4">
            Ready to see these capabilities in action?
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <button className="bg-future-green text-business-black hover:bg-future-green/90 font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 font-inter flex items-center justify-center gap-2 w-full sm:w-auto">
              Request Demo
              <ArrowRight size={18} />
            </button>
            
            <button className="bg-business-black text-white hover:bg-business-black/90 font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2 font-inter flex items-center justify-center gap-2 w-full sm:w-auto">
              <Check size={18} />
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyLXERASection;
