'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

export interface ActionItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface MobileActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: ActionItem[];
  title?: string;
  description?: string;
  cancelLabel?: string;
  className?: string;
}

export function MobileActionSheet({
  open,
  onOpenChange,
  actions,
  title,
  description,
  cancelLabel = 'Cancel',
  className
}: MobileActionSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle swipe down to close
  useSwipeGesture(sheetRef, {
    onSwipeDown: () => onOpenChange(false),
    threshold: 50,
    enabled: open
  });

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
          'animate-in fade-in duration-200',
          'md:hidden'
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Action Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-background',
          'rounded-t-xl border-t shadow-xl',
          'animate-in slide-in-from-bottom duration-300',
          'md:hidden',
          className
        )}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-muted-foreground/20 rounded-full" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="px-6 py-3 text-center border-b">
            {title && (
              <h3 className="text-base font-semibold">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="py-2">
          {actions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => {
                action.onClick();
                onOpenChange(false);
              }}
              disabled={action.disabled}
              className={cn(
                'w-full px-6 py-3 flex items-center gap-3',
                'text-left transition-colors',
                'hover:bg-muted/50 active:bg-muted',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                action.variant === 'destructive' && 'text-destructive',
                index < actions.length - 1 && 'border-b'
              )}
            >
              {action.icon && (
                <span className="flex-shrink-0">{action.icon}</span>
              )}
              <span className="flex-1 text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel Button */}
        <div className="p-3 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
        </div>

        {/* Safe area padding */}
        <div className="pb-safe" />
      </div>
    </>
  );
}