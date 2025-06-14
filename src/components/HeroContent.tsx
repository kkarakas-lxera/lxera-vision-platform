
const HeroContent = () => {
  return (
    <div className="text-center space-y-10">
      <div className="animate-fade-in-up">
        <h1 className="headline text-4xl sm:text-5xl lg:text-7xl font-bold text-business-black leading-tight tracking-tight">
          <span className="block text-business-black">LXERA is the first</span>
          <span className="block drop-shadow-sm" style={{ color: '#aeb171' }}>
            Learning & Innovation
          </span>
          <span className="block text-business-black drop-shadow-sm">Experience Platform</span>
        </h1>
      </div>

      <div className="animate-fade-in-up animate-delay-200">
        <p className="subheadline text-lg sm:text-xl lg:text-2xl text-business-black/85 max-w-3xl mx-auto font-medium leading-relaxed">
          Empower teams to{" "}
          <b className="text-business-black">learn faster,</b>
          <br className="hidden sm:block" />
          <b className="text-business-black"> innovate deeper,</b>
          <br className="hidden sm:block" />
          and <b className="text-business-black">grow</b> from the frontline—
          <br className="hidden sm:block" />
          in one intelligent ecosystem.
        </p>
      </div>

      <div className="animate-fade-in-scale animate-delay-400">
        <div className="w-32 h-1 mx-auto animate-pulse-slow shadow-lg bg-gradient-to-r from-transparent via-future-green to-transparent"></div>
      </div>
    </div>
  );
};

export default HeroContent;

