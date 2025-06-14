
import HeroContent from "./HeroContent";
import CTASection from "./CTASection";
import VideoPreview from "./VideoPreview";

const HeroSection = () => {
  return (
    <section className="hero w-full pt-24 pb-16 px-6 lg:px-8 bg-gradient-to-br from-smart-beige via-smart-beige to-future-green/5 relative overflow-hidden min-h-screen">
      {/* Enhanced decorative elements with better positioning */}
      <div className="absolute top-20 right-10 w-40 h-40 rounded-full blur-3xl bg-future-green/10 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full blur-2xl bg-future-green/15 animate-pulse animate-delay-1000"></div>
      <div className="absolute top-1/3 left-1/4 w-20 h-20 rounded-full blur-xl bg-future-green/8 animate-float-gentle"></div>
      <div className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full blur-lg bg-emerald/6 animate-float-gentle animate-delay-500"></div>
      
      <div className="container max-w-7xl mx-auto relative z-10 h-full">
        {/* Improved split-screen layout with better spacing */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center min-h-[85vh]">
          {/* Left side - Content (enhanced width distribution) */}
          <div className="lg:col-span-7 space-y-12">
            <HeroContent />
            <CTASection />
          </div>
          
          {/* Right side - Video (better proportions) */}
          <div className="lg:col-span-5">
            <VideoPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
