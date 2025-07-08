'use client';

import React from 'react';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSyncStatus } from '@/hooks/useOfflineDetection';
import { formatDistanceToNow } from 'date-fns';

interface SyncIndicatorProps {
  className?: string;
  onSync?: () => Promise<void>;
}

export function SyncIndicator({ className, onSync }: SyncIndicatorProps) {
  const { isOnline, isSyncing, lastSyncTime, syncError, startSync } = useSyncStatus();

  const handleSync = () => {
    if (onSync) {
      startSync(onSync);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm',
        className
      )}
    >
      {isSyncing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Syncing...</span>
        </>
      ) : !isOnline ? (
        <>
          <CloudOff className="h-4 w-4 text-destructive" />
          <span className="text-destructive">Offline</span>
        </>
      ) : syncError ? (
        <>
          <CloudOff className="h-4 w-4 text-destructive" />
          <span className="text-destructive">Sync failed</span>
        </>
      ) : (
        <>
          <Cloud className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-muted-foreground">
            {lastSyncTime
              ? `Synced ${formatDistanceToNow(lastSyncTime, { addSuffix: true })}`
              : 'Synced'}
          </span>
        </>
      )}
      
      {onSync && isOnline && !isSyncing && (
        <button
          onClick={handleSync}
          className="text-xs text-primary hover:underline"
        >
          Sync now
        </button>
      )}
    </div>
  );
}