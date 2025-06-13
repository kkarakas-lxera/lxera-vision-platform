
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowDown } from "lucide-react";

const TransformationStartsSection = () => {
  return (
    <section className="w-full py-20 px-6 text-center bg-gradient-to-b from-smart-beige to-smart-beige/50 relative">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6 animate-fade-in">
          Your Transformation Starts Here
        </h2>
        
        <p className="text-lg lg:text-xl text-business-black/70 max-w-2xl mx-auto mb-4 animate-fade-in">
          LXERA helps future-ready teams move beyond learning and into innovation.
        </p>
        
        <p className="text-base italic text-business-black/60 mb-8 animate-fade-in">
          "It's 3 steps ahead of where L&D is going."
        </p>

        {/* Enhanced bridge content */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto animate-fade-in">
          <p className="text-business-black/80 font-medium">
            Ready to see how transformation happens? Let's walk through the journey from learning to innovation.
          </p>
        </div>
      </div>
      
      {/* Visual transition element */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-future-green/30">
          <ArrowDown className="w-6 h-6 text-future-green animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default TransformationStartsSection;
