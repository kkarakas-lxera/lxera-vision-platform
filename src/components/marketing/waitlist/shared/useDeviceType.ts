import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    // Check on mount
    checkDeviceType();

    // Add resize listener
    window.addEventListener('resize', checkDeviceType);
    
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
};

// Breakpoint constants for consistency
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

// Utility to check if current device is mobile
export const isMobile = () => {
  return typeof window !== 'undefined' && window.innerWidth < BREAKPOINTS.mobile;
};

// Utility to check if current device is tablet
export const isTablet = () => {
  return typeof window !== 'undefined' && 
    window.innerWidth >= BREAKPOINTS.mobile && 
    window.innerWidth < BREAKPOINTS.tablet;
};

// Utility to check if current device is desktop
export const isDesktop = () => {
  return typeof window !== 'undefined' && window.innerWidth >= BREAKPOINTS.tablet;
};