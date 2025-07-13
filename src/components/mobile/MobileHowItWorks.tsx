import React, { useState, useEffect, useRef } from 'react';
import { stepsData } from '@/data/howItWorksSteps';
import ProgressiveDemoCapture from '@/components/forms/ProgressiveDemoCapture';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileHowItWorksProps {
  openDemoModal?: (source: string) => void;
}

const MobileHowItWorks = ({ openDemoModal }: MobileHowItWorksProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState<string>("");
  const [ctaText, setCtaText] = useState("Book Demo");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  // Auto-expand most impactful step (Von Restorff Effect)
  useEffect(() => {
    const timer = setTimeout(() => {
      setExpandedStep('step-3'); // Step 3 has 80% engagement boost - most impactful
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Update CTA based on scroll position (Hick's Law)
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollPercentage = -rect.top / rect.height;
      
      if (scrollPercentage < 0.2) {
        setCtaText("See Step 2");
      } else if (scrollPercentage < 0.4) {
        setCtaText("See Step 3");
      } else if (scrollPercentage < 0.6) {
        setCtaText("See Step 4");
      } else {
        setCtaText("Book Demo");
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle swipe navigation with haptic feedback (Serial Position Effect)
  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentStep < stepsData.length - 1) {
      setCurrentStep(currentStep + 1);
      setExpandedStep(`step-${currentStep + 1}`);
      // Trigger haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } else if (direction === 'right' && currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setExpandedStep(`step-${currentStep - 1}`);
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const handleStepClick = () => {
    if (ctaText.includes("Step")) {
      const stepNum = parseInt(ctaText.match(/\d+/)?.[0] || "2") - 1;
      setCurrentStep(stepNum);
      setExpandedStep(`step-${stepNum}`);
      
      // Smooth scroll to accordion
      const accordion = document.querySelector(`[data-step="${stepNum}"]`);
      accordion?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (openDemoModal) {
      openDemoModal('how_it_works_mobile_sticky');
    }
  };

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
          
          {/* Swipe Navigation Controls (Serial Position Effect) */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => handleSwipe('right')}
              className={`p-3 rounded-full ${currentStep > 0 ? 'bg-business-black text-white' : 'bg-gray-200 text-gray-400'} transition-colors`}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {/* Progress Dots */}
            <div className="flex gap-2">
              {stepsData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentStep(index);
                    setExpandedStep(`step-${index}`);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'w-8 bg-business-black' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => handleSwipe('left')}
              className={`p-3 rounded-full ${currentStep < stepsData.length - 1 ? 'bg-business-black text-white' : 'bg-gray-200 text-gray-400'} transition-colors`}
              disabled={currentStep === stepsData.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
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

      {/* Hick's Law: Single sticky CTA with dynamic context */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-lg">
        <button
          onClick={handleStepClick}
          className="w-full py-4 px-6 bg-business-black text-white rounded-xl font-semibold text-lg hover:bg-business-black/90 transition-colors"
        >
          {ctaText}
        </button>
      </div>

      {/* Section Separator - same as desktop */}
      <div className="relative">
        <div className="h-8 bg-gradient-to-b from-smart-beige/60 via-white/40 to-smart-beige/30 transition-all duration-1000 ease-in-out"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-future-green/5 to-transparent"></div>
      </div>
    </>
  );
};

export default MobileHowItWorks;