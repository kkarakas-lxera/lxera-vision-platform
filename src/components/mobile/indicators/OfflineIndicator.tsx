'use client';

import React from 'react';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { Button } from '@/components/ui/button';

interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

export function OfflineIndicator({ 
  className,
  showWhenOnline = false 
}: OfflineIndicatorProps) {
  const { isOnline, wasOffline, retry, retryCount } = useOfflineDetection();

  // Don't show if online and not requested
  if (isOnline && !showWhenOnline && !wasOffline) {
    return null;
  }

  // Show success message briefly after coming back online
  if (isOnline && wasOffline) {
    setTimeout(() => {
      // Force re-render to hide the indicator
      retry();
    }, 3000);
  }

  return (
    <div
      className={cn(
        'fixed top-14 left-0 right-0 z-30 md:top-16',
        'animate-in slide-in-from-top duration-300',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto max-w-lg px-4 py-2',
          'flex items-center justify-center gap-2',
          'text-sm font-medium',
          isOnline 
            ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
            : 'bg-destructive/10 text-destructive'
        )}
      >
        {isOnline ? (
          <>
            <CheckCircle className="h-4 w-4" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>No internet connection</span>
            {retryCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={retry}
                className="h-6 px-2 ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}