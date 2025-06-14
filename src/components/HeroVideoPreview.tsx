
import { useState } from "react";
import VideoModal from "./VideoModal";

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
        <video
          className="w-full object-cover aspect-video"
          src="your-demo-video.mp4"
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
        {/* Fallback play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition">
          <span className="flex items-center justify-center bg-white/90 rounded-full shadow-md w-16 h-16 border-2 border-future-green drop-shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#6cd4b4" strokeWidth="2"><polygon points="9.5,7.5 16.5,12 9.5,16.5" fill="#40b69e" /></svg>
          </span>
        </div>
      </div>
      {/* Tiny line under play button */}
      <div className="w-full max-w-xl mx-auto mt-2 flex flex-col items-center">
        <span className="block h-0.5 w-16 bg-gradient-to-r from-transparent via-future-green to-transparent mb-1 rounded-full opacity-80" />
        <span className="text-sm text-business-black/60 font-medium tracking-wide">
          Watch how LXERA works in 90 seconds
        </span>
      </div>
      <VideoModal isOpen={open} setIsOpen={setOpen} />
    </>
  );
};

export default HeroVideoPreview;
