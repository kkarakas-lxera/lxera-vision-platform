
const HeroContent = () => {
  return (
    <div className="hero-content w-full flex flex-col lg:flex-row lg:justify-between lg:items-center lg:gap-12">
      <div className="w-full lg:w-1/2 text-left lg:text-left space-y-8">
        {/* Headline */}
        <div className="animate-fade-in-up">
          <h1 className="headline text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-business-black leading-tight tracking-tight">
            <span>
              LXERA is the first
            </span>
            <br />
            <span
              className="block drop-shadow-sm"
              style={{ color: '#B1B973' }}
            >
              Learning & Innovation
            </span>
            <span>
              Experience Platform
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <div className="animate-fade-in-up animate-delay-200">
          <p className="subheadline text-base xs:text-lg sm:text-xl lg:text-xl text-business-black/85 font-medium leading-relaxed">
            Empower teams to{" "}
            <b className="text-business-black">learn faster,</b>{" "}
            <b className="text-business-black">innovate deeper,</b>{" "}
            and <b className="text-business-black">grow</b> from the frontline—
            in one intelligent ecosystem.
          </p>
        </div>

        {/* Divider */}
        <div className="animate-fade-in-scale animate-delay-400">
          <div className="w-32 h-1 animate-pulse-slow shadow-lg bg-gradient-to-r from-transparent via-future-green to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
