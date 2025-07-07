
const HeroVideoPreview = () => {
  // YouTube video embed URL with autoplay, muted, and captions
  // Original: https://youtu.be/NDLauMIM0hU
  const videoId = "NDLauMIM0hU";
  const videoUrl = `https://www.youtube.com/embed/${videoId}`;
  
  // Add YouTube parameters for autoplay, mute, captions, and loop
  const videoUrlWithParams = `${videoUrl}?autoplay=1&mute=1&cc_load_policy=1&loop=1&playlist=${videoId}&modestbranding=1&rel=0`;

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl shadow-2xl border-2 border-future-green/20 overflow-hidden transition-all duration-300 group">
      {/* YouTube video with autoplay, muted, and captions */}
      <iframe
        width="896"
        height="504"
        className="w-full aspect-video"
        src={videoUrlWithParams}
        title="LXERA Demo Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
