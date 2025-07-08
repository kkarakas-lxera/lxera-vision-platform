/**
 * Touch Optimization Utilities for Mobile Learner Dashboard
 * Ensures all interactive elements meet touch accessibility standards
 */

export const TOUCH_TARGET_MIN_SIZE = 44; // Apple's recommended minimum touch target size
export const TOUCH_SPACING_MIN = 8; // Minimum spacing between touch targets

/**
 * Touch target size utilities
 */
export const touchTargetClasses = {
  // Minimum touch target size (44px x 44px)
  minimal: 'min-h-[44px] min-w-[44px]',
  // Comfortable touch target size (48px x 48px)
  comfortable: 'min-h-[48px] min-w-[48px]',
  // Large touch target size (56px x 56px)
  large: 'min-h-[56px] min-w-[56px]',
  // Extra large for primary actions (64px x 64px)
  extraLarge: 'min-h-[64px] min-w-[64px]'
};

/**
 * Touch feedback classes for different interaction states
 */
export const touchFeedbackClasses = {
  // Standard touch feedback
  standard: 'active:scale-98 active:shadow-sm transition-all duration-150',
  // Gentle feedback for cards
  gentle: 'active:scale-99 active:shadow-sm transition-all duration-200',
  // Strong feedback for buttons
  strong: 'active:scale-95 active:shadow-md transition-all duration-100',
  // Subtle feedback for navigation items
  subtle: 'active:bg-muted/50 transition-colors duration-150'
};

/**
 * Spacing utilities for touch targets
 */
export const touchSpacingClasses = {
  // Minimum spacing between touch targets
  minimal: 'gap-2', // 8px
  // Comfortable spacing
  comfortable: 'gap-3', // 12px
  // Generous spacing for better accessibility
  generous: 'gap-4', // 16px
  // Extra generous for primary actions
  extraGenerous: 'gap-6' // 24px
};

/**
 * Touch action utilities to control native touch behaviors
 */
export const touchActionClasses = {
  // Allow only horizontal scrolling
  panX: 'touch-pan-x',
  // Allow only vertical scrolling
  panY: 'touch-pan-y',
  // Disable all touch actions
  none: 'touch-none',
  // Enable manipulation (pinch, zoom)
  manipulation: 'touch-manipulation'
};

/**
 * Utility function to combine touch optimization classes
 */
export const createTouchOptimizedClass = (
  size: keyof typeof touchTargetClasses = 'minimal',
  feedback: keyof typeof touchFeedbackClasses = 'standard',
  spacing?: keyof typeof touchSpacingClasses,
  touchAction?: keyof typeof touchActionClasses
) => {
  const classes = [
    touchTargetClasses[size],
    touchFeedbackClasses[feedback]
  ];
  
  if (spacing) {
    classes.push(touchSpacingClasses[spacing]);
  }
  
  if (touchAction) {
    classes.push(touchActionClasses[touchAction]);
  }
  
  return classes.join(' ');
};

/**
 * CSS-in-JS styles for touch optimization
 */
export const touchOptimizationStyles = `
  /* Base touch target styles */
  .touch-target {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Touch action utilities */
  .touch-pan-x {
    touch-action: pan-x;
  }
  
  .touch-pan-y {
    touch-action: pan-y;
  }
  
  .touch-none {
    touch-action: none;
  }
  
  .touch-manipulation {
    touch-action: manipulation;
  }
  
  /* Hide scrollbars on mobile */
  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Improve touch feedback on mobile devices */
  @media (hover: none) and (pointer: coarse) {
    .hover\\:shadow-md:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    .hover\\:shadow-lg:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    .active\\:scale-95:active {
      transform: scale(0.95);
    }
    
    .active\\:scale-98:active {
      transform: scale(0.98);
    }
    
    .active\\:scale-99:active {
      transform: scale(0.99);
    }
  }
  
  /* Prevent iOS bounce scroll */
  body {
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Improve focus visibility for accessibility */
  .focus\\:ring-2:focus {
    outline: 2px solid hsl(var(--primary));
    outline-offset: 2px;
  }
  
  /* Smooth animations with reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .transition-all,
    .transition-transform,
    .transition-colors,
    .transition-shadow {
      transition: none;
    }
    
    .animate-spin,
    .animate-pulse,
    .animate-bounce {
      animation: none;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .border {
      border-width: 2px;
    }
    
    .shadow-sm {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
    }
  }
  
  /* Snap scrolling for carousels */
  .snap-x {
    scroll-snap-type: x mandatory;
  }
  
  .snap-y {
    scroll-snap-type: y mandatory;
  }
  
  .snap-center {
    scroll-snap-align: center;
  }
  
  .snap-start {
    scroll-snap-align: start;
  }
`;

/**
 * Function to inject touch optimization styles into the document
 */
export const injectTouchOptimizationStyles = () => {
  if (typeof document === 'undefined') return;
  
  const existingStyles = document.getElementById('touch-optimization-styles');
  if (existingStyles) return;
  
  const styleSheet = document.createElement('style');
  styleSheet.id = 'touch-optimization-styles';
  styleSheet.textContent = touchOptimizationStyles;
  document.head.appendChild(styleSheet);
};

/**
 * Hook to detect if the device is touch-enabled
 */
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    /Mobi|Android/i.test(navigator.userAgent)
  );
};

/**
 * Hook to detect if the device is mobile
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth < 768 || isTouchDevice();
};

/**
 * Utility to add haptic feedback on supported devices
 */
export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window === 'undefined' || !('navigator' in window)) return;
  
  // Check if device supports haptic feedback
  if ('vibrate' in navigator) {
    const intensity = {
      light: 10,
      medium: 20,
      heavy: 30
    };
    
    navigator.vibrate(intensity[type]);
  }
};

/**
 * Debounce utility for touch events
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};