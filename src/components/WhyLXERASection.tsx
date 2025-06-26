
import AnimatedBackground from "./AnimatedBackground";
import SectionHeader from "./SectionHeader";
import { capabilitiesData } from "@/data/capabilitiesData";

const WhyLXERASection = () => {
  // Use all capabilities as originally
  const filteredCapabilities = capabilitiesData;

  return (
    <>
      <section id="platform" className="w-full py-16 px-4 sm:px-6 lg:px-12 relative overflow-hidden bg-gradient-to-br from-future-green/6 via-smart-beige/50 to-future-green/12 transition-all duration-1000 ease-in-out">
        <div className="absolute inset-0 bg-gradient-to-tr from-smart-beige/20 via-transparent to-future-green/10"></div>
        <AnimatedBackground />
        <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-0">
          <div className="text-left mb-12 animate-fade-in-up relative">
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-business-black mb-4 sm:mb-6 animate-slide-in-left leading-tight font-inter" style={{animationDelay: '0.2s'}}>
                Outcomes That Matter: How LXERA Drives Real Transformation
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-business-black/80 max-w-4xl mr-auto animate-slide-in-right leading-relaxed font-normal font-inter" style={{animationDelay: '0.4s'}}>
                Four core pillars designed to deliver measurable impact and unlock your team's full potential.
              </p>
              
              {/* Enhanced decorative line */}
              <div className="mt-6 sm:mt-8 flex justify-start animate-fade-in-scale" style={{animationDelay: '0.6s'}}>
                <div className="relative">
                  <div className="w-32 sm:w-40 h-1.5 bg-gradient-to-r from-transparent via-future-green to-transparent animate-pulse-slow shadow-lg rounded-full"></div>
                  <div className="absolute inset-0 w-32 sm:w-40 h-1.5 bg-gradient-to-r from-transparent via-emerald/50 to-transparent animate-shimmer rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Grid with curved styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
            {filteredCapabilities.map((capability, index) => (
              <div
                key={capability.title}
                className="bg-gradient-to-br from-smart-beige/80 via-future-green/10 to-smart-beige/60 lxera-shadow text-center group hover:from-smart-beige/90 hover:via-future-green/15 hover:to-smart-beige/70 hover:shadow-xl transition-all duration-500 lxera-hover animate-fade-in-up rounded-3xl"
                style={{
                  animationDelay: `${300 + index * 100}ms`,
                }}
              >
                <div className="p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4 flex justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-future-green/25 to-smart-beige/30 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      {capability.icon && (
                        // @ts-expect-error
                        <capability.icon className="w-6 h-6 sm:w-8 sm:h-8 text-business-black group-hover:animate-bounce transition-all duration-300" />
                      )}
                    </div>
                  </div>
                  <p className="text-business-black font-medium text-base sm:text-lg mb-1 font-inter">{capability.title}</p>
                  {/* Use valueStatement as subtitle */}
                  {capability.valueStatement && (
                    <p className="text-business-black/80 mb-2 text-sm sm:text-base font-normal font-inter">{capability.valueStatement}</p>
                  )}
                  {/* Always show description. If tangibleResults, show on hover as microcopy */}
                  <p className="text-business-black/70 text-xs sm:text-sm min-h-[40px] font-normal font-inter">{capability.description}</p>
                  {capability.tangibleResults && (
                    <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100">
                      <p className="text-xs sm:text-sm text-business-black/60 italic border-t border-future-green/20 pt-3 leading-relaxed font-normal font-inter">
                        {capability.tangibleResults.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Conclude with an impact note for consistency */}
          <p className="text-business-black/70 mb-2 text-center text-sm sm:text-base mt-6 sm:mt-8 font-normal font-inter px-4 sm:px-0">
            Every LXERA innovation capability shaped by real-world feedback for maximum impact.
          </p>
        </div>
      </section>

      {/* Enhanced Section Separator - consistent height */}
      <div className="relative">
        <div className="h-8 bg-gradient-to-b from-future-green/12 via-smart-beige/40 to-future-green/15 transition-all duration-1000 ease-in-out"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-future-green/8 to-transparent"></div>
      </div>
    </>
  );
};

export default WhyLXERASection;
