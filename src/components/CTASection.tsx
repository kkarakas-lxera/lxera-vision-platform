
import { Button } from "@/components/ui/button";
import { Play, Rocket, ArrowRight } from "lucide-react";

const CTASection = () => {
  const handleScrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up animate-delay-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-start items-start">
        {/* Enhanced Primary CTA */}
        <Button 
          size="lg" 
          className="bg-future-green text-business-black hover:bg-emerald hover:text-white hover:scale-105 active:scale-95 text-lg font-bold px-8 py-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl border-0 min-w-[300px] group"
          aria-label="Try the LXERA Experience"
        >
          <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce-slow" />
          🚀 Try the LXERA Experience
          <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
        
        {/* Enhanced Secondary CTA */}
        <Button 
          size="lg" 
          variant="outline"
          className="border-2 border-business-black text-business-black hover:bg-business-black hover:text-white text-lg px-8 py-6 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-2xl min-w-[300px] group"
          onClick={handleScrollToDemo}
          aria-label="Watch how LXERA works demo video"
        >
          <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          ▶ See How It Works (2 Min)
        </Button>
      </div>

      {/* Enhanced early access indicator */}
      <div className="text-left animate-fade-in-up animate-delay-700">
        <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-future-green/20">
          <div className="w-2 h-2 bg-future-green rounded-full animate-pulse"></div>
          <p className="text-base text-business-black/80 font-medium">
            <strong className="text-future-green">Early access open</strong> for innovation leaders
          </p>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
