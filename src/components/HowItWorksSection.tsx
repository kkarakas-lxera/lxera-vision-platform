
import { Button } from "@/components/ui/button";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";
import React, { useState } from "react";
import { stepsData } from "@/data/howItWorksSteps";

const HowItWorksSection = () => {

  return (
    <>
      <section id="how-it-works" className="w-full py-16 px-6 lg:px-12 bg-gradient-to-br from-smart-beige/40 via-future-green/8 to-smart-beige/60 relative overflow-hidden transition-all duration-1000 ease-in-out">
        <div className="max-w-6xl mx-auto text-center">
          {/* Section Header matching other sections */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-business-black mb-8 animate-fade-in-up">
            How LXERA Works
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-business-black/80 mb-12 max-w-3xl mx-auto animate-fade-in-up animate-delay-200">
            From onboarding to innovation — in 4 steps that drive measurable results.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {stepsData.map((step, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group animate-fade-in-up"
                style={{
                  animationDelay: `${300 + index * 100}ms`,
                }}
              >
                <div className="p-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-business-black rounded-full shadow-lg flex items-center justify-center scale-105 border-4 border-white relative z-20 group-hover:scale-110 transition-all duration-300">
                      <span className="text-3xl font-extrabold text-white tracking-tight">
                        {step.step}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-business-black font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-business-black/80 mb-4 text-sm">{step.subtitle}</p>
                  
                  <div className="text-sm text-business-black/60 italic text-center">
                    {step.metrics}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-business-black/70 mb-6 text-base animate-fade-in-up animate-delay-700">
            Every LXERA innovation capability shaped by real-world feedback for maximum impact.
          </p>
          
          <ProgressiveDemoCapture
            source="how_it_works_section"
            buttonText="Book Demo"
            onSuccess={() => {}}
          />
        </div>

      </section>

      {/* Enhanced Section Separator - consistent height */}
      <div className="relative">
        <div className="h-8 bg-gradient-to-b from-smart-beige/60 via-white/40 to-smart-beige/30 transition-all duration-1000 ease-in-out"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-future-green/5 to-transparent"></div>
      </div>
    </>
  );
};

export default HowItWorksSection;
