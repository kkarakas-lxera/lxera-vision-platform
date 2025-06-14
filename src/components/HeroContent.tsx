
const HeroContent = () => {
  return (
    <div className="w-full flex flex-col lg:flex-row lg:justify-center lg:items-center">
      <div className="w-full lg:max-w-2xl mx-auto text-center space-y-10">
        {/* Headline */}
        <div className="animate-fade-in-up">
          <h1 className="headline text-4xl sm:text-5xl lg:text-7xl font-bold text-business-black leading-tight tracking-tight">
            LXERA is the first<br />
            <span
              className="drop-shadow-sm"
              style={{ color: '#B1B973' }}
            >
              Learning & Innovation
            </span>
            <br />
            Experience Platform
          </h1>
        </div>

        {/* Subheadline */}
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

        {/* Divider */}
        <div className="animate-fade-in-scale animate-delay-400">
          <div className="w-32 h-1 mx-auto animate-pulse-slow shadow-lg bg-gradient-to-r from-transparent via-future-green to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;

