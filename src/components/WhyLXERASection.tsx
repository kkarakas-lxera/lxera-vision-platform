
import AnimatedBackground from "./AnimatedBackground";
import SectionHeader from "./SectionHeader";
import { capabilitiesData } from "@/data/capabilitiesData";

const WhyLXERASection = () => {
  // Use all capabilities as originally
  const filteredCapabilities = capabilitiesData;

  return (
    <>
      {/* Section Transition */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-b from-smart-beige via-future-green/10 to-future-green/20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-future-green/8 via-transparent to-business-black/5"></div>
          </div>
          <div className="absolute top-8 left-1/4 w-4 h-4 bg-future-green/20 rounded-full animate-float-gentle blur-sm"></div>
          <div className="absolute top-16 right-1/3 w-3 h-3 bg-business-black/20 rounded-full animate-float-gentle animate-delay-500 blur-sm"></div>
          <div className="absolute top-12 left-2/3 w-2 h-2 bg-future-green/30 rounded-full animate-float-gentle animate-delay-1000"></div>
        </div>
      </div>

      <section id="platform" className="w-full pt-4 pb-24 px-0 sm:px-6 lg:px-12 relative overflow-hidden bg-gradient-to-br from-future-green/15 via-future-green/8 to-future-green/20">
        <div className="absolute inset-0 bg-gradient-to-tr from-future-green/10 via-transparent to-business-black/5"></div>
        <AnimatedBackground />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeader 
            title="What Makes LXERA Different"
            subtitle="LXERA is built to deliver measurable transformation—for individuals, teams, and organizations. Each feature is strategically designed to drive tangible results across four core pillars."
          />

          {/* Card Grid in "Built for Innovators" design */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {filteredCapabilities.map((capability, index) => (
              <div
                key={capability.title}
                className="bg-gradient-to-br from-white/90 via-smart-beige/20 to-white/80 lxera-shadow text-center group hover:from-white hover:via-smart-beige/30 hover:to-white/90 hover:shadow-xl transition-all duration-500 lxera-hover animate-fade-in-up"
                style={{
                  animationDelay: `${300 + index * 100}ms`,
                }}
              >
                <div className="p-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-future-green/25 to-business-black/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      {capability.icon && (
                        // @ts-ignore
                        <capability.icon className="w-8 h-8 text-business-black group-hover:animate-bounce transition-all duration-300" />
                      )}
                    </div>
                  </div>
                  <p className="text-business-black font-bold text-lg mb-1">{capability.title}</p>
                  {/* Use valueStatement as subtitle */}
                  {capability.valueStatement && (
                    <p className="text-business-black/80 mb-2 text-base">{capability.valueStatement}</p>
                  )}
                  {/* Always show description. If tangibleResults, show on hover as microcopy */}
                  <p className="text-business-black/70 text-sm min-h-[40px]">{capability.description}</p>
                  {capability.tangibleResults && (
                    <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100">
                      <p className="text-sm text-business-black/60 italic border-t border-future-green/20 pt-3 leading-relaxed">
                        {capability.tangibleResults.description}
                      </p>
                    </div>
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
