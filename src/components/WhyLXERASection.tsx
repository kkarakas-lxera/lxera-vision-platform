
import CapabilityCard from "./CapabilityCard";
import AnimatedBackground from "./AnimatedBackground";
import SectionHeader from "./SectionHeader";
import { capabilitiesData } from "@/data/capabilitiesData";

const WhyLXERASection = () => {
  return (
    <section id="platform" className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-white via-smart-beige/20 to-smart-beige/40 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Enhanced decorative elements */}
      <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-future-green/5 animate-float-gentle"></div>
      <div className="absolute bottom-40 right-16 w-32 h-32 rounded-full bg-future-green/8 animate-float-gentle animate-delay-1000"></div>
      <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-emerald/6 animate-float-gentle animate-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader 
          title="Why LXERA"
          subtitle="Strategic Outcomes with Tangible Impact"
        />

        {/* Enhanced introduction text */}
        <div className="text-center mb-12 animate-fade-in-up animate-delay-600">
          <p className="text-lg text-business-black/70 max-w-3xl mx-auto leading-relaxed">
            Transform your organization's learning culture with AI-powered solutions that drive real business outcomes
          </p>
        </div>

        <div className="space-y-8 lg:space-y-12">
          {capabilitiesData.map((capability, index) => (
            <CapabilityCard
              key={index}
              {...capability}
              index={index}
            />
          ))}
        </div>

        {/* Enhanced closing section */}
        <div className="mt-16 text-center animate-fade-in-up animate-delay-1000">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 max-w-4xl mx-auto border border-future-green/10 shadow-lg hover:shadow-xl transition-all duration-500">
            <h3 className="text-2xl font-bold text-business-black mb-4">
              Ready to Experience the Difference?
            </h3>
            <p className="text-business-black/80 text-lg leading-relaxed">
              Join forward-thinking organizations that are already transforming their learning and development with LXERA's innovative platform.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyLXERASection;
