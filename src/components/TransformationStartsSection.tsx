
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowRight } from "lucide-react";

const TransformationStartsSection = () => {
  return (
    <section className="w-full py-28 px-6 text-center bg-gradient-to-b from-future-green/8 via-smart-beige/60 to-future-green/12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-business-black mb-6 animate-fade-in-up">
          Your Transformation Starts Here
        </h2>
        
        <p className="text-lg sm:text-xl lg:text-xl text-business-black/70 max-w-2xl mx-auto mb-4 animate-fade-in-up animate-delay-200">
          LXERA helps future-ready teams move beyond learning and into innovation.
        </p>
        
        <div className="bg-gradient-to-r from-smart-beige/60 via-future-green/20 to-smart-beige/40 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto animate-fade-in-scale animate-delay-600 border border-future-green/30 hover:from-smart-beige/70 hover:via-future-green/25 hover:to-smart-beige/50 hover:shadow-xl transition-all duration-500 lxera-hover">
          <p className="text-business-black/80 font-medium text-base">
            Ready to see how transformation happens? Let's walk through the journey from learning to innovation.
          </p>
        </div>

        {/* Animated Down Arrow Indicator above the CTA button */}
        <div className="flex justify-center mt-6 animate-bounce-slow">
          <ArrowDown size={32} className="text-future-green/70" aria-label="Scroll for more" />
        </div>

        {/* CTA Button - Only Get Early Access */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 animate-fade-in-up animate-delay-700">
          <Button
            size="lg"
            className="bg-future-green text-business-black hover:bg-future-green/90 font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
            aria-label="Get Early Access"
          >
            Get Early Access
            <ArrowRight size={18} />
          </Button>
        </div>

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
    </section>
  );
};
export default TransformationStartsSection;
