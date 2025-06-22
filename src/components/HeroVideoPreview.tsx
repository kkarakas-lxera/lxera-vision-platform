
import { useState, useRef } from "react";
import { Volume, VolumeOff, Play, Pause, Maximize } from "lucide-react";

const HeroVideoPreview = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    
    if (iframeRef.current) {
      const command = isMuted ? '{"event":"command","func":"unMute","args":""}' : '{"event":"command","func":"mute","args":""}';
      iframeRef.current.contentWindow?.postMessage(command, '*');
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    
    if (iframeRef.current) {
      const command = isPlaying ? '{"event":"command","func":"pauseVideo","args":""}' : '{"event":"command","func":"playVideo","args":""}';
      iframeRef.current.contentWindow?.postMessage(command, '*');
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlayPause(e);
  };

  const videoUrl = "https://www.youtube.com/embed/U-7THjkQdbg?autoplay=1&mute=1&loop=1&playlist=U-7THjkQdbg&enablejsapi=1&origin=" + window.location.origin;

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto rounded-3xl shadow-2xl border-2 border-future-green/30 overflow-hidden hover:scale-[1.02] hover:shadow-3xl transition-all duration-500 group bg-gradient-to-br from-white/90 to-smart-beige/50 backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced video container */}
      <div className="relative">
        <iframe
          ref={iframeRef}
          className="w-full aspect-video cursor-pointer"
          src={videoUrl}
          title="LXERA Demo Video - See How Learning Transforms Innovation"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onClick={handleVideoClick}
        />
        
        {/* Enhanced overlay with better visibility */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Enhanced control buttons */}
        <div className={`absolute top-4 right-4 flex gap-2 z-30 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-1'}`}>
          <button
            onClick={togglePlayPause}
            className="p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-future-green/50 shadow-xl backdrop-blur-sm border border-white/20"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          
          <button
            onClick={toggleMute}
            className="p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-future-green/50 shadow-xl backdrop-blur-sm border border-white/20"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <VolumeOff className="w-5 h-5" />
            ) : (
              <Volume className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Enhanced video label with better positioning */}
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-1'}`}>
          <div className="px-6 py-3 bg-white/95 backdrop-blur-sm text-business-black text-sm font-semibold rounded-full shadow-lg border border-future-green/30 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Watch LXERA Transform Learning</span>
            <Maximize className="w-4 h-4 opacity-60" />
          </div>
        </div>
      </div>
      
      {/* Enhanced glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-future-green/50 to-emerald/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur"></div>
    </div>
  );
};

export default HeroVideoPreview;
