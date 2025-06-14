
import { useState } from "react";
import { Play } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import VideoModal from "./VideoModal";

const VideoPreview = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="animate-fade-in-up animate-delay-600">
      <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
        {/* Video thumbnail container */}
        <div className="relative aspect-video bg-gradient-to-br from-smart-beige to-future-green/10 rounded-2xl overflow-hidden shadow-xl border border-future-green/20">
          {/* Placeholder for video thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-br from-business-black/80 to-business-black/60 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-future-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2">LXERA Platform Demo</h3>
              <p className="text-white/80">See the future of learning & innovation</p>
            </div>
          </div>
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-2 shadow-lg">
              <Play className="w-5 h-5 text-business-black" />
              <span className="text-business-black font-semibold">Play with sound</span>
            </div>
          </div>
        </div>
        
        {/* Subtitle */}
        <p className="text-center text-business-black/60 text-sm mt-4 italic">
          *See why early adopters are already onboard.*
        </p>
      </div>

      {/* Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black rounded-2xl">
          <VideoModal />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoPreview;
