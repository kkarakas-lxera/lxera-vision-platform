
import HeroVideoPreview from "./HeroVideoPreview";
import { Button } from "@/components/ui/button";

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
      <div className="text-center animate-fade-in-up animate-delay-600 space-y-4">
        <p className="text-base text-business-black/75 font-medium">
          🚀 <strong className="text-business-black">Early access open</strong> for innovative teams
        </p>
        <Button
          size="lg"
          className="bg-future-green text-business-black hover:bg-future-green/90 font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
          onClick={handleScrollToContact}
          aria-label="Request a demo"
        >
          Request a demo
        </Button>
      </div>
    </div>
  );
};

export default CTASection;
