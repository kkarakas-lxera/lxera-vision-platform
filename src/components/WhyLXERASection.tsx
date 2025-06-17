
import AnimatedBackground from "./AnimatedBackground";
import SectionHeader from "./SectionHeader";
import { capabilitiesData } from "@/data/capabilitiesData";

const WhyLXERASection = () => {
  // Use all capabilities as originally
  const filteredCapabilities = capabilitiesData;

  return (
    <>
      {/* Reduced section transition height */}
      <div className="relative">
        <div className="h-16 bg-gradient-to-b from-smart-beige via-smart-beige/95 to-future-green/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-future-green/8 via-transparent to-smart-beige/15"></div>
          </div>
        </div>
      </div>

      <section id="platform" className="w-full pt-8 pb-16 px-0 sm:px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-future-green/4 via-smart-beige/70 to-future-green/10"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-smart-beige/30 via-transparent to-future-green/8"></div>
        <AnimatedBackground />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-left mb-20 animate-fade-in-up relative">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 animate-slide-in-left leading-tight font-inter" style={{animationDelay: '0.2s'}}>
                What Makes LXERA Different
              </h2>
              <p className="text-lg sm:text-xl lg:text-xl text-business-black/80 max-w-4xl mr-auto animate-slide-in-right leading-relaxed font-normal font-inter" style={{animationDelay: '0.4s'}}>
                LXERA is built to deliver measurable transformation—for individuals, teams, and organizations. Each feature is strategically designed to drive tangible results across four core pillars.
              </p>
              
              {/* Enhanced decorative line */}
              <div className="mt-8 flex justify-start animate-fade-in-scale" style={{animationDelay: '0.6s'}}>
                <div className="relative">
                  <div className="w-40 h-1.5 bg-gradient-to-r from-transparent via-future-green to-transparent animate-pulse-slow shadow-lg rounded-full"></div>
                  <div className="absolute inset-0 w-40 h-1.5 bg-gradient-to-r from-transparent via-emerald/50 to-transparent animate-shimmer rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Grid in "Built for Innovators" design */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {filteredCapabilities.map((capability, index) => (
              <div
                key={capability.title}
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
                  <p className="text-business-black font-medium text-lg mb-1 font-inter">{capability.title}</p>
                  {/* Use valueStatement as subtitle */}
                  {capability.valueStatement && (
                    <p className="text-business-black/80 mb-2 text-base font-normal font-inter">{capability.valueStatement}</p>
                  )}
                  {/* Always show description. If tangibleResults, show on hover as microcopy */}
                  <p className="text-business-black/70 text-sm min-h-[40px] font-normal font-inter">{capability.description}</p>
                  {capability.tangibleResults && (
                    <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100">
                      <p className="text-sm text-business-black/60 italic border-t border-future-green/20 pt-3 leading-relaxed font-normal font-inter">
                        {capability.tangibleResults.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Conclude with an impact note for consistency */}
          <p className="text-business-black/70 mb-2 text-center text-base mt-8 font-normal font-inter">
            Every LXERA innovation capability shaped by real-world feedback for maximum impact.
          </p>
        </div>
      </section>
    </>
  );
};

export default WhyLXERASection;
