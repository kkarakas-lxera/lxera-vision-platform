import CapabilityCard from "./CapabilityCard";
import AnimatedBackground from "./AnimatedBackground";
import SectionHeader from "./SectionHeader";
import TestimonialCarousel from "./TestimonialCarousel";
import CapabilityFilter from "./CapabilityFilter";
import StatsCounter from "./StatsCounter";
import { capabilitiesData } from "@/data/capabilitiesData";
import { useState } from "react";

const WhyLXERASection = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredCapabilities = capabilitiesData.filter(capability => {
    if (activeFilter === "all") return true;
    return capability.category === activeFilter;
  });

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
      
      <section id="platform" className="w-full py-24 px-6 lg:px-12 relative overflow-hidden">
        {/* Background with future-green and smart-beige gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-future-green/3 via-smart-beige/50 to-future-green/8"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-smart-beige/20 via-transparent to-future-green/6"></div>
        
        <AnimatedBackground />
        
        {/* Decorative elements with consistent palette */}
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-gradient-to-br from-future-green/12 to-smart-beige/8 animate-float-gentle blur-xl"></div>
        <div className="absolute bottom-40 right-16 w-48 h-48 rounded-full bg-gradient-to-tl from-smart-beige/15 to-future-green/10 animate-float-gentle animate-delay-1000 blur-2xl"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-future-green/8 to-smart-beige/12 animate-float-gentle animate-delay-2000 blur-xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeader 
            title="Why LXERA"
            subtitle="Strategic Outcomes with Tangible Impact"
          />

          {/* Intro section with updated colors */}
          <div className="text-center mb-16 animate-fade-in-up animate-delay-600">
            <div className="max-w-4xl mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-smart-beige/60 via-smart-beige/40 to-future-green/20 backdrop-blur-sm rounded-3xl border border-future-green/30 shadow-lg -m-8"></div>
              
              <div className="relative z-10 p-8">
                <p className="text-xl lg:text-2xl text-business-black/80 leading-relaxed font-medium mb-6">
                  Transform your organization's learning culture with AI-powered solutions that drive 
                  <span className="text-future-green font-semibold"> real business outcomes</span>
                </p>
                
                <StatsCounter />
              </div>
            </div>
          </div>

          <TestimonialCarousel />

          <CapabilityFilter 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />

          {/* Capabilities grid with updated background patterns */}
          <div className="space-y-12 lg:space-y-16">
            {filteredCapabilities.map((capability, index) => (
              <div 
                key={index}
                className={`relative ${index % 2 === 1 ? 'lg:ml-16' : ''}`}
                style={{animationDelay: `${400 + index * 200}ms`}}
              >
                {index % 2 === 1 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-smart-beige/30 via-future-green/5 to-smart-beige/20 rounded-3xl blur-sm"></div>
                )}
                
                <CapabilityCard
                  {...capability}
                  index={index}
                />
              </div>
            ))}
          </div>

          {/* CTA section with consistent gradient */}
          <div className="mt-20 text-center animate-fade-in-up animate-delay-1000">
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-smart-beige/70 via-future-green/10 to-smart-beige/50 rounded-3xl backdrop-blur-md border border-future-green/40 shadow-2xl"></div>
              
              <div className="relative p-10 lg:p-12">
                <div className="absolute top-6 left-6 w-3 h-3 bg-future-green/30 rounded-full"></div>
                <div className="absolute bottom-6 right-6 w-2 h-2 bg-smart-beige/60 rounded-full"></div>
                
                {/* Urgency indicator */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-future-green/15 to-smart-beige/20 text-future-green text-sm font-medium px-4 py-2 rounded-full mb-6">
                  <div className="w-2 h-2 bg-future-green rounded-full animate-pulse"></div>
                  Limited Time: Free Implementation Consultation
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-bold text-business-black mb-6 hover:text-future-green transition-colors duration-500">
                  Ready to Experience the Difference?
                </h3>
                <p className="text-xl text-business-black/80 leading-relaxed mb-8 max-w-3xl mx-auto">
                  Join forward-thinking organizations that are already transforming their learning and development with LXERA's innovative platform.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <button className="group bg-future-green hover:bg-emerald text-business-black hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md relative overflow-hidden">
                    <span className="relative z-10">Start Your Transformation</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>
                  <button className="border-2 border-future-green text-future-green hover:bg-future-green hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105">
                    Watch Interactive Demo
                  </button>
                </div>
                
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
