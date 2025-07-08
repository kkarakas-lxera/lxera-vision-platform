import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  disabled?: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  disabled = false
}: UsePullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const scrollElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = scrollElement.current || document.documentElement;
    
    const handleScroll = () => {
      setIsAtTop(element.scrollTop <= 0);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (disabled || !isAtTop) return;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (disabled || !isAtTop || isRefreshing) return;
      
      touchEndY.current = e.touches[0].clientY;
      const pullY = touchEndY.current - touchStartY.current;
      
      if (pullY > 0 && element.scrollTop <= 0) {
        // Prevent default scrolling when pulling down at the top
        e.preventDefault();
        setPullDistance(Math.min(pullY, threshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (disabled || !isAtTop || isRefreshing) {
        setPullDistance(0);
        return;
      }
      
      const pullY = touchEndY.current - touchStartY.current;
      
      if (pullY >= threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Pull to refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setPullDistance(0);
      touchStartY.current = 0;
      touchEndY.current = 0;
    };

    // Add event listeners
    element.addEventListener('scroll', handleScroll, { passive: true });
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Initial scroll check
    handleScroll();

    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold, disabled, isAtTop, isRefreshing]);

  const setScrollElement = (element: HTMLElement | null) => {
    scrollElement.current = element;
  };

  const getRefreshProgress = () => {
    return Math.min(pullDistance / threshold, 1);
  };

  const shouldShowRefreshIndicator = () => {
    return pullDistance > 20 || isRefreshing;
  };

  return {
    isRefreshing,
    pullDistance,
    isAtTop,
    setScrollElement,
    getRefreshProgress,
    shouldShowRefreshIndicator
  };
};