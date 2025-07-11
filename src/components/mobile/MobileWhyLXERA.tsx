import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { capabilitiesData } from '@/data/capabilitiesData';
import AnimatedBackground from '../AnimatedBackground';

const MobileWhyLXERA = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (title: string) => {
    setExpandedCard(expandedCard === title ? null : title);
  };

  return (
    <>
      <section id="platform" className="w-full py-12 px-4 relative overflow-hidden bg-gradient-to-br from-future-green/6 via-smart-beige/50 to-future-green/12 transition-all duration-1000 ease-in-out">
        <div className="absolute inset-0 bg-gradient-to-tr from-smart-beige/20 via-transparent to-future-green/10"></div>
        <AnimatedBackground />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header - same as desktop */}
          <div className="text-left mb-6 animate-fade-in-up relative">
            <div className="relative z-10">
              <h2 className="text-2xl font-medium text-business-black mb-4 animate-slide-in-left leading-tight font-inter" style={{animationDelay: '0.2s'}}>
                Outcomes That Matter: How LXERA Drives Real Transformation
              </h2>
              <p className="text-base text-business-black/80 max-w-4xl animate-slide-in-right leading-relaxed font-normal font-inter" style={{animationDelay: '0.4s'}}>
                Four core pillars designed to deliver measurable impact and unlock your team's full potential.
              </p>
              
              {/* Decorative line */}
              <div className="mt-6 flex justify-start animate-fade-in-scale" style={{animationDelay: '0.6s'}}>
                <div className="relative">
                  <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-future-green to-transparent animate-pulse-slow shadow-lg rounded-full"></div>
                  <div className="absolute inset-0 w-32 h-1.5 bg-gradient-to-r from-transparent via-emerald/50 to-transparent animate-shimmer rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Cards - 2x2 grid with tap interactions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {capabilitiesData.map((capability, index) => (
              <div
                key={capability.title}
                className="bg-white rounded-xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{
                  animationDelay: `${300 + index * 100}ms`,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="p-4">
                  <div className="mb-4 flex justify-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-future-green/25 to-smart-beige/30 flex items-center justify-center border border-gray-100">
                      {capability.icon && (
                        <capability.icon className="w-7 h-7 text-business-black" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-business-black font-semibold text-lg mb-2 font-inter text-center leading-tight">{capability.title}</h3>
                  
                  {/* Value statement */}
                  {capability.valueStatement && (
                    <p className="text-business-black/80 mb-3 text-sm font-medium font-inter text-center leading-relaxed">{capability.valueStatement}</p>
                  )}
                  
                  {/* Description */}
                  <p className="text-business-black/70 text-sm font-normal font-inter text-center leading-relaxed">{capability.description}</p>
                  
                  {/* Expand button if tangible results exist */}
                  {capability.tangibleResults && (
                    <>
                      <button
                        onClick={() => toggleCard(capability.title)}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-business-black bg-future-green hover:bg-future-green/90 transition-all duration-200 py-3 mt-4 rounded-xl border-2 border-future-green hover:border-future-green/90 min-h-[48px] touch-manipulation"
                        style={{ minHeight: '48px' }}
                      >
                        {expandedCard === capability.title ? (
                          <>
                            Show less
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Learn More
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      {/* Expanded content */}
                      {expandedCard === capability.title && (
                        <div className="mt-4 animate-fade-in-up">
                          <p className="text-sm text-business-black/60 italic border-t border-gray-200 pt-4 leading-relaxed font-normal font-inter">
                            {capability.tangibleResults.description}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom text - same as desktop */}
          <p className="text-business-black/70 mb-2 text-center text-sm font-normal font-inter">
            Every LXERA innovation capability shaped by real-world feedback for maximum impact.
          </p>
        </div>
      </section>

      {/* Section Separator - same as desktop */}
      <div className="relative">
        <div className="h-8 bg-gradient-to-b from-future-green/12 via-smart-beige/40 to-future-green/15 transition-all duration-1000 ease-in-out"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-future-green/8 to-transparent"></div>
      </div>
    </>
  );
};

export default MobileWhyLXERA;