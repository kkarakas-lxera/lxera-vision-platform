'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileAdminHeaderProps {
  title?: string;
  onMenuClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function MobileAdminHeader({
  title = 'Admin Dashboard',
  onMenuClick,
  showBackButton = false,
  onBackClick,
  actions,
  className
}: MobileAdminHeaderProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Only hide when scrolling down and past a threshold
          if (currentScrollY > lastScrollY && currentScrollY > 60) {
            setIsHidden(true);
          } else if (currentScrollY < lastScrollY || currentScrollY <= 60) {
            setIsHidden(false);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Reset on route change
  useEffect(() => {
    setIsHidden(false);
    setLastScrollY(0);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <div
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b transition-transform duration-300 ease-in-out md:hidden',
          isHidden ? '-translate-y-full' : 'translate-y-0',
          className
        )}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            {showBackButton && onBackClick ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackClick}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : onMenuClick ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="h-9 w-9"
              >
                <Menu className="h-5 w-5" />
              </Button>
            ) : null}
            
            <h1 className="text-lg font-semibold truncate">{title}</h1>
          </div>
          
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
      
      {/* Spacer to prevent content jump */}
      <div className="h-14 md:hidden" />
    </>
  );
}