
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
      <section className="w-full py-16 px-6 text-center bg-gradient-to-br from-future-green/15 via-smart-beige/30 to-future-green/25 relative overflow-hidden font-inter transition-all duration-1000 ease-in-out">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-future-green/8 to-transparent opacity-80"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-future-green/5 via-transparent to-transparent"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          
          {/* Enhanced Header with Striking Visual Elements */}
          <div className="relative mb-8">
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-future-green/30 rounded-full blur-sm animate-pulse"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-smart-beige/40 rounded-full blur-sm animate-pulse" style={{animationDelay: '0.5s'}}></div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-business-black mb-4 animate-fade-in-up font-inter relative">
              Your Transformation Starts Here
            </h2>
            
            {/* Decorative accent line */}
            <div className="flex justify-center mb-4 animate-fade-in-scale" style={{animationDelay: '0.3s'}}>
              <div className="relative">
                <div className="w-24 h-1 bg-gradient-to-r from-future-green/60 via-future-green to-future-green/60 rounded-full"></div>
                <div className="absolute inset-0 w-24 h-1 bg-gradient-to-r from-transparent via-future-green/80 to-transparent rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <p className="text-base sm:text-lg lg:text-xl text-business-black/80 max-w-2xl mx-auto mb-8 animate-fade-in-up animate-delay-200 font-medium font-inter">
            LXERA helps future-ready teams move beyond learning and into innovation.
          </p>
          
          {/* Enhanced CTA Card with Better Visual Appeal */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-future-green/40 via-smart-beige/30 to-future-green/40 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-gradient-to-r from-white/80 via-smart-beige/20 to-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto animate-fade-in-scale animate-delay-600 border border-future-green/20 hover:border-future-green/40 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-center mb-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-future-green rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-future-green/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-future-green/40 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
              <p className="text-business-black/90 font-medium text-base font-inter leading-relaxed">
                Ready to see how transformation happens? Let's walk through the journey from learning to innovation.
              </p>
              <div className="mt-4 text-center">
                <span className="inline-block px-4 py-2 bg-future-green/10 text-business-black/80 rounded-full text-sm font-semibold">
                  Join 200+ teams already transforming
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Action Section */}
          <div className="mt-8 space-y-6">
            
            {/* Animated Down Arrow Indicator */}
            <div className="flex justify-center animate-bounce-slow">
              <div className="relative">
                <ArrowDown size={32} className="text-future-green/80" aria-label="Scroll for more" />
                <div className="absolute inset-0 bg-future-green/20 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* CTA - Email capture or success state */}
            <div className="animate-fade-in-up animate-delay-700 max-w-md mx-auto">
              {showEmailCapture && !emailCaptured ? (
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-future-green/30 to-smart-beige/30 rounded-xl blur opacity-25"></div>
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-future-green/20 shadow-lg">
                      <SmartEmailCapture 
                        source="transformation_section"
                        buttonText="Get Early Access"
                        onSuccess={handleEmailSuccess}
                        className="mx-auto"
                      />
                      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-business-black/80">
                        <span>No credit card required</span>
                        <span>•</span>
                        <span className="font-semibold text-business-black">Join 200+ teams</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-business-black/90 mb-2 font-medium">
                      Prefer a demo? 
                    </p>
                    <ProgressiveDemoCapture 
                      source="transformation_section_demo"
                      buttonText="Book Demo"
                      variant="minimal"
                      onSuccess={() => {}}
                      className="inline-flex font-semibold"
                    />
                  </div>
                </div>
              ) : emailCaptured ? (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-xl blur opacity-25"></div>
                  <div className="relative bg-green-50/90 backdrop-blur-sm border border-green-200 rounded-xl p-6 text-center shadow-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 text-xl">✓</span>
                    </div>
                    <p className="text-green-800 font-semibold mb-1">Check your email to continue!</p>
                    <p className="text-green-600 text-sm">We sent you a magic link</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-future-green/30 to-smart-beige/30 rounded-xl blur opacity-25"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-future-green/20 shadow-lg">
                    <ProgressiveDemoCapture
                      source="transformation_starts_section"
                      buttonText="Book Demo"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Progress Dots */}
            <div className="flex justify-center space-x-3 animate-fade-in animate-delay-800">
              {[1, 2, 3, 4].map((step, index) => (
                <div 
                  key={step}
                  className="relative"
                >
                  <div 
                    className="w-3 h-3 rounded-full bg-future-green/70 animate-pulse-slow"
                    style={{
                      animationDelay: `${1000 + index * 200}ms`,
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0 w-3 h-3 rounded-full bg-future-green/30 animate-ping"
                    style={{
                      animationDelay: `${1500 + index * 200}ms`,
                    }}
                  ></div>
                </div>
              ))}
            </div>
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
