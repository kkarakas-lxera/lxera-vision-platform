
import { useState } from "react";
import { Play, Volume2, Eye } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import VideoModal from "./VideoModal";

const VideoPreview = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="animate-fade-in-up animate-delay-600">
      <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
        {/* Enhanced video thumbnail container */}
        <div className="relative aspect-video bg-gradient-to-br from-business-black/95 to-business-black/80 rounded-3xl overflow-hidden shadow-2xl border border-future-green/20 hover:border-future-green/40 transition-all duration-500 hover:shadow-[0_0_50px_rgba(122,229,198,0.3)]">
          {/* Enhanced placeholder for video thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-br from-business-black/90 to-business-black/70 flex items-center justify-center">
            <div className="text-center text-white relative z-10">
              <div className="w-28 h-28 bg-gradient-to-br from-future-green/30 to-emerald/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-500 shadow-xl">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                LXERA Platform Demo
              </h3>
              <p className="text-white/90 text-xl font-medium">
                See the future of learning & innovation
              </p>
            </div>
          </div>
          
          {/* Enhanced play overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl px-8 py-4 flex items-center gap-4 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <Volume2 className="w-6 h-6 text-business-black" />
              <span className="text-business-black font-bold text-lg">Play with sound</span>
              <Eye className="w-6 h-6 text-future-green" />
            </div>
          </div>

          {/* Animated glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-future-green/10 to-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Subtle border animation */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-future-green/30 transition-colors duration-500"></div>
        </div>
        
        {/* Enhanced subtitle with better styling */}
        <div className="text-center mt-8">
          <p className="text-business-black/80 text-lg font-medium italic mb-3">
            <span className="text-future-green font-semibold">*</span>
            See why early adopters are already onboard.
            <span className="text-future-green font-semibold">*</span>
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 bg-future-green rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-future-green/60 rounded-full animate-pulse animate-delay-200"></div>
            <div className="w-2 h-2 bg-future-green/40 rounded-full animate-pulse animate-delay-400"></div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl w-full p-0 bg-black rounded-3xl border-2 border-future-green/20 shadow-2xl">
          <VideoModal />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoPreview;
