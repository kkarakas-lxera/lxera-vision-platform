
import { Button } from "@/components/ui/button";
import { Play, Rocket, ArrowRight, Sparkles, Clock } from "lucide-react";

const CTASection = () => {
  const handleScrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 animate-fade-in-up animate-delay-500">
      <div className="flex flex-col lg:flex-row gap-6 justify-start items-start">
        {/* Enhanced Primary CTA with better visual impact */}
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-future-green via-emerald to-future-green text-business-black hover:from-emerald hover:via-future-green hover:to-emerald hover:scale-105 active:scale-95 text-lg font-bold px-12 py-8 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-[0_20px_50px_rgba(122,229,198,0.4)] border-0 group relative overflow-hidden min-w-fit"
          aria-label="Try the LXERA Experience"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <Rocket className="w-6 h-6 mr-4 group-hover:animate-bounce-slow relative z-10 text-business-black" />
          <span className="relative z-10 text-business-black">🚀 Try the LXERA Experience</span>
          <ArrowRight className="w-6 h-6 ml-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 relative z-10 text-business-black" />
        </Button>
        
        {/* Enhanced Secondary CTA with better styling */}
        <Button 
          size="lg" 
          variant="outline"
          className="border-2 border-business-black bg-white/90 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white text-lg px-12 py-8 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl group relative overflow-hidden min-w-fit"
          onClick={handleScrollToDemo}
          aria-label="Watch how LXERA works demo video"
        >
          <div className="absolute inset-0 bg-business-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          <Play className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform relative z-10" />
          <span className="relative z-10">▶ See How It Works</span>
          <Clock className="w-5 h-5 ml-3 opacity-70 relative z-10" />
          <span className="text-sm font-medium ml-1 relative z-10">(2 Min)</span>
        </Button>
      </div>

      {/* Enhanced early access indicator with improved design */}
      <div className="text-left animate-fade-in-up animate-delay-700">
        <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-lg px-8 py-4 rounded-full border-2 border-future-green/30 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-default">
          <div className="relative">
            <div className="w-4 h-4 bg-future-green rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-4 h-4 bg-future-green rounded-full animate-ping opacity-40"></div>
            <div className="absolute inset-0 w-4 h-4 bg-emerald rounded-full animate-ping opacity-20 animate-delay-200"></div>
          </div>
          <p className="text-lg text-business-black/90 font-semibold">
            <strong className="text-future-green font-bold bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">
              Early access open
            </strong> for innovation leaders
          </p>
          <Sparkles className="w-5 h-5 text-future-green animate-pulse group-hover:animate-spin transition-all duration-500" />
        </div>
      </div>
    </div>
  );
};

export default CTASection;
