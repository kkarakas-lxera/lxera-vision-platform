
import HeroContent from "./HeroContent";
import CTASection from "./CTASection";
import HeroStats from "./HeroStats";

const HeroSection = () => {
  return (
    <section className="hero w-full pt-32 pb-16 px-6 lg:px-12 bg-smart-beige relative overflow-hidden">
      {/* Enhanced decorative elements with improved color harmony */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/6 via-transparent to-future-green/4"></div>
      <div className="absolute top-20 right-10 w-40 h-40 rounded-full blur-xl animate-pulse bg-gradient-to-br from-future-green/12 to-emerald/8"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full blur-lg animate-pulse bg-gradient-to-br from-future-green/15 to-future-green/10 animate-delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full blur-md animate-pulse bg-future-green/8 animate-delay-2000"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full blur-lg animate-pulse bg-future-green/12 animate-delay-500"></div>
      
      <div className="container max-w-7xl mx-auto relative z-10">
        {/* Split-screen layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Left side - Content */}
          <div className="space-y-8">
            <HeroContent />
            <CTASection />
          </div>
          
          {/* Right side - Video */}
          <div className="lg:order-last">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/5 backdrop-blur-sm border border-future-green/20">
              <div className="aspect-video">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/placeholder.svg"
                >
                  <source src="your-product-demo.mp4" type="video/mp4" />
                  <div className="w-full h-full bg-gradient-to-br from-future-green/20 to-emerald/10 flex items-center justify-center">
                    <p className="text-business-black/60 text-center px-4">
                      Product demo video will appear here
                    </p>
                  </div>
                </video>
              </div>
              
              {/* Video overlay indicator */}
              <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                Live Demo
              </div>
            </div>
          </div>
        </div>
        
        <HeroStats />
      </div>
    </section>
  );
};

export default HeroSection;
