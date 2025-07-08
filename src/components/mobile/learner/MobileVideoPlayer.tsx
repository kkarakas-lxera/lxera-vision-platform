import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize, 
  Minimize,
  RotateCcw,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileVideoPlayerProps {
  videoUrl: string;
  videoId?: string;
  title: string;
  onFeedback: (isPositive: boolean) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export default function MobileVideoPlayer({ 
  videoUrl, 
  videoId, 
  title, 
  onFeedback,
  onFullscreenChange 
}: MobileVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLandscape, setIsLandscape] = useState(false);
  const [gestureStart, setGestureStart] = useState<{ x: number; y: number } | null>(null);
  const [seeking, setSeeking] = useState(false);
  const [volumeAdjusting, setVolumeAdjusting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTapTimeRef = useRef<number>(0);
  const seekDisplayRef = useRef<HTMLDivElement>(null);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  // Handle orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsLandscape(window.innerHeight < window.innerWidth);
    };
    
    handleOrientationChange();
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Fetch video source
  useEffect(() => {
    if (videoId) {
      setLoading(true);
      const heygenVideoUrl = `https://resource.heygen.com/video/${videoId}.mp4`;
      setVideoSrc(heygenVideoUrl);
      setLoading(false);
    } else if (videoUrl) {
      setVideoSrc(videoUrl);
    } else {
      setVideoSrc('');
    }
  }, [videoId, videoUrl]);

  // Show feedback prompt after 10 seconds of playing
  useEffect(() => {
    if (isPlaying && !feedbackGiven) {
      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, feedbackGiven]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    onFullscreenChange?.(!isFullscreen);
  };

  const seekForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  const seekBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const handleVideoClick = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    
    if (timeSinceLastTap < 300) {
      // Double tap - toggle fullscreen
      toggleFullscreen();
    } else {
      // Single tap - toggle controls
      setShowControls(!showControls);
    }
    
    lastTapTimeRef.current = now;
  };

  // Enhanced gesture handling for seeking and volume
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setGestureStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gestureStart || !videoRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - gestureStart.x;
    const deltaY = touch.clientY - gestureStart.y;
    
    // Determine if this is a horizontal or vertical gesture
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      // Horizontal swipe - seeking
      setSeeking(true);
      const sensitivity = isLandscape ? 0.5 : 0.3;
      const seekTime = (deltaX * sensitivity);
      const newTime = Math.max(0, Math.min(duration, currentTime + seekTime));
      
      if (seekDisplayRef.current) {
        seekDisplayRef.current.style.display = 'flex';
        seekDisplayRef.current.textContent = `${deltaX > 0 ? '+' : ''}${Math.round(seekTime)}s`;
      }
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
      // Vertical swipe - volume control
      setVolumeAdjusting(true);
      const sensitivity = 0.02;
      const volumeChange = -deltaY * sensitivity;
      const newVolume = Math.max(0, Math.min(1, volume + volumeChange));
      setVolume(newVolume);
      
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
      }
    }
  };

  const handleTouchEnd = () => {
    if (seeking && gestureStart && videoRef.current) {
      const deltaX = gestureStart.x;
      const sensitivity = isLandscape ? 0.5 : 0.3;
      const seekTime = deltaX * sensitivity;
      const newTime = Math.max(0, Math.min(duration, currentTime + seekTime));
      videoRef.current.currentTime = newTime;
    }
    
    setGestureStart(null);
    setSeeking(false);
    setVolumeAdjusting(false);
    
    if (seekDisplayRef.current) {
      seekDisplayRef.current.style.display = 'none';
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackGiven(isPositive ? 'positive' : 'negative');
    onFeedback(isPositive);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden">
      <div 
        ref={containerRef}
        className={cn(
          "relative bg-black",
          isFullscreen ? "h-screen" : "aspect-video",
          isLandscape && isFullscreen ? "w-screen h-screen" : ""
        )}
      >
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
        
        {/* Video Element */}
        {!loading && videoSrc && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain"
            src={videoSrc}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onClick={handleVideoClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            playsInline
            preload="metadata"
          />
        )}
        
        {/* No Video Message */}
        {!loading && !videoSrc && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-lg mb-2">No video available</div>
              <div className="text-sm text-white/70">"{title}"</div>
            </div>
          </div>
        )}

        {/* Touch Controls Overlay */}
        {videoSrc && (
          <div 
            className="absolute inset-0 flex"
            style={{ touchAction: 'manipulation' }}
          >
            {/* Left third - seek backward */}
            <div 
              className="flex-1 flex items-center justify-center"
              onTouchEnd={(e) => {
                e.preventDefault();
                seekBackward();
                setShowControls(true);
              }}
            >
              <div className="opacity-0 hover:opacity-100 transition-opacity">
                <RotateCcw className="h-8 w-8 text-white" />
              </div>
            </div>
            
            {/* Middle third - play/pause */}
            <div 
              className="flex-1 flex items-center justify-center"
              onTouchEnd={(e) => {
                e.preventDefault();
                handlePlayPause();
                setShowControls(true);
              }}
            >
              {!isPlaying && (
                <div className="bg-black/50 rounded-full p-4">
                  <Play className="h-12 w-12 text-white" fill="white" />
                </div>
              )}
            </div>
            
            {/* Right third - seek forward */}
            <div 
              className="flex-1 flex items-center justify-center"
              onTouchEnd={(e) => {
                e.preventDefault();
                seekForward();
                setShowControls(true);
              }}
            >
              <div className="opacity-0 hover:opacity-100 transition-opacity">
                <RotateCw className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        {videoSrc && showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={handleSeek}
                className="w-full [&>span]:bg-white [&>span>span]:bg-blue-500"
              />
              <div className="flex justify-between text-xs text-white/70 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                
                <div className="w-16">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="[&>span]:bg-white [&>span>span]:bg-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={changePlaybackRate}
                  className="text-white hover:bg-white/20 text-xs"
                >
                  {playbackRate}x
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Buttons */}
        {isPlaying && !showFeedback && (
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

        {/* Gesture Feedback Overlays */}
        {seeking && (
          <div 
            ref={seekDisplayRef}
            className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-2xl font-bold"
            style={{ display: 'none' }}
          >
            Seeking...
          </div>
        )}

        {volumeAdjusting && (
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/70 text-white px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <div className="w-16 h-1 bg-gray-600 rounded">
                <div 
                  className="h-full bg-white rounded transition-all"
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
              <span className="text-sm">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        )}

        {/* Landscape Mode Indicator */}
        {isLandscape && isFullscreen && (
          <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
            Landscape Mode
          </div>
        )}

        {/* Feedback Prompt */}
        {showFeedback && !feedbackGiven && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg animate-in slide-in-from-right">
            <p className="text-sm font-medium mb-2">Was this helpful?</p>
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