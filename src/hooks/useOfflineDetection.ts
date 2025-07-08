import { useEffect, useState, useCallback } from 'react';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnline: Date | null;
  retryCount: number;
}

interface UseOfflineDetectionOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  checkInterval?: number;
  enablePeriodicCheck?: boolean;
}

export function useOfflineDetection(options: UseOfflineDetectionOptions = {}) {
  const {
    onOnline,
    onOffline,
    checkInterval = 5000,
    enablePeriodicCheck = true
  } = options;

  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnline: typeof navigator !== 'undefined' && navigator.onLine ? new Date() : null,
    retryCount: 0
  });

  const checkConnection = useCallback(async () => {
    try {
      // Try to fetch a small resource to verify actual connectivity
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const updateOnlineStatus = useCallback(async (isNavigatorOnline: boolean) => {
    // If navigator says we're offline, trust it
    if (!isNavigatorOnline) {
      setState(prev => {
        if (prev.isOnline) {
          onOffline?.();
        }
        return {
          isOnline: false,
          wasOffline: true,
          lastOnline: prev.lastOnline,
          retryCount: 0
        };
      });
      return;
    }

    // If navigator says we're online, verify with actual request
    const isActuallyOnline = await checkConnection();
    
    setState(prev => {
      const wasOffline = !prev.isOnline;
      const isNowOnline = isActuallyOnline;
      
      if (wasOffline && isNowOnline) {
        onOnline?.();
      } else if (!wasOffline && !isNowOnline) {
        onOffline?.();
      }
      
      return {
        isOnline: isNowOnline,
        wasOffline: wasOffline || prev.wasOffline,
        lastOnline: isNowOnline ? new Date() : prev.lastOnline,
        retryCount: isNowOnline ? 0 : prev.retryCount + 1
      };
    });
  }, [checkConnection, onOnline, onOffline]);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => updateOnlineStatus(true);
    const handleOffline = () => updateOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    updateOnlineStatus(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateOnlineStatus]);

  // Periodic connectivity check
  useEffect(() => {
    if (!enablePeriodicCheck) return;

    const interval = setInterval(() => {
      updateOnlineStatus(navigator.onLine);
    }, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval, enablePeriodicCheck, updateOnlineStatus]);

  const retry = useCallback(() => {
    updateOnlineStatus(navigator.onLine);
  }, [updateOnlineStatus]);

  return {
    ...state,
    retry
  };
}

// Hook for sync status
export function useSyncStatus() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const { isOnline } = useOfflineDetection();

  const startSync = useCallback(async (syncFunction: () => Promise<void>) => {
    if (!isOnline) {
      setSyncError('No internet connection');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      await syncFunction();
      setLastSyncTime(new Date());
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncError,
    startSync
  };
}