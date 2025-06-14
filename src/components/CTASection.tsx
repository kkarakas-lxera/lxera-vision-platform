
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
          “Built with real teams. Designed for transformation.”
        </span>
      </div>
      <div className="text-center animate-fade-in-up animate-delay-600 space-y-4">
        <p className="text-base text-business-black/75 font-medium">
          🚀 <strong className="text-business-black">Early access open</strong> for innovative teams
        </p>
        <Button
          size="lg"
          className="bg-future-green text-business-black hover:bg-future-green/90 font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 group relative inline-flex items-center justify-center gap-2"
          onClick={handleScrollToContact}
          aria-label="Request a demo"
        >
          <span className="relative flex items-center justify-center w-full">
            <span className="mx-auto">Request a demo</span>
            {/* Arrow is absolutely positioned on the right, without shifting "Request a demo" */}
            <span className="absolute right-[-2.1rem] top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowRight
                className="transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                size={22}
                aria-hidden="true"
              />
            </span>
          </span>
        </Button>
      </div>
    </div>
  );
};

export default CTASection;

