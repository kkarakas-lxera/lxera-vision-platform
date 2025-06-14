
import CapabilityCard from "./CapabilityCard";
import AnimatedBackground from "./AnimatedBackground";
import SectionHeader from "./SectionHeader";
import TestimonialCarousel from "./TestimonialCarousel";
import StatsCounter from "./StatsCounter";
import { capabilitiesData } from "@/data/capabilitiesData";
import { useState } from "react";
import { useInView } from "@/hooks/useInView";

const WhyLXERASection = () => {
  // Show all capabilities
  const filteredCapabilities = capabilitiesData;

  // We're going to track in-view states for each card.
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
        {/* Improved gradient transition for visual separation */}
        <div className="absolute inset-0 bg-gradient-to-br from-future-green/4 via-smart-beige/70 to-future-green/10"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-smart-beige/30 via-transparent to-future-green/8"></div>
        <AnimatedBackground />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeader 
            title="What Makes LXERA Different"
            subtitle="LXERA is built to deliver measurable transformation—for individuals, teams, and organizations. Each feature is strategically designed to drive tangible results across five core pillars."
          />

          {/* Capabilities grid with in-view animation */}
          <div className="space-y-16 lg:space-y-20 px-1">
            {filteredCapabilities.map((capability, index) => {
              // Each card observes itself
              const [ref, inView] = useInView<HTMLDivElement>({});

              return (
                <div
                  key={index}
                  ref={ref}
                  className={`relative group ${index % 2 === 1 ? 'lg:ml-16' : ''} transition-all duration-500`}
                  style={{
                    animationDelay: inView
                      ? `${300 + index * 150}ms`
                      : undefined,
                  }}
                >
                  {/* Decorative band */}
                  <div className={`absolute inset-0 blur-md rounded-3xl group-hover:scale-105 group-hover:opacity-70 transition-all duration-700 pointer-events-none
                    ${index % 2 === 1
                      ? "bg-gradient-to-r from-future-green/10 via-smart-beige/40 to-future-green/10"
                      : "bg-gradient-to-l from-smart-beige/10 via-future-green/5 to-smart-beige/10"
                    }
                  `}></div>
                  <CapabilityCard
                    {...capability}
                    index={index}
                    isVisible={inView}
                  />
                </div>
              );
            })}
          </div>
          {/* Removed "Ready to Experience the Difference?" CTA section here */}
        </div>
      </section>
    </>
  );
};

export default WhyLXERASection;
