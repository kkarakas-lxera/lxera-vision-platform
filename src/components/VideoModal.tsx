
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
          variant="outline" 
          className="btn btn-outline border-2 border-business-black text-business-black hover:bg-business-black hover:text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 group min-h-[3rem] focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2"
          aria-label="Watch LXERA platform demonstration video"
        >
          <Play className="w-5 h-5 mr-2 text-business-black/90 group-hover:text-white transition-colors" />
          Watch LXERA in Action (2 Min)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 bg-black rounded-2xl">
        <div className="aspect-video w-full relative rounded-2xl overflow-hidden">
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
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-business-black"
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
