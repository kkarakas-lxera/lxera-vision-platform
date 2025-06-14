
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  videoUrl: string;
  videoCaption?: string;
}

const VideoModal = ({ isOpen, setIsOpen, videoUrl, videoCaption }: VideoModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
      setIsLoading(true);
      setHasError(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 bg-black rounded-2xl" aria-describedby="video-desc">
        <div className="aspect-video w-full relative rounded-2xl overflow-hidden">
          <div id="video-desc" className="sr-only">
            LXERA feature demo video {videoCaption ?? ""}
          </div>
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-business-black/80 rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-future-green animate-spin mx-auto mb-3" />
                <p className="text-white text-sm">Loading video…</p>
              </div>
            </div>
          )}
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-business-black/90 rounded-lg text-white p-8">
              <AlertCircle className="w-16 h-16 text-future-green mb-4" />
              <h3 className="text-lg mb-2 font-semibold">Video Unavailable</h3>
              <p className="text-sm text-white/70 text-center mb-4">
                Sorry, this demo wasn’t found. Check again soon!
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
              muted
              className="w-full h-full object-cover rounded-lg"
              poster="/placeholder.svg"
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              aria-label="LXERA feature demonstration"
              preload="metadata"
              autoPlay={false}
              tabIndex={0}
            >
              <source src={videoUrl} type="video/mp4" />
              {/* You may add <track> for captions if desired */}
              Your browser does not support HTML5 video.
            </video>
          )}
        </div>
        {videoCaption && (
          <div className="text-sm text-white/80 text-center p-2">{videoCaption}</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
