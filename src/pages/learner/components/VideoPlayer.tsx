import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  Settings,
  ThumbsUp,
  ThumbsDown,
  Subtitles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onFeedback: (isPositive: boolean) => void;
}

export default function VideoPlayer({ videoUrl, title, onFeedback }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackGiven(isPositive ? 'positive' : 'negative');
    onFeedback(isPositive);
    
    // Hide feedback prompt after selection
    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };

  // Show feedback prompt after 10 seconds of "playing"
  React.useEffect(() => {
    if (isPlaying && !feedbackGiven) {
      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, feedbackGiven]);

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-black aspect-video">
        {/* Video Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying ? (
            <button
              onClick={() => setIsPlaying(true)}
              className="bg-white/20 hover:bg-white/30 rounded-full p-8 transition-colors"
            >
              <Play className="h-12 w-12 text-white" fill="white" />
            </button>
          ) : (
            <div className="text-white text-lg">
              Video Player Placeholder
              <br />
              <span className="text-sm text-white/70">"{title}"</span>
            </div>
          )}
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="relative h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-500" />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-white text-sm">0:00 / 12:34</span>
              </div>

              <div className="flex items-center gap-1">
                {/* Feedback Buttons */}
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "text-white hover:bg-white/20",
                    feedbackGiven === 'positive' && "bg-green-600/30"
                  )}
                  onClick={() => handleFeedback(true)}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "text-white hover:bg-white/20",
                    feedbackGiven === 'negative' && "bg-red-600/30"
                  )}
                  onClick={() => handleFeedback(false)}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
                
                <div className="w-px h-6 bg-white/30 mx-1" />
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Subtitles className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Prompt */}
        {showFeedback && !feedbackGiven && (
          <div className="absolute top-4 right-4 bg-white rounded-lg p-4 shadow-lg animate-in slide-in-from-right">
            <p className="text-sm font-medium mb-2">Was this section helpful?</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFeedback(true)}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="h-3 w-3" />
                Yes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFeedback(false)}
                className="flex items-center gap-1"
              >
                <ThumbsDown className="h-3 w-3" />
                No
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}