
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";

const HeroContent = () => {
  return (
    <div className="text-left space-y-10">
      {/* Enhanced headline with better typography hierarchy */}
      <div className="animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-business-black leading-[1.05] tracking-tight">
          <span className="text-business-black block mb-2">LXERA is the first</span>
          <span className="text-future-green bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent block mb-2">
            Learning & Innovation
          </span>
          <span className="text-business-black block mb-4">Experience Platform</span>
          <span className="text-lg lg:text-xl font-medium text-business-black/70 tracking-wider uppercase">
            (LXIP)
          </span>
        </h1>
      </div>

      {/* Enhanced subheadline with better readability */}
      <div className="animate-fade-in-up animate-delay-200">
        <p className="text-xl lg:text-2xl xl:text-3xl text-business-black/90 font-medium leading-relaxed max-w-2xl">
          Empower your teams to{" "}
          <strong className="text-future-green font-semibold relative">
            learn faster
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-future-green/30"></span>
          </strong>
          ,{" "}
          <strong className="text-future-green font-semibold relative">
            build smarter
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-future-green/30"></span>
          </strong>
          , and{" "}
          <strong className="text-future-green font-semibold relative">
            innovate from the inside out
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-future-green/30"></span>
          </strong>
          {" "}— all through one intelligent, adaptive platform.
        </p>
      </div>

      {/* Enhanced value bullets with improved design */}
      <div className="animate-fade-in-up animate-delay-400">
        <ul className="space-y-6 text-lg lg:text-xl text-business-black/85">
          <li className="flex items-start gap-5 group">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-future-green to-emerald rounded-full flex items-center justify-center mt-1 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="leading-relaxed font-medium">AI-powered learning journeys, tailored in real time</span>
          </li>
          <li className="flex items-start gap-5 group">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-future-green to-emerald rounded-full flex items-center justify-center mt-1 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="leading-relaxed font-medium">Built-in tools to drive innovation from the frontline</span>
          </li>
          <li className="flex items-start gap-5 group">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-future-green to-emerald rounded-full flex items-center justify-center mt-1 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="leading-relaxed font-medium">Dashboards, insights, and skill mapping—automated</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeroContent;
