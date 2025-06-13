
import { Button } from "@/components/ui/button";
import VideoModal from "./VideoModal";

const CTASection = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Button 
          size="lg" 
          className="btn btn-primary bg-business-black text-white hover:bg-business-black/90 hover:scale-105 text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Book a Demo
        </Button>
        
        <VideoModal />
      </div>

      <div className="text-center animate-fade-in-up" style={{animationDelay: '0.6s'}}>
        <p className="text-base text-business-black/80 mb-2">
          🚀 <strong>Early access now open</strong> for teams shaping the future of adaptive learning.
        </p>
        <p className="text-sm text-business-black/70">
          Join our innovation wave and help define what LXERA becomes.
        </p>
      </div>
    </div>
  );
};

export default CTASection;
