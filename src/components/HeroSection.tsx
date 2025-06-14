
import HeroContent from "./HeroContent";
import CTASection from "./CTASection";
import VideoPreview from "./VideoPreview";

const HeroSection = () => {
  return (
    <section className="hero w-full pt-32 pb-16 px-6 lg:px-12 bg-gradient-to-br from-smart-beige via-smart-beige to-future-green/5 relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full blur-3xl bg-future-green/8 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full blur-2xl bg-future-green/10 animate-pulse animate-delay-1000"></div>
      
      <div className="container max-w-7xl mx-auto relative z-10">
        {/* Split-screen layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
          {/* Left side - Content */}
          <div className="space-y-8">
            <HeroContent />
            <CTASection />
          </div>
          
          {/* Right side - Video */}
          <div className="lg:pl-8">
            <VideoPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
