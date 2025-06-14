
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Loader2, AlertCircle } from "lucide-react";

const VideoModal = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset states when closing
      setIsLoading(true);
      setHasError(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="btn btn-primary bg-future-green text-business-black hover:bg-future-green/90 hover:scale-110 hover:shadow-2xl active:scale-95 text-lg px-10 py-5 rounded-full font-semibold transition-all duration-300 shadow-xl hover:shadow-future-green/30 border-2 border-white/30 hover:border-white/60 group relative overflow-hidden focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
          aria-label="Watch LXERA in Action (video demonstration)"
        >
          <span className="relative z-10 drop-shadow-sm flex items-center">
            <Play className="w-5 h-5 mr-2 text-business-black group-hover:text-business-black transition-colors" />
            Watch LXERA in Action (2 Min)
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 bg-black rounded-2xl" aria-describedby="video-description">
        <div className="aspect-video w-full relative rounded-2xl overflow-hidden">
          <div id="video-description" className="sr-only">
            LXERA platform demonstration video showing key features and benefits
          </div>
          
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-business-black/90 rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-future-green animate-spin mx-auto mb-3" />
                <p className="text-white text-sm">Loading video...</p>
              </div>
            </div>
          )}
          
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-business-black/90 rounded-lg text-white p-8">
              <AlertCircle className="w-16 h-16 text-future-green mb-4" />
              <h3 className="text-lg mb-2 font-semibold">Video Preview Coming Soon</h3>
              <p className="text-sm text-white/70 text-center mb-4">
                Our demo video is currently being prepared and will be available shortly.
              </p>
              <Button 
                onClick={() => setIsOpen(false)}
                className="bg-white text-business-black hover:bg-future-green hover:text-business-black border border-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <video 
              controls 
              autoPlay
              className="w-full h-full object-cover rounded-lg"
              poster="/placeholder.svg"
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              aria-label="LXERA platform demonstration"
              preload="metadata"
            >
              <source src="your-demo-video.mp4" type="video/mp4" />
              <track kind="captions" src="demo-captions.vtt" srcLang="en" label="English" />
              Your browser does not support HTML5 video.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
