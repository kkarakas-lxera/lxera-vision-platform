
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowRight } from "lucide-react";

const TransformationStartsSection = () => {
  return (
    <>
      {/* Minimal transition */}
      <div className="relative">
        <div className="h-px bg-gradient-to-r from-transparent via-future-green/20 to-transparent"></div>
      </div>

      <section className="w-full py-20 px-6 text-center bg-white relative overflow-hidden font-inter transition-all duration-1000 ease-in-out">
        <div className="max-w-4xl mx-auto relative z-10">
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-business-black mb-8 animate-fade-in-up font-inter">
            Where Learning Meets Innovation
          </h2>
          
          <p className="text-lg sm:text-xl text-business-black/70 max-w-2xl mx-auto mb-12 animate-fade-in-up animate-delay-200 font-light font-inter leading-relaxed">
            Experience how AI-powered learning transforms teams into innovation engines.
          </p>
          
          {/* Minimal accent */}
          <div className="flex justify-center mb-12 animate-fade-in-up animate-delay-400">
            <div className="w-16 h-px bg-future-green"></div>
          </div>

          {/* Clean CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up animate-delay-600">
            <Button
              size="lg"
              className="bg-business-black text-white hover:bg-business-black/90 font-normal px-8 py-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md font-inter min-h-[48px] border-0"
              aria-label="Explore the journey"
            >
              Explore the journey
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>

          {/* Minimal scroll indicator */}
          <div className="flex justify-center mt-16 animate-fade-in-up animate-delay-800">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-px h-8 bg-business-black/20"></div>
              <ArrowDown className="w-4 h-4 animate-bounce text-business-black/40" />
            </div>
          </div>
        </div>

        {/* Subtle geometric elements */}
        <div className="absolute top-20 right-20 w-2 h-2 rounded-full bg-future-green/20"></div>
        <div className="absolute bottom-20 left-20 w-1 h-12 bg-future-green/20"></div>
      </section>
    </>
  );
};
export default TransformationStartsSection;
