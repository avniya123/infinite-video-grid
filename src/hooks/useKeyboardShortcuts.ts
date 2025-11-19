import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsProps {
  onEscape?: () => void;
  onSpace?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onEscape,
  onSpace,
  onArrowLeft,
  onArrowRight,
  onArrowUp,
  onArrowDown,
  enabled = true,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
    }
  }, [enabled, onEscape, onSpace, onArrowLeft, onArrowRight, onArrowUp, onArrowDown]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}
