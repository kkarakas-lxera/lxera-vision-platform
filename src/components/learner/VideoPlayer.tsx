import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Maximize2, SkipForward, SkipBack } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VideoPlayerProps {
  sectionName: string;
  duration?: string;
}

export default function VideoPlayer({ sectionName, duration = "5:00" }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Simulate video progress
    if (!isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }
  };

  const formatSectionName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="overflow-hidden bg-slate-900 border-slate-800">
      {/* Video Display Area */}
      <div className="relative bg-black aspect-video flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-90" />
        
        {/* Center Content */}
        {!isPlaying && (
          <div className="relative z-10 text-center">
            <h3 className="text-2xl font-semibold text-white mb-2">
              {formatSectionName(sectionName)}
            </h3>
            <p className="text-slate-400 mb-8">Video content coming soon</p>
            <button
              onClick={togglePlayPause}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors group"
            >
              <Play className="h-10 w-10 text-white ml-1 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}
        
        {/* Playing State */}
        {isPlaying && (
          <div className="relative z-10 text-center">
            <div className="animate-pulse">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/20 rounded-full mb-4">
                <Play className="h-10 w-10 text-blue-400" />
              </div>
            </div>
            <p className="text-slate-400">Playing: {formatSectionName(sectionName)}</p>
          </div>
        )}
      </div>

      {/* Video Controls */}
      <div className="bg-slate-800 p-4">
        {/* Progress Bar */}
        <div className="mb-3">
          <Progress value={progress} className="h-1 bg-slate-700" />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={togglePlayPause}
              className="h-10 w-10 text-white hover:bg-slate-700"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}