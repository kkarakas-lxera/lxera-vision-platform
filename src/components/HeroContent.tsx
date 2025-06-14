
import { ArrowRight } from "lucide-react";

const HeroContent = () => {
  return (
    <div className="text-left space-y-8">
      {/* Headline */}
      <div className="animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-business-black leading-tight tracking-tight">
          <span className="text-business-black">LXERA is the first</span><br />
          <span className="text-future-green">Learning & Innovation</span><br />
          <span className="text-business-black">Experience Platform</span><br />
          <span className="text-lg font-medium text-business-black/70 mt-2 block">(LXIP)</span>
        </h1>
      </div>

      {/* Subheadline */}
      <div className="animate-fade-in-up animate-delay-200">
        <p className="text-xl lg:text-2xl text-business-black/85 font-medium leading-relaxed max-w-2xl">
          Empower your teams to <strong className="text-future-green">learn faster</strong>, <strong className="text-future-green">build smarter</strong>, and <strong className="text-future-green">innovate from the inside out</strong> — all through one intelligent, adaptive platform.
        </p>
      </div>

      {/* Value bullets */}
      <div className="animate-fade-in-up animate-delay-400">
        <ul className="space-y-4 text-lg text-business-black/80">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-future-green mt-1 flex-shrink-0" />
            <span>AI-powered learning journeys, tailored in real time</span>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-future-green mt-1 flex-shrink-0" />
            <span>Built-in tools to drive innovation from the frontline</span>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-future-green mt-1 flex-shrink-0" />
            <span>Dashboards, insights, and skill mapping—automated</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeroContent;
