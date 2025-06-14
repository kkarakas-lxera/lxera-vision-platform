
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoModal from "./VideoModal";

const HeroContent = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
      {/* Left Side - Content */}
      <div className="space-y-8 text-left lg:pr-8">
        <div className="animate-fade-in-up">
          <h1 className="headline text-4xl sm:text-5xl lg:text-6xl font-bold text-business-black leading-tight tracking-tight">
            LXERA is the first{" "}
            <span className="drop-shadow-sm" style={{ color: '#7AE5C6' }}>
              Learning & Innovation Experience Platform
            </span>{" "}
            (LXIP)
          </h1>
        </div>

        <div className="animate-fade-in-up animate-delay-200">
          <p className="subheadline text-lg lg:text-xl text-business-black/85 font-medium leading-relaxed max-w-2xl">
            Empower your teams to learn faster, build smarter, and innovate from the inside out — all through one intelligent, adaptive platform.
          </p>
        </div>

        {/* Value Bullets */}
        <div className="animate-fade-in-up animate-delay-300 space-y-4">
          <div className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-future-green mt-1 flex-shrink-0" />
            <p className="text-business-black/80 font-medium">
              AI-powered learning journeys, tailored in real time
            </p>
          </div>
          <div className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-future-green mt-1 flex-shrink-0" />
            <p className="text-business-black/80 font-medium">
              Built-in tools to drive innovation from the frontline
            </p>
          </div>
          <div className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-future-green mt-1 flex-shrink-0" />
            <p className="text-business-black/80 font-medium">
              Dashboards, insights, and skill mapping—automated
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up animate-delay-400 flex flex-col sm:flex-row gap-4">
          <Button 
            size="lg" 
            className="bg-future-green text-business-black hover:bg-emerald hover:text-white text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-white/20 group"
            aria-label="Try the LXERA Experience"
          >
            🚀 Try the LXERA Experience
          </Button>
          
          <VideoModal />
        </div>
      </div>

      {/* Right Side - Video Preview */}
      <div className="animate-fade-in-scale animate-delay-500">
        <div className="relative aspect-video bg-gradient-to-br from-future-green/10 to-emerald/10 rounded-2xl overflow-hidden border border-future-green/20 shadow-2xl group hover:shadow-future-green/20 transition-all duration-300">
          {/* Video Thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-br from-business-black/80 to-business-black/60 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-future-green/90 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300 cursor-pointer">
                <Play className="w-8 h-8 text-business-black ml-1" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-semibold text-lg">▶ Play with sound</p>
                <p className="text-white/80 text-sm">Product Walkthrough</p>
              </div>
            </div>
          </div>
          
          {/* Background pattern/texture */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full blur-xl bg-future-green/30"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full blur-lg bg-emerald/40"></div>
          </div>
        </div>
        
        {/* Video Subtitle */}
        <p className="text-center text-business-black/70 text-sm mt-4 italic">
          *See why early adopters are already onboard.*
        </p>
      </div>
    </div>
  );
};

export default HeroContent;
