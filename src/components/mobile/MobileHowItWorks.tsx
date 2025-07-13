import React, { useState, useEffect, useRef } from 'react';
import { stepsData } from '@/data/howItWorksSteps';
import ProgressiveDemoCapture from '@/components/forms/ProgressiveDemoCapture';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface MobileHowItWorksProps {
  openDemoModal?: (source: string) => void;
}

const MobileHowItWorks = ({ openDemoModal }: MobileHowItWorksProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState<string>("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  // Auto-expand most impactful step (Von Restorff Effect)
  useEffect(() => {
    const timer = setTimeout(() => {
      setExpandedStep('step-3'); // Step 3 has 80% engagement boost - most impactful
    }, 1000);
    return () => clearTimeout(timer);
  }, []);




  return (
    <>
      <section 
        ref={sectionRef}
        id="how-it-works" 
        className="w-full py-8 px-4 bg-gradient-to-br from-smart-beige/40 via-future-green/8 to-smart-beige/60 relative overflow-hidden transition-all duration-1000 ease-in-out"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header - same as desktop */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-semibold text-business-black mb-6 animate-fade-in-up">
              How LXERA Works
            </h2>
            <p className="text-lg text-business-black/80 mb-8 max-w-3xl mx-auto animate-fade-in-up animate-delay-200 leading-relaxed">
              From onboarding to innovation — in 4 steps that drive measurable results.
            </p>
          </div>
          

          {/* Accordion Steps with UX improvements */}
          <Accordion 
            type="single" 
            collapsible 
            className="space-y-4 mb-6"
            value={expandedStep}
            onValueChange={setExpandedStep}
          >
            {stepsData.map((step, index) => (
              <AccordionItem
                key={index}
                value={`step-${index}`}
                data-step={index}
                className={`border-2 rounded-xl overflow-hidden bg-white shadow-lg transition-all duration-500 ${
                  index === currentStep 
                    ? 'border-business-black shadow-xl scale-[1.02]' 
                    : 'border-gray-200 shadow-gray-100'
                } animate-fade-in-up`}
                style={{
                  animationDelay: `${300 + index * 100}ms`,
                }}
              >
                {/* Fitts's Law: Increased touch target to 56px minimum */}
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors text-left min-h-[56px] w-full">
                  <div className="flex items-center gap-5 w-full">
                    <div className="w-14 h-14 bg-business-black rounded-xl shadow-lg shadow-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-extrabold text-white tracking-tight">
                        {step.step}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-business-black font-semibold text-lg mb-1 text-left leading-tight">{step.title}</h3>
                      {/* Miller's Law: Single-line summary */}
                      <p className="text-business-black/70 text-sm text-left truncate">
                        {step.metrics} • Tap to explore
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="ml-19 border-l-2 border-future-green/30 pl-6">
                    {/* Full content when expanded */}
                    <p className="text-business-black/80 mb-4 leading-relaxed">
                      {step.subtitle}
                    </p>
                    <ul className="space-y-2 mb-4">
                      {step.bullets.map((bullet, idx) => (
                        <li key={idx} className="text-business-black/70 text-sm flex items-start">
                          <span className="text-future-green mr-2 mt-1">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    {step.cta && (
                      <button className="text-business-black font-medium text-sm underline">
                        {step.cta} →
                      </button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {/* Bottom content - same as desktop */}
          <div className="text-center mb-20"> {/* Extra margin for sticky CTA */}
            <p className="text-business-black/70 mb-8 text-lg animate-fade-in-up animate-delay-700 leading-relaxed">
              Every LXERA innovation capability shaped by real-world feedback for maximum impact.
            </p>
          </div>
        </div>
      </section>


      {/* Section Separator - same as desktop */}
      <div className="relative">
        <div className="h-8 bg-gradient-to-b from-smart-beige/60 via-white/40 to-smart-beige/30 transition-all duration-1000 ease-in-out"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-future-green/5 to-transparent"></div>
      </div>
    </>
  );
};

export default MobileHowItWorks;