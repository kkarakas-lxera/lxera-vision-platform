
import { Button } from "@/components/ui/button";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";
import SmartEmailCapture from "@/components/forms/SmartEmailCapture";
import { ArrowDown } from "lucide-react";
import { useState } from "react";

const TransformationStartsSection = () => {
  const [showEmailCapture, setShowEmailCapture] = useState(true);
  const [emailCaptured, setEmailCaptured] = useState(false);

  const handleEmailSuccess = (email: string) => {
    setEmailCaptured(true);
    setShowEmailCapture(false);
  };

  return (
    <>
      <section className="w-full py-16 px-6 text-center bg-gradient-to-b from-future-green/10 via-smart-beige/40 to-future-green/18 relative overflow-hidden font-inter transition-all duration-1000 ease-in-out">
        <div className="max-w-4xl mx-auto relative z-10">
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-business-black mb-4 animate-fade-in-up font-inter">
            Your Transformation Starts Here
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-business-black/70 max-w-2xl mx-auto mb-6 animate-fade-in-up animate-delay-200 font-normal font-inter">
            LXERA helps future-ready teams move beyond learning and into innovation.
          </p>
          
          <div className="bg-gradient-to-r from-smart-beige/60 via-future-green/20 to-smart-beige/40 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto animate-fade-in-scale animate-delay-600 border border-future-green/30 hover:from-smart-beige/70 hover:via-future-green/25 hover:to-smart-beige/50 hover:shadow-xl transition-all duration-500 lxera-hover">
            <p className="text-business-black/80 font-normal text-base font-inter">
              Ready to see how transformation happens? Let's walk through the journey from learning to innovation.
            </p>
          </div>

          {/* Animated Down Arrow Indicator above the CTA button */}
          <div className="flex justify-center mt-4 animate-bounce-slow">
            <ArrowDown size={32} className="text-future-green/70" aria-label="Scroll for more" />
          </div>

          {/* CTA - Email capture or success state */}
          <div className="mt-6 animate-fade-in-up animate-delay-700 max-w-md mx-auto">
            {showEmailCapture && !emailCaptured ? (
              <div className="space-y-4">
                <SmartEmailCapture 
                  source="transformation_section"
                  buttonText="Get Early Access"
                  onSuccess={handleEmailSuccess}
                  className="mx-auto"
                />
                <p className="text-xs text-gray-500">
                  No credit card required • Join 200+ teams
                </p>
                <p className="text-sm">
                  Prefer a demo? 
                  <SmartEmailCapture 
                    source="transformation_section_demo"
                    buttonText="Schedule a call"
                    variant="minimal"
                    onSuccess={handleEmailSuccess}
                    className="ml-2"
                  />
                </p>
              </div>
            ) : emailCaptured ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-medium">✓ Check your email to continue!</p>
                <p className="text-green-600 text-sm mt-1">We sent you a magic link</p>
              </div>
            ) : (
              <ProgressiveDemoCapture
                source="transformation_starts_section"
                buttonText="Request a Demo"
                onSuccess={handleEmailSuccess}
                className=""
              />
            )}
          </div>

          <div className="flex justify-center mt-6 space-x-2 animate-fade-in animate-delay-800">
            {[1, 2, 3, 4].map((step, index) => (
              <div 
                key={step}
                className="w-2 h-2 rounded-full animate-pulse-slow bg-future-green/60"
                style={{
                  animationDelay: `${1000 + index * 200}ms`,
                }}
              ></div>
            ))}
          </div>
        </div>

      </section>

      {/* Enhanced Section Separator - consistent height */}
      <div className="relative">
        <div className="h-8 bg-gradient-to-b from-future-green/18 via-smart-beige/30 to-future-green/8 transition-all duration-1000 ease-in-out"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-future-green/10 to-transparent"></div>
      </div>
    </>
  );
};

export default TransformationStartsSection;
