
const HeroContent = () => {
  return (
    <div className="text-center space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="headline text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold text-business-black leading-[1.1] tracking-tight">
          The First<br />
          <span className="relative inline-block">
            <span className="bg-clip-text animate-gradient-shift drop-shadow-sm text-future-green relative z-10">
              Learning & Innovation
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-future-green/20 to-emerald/20 blur-xl animate-pulse-slow -z-10"></div>
          </span><br />
          <span className="text-business-black drop-shadow-sm">Experience Platform</span>
          <span className="text-future-green drop-shadow-sm font-extrabold"> (LXIP)</span>
        </h1>
      </div>

      <div className="animate-fade-in-up animate-delay-200">
        <p className="subheadline text-lg sm:text-xl lg:text-2xl xl:text-3xl text-business-black/85 max-w-6xl mx-auto font-medium leading-relaxed tracking-wide">
          Empower your teams to <strong className="text-future-green font-semibold">learn faster</strong>, <strong className="text-future-green font-semibold">build smarter</strong>, and <strong className="text-future-green font-semibold">innovate from the frontline</strong>—<br className="hidden md:block" />
          in one intelligent, adaptive ecosystem.
        </p>
      </div>

      {/* Enhanced decorative divider */}
      <div className="animate-fade-in-scale animate-delay-400">
        <div className="flex items-center justify-center space-x-4">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-future-green animate-pulse-slow"></div>
          <div className="w-3 h-3 rounded-full bg-future-green animate-pulse shadow-lg"></div>
          <div className="w-32 h-px bg-gradient-to-r from-future-green via-future-green to-future-green animate-pulse-slow shadow-lg"></div>
          <div className="w-3 h-3 rounded-full bg-future-green animate-pulse shadow-lg"></div>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-future-green animate-pulse-slow"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
