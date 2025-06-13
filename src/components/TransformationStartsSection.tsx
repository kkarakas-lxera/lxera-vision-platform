
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const TransformationStartsSection = () => {
  return (
    <section className="w-full py-20 px-6 text-center bg-gradient-to-b from-smart-beige/80 to-smart-beige/50 relative overflow-hidden">
      {/* Enhanced animated background elements with brand colors */}
      <div className="absolute inset-0 opacity-8">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full animate-float-gentle bg-brand-accent/30"></div>
        <div className="absolute top-32 right-20 w-20 h-20 rounded-full animate-float-gentle bg-brand-accent/25" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-16 h-16 rounded-full animate-float-gentle bg-brand-accent/20" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6 animate-fade-in-up">
          Your Transformation Starts Here
        </h2>
        
        <p className="text-lg lg:text-xl text-business-black/70 max-w-2xl mx-auto mb-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          LXERA helps future-ready teams move beyond learning and into innovation.
        </p>
        
        <p className="text-base italic text-business-black/60 mb-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          "It's 3 steps ahead of where L&D is going."
        </p>

        {/* Enhanced bridge content */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto animate-fade-in-scale border border-white/30 hover:bg-white/70 hover:shadow-lg transition-all duration-500" style={{animationDelay: '0.6s'}}>
          <p className="text-business-black/80 font-medium">
            Ready to see how transformation happens? Let's walk through the journey from learning to innovation.
          </p>
        </div>

        {/* Enhanced progress indicators */}
        <div className="flex justify-center mt-8 space-x-2 animate-fade-in" style={{animationDelay: '0.8s'}}>
          {[1, 2, 3, 4].map((step, index) => (
            <div 
              key={step}
              className="w-2 h-2 rounded-full animate-pulse bg-brand-accent/60"
              style={{
                animationDelay: `${1 + index * 0.2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Enhanced visual transition element */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 animate-bounce-slow hover:scale-110 transition-transform duration-300 border-brand-accent/40">
          <ArrowDown className="w-6 h-6 animate-bounce text-brand-accent" />
        </div>
      </div>
    </section>
  );
};

export default TransformationStartsSection;
