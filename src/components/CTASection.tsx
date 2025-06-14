
import { Button } from "@/components/ui/button";
import { Play, Rocket, ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  const handleScrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in-up animate-delay-500">
      <div className="flex flex-col lg:flex-row gap-6 justify-start items-start">
        {/* Enhanced Primary CTA */}
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-future-green to-emerald text-business-black hover:from-emerald hover:to-future-green hover:scale-105 active:scale-95 text-lg font-bold px-10 py-7 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl border-0 group relative overflow-hidden"
          aria-label="Try the LXERA Experience"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Rocket className="w-6 h-6 mr-3 group-hover:animate-bounce-slow relative z-10" />
          <span className="relative z-10">🚀 Try the LXERA Experience</span>
          <ArrowRight className="w-5 h-5 ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 relative z-10" />
        </Button>
        
        {/* Enhanced Secondary CTA */}
        <Button 
          size="lg" 
          variant="outline"
          className="border-2 border-business-black bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white text-lg px-10 py-7 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden"
          onClick={handleScrollToDemo}
          aria-label="Watch how LXERA works demo video"
        >
          <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
          <span>▶ See How It Works (2 Min)</span>
        </Button>
      </div>

      {/* Enhanced early access indicator with better design */}
      <div className="text-left animate-fade-in-up animate-delay-700">
        <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-md px-6 py-3 rounded-full border border-future-green/30 shadow-lg">
          <div className="relative">
            <div className="w-3 h-3 bg-future-green rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-future-green rounded-full animate-ping opacity-30"></div>
          </div>
          <p className="text-base text-business-black/90 font-medium">
            <strong className="text-future-green font-semibold">Early access open</strong> for innovation leaders
          </p>
          <Sparkles className="w-4 h-4 text-future-green animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default CTASection;
