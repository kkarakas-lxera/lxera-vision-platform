
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
        {/* Split-screen layout matching the reference image */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
          {/* Left side - Content (7 columns) */}
          <div className="lg:col-span-7 space-y-8">
            <HeroContent />
            <CTASection />
          </div>
          
          {/* Right side - Video/Image (5 columns) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-future-green/20">
              <div className="aspect-[4/3]">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/lovable-uploads/ad266e9b-bcd8-44ce-9e4f-3331c75997c0.png"
                >
                  <source src="your-product-demo.mp4" type="video/mp4" />
                  {/* Fallback image */}
                  <img 
                    src="/lovable-uploads/ad266e9b-bcd8-44ce-9e4f-3331c75997c0.png" 
                    alt="LXERA Platform Demo"
                    className="w-full h-full object-cover"
                  />
                </video>
              </div>
              
              {/* Video controls overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[8px] border-l-business-black border-y-[6px] border-y-transparent ml-1"></div>
                  </div>
                </div>
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
