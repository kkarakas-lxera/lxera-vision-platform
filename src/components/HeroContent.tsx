
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";

const HeroContent = () => {
  return (
    <div className="text-left space-y-12">
      {/* Enhanced headline with improved typography and emphasis */}
      <div className="animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-business-black leading-[1.02] tracking-tight">
          <span className="text-business-black block mb-3">LXERA is the first</span>
          <span className="text-future-green bg-gradient-to-r from-future-green via-emerald to-future-green bg-clip-text text-transparent block mb-3 relative">
            Learning & Innovation
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-future-green/30 to-emerald/30 rounded-full"></div>
          </span>
          <span className="text-business-black block mb-4">Experience Platform</span>
          <span className="text-xl lg:text-2xl font-semibold text-business-black/70 tracking-wider uppercase bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-future-green/20 inline-block">
            (LXIP)
          </span>
        </h1>
      </div>

      {/* Enhanced subheadline with better readability and emphasis */}
      <div className="animate-fade-in-up animate-delay-200">
        <p className="text-xl lg:text-2xl xl:text-3xl text-business-black/90 font-medium leading-[1.4] max-w-2xl">
          Empower your teams to{" "}
          <strong className="text-future-green font-bold relative inline-block">
            learn faster
            <span className="absolute bottom-0 left-0 w-full h-1 bg-future-green/40 rounded-full animate-pulse"></span>
          </strong>
          ,{" "}
          <strong className="text-future-green font-bold relative inline-block">
            build smarter
            <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald/40 rounded-full animate-pulse animate-delay-200"></span>
          </strong>
          , and{" "}
          <strong className="text-future-green font-bold relative inline-block">
            innovate from the inside out
            <span className="absolute bottom-0 left-0 w-full h-1 bg-future-green/40 rounded-full animate-pulse animate-delay-400"></span>
          </strong>
          {" "}— all through one intelligent, adaptive platform.
        </p>
      </div>

      {/* Enhanced value bullets with improved icons and animation */}
      <div className="animate-fade-in-up animate-delay-400">
        <ul className="space-y-8 text-lg lg:text-xl text-business-black/90">
          <li className="flex items-start gap-6 group cursor-default">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-future-green via-emerald to-future-green rounded-full flex items-center justify-center mt-1 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="leading-relaxed font-semibold group-hover:text-future-green transition-colors duration-300">
              AI-powered learning journeys, tailored in real time
            </span>
          </li>
          <li className="flex items-start gap-6 group cursor-default">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald via-future-green to-emerald rounded-full flex items-center justify-center mt-1 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
              <Zap className="w-5 h-5 text-white animate-pulse animate-delay-200" />
            </div>
            <span className="leading-relaxed font-semibold group-hover:text-future-green transition-colors duration-300">
              Built-in tools to drive innovation from the frontline
            </span>
          </li>
          <li className="flex items-start gap-6 group cursor-default">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-future-green via-emerald to-future-green rounded-full flex items-center justify-center mt-1 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
              <Target className="w-5 h-5 text-white animate-pulse animate-delay-400" />
            </div>
            <span className="leading-relaxed font-semibold group-hover:text-future-green transition-colors duration-300">
              Dashboards, insights, and skill mapping—automated
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeroContent;
