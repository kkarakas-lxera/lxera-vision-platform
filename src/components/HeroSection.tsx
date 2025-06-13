
import { Button } from "@/components/ui/button";
import { Play, ArrowDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="hero w-full py-20 px-6 lg:px-12">
      <div className="container max-w-7xl mx-auto text-center animate-fade-in">
        <h1 className="headline text-5xl lg:text-7xl font-bold text-business-black mb-8 leading-tight">
          The First<br />
          <span className="text-future-green">Learning & Innovation</span><br />
          Experience Platform (LXIP)
        </h1>

        <p className="subheadline text-xl lg:text-2xl text-business-black/80 mb-12 max-w-5xl mx-auto font-medium">
          Empower your teams to learn faster, build smarter, and innovate from the frontline—<br />
          in one intelligent, adaptive ecosystem.
        </p>

        <div className="cta-buttons flex flex-col sm:flex-row gap-6 justify-center items-center" style={{marginTop: '1.5rem'}}>
          <Button 
            size="lg" 
            className="btn btn-primary bg-future-green text-business-black hover:bg-emerald hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
          >
            Book a Demo
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="btn btn-outline border-2 border-business-black text-business-black hover:bg-business-black hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
          >
            <Play className="w-5 h-5 mr-2" />
            Watch 2-Min Intro
          </Button>
        </div>

        <p className="early-access-note" style={{marginTop:'1.2rem', fontSize:'0.95rem', color:'#666'}}>
          🚀 <strong>Early access now open</strong> for teams shaping the future of adaptive learning.<br />
          Join our innovation wave and help define what LXERA becomes.
        </p>

        <div className="stat-strip" style={{marginTop:'2rem', display:'flex', justifyContent:'center', gap:'2rem', fontWeight:'bold', fontSize:'0.9rem'}}>
          <span>📈 85% Retention Boost</span>
          <span>⚡ 60% Faster Learning</span>
          <span>💬 3× Engagement</span>
          <span>💡 72% Innovation Lift</span>
        </div>

        {/* Fine print for stats transparency */}
        <p className="text-xs text-business-black/60 mt-2 max-w-2xl mx-auto">
          *Based on industry research & projected benchmarks
        </p>

        {/* Video Preview Container */}
        <div className="video-preview-container mt-12 max-w-4xl mx-auto relative">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="preview-video w-full h-64 lg:h-96 object-cover rounded-2xl lxera-shadow"
          >
            <source src="your-preview-snippet.mp4" type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
          <div className="video-overlay absolute inset-0 flex items-center justify-center bg-business-black/20 rounded-2xl">
            <Button 
              onClick={() => window.open('your-full-video-url', '_blank')} 
              className="play-full-btn bg-future-green text-business-black hover:bg-emerald hover:text-white px-8 py-4 rounded-full font-semibold lxera-hover text-lg"
            >
              ▶ See LXERA in Action
            </Button>
          </div>
        </div>
        
        <div className="mt-16 animate-float">
          <ArrowDown className="w-8 h-8 text-business-black/60 mx-auto" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
