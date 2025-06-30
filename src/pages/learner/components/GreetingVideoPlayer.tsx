import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  ThumbsUp,
  ThumbsDown,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GreetingVideoPlayerProps {
  videoId: string;
  title: string;
  onFeedback?: (isPositive: boolean) => void;
}

export default function GreetingVideoPlayer({ videoId, title, onFeedback }: GreetingVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackGiven(isPositive ? 'positive' : 'negative');
    onFeedback?.(isPositive);
    
    // Hide feedback prompt after selection
    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };

  // Show feedback prompt after 10 seconds of playing
  useEffect(() => {
    if (isPlaying && !feedbackGiven) {
      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, feedbackGiven]);

  // Fetch video source from HeyGen API
  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!videoId) return;
      
      setLoading(true);
      try {
        // Use HeyGen API to get the actual video URL
        const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Api-Key': 'Y2YxZDIyZDlhZTYxNDQ5MWIyNTNkM2I2ZjViMmVlMTItMTc1MTAyMzA4Mw=='
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('HeyGen API response:', data);
          
          if (data.code === 100 && data.data?.status === 'completed' && data.data?.video_url) {
            console.log('Found HeyGen video URL:', data.data.video_url);
            setVideoSrc(data.data.video_url);
          } else {
            console.log('Video not ready or not found:', data);
            setVideoSrc('');
          }
        } else {
          console.error('HeyGen API error:', response.status, response.statusText);
          setVideoSrc('');
        }
        
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching HeyGen video:', error);
        setVideoSrc('');
        setLoading(false);
      }
    };
    
    fetchVideoUrl();
  }, [videoId]);

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-black aspect-video">
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
        
        {/* Video Element */}
        {!loading && videoSrc ? (
          <video
            className="absolute inset-0 w-full h-full object-contain"
            controls
            autoPlay
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            src={videoSrc}
          >
            Your browser does not support the video tag.
          </video>
        ) : !loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-lg text-center">
              <Play className="h-12 w-12 mx-auto mb-4" />
              <p>Welcome Video</p>
              <p className="text-sm text-white/70">"{title}"</p>
            </div>
          </div>
        ) : null}
        
        {/* Play Button Overlay (only show when video is not playing) */}
        {!loading && videoSrc && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              onClick={() => {
                const video = document.querySelector('video');
                if (video) {
                  video.play();
                  setIsPlaying(true);
                }
              }}
              className="bg-white/20 hover:bg-white/30 rounded-full p-8 transition-colors"
            >
              <Play className="h-12 w-12 text-white" fill="white" />
            </button>
          </div>
        )}
        
        {/* Feedback Buttons Overlay */}
        {isPlaying && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "bg-black/50 hover:bg-black/70 text-white",
                feedbackGiven === 'positive' && "bg-green-600/50"
              )}
              onClick={() => handleFeedback(true)}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "bg-black/50 hover:bg-black/70 text-white",
                feedbackGiven === 'negative' && "bg-red-600/50"
              )}
              onClick={() => handleFeedback(false)}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Feedback Prompt */}
        {showFeedback && !feedbackGiven && (
          <div className="absolute top-4 left-4 bg-white rounded-lg p-4 shadow-lg animate-in slide-in-from-left">
            <p className="text-sm font-medium mb-2">How was this welcome message?</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFeedback(true)}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="h-3 w-3" />
                Helpful
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFeedback(false)}
                className="flex items-center gap-1"
              >
                <ThumbsDown className="h-3 w-3" />
                Not helpful
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}