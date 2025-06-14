
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";

const HeroContent = () => {
  return (
    <div className="text-left space-y-8">
      {/* Enhanced headline with better typography */}
      <div className="animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-business-black leading-[1.1] tracking-tight">
          <span className="text-business-black">LXERA is the first</span><br />
          <span className="text-future-green bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">
            Learning & Innovation
          </span><br />
          <span className="text-business-black">Experience Platform</span><br />
          <span className="text-base lg:text-lg font-medium text-business-black/70 mt-3 block tracking-wider">
            (LXIP)
          </span>
        </h1>
      </div>

      {/* Enhanced subheadline */}
      <div className="animate-fade-in-up animate-delay-200">
        <p className="text-xl lg:text-2xl xl:text-3xl text-business-black/85 font-medium leading-relaxed max-w-2xl">
          Empower your teams to <strong className="text-future-green font-semibold">learn faster</strong>, <strong className="text-future-green font-semibold">build smarter</strong>, and <strong className="text-future-green font-semibold">innovate from the inside out</strong> — all through one intelligent, adaptive platform.
        </p>
      </div>

      {/* Enhanced value bullets with better icons */}
      <div className="animate-fade-in-up animate-delay-400">
        <ul className="space-y-5 text-lg lg:text-xl text-business-black/80">
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0 w-6 h-6 bg-future-green/10 rounded-full flex items-center justify-center mt-1">
              <Sparkles className="w-3 h-3 text-future-green" />
            </div>
            <span className="leading-relaxed">AI-powered learning journeys, tailored in real time</span>
          </li>
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0 w-6 h-6 bg-future-green/10 rounded-full flex items-center justify-center mt-1">
              <Zap className="w-3 h-3 text-future-green" />
            </div>
            <span className="leading-relaxed">Built-in tools to drive innovation from the frontline</span>
          </li>
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0 w-6 h-6 bg-future-green/10 rounded-full flex items-center justify-center mt-1">
              <Target className="w-3 h-3 text-future-green" />
            </div>
            <span className="leading-relaxed">Dashboards, insights, and skill mapping—automated</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeroContent;
