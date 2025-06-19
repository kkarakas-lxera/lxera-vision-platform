
import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowDown?: () => void;
  onArrowUp?: () => void;
  onTab?: () => void;
  isEnabled?: boolean;
}

export const useKeyboardNavigation = ({
  onEscape,
  onEnter,
  onArrowDown,
  onArrowUp,
  onTab,
  isEnabled = true
}: UseKeyboardNavigationProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      case 'Enter':
        if (document.activeElement?.tagName === 'BUTTON' || document.activeElement?.tagName === 'A') {
          onEnter?.();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'Tab':
        onTab?.();
        break;
    }
  }, [onEscape, onEnter, onArrowDown, onArrowUp, onTab, isEnabled]);

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isEnabled]);
};
