
import CapabilityCard from "./CapabilityCard";
import AnimatedBackground from "./AnimatedBackground";
import SectionHeader from "./SectionHeader";
import { capabilitiesData } from "@/data/capabilitiesData";

const WhyLXERASection = () => {
  return (
    <section id="platform" className="w-full py-16 px-6 lg:px-12 bg-gradient-to-br from-white via-smart-beige/30 to-smart-beige/60 relative overflow-hidden">
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader 
          title="Why LXERA"
          subtitle="Strategic Outcomes with Tangible Impact"
        />

        <div className="space-y-12">
          {capabilitiesData.map((capability, index) => (
            <CapabilityCard
              key={index}
              {...capability}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyLXERASection;
