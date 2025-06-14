
import { useState } from "react";
import { Play, Volume2, Eye, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import VideoModal from "./VideoModal";

const VideoPreview = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="animate-fade-in-up animate-delay-600">
      <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
        {/* Enhanced video thumbnail container with better visual hierarchy */}
        <div className="relative aspect-video bg-gradient-to-br from-business-black via-business-black/95 to-business-black/90 rounded-3xl overflow-hidden shadow-2xl border-2 border-future-green/20 hover:border-future-green/50 transition-all duration-500 hover:shadow-[0_0_60px_rgba(122,229,198,0.4)] group-hover:scale-[1.02]">
          {/* Enhanced background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(122,229,198,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(2,156,85,0.08),transparent_70%)]"></div>
          
          {/* Main content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white relative z-10 px-8">
              {/* Enhanced play button */}
              <div className="w-32 h-32 bg-gradient-to-br from-future-green/40 via-emerald/30 to-future-green/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-500 shadow-2xl border border-white/20">
                <div className="w-24 h-24 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <Play className="w-12 h-12 text-white ml-1 drop-shadow-lg" />
                </div>
                {/* Pulsing rings */}
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border border-future-green/40 animate-pulse"></div>
              </div>
              
              {/* Enhanced title */}
              <h3 className="text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                LXERA Platform Demo
              </h3>
              
              {/* Enhanced subtitle */}
              <p className="text-white/90 text-xl lg:text-2xl font-medium mb-4">
                See the future of learning & innovation
              </p>
              
              {/* Feature highlights */}
              <div className="flex items-center justify-center gap-6 text-future-green/80 text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Live Demo
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  2 Min Tour
                </span>
              </div>
            </div>
          </div>
          
          {/* Enhanced play overlay with better interaction */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl px-10 py-5 flex items-center gap-5 shadow-2xl transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 border border-white/50">
              <Volume2 className="w-7 h-7 text-business-black" />
              <span className="text-business-black font-bold text-xl">Play with sound</span>
              <div className="w-2 h-2 bg-future-green rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Enhanced animated effects */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-future-green/5 via-transparent to-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Subtle animated border */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-future-green/40 group-hover:to-emerald/40 transition-all duration-500"></div>
        </div>
        
        {/* Enhanced subtitle with better design */}
        <div className="text-center mt-10">
          <p className="text-business-black/80 text-xl font-medium italic mb-4">
            <span className="text-future-green font-bold text-2xl">✨</span>
            See why early adopters are already onboard
            <span className="text-future-green font-bold text-2xl">✨</span>
          </p>
          
          {/* Enhanced indicator dots */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-future-green rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-future-green/70 rounded-full animate-pulse animate-delay-200"></div>
              <div className="w-2 h-2 bg-future-green/50 rounded-full animate-pulse animate-delay-400"></div>
              <div className="w-1 h-1 bg-future-green/30 rounded-full animate-pulse animate-delay-600"></div>
            </div>
          </div>
          
          {/* Call to action hint */}
          <p className="text-business-black/60 text-base font-medium mt-4 group-hover:text-future-green transition-colors duration-300">
            Click to watch the full demo
          </p>
        </div>
      </div>

      {/* Enhanced Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl w-full p-0 bg-black rounded-3xl border-2 border-future-green/30 shadow-2xl">
          <VideoModal />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoPreview;
