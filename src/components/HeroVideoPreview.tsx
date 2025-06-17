
import { useState } from "react";
import { Volume, VolumeOff } from "lucide-react";

const HERO_VIDEO_URL_MUTED = "https://www.youtube.com/embed/U-7THjkQdbg?autoplay=1&mute=1&loop=1&playlist=U-7THjkQdbg";
const HERO_VIDEO_URL_UNMUTED = "https://www.youtube.com/embed/U-7THjkQdbg?autoplay=1&loop=1&playlist=U-7THjkQdbg";

const HeroVideoPreview = () => {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl shadow-xl border border-future-green/30 overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
      {/* YouTube iframe preview */}
      <iframe
        className="w-full aspect-video"
        src={isMuted ? HERO_VIDEO_URL_MUTED : HERO_VIDEO_URL_UNMUTED}
        title="LXERA Demo Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      
      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-future-green/50 z-30"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? (
          <VolumeOff className="w-4 h-4" />
        ) : (
          <Volume className="w-4 h-4" />
        )}
      </button>
      
      {/* Video Overlay Label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/75 text-business-black/75 text-xs font-semibold rounded-full shadow-sm border border-future-green/30 transition-all group-hover:bg-white group-hover:text-business-black/90 z-20 select-none">
          Watch how LXERA works
        </span>
      </div>
      
      {/* Subtle hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-lg">
          LXERA Demo
        </span>
      </div>
    </div>
  );
};

export default HeroVideoPreview;
