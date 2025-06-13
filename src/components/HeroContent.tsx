
const HeroContent = () => {
  return (
    <div className="text-center space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="headline text-4xl sm:text-5xl lg:text-7xl font-bold text-business-black leading-tight tracking-tight">
          The First<br />
          <span className="bg-clip-text animate-gradient-shift drop-shadow-sm text-brand-accent">
            Learning & Innovation
          </span><br />
          <span className="text-business-black drop-shadow-sm">Experience Platform</span>
          <span className="text-brand-accent drop-shadow-sm"> (LXIP)</span>
        </h1>
      </div>

      <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <p className="subheadline text-lg sm:text-xl lg:text-2xl text-business-black/85 max-w-5xl mx-auto font-medium leading-relaxed tracking-wide">
          Empower your teams to <strong className="text-brand-accent">learn faster</strong>, <strong className="text-brand-accent">build smarter</strong>, and <strong className="text-brand-accent">innovate from the frontline</strong>—<br className="hidden md:block" />
          in one intelligent, adaptive ecosystem.
        </p>
      </div>

      <div className="animate-fade-in-scale" style={{animationDelay: '0.4s'}}>
        <div className="w-32 h-1 mx-auto animate-pulse-slow shadow-lg bg-gradient-to-r from-transparent via-brand-accent to-transparent"></div>
      </div>
    </div>
  );
};

export default HeroContent;
