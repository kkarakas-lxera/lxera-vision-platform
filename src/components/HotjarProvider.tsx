import { useEffect } from 'react';
import Hotjar from '@hotjar/browser';

interface HotjarProviderProps {
  siteId: number;
  children: React.ReactNode;
}

const HotjarProvider = ({ siteId, children }: HotjarProviderProps) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const hotjarVersion = 6;
        Hotjar.init(siteId, hotjarVersion);
        console.log('Hotjar initialized with site ID:', siteId);
      } catch (error) {
        console.error('Failed to initialize Hotjar:', error);
      }
    }
  }, [siteId]);

  return <>{children}</>;
};

export default HotjarProvider;