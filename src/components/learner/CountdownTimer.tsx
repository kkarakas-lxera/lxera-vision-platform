import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  /** Duration in seconds (default: 300 for 5 minutes) */
  duration?: number;
  /** Callback when timer expires (optional) */
  onExpire?: () => void;
  /** Custom className for styling */
  className?: string;
}

export default function CountdownTimer({ 
  duration = 300, // 5 minutes in seconds
  onExpire,
  className 
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || timeRemaining <= 0) {
      if (timeRemaining <= 0 && onExpire) {
        onExpire();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, onExpire]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Determine color based on time remaining
  const getTimerColor = (): string => {
    const percentage = timeRemaining / duration;
    
    if (percentage > 0.5) {
      return 'text-green-600 bg-green-50 border-green-200'; // Green when > 50%
    } else if (percentage > 0.25) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'; // Yellow when > 25%
    } else {
      return 'text-red-600 bg-red-50 border-red-200'; // Red when ≤ 25%
    }
  };

  // Get pulse animation for urgency
  const getPulseAnimation = (): string => {
    const percentage = timeRemaining / duration;
    
    if (percentage <= 0.25) {
      return 'animate-pulse'; // Pulse when ≤ 25%
    } else if (percentage <= 0.5) {
      return timeRemaining % 2 === 0 ? 'animate-pulse' : ''; // Occasional pulse when ≤ 50%
    }
    
    return '';
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-300",
      getTimerColor(),
      getPulseAnimation(),
      className
    )}>
      <Clock className="h-4 w-4" />
      <span className="tabular-nums">
        {formatTime(timeRemaining)}
      </span>
      {timeRemaining <= 60 && (
        <span className="text-xs opacity-75">
          remaining
        </span>
      )}
    </div>
  );
}