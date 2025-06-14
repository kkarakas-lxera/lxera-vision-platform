import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/StepCard";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { Timeline } from "@/components/Timeline";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { stepsData } from "@/data/howItWorksSteps";

const HowItWorksSection = () => {
  const { isVisible, currentStep, updateCurrentStep } = useScrollAnimation();

  return (
    <section id="how-it-works" className="w-full py-24 px-6 lg:px-12 bg-gradient-to-br from-smart-beige/40 via-future-green/8 to-smart-beige/60 relative overflow-hidden">
      {/* Animated background particles with consistent colors */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-future-green to-smart-beige rounded-full animate-float-gentle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Smooth transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-smart-beige/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header with enhanced animations */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-block mb-4 animate-slide-in-right stagger-2">
            <span className="text-sm font-semibold text-future-green bg-future-green/10 px-4 py-2 rounded-full hover:bg-future-green/20 transition-colors duration-300 animate-glow">
              THE PROCESS
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-6 animate-fade-in-up stagger-4">
            How LXERA Works
          </h2>
          <p className="text-xl lg:text-2xl text-business-black/80 max-w-3xl mx-auto animate-fade-in-up stagger-5">
            From onboarding to innovation in 4 smart steps
          </p>
          
          {/* Enhanced Progress Indicator */}
          <div className="mt-8 animate-fade-in stagger-5">
            <ProgressIndicator totalSteps={stepsData.length} currentStep={currentStep} />
          </div>
          
          {/* Animated visual connector */}
          <div className="mt-4 flex justify-center animate-fade-in stagger-5">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-future-green to-transparent animate-pulse-slow"></div>
          </div>
        </div>
        
        {/* Steps Container */}
        <div className="relative">
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-4 gap-8 relative">
              {/* Enhanced animated timeline */}
              <Timeline stepCount={stepsData.length} layout="desktop" />
              
              {stepsData.map((step, index) => (
                <div
                  key={index}
                  onMouseEnter={() => updateCurrentStep(index + 1)}
                >
                  <StepCard
                    step={step}
                    index={index}
                    isLast={index === stepsData.length - 1}
                    layout="desktop"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-8 relative">
            {/* Enhanced animated vertical timeline */}
            <Timeline stepCount={stepsData.length} layout="mobile" />
            
            {stepsData.map((step, index) => (
              <div key={index}>
                <StepCard
                  step={step}
                  index={index}
                  isLast={index === stepsData.length - 1}
                  layout="mobile"
                />
                
                {/* Enhanced mobile connector */}
                {index < stepsData.length - 1 && (
                  <div className="flex justify-center my-6 relative z-10">
                    <div className="w-1 h-12 bg-gradient-to-b from-future-green/60 to-future-green/20 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced bottom CTA with consistent gradient */}
        <div className="text-center mt-20 animate-fade-in-up stagger-5">
          <div className="bg-gradient-to-r from-future-green/15 via-smart-beige/30 to-future-green/10 p-8 rounded-2xl hover:from-future-green/20 hover:via-smart-beige/40 hover:to-future-green/15 transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-future-green/8 to-smart-beige/12 animate-gradient-shift"></div>
            <div className="relative z-10">
              <p className="text-lg text-business-black/70 mb-6 animate-fade-in stagger-5">
                Ready to transform how your organization learns, grows, and innovates?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Button 
                  size="lg" 
                  className="bg-business-black hover:bg-business-black/90 text-white px-8 py-3 text-lg font-semibold lxera-hover shadow-lg hover:shadow-xl animate-scale-pulse"
                >
                  Book a Demo
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-future-green text-future-green hover:bg-future-green/10 px-8 py-3 text-lg font-semibold lxera-hover"
                >
                  Watch Overview
                </Button>
              </div>
              <p className="text-sm text-business-black/60 mt-4 animate-fade-in stagger-5">
                Join forward-thinking teams already accelerating growth with LXERA.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
