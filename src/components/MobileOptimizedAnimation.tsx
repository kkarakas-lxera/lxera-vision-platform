import { ReactNode } from 'react';
import { useAnimationPlayState } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface MobileOptimizedAnimationProps {
  children: ReactNode;
  animation: string;
  className?: string;
  delay?: string;
  disableOnMobile?: boolean;
  threshold?: number;
}

const MobileOptimizedAnimation = ({
  children,
  animation,
  className = '',
  delay,
  disableOnMobile = false,
  threshold = 0.1,
}: MobileOptimizedAnimationProps) => {
  const { ref, animationClassName, isVisible } = useAnimationPlayState({
    threshold,
    freezeOnceVisible: true,
  });

  // Build animation classes based on device type
  const animationClasses = cn(
    // Desktop animations
    `lg:${animation}`,
    // Mobile optimizations
    disableOnMobile ? '' : `max-lg:${animation}`,
    // Animation play state control
    animationClassName,
    // Delay if provided
    delay ? `animate-delay-${delay}` : '',
    // Visibility control
    !isVisible && 'opacity-0',
    // Performance optimization
    'mobile-optimize',
    // Custom classes
    className
  );

  return (
    <div ref={ref} className={animationClasses}>
      {children}
    </div>
  );
};

export default MobileOptimizedAnimation;