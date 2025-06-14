import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const TransformationStartsSection = () => {
  return (
    <section className="w-full py-20 px-6 text-center bg-gradient-to-b from-future-green/8 via-smart-beige/60 to-future-green/12 relative overflow-hidden">
      {/* Animated background elements with consistent colors */}
      <div className="absolute inset-0 opacity-8">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full animate-float-gentle bg-gradient-to-br from-future-green/25 to-smart-beige/15"></div>
        <div className="absolute top-32 right-20 w-20 h-20 rounded-full animate-float-gentle bg-gradient-to-l from-smart-beige/20 to-future-green/18 animate-delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-16 h-16 rounded-full animate-float-gentle bg-gradient-to-r from-future-green/15 to-smart-beige/25 animate-delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6 animate-fade-in-up">
          Your Transformation Starts Here
        </h2>
        
        <p className="text-lg lg:text-xl text-business-black/70 max-w-2xl mx-auto mb-4 animate-fade-in-up animate-delay-200">
          LXERA helps future-ready teams move beyond learning and into innovation.
        </p>
        
        {/* Changed: neutral quote, no green */}
        <p className="text-base italic text-business-black/60 mb-8 animate-fade-in-up animate-delay-400">
          "It's 3 steps ahead of where L&D is going."
        </p>

        {/* Bridge content with updated gradient */}
        <div className="bg-gradient-to-r from-smart-beige/60 via-future-green/20 to-smart-beige/40 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto animate-fade-in-scale animate-delay-600 border border-future-green/30 hover:from-smart-beige/70 hover:via-future-green/25 hover:to-smart-beige/50 hover:shadow-xl transition-all duration-500 lxera-hover">
          <p className="text-business-black/80 font-medium">
            Ready to see how transformation happens? Let's walk through the journey from learning to innovation.
          </p>
        </div>

        {/* Enhanced progress indicators */}
        <div className="flex justify-center mt-8 space-x-2 animate-fade-in animate-delay-800">
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
      
      {/* Visual transition element with updated colors */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div className="w-16 h-16 bg-gradient-to-br from-smart-beige to-future-green/30 rounded-full shadow-lg flex items-center justify-center border-2 border-future-green/30 animate-bounce-slow hover:scale-110 transition-transform duration-300 lxera-hover">
          <ArrowDown className="w-6 h-6 text-future-green animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default TransformationStartsSection;
