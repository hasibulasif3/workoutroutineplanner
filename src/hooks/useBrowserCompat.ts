import { useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

interface BrowserCompatOptions {
  enableTouchHandling?: boolean;
  preventScrollOnDrag?: boolean;
  debounceMs?: number;
}

export function useBrowserCompat({
  enableTouchHandling = true,
  preventScrollOnDrag = true,
  debounceMs = 150
}: BrowserCompatOptions = {}) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || !preventScrollOnDrag) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // If horizontal drag is detected, prevent scrolling
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
      isDraggingRef.current = true;
    }
  }, [preventScrollOnDrag]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    isDraggingRef.current = false;
  }, []);

  // Debounced event handlers
  const debouncedTouchMove = debounce(handleTouchMove, debounceMs, {
    leading: true,
    trailing: false
  });

  useEffect(() => {
    if (!enableTouchHandling) return;

    // Add passive: false to allow preventDefault()
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', debouncedTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);

    // Safari-specific fix for momentum scrolling
    document.documentElement.style.overscrollBehavior = 'none';

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', debouncedTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      
      // Cleanup Safari fix
      document.documentElement.style.overscrollBehavior = '';
      
      // Cancel any pending debounced calls
      debouncedTouchMove.cancel();
    };
  }, [enableTouchHandling, handleTouchStart, debouncedTouchMove, handleTouchEnd]);

  return {
    isDragging: isDraggingRef.current,
    touchStartPos: touchStartRef.current
  };
}