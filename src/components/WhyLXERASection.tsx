
import AnimatedBackground from "./AnimatedBackground";
import SectionHeader from "./SectionHeader";
import { capabilitiesData } from "@/data/capabilitiesData";

const WhyLXERASection = () => {
  // Use all capabilities as originally
  const filteredCapabilities = capabilitiesData;

  return (
    <>
      {/* Section Transition with consistent colors */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-b from-smart-beige via-smart-beige/95 to-future-green/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-future-green/8 via-transparent to-smart-beige/15"></div>
          </div>
          <div className="absolute top-8 left-1/4 w-4 h-4 bg-future-green/20 rounded-full animate-float-gentle blur-sm"></div>
          <div className="absolute top-16 right-1/3 w-3 h-3 bg-smart-beige/40 rounded-full animate-float-gentle animate-delay-500 blur-sm"></div>
          <div className="absolute top-12 left-2/3 w-2 h-2 bg-future-green/30 rounded-full animate-float-gentle animate-delay-1000"></div>
        </div>
      </div>
      
      <section id="platform" className="w-full pt-4 pb-24 px-0 sm:px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-future-green/4 via-smart-beige/70 to-future-green/10"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-smart-beige/30 via-transparent to-future-green/8"></div>
        <AnimatedBackground />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeader 
            title="What Makes LXERA Different"
            subtitle="LXERA is built to deliver measurable transformation—for individuals, teams, and organizations. Each feature is strategically designed to drive tangible results across five core pillars."
          />

          {/* Card Grid mimicking Built for Innovators design */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {filteredCapabilities.map((capability, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-smart-beige/80 via-future-green/10 to-smart-beige/60 lxera-shadow text-center group hover:from-smart-beige/90 hover:via-future-green/15 hover:to-smart-beige/70 hover:shadow-xl transition-all duration-500 lxera-hover animate-fade-in-up"
                style={{
                  animationDelay: `${300 + index * 100}ms`,
                }}
              >
                <div className="p-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-future-green/25 to-smart-beige/30 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      {capability.icon && (
                        // @ts-ignore
                        <capability.icon className="w-8 h-8 text-business-black group-hover:animate-bounce transition-all duration-300" />
                      )}
                    </div>
                  </div>
                  <p className="text-business-black font-bold text-lg mb-1">{capability.title}</p>
                  {/* Subtitle as the lighter text below the title */}
                  {capability.subtitle && (
                    <p className="text-business-black/80 mb-1 text-base">{capability.subtitle}</p>
                  )}
                  {/* Description/microcopy, always visible or on hover depending on data */}
                  <div className={capability.microcopy ? 
                    "overflow-hidden transition-all duration-500 ease-out max-h-0 group-hover:max-h-20 opacity-0 group-hover:opacity-100" : ""}>
                    <p className="text-sm text-business-black/60 italic border-t border-future-green/20 pt-3">
                      {capability.microcopy ?? capability.description}
                    </p>
                  </div>
                  {/* If no microcopy, always show description */}
                  {!capability.microcopy && (
                    <p className="text-business-black/70 mt-2 text-sm">{capability.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Conclude with an impact note for consistency */}
          <p className="text-business-black/70 mb-2 text-center text-base mt-8">
            Every LXERA innovation capability shaped by real-world feedback for maximum impact.
          </p>
        </div>
      </section>
    </>
  );
};

export default WhyLXERASection;
