
import { Button } from "@/components/ui/button";
import { Play, Rocket } from "lucide-react";

const CTASection = () => {
  const handleScrollToDemo = () => {
    // Scroll to demo section or trigger video modal
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up animate-delay-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-start items-start">
        {/* Primary CTA - Try LXERA Experience */}
        <Button 
          size="lg" 
          className="bg-future-green text-business-black hover:bg-future-green/90 hover:scale-105 active:scale-95 text-lg px-8 py-6 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl border-0 min-w-[280px]"
          aria-label="Try the LXERA Experience"
        >
          <Rocket className="w-5 h-5 mr-2" />
          🚀 Try the LXERA Experience
        </Button>
        
        {/* Secondary CTA - See How It Works */}
        <Button 
          size="lg" 
          variant="outline"
          className="border-2 border-business-black text-business-black hover:bg-business-black hover:text-white text-lg px-8 py-6 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl min-w-[280px]"
          onClick={handleScrollToDemo}
          aria-label="Watch how LXERA works demo video"
        >
          <Play className="w-5 h-5 mr-2" />
          ▶ See How It Works (2 Min)
        </Button>
      </div>

      {/* Early access indicator */}
      <div className="text-left animate-fade-in-up animate-delay-700">
        <p className="text-base text-business-black/75 font-medium">
          🚀 <strong className="text-future-green">Early access open</strong> for innovation leaders
        </p>
      </div>
    </div>
  );
};

export default CTASection;
