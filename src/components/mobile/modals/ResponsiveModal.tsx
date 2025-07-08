import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  mobileMode?: 'sheet' | 'fullscreen';
  sheetSide?: 'top' | 'right' | 'bottom' | 'left';
}

export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  children,
  className,
  mobileMode = 'sheet',
  sheetSide = 'bottom'
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    if (mobileMode === 'fullscreen') {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className={cn(
            "sm:max-w-full h-screen w-screen max-h-screen p-0 m-0 rounded-none",
            className
          )}>
            <DialogHeader className="p-4 pb-0">
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="p-4 h-[calc(100vh-4rem)] overflow-y-auto">
              {children}
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side={sheetSide} 
          className={cn(
            sheetSide === 'bottom' && "h-[90vh] rounded-t-3xl",
            sheetSide === 'top' && "h-[90vh] rounded-b-3xl",
            className
          )}
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-[calc(100%-4rem)] overflow-y-auto">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[600px]", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}