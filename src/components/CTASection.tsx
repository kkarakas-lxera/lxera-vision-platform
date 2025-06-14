
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-6 justify-start items-start">
        <Button 
          size="lg" 
          className="btn btn-primary bg-future-green text-business-black hover:bg-future-green/90 hover:scale-110 hover:shadow-2xl active:scale-95 text-lg px-10 py-5 rounded-full font-semibold transition-all duration-300 shadow-xl hover:shadow-future-green/30 border-2 border-white/30 hover:border-white/60 group relative overflow-hidden focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
          aria-label="Book a demonstration of LXERA platform"
        >
          <span className="relative z-10 drop-shadow-sm">Book a Demo</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Button>
      </div>

      <div className="text-left animate-fade-in-up animate-delay-600">
        <p className="text-base text-business-black/85 mb-3 font-medium">
          🚀 <strong className="text-future-green">Early access now open</strong> for teams shaping the future of adaptive learning.
        </p>
        <p className="text-sm text-business-black/75 font-medium">
          Join our innovation wave and help define what <span className="text-future-green font-semibold">LXERA</span> becomes.
        </p>
      </div>
    </div>
  );
};

export default CTASection;
