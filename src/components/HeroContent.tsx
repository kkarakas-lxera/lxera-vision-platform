
const HeroContent = () => {
  return (
    <div className="text-center space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="headline text-4xl sm:text-5xl lg:text-7xl font-bold text-business-black leading-tight tracking-tight">
          LXERA is the first<br />
          <span className="bg-clip-text animate-gradient-shift drop-shadow-sm text-future-green text-5xl sm:text-6xl lg:text-8xl font-extrabold">
            Experience Platform
          </span><br />
          <span className="text-business-black drop-shadow-sm">for Learning & Innovation</span>
          <span className="text-future-green drop-shadow-sm"> (LXIP)</span>
        </h1>
      </div>

      <div className="animate-fade-in-up animate-delay-200">
        <p className="subheadline text-lg sm:text-xl lg:text-2xl text-business-black/85 max-w-5xl mx-auto font-medium leading-relaxed tracking-wide">
          Empower your teams to <strong className="text-future-green">learn faster</strong>, <strong className="text-future-green">build smarter</strong>, and <strong className="text-future-green">innovate from the inside out</strong>—<br className="hidden md:block" />
          all through one adaptive, intelligent platform.
        </p>
      </div>

      <div className="animate-fade-in-scale animate-delay-400">
        <div className="w-32 h-1 mx-auto animate-pulse-slow shadow-lg bg-gradient-to-r from-transparent via-future-green to-transparent"></div>
      </div>
    </div>
  );
};

export default HeroContent;
