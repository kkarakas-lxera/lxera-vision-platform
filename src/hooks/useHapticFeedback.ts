import { useCallback } from 'react';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
type NotificationFeedback = 'success' | 'warning' | 'error';

interface HapticFeedback {
  impactOccurred: (style?: HapticStyle) => void;
  notificationOccurred: (type: NotificationFeedback) => void;
  selectionChanged: () => void;
}

// Check if we're on iOS and have haptic feedback available
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const hasHapticFeedback = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for the Taptic Engine API (iOS 10+)
  return 'vibrate' in navigator || 
    (window as any).webkit?.messageHandlers?.haptic;
};

export function useHapticFeedback(): HapticFeedback {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (hasHapticFeedback() && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const impactOccurred = useCallback((style: HapticStyle = 'medium') => {
    if (!hasHapticFeedback()) return;

    // Map styles to vibration patterns
    const patterns: Record<HapticStyle, number> = {
      light: 10,
      medium: 20,
      heavy: 30,
      soft: 15,
      rigid: 25
    };

    vibrate(patterns[style]);

    // If we have access to the native iOS API
    if (isIOS() && (window as any).webkit?.messageHandlers?.haptic) {
      try {
        (window as any).webkit.messageHandlers.haptic.postMessage({
          type: 'impact',
          style
        });
      } catch (e) {
        console.debug('Haptic feedback not available');
      }
    }
  }, [vibrate]);

  const notificationOccurred = useCallback((type: NotificationFeedback) => {
    if (!hasHapticFeedback()) return;

    // Map notification types to vibration patterns
    const patterns: Record<NotificationFeedback, number[]> = {
      success: [10, 20, 10],
      warning: [20, 10, 20],
      error: [30, 10, 30, 10, 30]
    };

    vibrate(patterns[type]);

    // If we have access to the native iOS API
    if (isIOS() && (window as any).webkit?.messageHandlers?.haptic) {
      try {
        (window as any).webkit.messageHandlers.haptic.postMessage({
          type: 'notification',
          notificationType: type
        });
      } catch (e) {
        console.debug('Haptic feedback not available');
      }
    }
  }, [vibrate]);

  const selectionChanged = useCallback(() => {
    if (!hasHapticFeedback()) return;

    vibrate(5);

    // If we have access to the native iOS API
    if (isIOS() && (window as any).webkit?.messageHandlers?.haptic) {
      try {
        (window as any).webkit.messageHandlers.haptic.postMessage({
          type: 'selection'
        });
      } catch (e) {
        console.debug('Haptic feedback not available');
      }
    }
  }, [vibrate]);

  return {
    impactOccurred,
    notificationOccurred,
    selectionChanged
  };
}

// Hook for button presses with haptic feedback
export function useHapticButton() {
  const { impactOccurred } = useHapticFeedback();

  const onClick = useCallback((handler?: () => void) => {
    return () => {
      impactOccurred('light');
      handler?.();
    };
  }, [impactOccurred]);

  return { onClick };
}