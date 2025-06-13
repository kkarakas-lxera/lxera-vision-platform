
import { Button } from "@/components/ui/button";
import VideoModal from "./VideoModal";
import { ArrowRight, Calendar } from "lucide-react";

const CTASection = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Button 
          size="lg" 
          className="btn btn-primary bg-future-green text-business-black hover:bg-future-green/90 hover:scale-110 hover:shadow-2xl active:scale-95 text-lg px-12 py-6 rounded-full font-semibold transition-all duration-300 shadow-xl hover:shadow-future-green/30 border-2 border-white/30 hover:border-white/60 group relative overflow-hidden focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
          aria-label="Book a demonstration of LXERA platform"
        >
          <Calendar className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
          <span className="relative z-10 drop-shadow-sm">Book a Demo</span>
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Button>
        
        <VideoModal />
      </div>

      <div className="text-center animate-fade-in-up animate-delay-600">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-future-green/20 shadow-lg max-w-2xl mx-auto">
          <p className="text-base text-business-black/90 mb-3 font-semibold">
            🚀 <span className="text-future-green font-bold">Early Access Now Open</span>
          </p>
          <p className="text-sm text-business-black/75 font-medium leading-relaxed">
            Join our innovation wave and help define what <span className="text-future-green font-semibold">LXERA</span> becomes. 
            Limited spots available for teams shaping the future of adaptive learning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
