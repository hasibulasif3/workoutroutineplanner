import { useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { MouseEvent, TouchEvent } from 'react';

interface DragEventOptions {
  onDragStart?: (e: MouseEvent | TouchEvent) => void;
  onDragMove?: (e: MouseEvent | TouchEvent) => void;
  onDragEnd?: () => void;
  threshold?: number;
  debounceMs?: number;
}

export function useDragEvents({
  onDragStart,
  onDragMove,
  onDragEnd,
  threshold = 5,
  debounceMs = 16
}: DragEventOptions) {
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const eventCleanupRef = useRef<(() => void)[]>([]);
  const lastMoveTime = useRef(0);
  
  const debouncedMove = useCallback(
    debounce((e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      
      const now = performance.now();
      if (now - lastMoveTime.current < 16) { // Skip if less than 16ms (60fps)
        return;
      }
      lastMoveTime.current = now;
      
      onDragMove?.(e);
    }, debounceMs, { maxWait: 32 }), // Ensure smoother updates
    [onDragMove]
  );

  const cleanup = useCallback(() => {
    isDraggingRef.current = false;
    onDragEnd?.();
    eventCleanupRef.current.forEach(cleanup => cleanup());
    eventCleanupRef.current = [];
    debouncedMove.cancel();
    document.body.style.overflow = '';
  }, [onDragEnd, debouncedMove]);

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    const pos = 'touches' in e ? e.touches[0] : e;
    const deltaX = Math.abs(pos.clientX - startPosRef.current.x);
    const deltaY = Math.abs(pos.clientY - startPosRef.current.y);
    
    // Only prevent default if we've moved past threshold
    if (deltaX > threshold || deltaY > threshold) {
      e.preventDefault();
      requestAnimationFrame(() => {
        debouncedMove(e);
      });
    }
  }, [debouncedMove, threshold]);

  const handleStart = useCallback((e: MouseEvent | TouchEvent) => {
    const pos = 'touches' in e ? e.touches[0] : e;
    startPosRef.current = { x: pos.clientX, y: pos.clientY };
    isDraggingRef.current = true;
    
    const addEventListenerWithCleanup = (
      target: EventTarget,
      type: string,
      handler: any,
      options?: AddEventListenerOptions
    ) => {
      target.addEventListener(type, handler, options);
      eventCleanupRef.current.push(() => 
        target.removeEventListener(type, handler)
      );
    };

    // Handle both mouse and touch events
    if ('touches' in e) {
      addEventListenerWithCleanup(document, 'touchmove', handleMove, { 
        passive: false,
        capture: true 
      });
      addEventListenerWithCleanup(document, 'touchend', cleanup);
      addEventListenerWithCleanup(document, 'touchcancel', cleanup);
      
      // Prevent zoom gestures during drag
      const preventZoom = (e: TouchEvent) => {
        if (isDraggingRef.current && e.touches.length > 1) {
          e.preventDefault();
        }
      };
      
      addEventListenerWithCleanup(document, 'touchstart', preventZoom, { 
        passive: false 
      });
      
      // Lock body scroll during touch drag
      document.body.style.overflow = 'hidden';
    } else {
      addEventListenerWithCleanup(document, 'mousemove', handleMove);
      addEventListenerWithCleanup(document, 'mouseup', cleanup);
    }

    onDragStart?.(e);
  }, [handleMove, cleanup, onDragStart, threshold]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      debouncedMove.cancel();
    };
  }, [cleanup, debouncedMove]);

  return { handleStart };
}