'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useMediaQuery } from '@/hooks/use-media-query';

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  fullScreenOnMobile?: boolean;
  disableSwipeToClose?: boolean;
}

export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  className,
  showCloseButton = true,
  fullScreenOnMobile = true,
  disableSwipeToClose = false
}: ResponsiveModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const sheetRef = React.useRef<HTMLDivElement>(null);

  // Handle swipe down to close on mobile
  useSwipeGesture(sheetRef, {
    onSwipeDown: () => {
      if (!disableSwipeToClose && isMobile) {
        onOpenChange(false);
      }
    },
    threshold: 50,
    enabled: open && isMobile && !disableSwipeToClose
  });

  // On desktop, use regular dialog
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className={className}>
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          )}
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  // On mobile, use bottom sheet
  return (
    <>
      {trigger && (
        <button onClick={() => onOpenChange(true)}>
          {trigger}
        </button>
      )}
      
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => onOpenChange(false)}
          />

          {/* Bottom Sheet */}
          <div
            ref={sheetRef}
            className={cn(
              'fixed z-50 bg-background',
              'animate-in slide-in-from-bottom duration-300',
              fullScreenOnMobile
                ? 'inset-0'
                : 'bottom-0 left-0 right-0 max-h-[90vh] rounded-t-xl border-t shadow-xl',
              className
            )}
          >
            {/* Drag Handle for non-fullscreen */}
            {!fullScreenOnMobile && (
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-12 h-1 bg-muted-foreground/20 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || description || showCloseButton) && (
              <div className={cn(
                'flex items-start justify-between',
                fullScreenOnMobile ? 'p-4 border-b' : 'px-6 py-3'
              )}>
                <div className="flex-1">
                  {title && (
                    <h2 className="text-lg font-semibold">{title}</h2>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  )}
                </div>
                
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenChange(false)}
                    className="h-9 w-9 -mr-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={cn(
              'overflow-y-auto',
              fullScreenOnMobile
                ? 'flex-1 p-4'
                : 'max-h-[calc(90vh-4rem)] p-6'
            )}>
              {children}
            </div>

            {/* Safe area padding */}
            <div className="pb-safe" />
          </div>
        </>
      )}
    </>
  );
}