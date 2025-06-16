
import HeroVideoPreview from "./HeroVideoPreview";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  // Smooth scroll to #contact
  const handleScrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center items-center">
        <div className="w-full max-w-xl">
          <HeroVideoPreview />
        </div>
      </div>
      {/* Quote snippet below video */}
      <div className="text-center mt-3">
        <span className="block text-business-black/70 text-base font-medium italic leading-tight">
          "Built with real teams. Designed for transformation."
        </span>
      </div>
      <div className="text-center animate-fade-in-up animate-delay-600 space-y-4">
        <p className="text-base text-business-black/75 font-medium">
          🚀 <strong className="text-business-black">Early access open</strong> for innovative teams
        </p>
        <Button
          size="lg"
          className="bg-future-green text-business-black hover:bg-future-green/90 font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
          onClick={handleScrollToContact}
          aria-label="Request a demo"
        >
          <span className="flex items-center justify-center gap-2 w-full">
            <span className="block mx-auto">Request a demo</span>
            <ArrowRight
              className="transition-opacity duration-200 opacity-0 group-hover:opacity-100"
              size={22}
              aria-hidden="true"
            />
          </span>
        </Button>
      </div>
    </div>
  );
};

export default CTASection;
