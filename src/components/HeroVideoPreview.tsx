
const HeroVideoPreview = () => {
  // Google Drive video embed URL
  // Original: https://drive.google.com/file/d/1gJjvAJFs-JCQrxHtSr-Iq-ZMwDJA2ElS/view?usp=sharing
  // Converted to embed format: /preview instead of /view
  const videoUrl = "https://drive.google.com/file/d/1gJjvAJFs-JCQrxHtSr-Iq-ZMwDJA2ElS/preview";

  // Add parameters that might work with Google Drive
  // Note: Google Drive has limited support for these parameters
  const videoUrlWithParams = `${videoUrl}?autoplay=1&mute=1&cc_load_policy=1&start=1`;

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl shadow-2xl border-2 border-future-green/20 overflow-hidden transition-all duration-300 group">
      {/* Google Drive video preview - with autoplay attempt */}
      <iframe
        width="896"
        height="504"
        className="w-full aspect-video"
        src={videoUrlWithParams}
        title="LXERA Demo Video"
        frameBorder="0"
        allow="autoplay; encrypted-media; fullscreen;"
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
