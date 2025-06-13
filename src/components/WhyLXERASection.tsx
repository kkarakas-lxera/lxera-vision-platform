
import CapabilityCard from "./CapabilityCard";
import AnimatedBackground from "./AnimatedBackground";
import SectionHeader from "./SectionHeader";
import { capabilitiesData } from "@/data/capabilitiesData";

const WhyLXERASection = () => {
  return (
    <>
      {/* Enhanced Section Transition */}
      <div className="relative">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-future-green/40 to-transparent shadow-sm"></div>
        <div className="w-full h-16 bg-gradient-to-b from-smart-beige via-smart-beige/80 to-white/95 relative">
          {/* Floating transition elements */}
          <div className="absolute top-4 left-1/4 w-3 h-3 bg-future-green/30 rounded-full animate-float-gentle"></div>
          <div className="absolute top-8 right-1/3 w-2 h-2 bg-emerald/40 rounded-full animate-float-gentle animate-delay-500"></div>
          <div className="absolute top-6 left-2/3 w-1.5 h-1.5 bg-future-green/50 rounded-full animate-float-gentle animate-delay-1000"></div>
        </div>
      </div>
      
      <section id="platform" className="w-full py-24 px-6 lg:px-12 bg-gradient-to-br from-white via-white to-smart-beige/20 relative overflow-hidden">
        <AnimatedBackground />
        
        {/* Enhanced decorative elements with better positioning */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-future-green/15 to-emerald/8 animate-float-gentle blur-sm"></div>
        <div className="absolute bottom-40 right-16 w-40 h-40 rounded-full bg-gradient-to-tl from-future-green/20 to-future-green/5 animate-float-gentle animate-delay-1000 blur-lg"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-gradient-to-r from-emerald/15 to-future-green/10 animate-float-gentle animate-delay-2000 blur-md"></div>
        <div className="absolute top-1/3 left-1/3 w-20 h-20 rounded-full bg-gradient-to-bl from-future-green/12 to-transparent animate-float-gentle animate-delay-1500 blur-sm"></div>

        {/* Main content container with better spacing */}
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeader 
            title="Why LXERA"
            subtitle="Strategic Outcomes with Tangible Impact"
          />

          {/* Enhanced intro section */}
          <div className="text-center mb-16 animate-fade-in-up animate-delay-600">
            <div className="max-w-4xl mx-auto">
              <p className="text-xl lg:text-2xl text-business-black/80 leading-relaxed font-medium mb-6">
                Transform your organization's learning culture with AI-powered solutions that drive 
                <span className="text-future-green font-semibold"> real business outcomes</span>
              </p>
              
              {/* Visual stats teaser */}
              <div className="flex flex-wrap justify-center gap-8 mt-8">
                <div className="flex items-center gap-2 text-business-black/70">
                  <div className="w-3 h-3 bg-future-green rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">85% retention boost</span>
                </div>
                <div className="flex items-center gap-2 text-business-black/70">
                  <div className="w-3 h-3 bg-emerald rounded-full animate-pulse animate-delay-300"></div>
                  <span className="text-sm font-medium">60% faster learning</span>
                </div>
                <div className="flex items-center gap-2 text-business-black/70">
                  <div className="w-3 h-3 bg-future-green rounded-full animate-pulse animate-delay-600"></div>
                  <span className="text-sm font-medium">3x engagement increase</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced capabilities grid */}
          <div className="space-y-12 lg:space-y-16">
            {capabilitiesData.map((capability, index) => (
              <div 
                key={index}
                className="relative"
                style={{animationDelay: `${400 + index * 200}ms`}}
              >
                {/* Background accent for alternating cards */}
                {index % 2 === 1 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-future-green/3 to-transparent rounded-3xl transform -skew-y-1 opacity-50"></div>
                )}
                
                <CapabilityCard
                  {...capability}
                  index={index}
                />
              </div>
            ))}
          </div>

          {/* Enhanced bottom CTA section */}
          <div className="mt-20 text-center animate-fade-in-up animate-delay-1000">
            <div className="relative max-w-5xl mx-auto">
              {/* Gradient background with animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-future-green/10 via-emerald/5 to-future-green/10 rounded-3xl blur-sm opacity-60 animate-pulse-slow"></div>
              
              <div className="relative bg-white/80 backdrop-blur-md rounded-3xl p-10 lg:p-12 border border-future-green/20 shadow-xl hover:shadow-2xl transition-all duration-700 group">
                {/* Decorative elements */}
                <div className="absolute top-6 left-6 w-4 h-4 bg-future-green/20 rounded-full animate-float-gentle"></div>
                <div className="absolute bottom-6 right-6 w-3 h-3 bg-emerald/30 rounded-full animate-float-gentle animate-delay-1000"></div>
                
                <div className="relative z-10">
                  <h3 className="text-3xl lg:text-4xl font-bold text-business-black mb-6 group-hover:text-future-green transition-colors duration-500">
                    Ready to Experience the Difference?
                  </h3>
                  <p className="text-xl text-business-black/80 leading-relaxed mb-8 max-w-3xl mx-auto">
                    Join forward-thinking organizations that are already transforming their learning and development with LXERA's innovative platform.
                  </p>
                  
                  {/* Enhanced call-to-action buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="bg-future-green hover:bg-emerald text-business-black hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md group-hover:animate-pulse">
                      Start Your Transformation
                    </button>
                    <button className="border-2 border-future-green text-future-green hover:bg-future-green hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105">
                      Watch Demo
                    </button>
                  </div>
                  
                  {/* Trust indicators */}
                  <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-business-black/60">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-future-green rounded-full"></div>
                      Enterprise Security
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald rounded-full"></div>
                      99.9% Uptime
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-future-green rounded-full"></div>
                      24/7 Support
                    </span>
                  </div>
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
