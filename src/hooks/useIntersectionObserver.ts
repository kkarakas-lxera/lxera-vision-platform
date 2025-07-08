import { useEffect, useRef, useState } from 'react';

interface IntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = ({
  threshold = 0,
  rootMargin = '0px',
  root = null,
  freezeOnceVisible = false,
}: IntersectionObserverOptions = {}) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<Element | null>(null);
  const frozen = useRef(false);

  useEffect(() => {
    const node = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen.current || !node) return;

    const observerOptions: IntersectionObserverInit = {
      threshold,
      rootMargin,
      root,
    };

    const updateEntry = ([entry]: IntersectionObserverEntry[]) => {
      setEntry(entry);
      setIsVisible(entry.isIntersecting);

      if (entry.isIntersecting && freezeOnceVisible) {
        frozen.current = true;
      }
    };

    const observer = new IntersectionObserver(updateEntry, observerOptions);

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, root, freezeOnceVisible]);

  return { ref: elementRef, entry, isVisible };
};

// Hook for controlling animation play state based on visibility
export const useAnimationPlayState = (options?: IntersectionObserverOptions) => {
  const { ref, isVisible } = useIntersectionObserver(options);
  
  return {
    ref,
    animationClassName: isVisible ? 'animate-running' : 'animate-paused',
    isVisible,
  };
};