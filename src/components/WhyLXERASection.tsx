
import CapabilityCard from "./CapabilityCard";
import AnimatedBackground from "./AnimatedBackground";
import SectionHeader from "./SectionHeader";
import TestimonialCarousel from "./TestimonialCarousel";
import StatsCounter from "./StatsCounter";
import { capabilitiesData } from "@/data/capabilitiesData";
import { useState } from "react";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";

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
            title="Why LXERA"
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

          {/* CTA Micro-section after last card */}
          <div className="flex flex-col items-center justify-center mt-20 mb-12 px-4">
            <div className="rounded-2xl bg-white/80 border border-future-green/20 shadow-md p-8 w-full max-w-xl text-center mx-auto animate-fade-in-up">
              <div className="text-2xl font-bold text-business-black mb-4">
                Ready to unlock these outcomes in your team?
              </div>
              <Button
                className="lxera-btn-primary mt-2 w-fit px-8 py-4 text-lg rounded-full shadow-future-green/30 transition-all duration-200 hover:scale-105"
                size="lg"
              >
                Request a Demo
              </Button>
            </div>
          </div>

          {/* Section CTA: Enhance focus */}
          <div className="mt-24 text-center animate-fade-in-up animate-delay-1000">
            <div className="relative max-w-5xl mx-auto overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-smart-beige/85 via-future-green/30 to-smart-beige/70 backdrop-blur-xl shadow-2xl"></div>
              <div className="relative p-10 lg:p-12">
                {/* Urgency indicator */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-future-green/15 to-smart-beige/20 text-future-green text-sm font-medium px-4 py-2 rounded-full mb-6 shadow-md">
                  <div className="w-2 h-2 bg-future-green rounded-full animate-pulse"></div>
                  Limited Time: Free Implementation Consultation
                </div>

                {/* CTA heading */}
                <h3 className="text-3xl lg:text-4xl font-bold text-business-black mb-6 hover:text-future-green transition-colors duration-500 drop-shadow-md">
                  Ready to Experience the Difference?
                </h3>
                <p className="text-xl text-business-black/80 leading-relaxed mb-8 max-w-3xl mx-auto">
                  Join forward-thinking organizations that are already transforming their learning and development with LXERA's innovative platform.
                </p>

                {/* Enhanced CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <button className="group bg-future-green hover:bg-emerald text-business-black hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-emerald-300 shadow-md relative overflow-hidden focus-visible:ring-2 focus-visible:ring-emerald/50 focus:outline-none shadow-emerald-200">
                    <span className="relative z-10">Start Your Transformation</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>
                  <button className="border-2 border-future-green text-future-green hover:bg-future-green hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald/30">
                    Watch Interactive Demo
                  </button>
                </div>

                {/* Features */}
                <div className="flex flex-wrap justify-center gap-6 text-sm text-business-black/60">
                  <span className="flex items-center gap-2 bg-white/60 rounded-full px-3 py-1">
                    <div className="w-1.5 h-1.5 bg-future-green rounded-full animate-pulse"></div>
                    Enterprise Security
                  </span>
                  <span className="flex items-center gap-2 bg-white/60 rounded-full px-3 py-1">
                    <div className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse animate-delay-300"></div>
                    99.9% Uptime
                  </span>
                  <span className="flex items-center gap-2 bg-white/60 rounded-full px-3 py-1">
                    <div className="w-1.5 h-1.5 bg-future-green rounded-full animate-pulse animate-delay-600"></div>
                    24/7 Support
                  </span>
                  <span className="flex items-center gap-2 bg-white/60 rounded-full px-3 py-1">
                    <div className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse animate-delay-900"></div>
                    30-Day Money Back
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyLXERASection;

