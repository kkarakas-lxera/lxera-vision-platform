
const HeroVideoPreview = () => {
  // HeyGen embed URL
  const videoUrl = "https://app.heygen.com/embeds/18ee945cf2e541d3af61dceb6120dbec";

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl shadow-xl border border-future-green/30 overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
      {/* HeyGen iframe preview */}
      <iframe
        width="560"
        height="315"
        className="w-full aspect-video"
        src={videoUrl}
        title="HeyGen video player"
        frameBorder="0"
        allow="encrypted-media; fullscreen;"
        allowFullScreen
      />
      
      {/* Video Overlay Label - Hidden on mobile to avoid positioning issues */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/75 text-business-black/75 text-xs font-semibold rounded-full shadow-sm border border-future-green/30 transition-all group-hover:bg-white group-hover:text-business-black/90 z-20 select-none hidden sm:block">
          Watch how LXERA works
        </span>
      </div>
    </div>
  );
};

export default HeroVideoPreview;
