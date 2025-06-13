
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const TransformationStartsSection = () => {
  return (
    <section className="w-full py-16 px-6 text-center bg-smart-beige">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6">
          Your Transformation Starts Here
        </h2>
        
        <p className="text-lg lg:text-xl text-business-black/70 max-w-2xl mx-auto mb-4">
          LXERA helps future-ready teams move beyond learning and into innovation.
        </p>
        
        <p className="text-base italic text-business-black/60">
          "It's 3 steps ahead of where L&D is going."
        </p>
      </div>
    </section>
  );
};

export default TransformationStartsSection;
