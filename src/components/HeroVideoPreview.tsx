
import { useState } from "react";
import VideoModal from "./VideoModal";

const HERO_VIDEO_URL = "your-demo-video.mp4";
const HERO_VIDEO_CAPTION = "LXERA 90-second overview";

const HeroVideoPreview = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="relative w-full max-w-xl mx-auto rounded-2xl shadow-xl border border-future-green/30 overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
        aria-label="Watch LXERA in Action (video demonstration)"
        tabIndex={0}
        onKeyDown={e => (e.key === "Enter" ? setOpen(true) : undefined)}
        role="button"
      >
        {/* Auto-playing video preview */}
        <video
          className="w-full object-cover aspect-video"
          src={HERO_VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          poster="/placeholder.svg"
        />
        
        {/* Video Overlay Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/75 text-business-black/75 text-xs font-semibold rounded-full shadow-sm border border-future-green/30 transition-all group-hover:bg-white group-hover:text-business-black/90 z-20 select-none">
            Watch how LXERA works
          </span>
        </div>
        
        {/* Subtle hover overlay - no play button needed since video autoplays */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-lg">
            Click to expand
          </span>
        </div>
      </div>
      <VideoModal 
        isOpen={open}
        setIsOpen={setOpen}
        videoUrl={HERO_VIDEO_URL}
        videoCaption={HERO_VIDEO_CAPTION}
      />
    </>
  );
};

export default HeroVideoPreview;
