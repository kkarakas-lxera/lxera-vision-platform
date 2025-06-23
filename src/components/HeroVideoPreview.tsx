
import { useState, useRef } from "react";
import { Volume, VolumeOff, Play, Pause } from "lucide-react";

const HeroVideoPreview = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    
    // Send postMessage to YouTube iframe to toggle mute without restarting
    if (iframeRef.current) {
      const command = isMuted ? '{"event":"command","func":"unMute","args":""}' : '{"event":"command","func":"mute","args":""}';
      iframeRef.current.contentWindow?.postMessage(command, '*');
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    
    // Send postMessage to YouTube iframe to play/pause
    if (iframeRef.current) {
      const command = isPlaying ? '{"event":"command","func":"pauseVideo","args":""}' : '{"event":"command","func":"playVideo","args":""}';
      iframeRef.current.contentWindow?.postMessage(command, '*');
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlayPause(e);
  };

  // Always start muted to comply with autoplay policies
  const videoUrl = "https://www.youtube.com/embed/U-7THjkQdbg?autoplay=1&mute=1&loop=1&playlist=U-7THjkQdbg&enablejsapi=1&origin=" + window.location.origin;

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl shadow-xl border border-future-green/30 overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
      {/* YouTube iframe preview */}
      <iframe
        ref={iframeRef}
        className="w-full aspect-video cursor-pointer"
        src={videoUrl}
        title="LXERA Demo Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onClick={handleVideoClick}
      />
      
      {/* Control buttons container */}
      <div className="absolute top-4 right-4 flex gap-3 z-30">
        {/* Play/Pause Button - YouTube logic: shows OPPOSITE of current state */}
        <button
          onClick={togglePlayPause}
          className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-future-green/50 shadow-lg backdrop-blur-sm"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>
        
        {/* Mute/Unmute Button - YouTube logic: shows CURRENT state */}
        <button
          onClick={toggleMute}
          className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-future-green/50 shadow-lg backdrop-blur-sm"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? (
            <VolumeOff className="w-5 h-5" />
          ) : (
            <Volume className="w-5 h-5" />
          )}
        </button>
      </div>
      
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
