import React from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean;
  pullDistance: number;
  progress: number;
  threshold?: number;
}

const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  isRefreshing,
  pullDistance,
  progress,
  threshold = 80
}) => {
  const isReady = progress >= 1;
  
  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
        "flex items-center justify-center bg-background/95 backdrop-blur-sm border-b",
        pullDistance > 0 || isRefreshing ? "translate-y-0" : "-translate-y-full"
      )}
      style={{
        height: `${Math.max(pullDistance * 0.8, isRefreshing ? 60 : 0)}px`
      }}
    >
      <div className="flex items-center gap-3 text-sm">
        {/* Icon */}
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
          isReady || isRefreshing 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          {isRefreshing ? (
            <RefreshCw 
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                isRefreshing && "animate-spin"
              )} 
            />
          ) : (
            <ArrowDown 
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                isReady ? "rotate-180" : "rotate-0"
              )}
            />
          )}
        </div>
        
        {/* Text */}
        <div className="flex flex-col">
          <span className={cn(
            "font-medium transition-colors duration-300",
            isReady || isRefreshing ? "text-primary" : "text-muted-foreground"
          )}>
            {isRefreshing 
              ? "Refreshing..." 
              : isReady 
                ? "Release to refresh" 
                : "Pull to refresh"
            }
          </span>
          
          {/* Progress indicator */}
          {!isRefreshing && pullDistance > 20 && (
            <div className="w-24 h-1 bg-muted rounded-full mt-1 overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-300",
                  isReady ? "bg-primary" : "bg-muted-foreground"
                )}
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Background pulse effect when ready */}
      {isReady && !isRefreshing && (
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
      )}
    </div>
  );
};

export default PullToRefreshIndicator;