
const HeroSection = () => {
  return (
    <section className="hero w-full min-h-screen bg-business-black relative overflow-hidden flex items-center">
      {/* Subtle decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full blur-xl animate-pulse bg-future-green/10"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full blur-lg animate-pulse bg-future-green/8 animate-delay-1000"></div>
      
      <div className="container max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                LXERA is the first{" "}
                <span className="text-future-green">
                  Learning & Innovation Experience Platform
                </span>{" "}
                (LXIP)
              </h1>
            </div>

            <div className="animate-fade-in-up animate-delay-200">
              <p className="text-lg lg:text-xl text-white/85 font-medium leading-relaxed max-w-2xl">
                Empower your teams to learn faster, build smarter, and innovate from the inside out — all through one intelligent, adaptive platform.
              </p>
            </div>

            {/* Value Bullets */}
            <div className="animate-fade-in-up animate-delay-300 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-future-green/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-future-green"></div>
                </div>
                <p className="text-white/90 font-medium text-lg">
                  AI-powered learning journeys, tailored in real time
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-future-green/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-future-green"></div>
                </div>
                <p className="text-white/90 font-medium text-lg">
                  Built-in tools to drive innovation from the frontline
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-future-green/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-future-green"></div>
                </div>
                <p className="text-white/90 font-medium text-lg">
                  Dashboards, insights, and skill mapping—automated
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up animate-delay-400 flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-future-green text-business-black hover:bg-future-green/90 text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                🚀 Try the LXERA Experience
              </button>
              
              <button className="bg-transparent text-white border-2 border-white/30 hover:bg-white hover:text-business-black text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                ▶ See How It Works (2 Min)
              </button>
            </div>
          </div>

          {/* Right Side - Video */}
          <div className="animate-fade-in-scale animate-delay-500">
            <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              {/* Video Thumbnail/Preview */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700/80 to-gray-900/60 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                    <p className="text-white font-medium text-sm">Play with sound</p>
                  </div>
                </div>
              </div>
              
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-4 w-32 h-32 rounded-full blur-xl bg-future-green/20"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full blur-lg bg-future-green/30"></div>
              </div>
            </div>
            
            {/* Video Subtitle */}
            <p className="text-center text-white/60 text-sm mt-4 italic">
              *See why early adopters are already onboard.*
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
