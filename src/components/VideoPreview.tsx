
import { useState } from "react";
import { Play, Volume2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import VideoModal from "./VideoModal";

const VideoPreview = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="animate-fade-in-up animate-delay-600">
      <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
        {/* Enhanced video thumbnail container */}
        <div className="relative aspect-video bg-gradient-to-br from-smart-beige to-future-green/10 rounded-3xl overflow-hidden shadow-2xl border-2 border-future-green/20 hover:border-future-green/40 transition-all duration-500">
          {/* Enhanced placeholder for video thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-br from-business-black/90 to-business-black/70 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-future-green/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-12 h-12 text-white ml-1" />
              </div>
              <h3 className="text-2xl font-bold mb-3">LXERA Platform Demo</h3>
              <p className="text-white/80 text-lg">See the future of learning & innovation</p>
            </div>
          </div>
          
          {/* Enhanced play overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl px-8 py-4 flex items-center gap-3 shadow-xl transform scale-95 group-hover:scale-100 transition-transform duration-300">
              <Volume2 className="w-5 h-5 text-business-black" />
              <span className="text-business-black font-bold text-lg">Play with sound</span>
            </div>
          </div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-future-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        
        {/* Enhanced subtitle */}
        <div className="text-center mt-6">
          <p className="text-business-black/70 text-base font-medium italic">
            *See why early adopters are already onboard.*
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-1 h-1 bg-future-green rounded-full"></div>
            <div className="w-1 h-1 bg-future-green rounded-full"></div>
            <div className="w-1 h-1 bg-future-green rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl w-full p-0 bg-black rounded-3xl border-2 border-future-green/20">
          <VideoModal />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoPreview;
