
const HeroContent = () => {
  return (
    <div className="text-center space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="headline text-4xl sm:text-5xl lg:text-7xl font-bold text-business-black leading-tight">
          The First<br />
          <span className="text-transparent bg-gradient-to-r from-business-black via-future-green to-business-black bg-clip-text animate-gradient-shift">
            Learning & Innovation
          </span><br />
          <span className="text-business-black">Experience Platform</span>
          <span className="text-future-green"> (LXIP)</span>
        </h1>
      </div>

      <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <p className="subheadline text-lg sm:text-xl lg:text-2xl text-business-black/80 max-w-5xl mx-auto font-medium leading-relaxed">
          Empower your teams to <strong>learn faster</strong>, <strong>build smarter</strong>, and <strong>innovate from the frontline</strong>—<br className="hidden md:block" />
          in one intelligent, adaptive ecosystem.
        </p>
      </div>

      <div className="animate-fade-in-scale" style={{animationDelay: '0.4s'}}>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-future-green to-transparent mx-auto animate-pulse-slow"></div>
      </div>
    </div>
  );
};

export default HeroContent;
