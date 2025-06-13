
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";

const VideoModal = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          variant="outline" 
          className="btn btn-outline border-2 border-business-black text-business-black hover:bg-business-black hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover group"
        >
          <Play className="w-5 h-5 mr-2 text-business-black/90 group-hover:text-white transition-colors" />
          Watch LXERA in Action (2 Min)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 bg-black">
        <div className="aspect-video w-full relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-business-black/90 rounded-lg">
              <Loader2 className="w-8 h-8 text-future-green animate-spin" />
            </div>
          )}
          
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-business-black/90 rounded-lg text-white">
              <Play className="w-16 h-16 text-future-green mb-4" />
              <p className="text-lg mb-2">Video Preview Coming Soon</p>
              <p className="text-sm text-white/70">Demo video will be available shortly</p>
            </div>
          ) : (
            <video 
              controls 
              autoPlay
              className="w-full h-full object-cover rounded-lg"
              poster="/placeholder.svg"
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
            >
              <source src="your-demo-video.mp4" type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
