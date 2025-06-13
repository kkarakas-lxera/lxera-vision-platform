
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const TransformationStartsSection = () => {
  const scrollToHowItWorks = () => {
    const howItWorksSection = document.querySelector('[data-section="how-it-works"]');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-16 px-6 text-center bg-smart-beige">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6">
          Your Transformation Starts Here
        </h2>
        
        <p className="text-lg lg:text-xl text-business-black/70 max-w-2xl mx-auto mb-4">
          LXERA helps future-ready teams move beyond learning and into innovation.
        </p>
        
        <p className="text-base italic text-business-black/60 mb-8">
          "It's 3 steps ahead of where L&D is going."
        </p>
        
        <Button 
          onClick={scrollToHowItWorks}
          className="bg-business-black text-white hover:bg-business-black/90 px-6 py-3 rounded-md font-semibold transition-all duration-300"
        >
          See How It Works
          <ChevronDown className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </section>
  );
};

export default TransformationStartsSection;
