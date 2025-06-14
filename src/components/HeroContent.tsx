
const HeroContent = () => {
  return (
    <div className="text-left space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="headline text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-business-black leading-tight tracking-tight">
          <span className="text-business-black">LXERA is the first</span><br />
          <span className="drop-shadow-sm" style={{ color: '#BFCB80' }}>
            Learning & Innovation<br />
            Experience
          </span>
          <span className="text-business-black drop-shadow-sm"> Platform</span>
        </h1>
      </div>

      <div className="animate-fade-in-up animate-delay-200">
        <p className="subheadline text-lg sm:text-xl lg:text-2xl text-business-black/85 max-w-2xl font-medium leading-relaxed">
          Empower your teams to <strong className="text-future-green">learn faster</strong>, <strong className="text-future-green">build smarter</strong>, and <strong className="text-future-green">innovate from the frontline</strong>—in one intelligent, adaptive ecosystem.
        </p>
      </div>
    </div>
  );
};

export default HeroContent;
