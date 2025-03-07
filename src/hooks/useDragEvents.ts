
import { useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { MouseEvent, TouchEvent } from 'react';

interface DragEventOptions {
  onDragStart?: (e: MouseEvent | TouchEvent) => void;
  onDragMove?: (e: MouseEvent | TouchEvent) => void;
  onDragEnd?: () => void;
  threshold?: number;
  debounceMs?: number;
  preventDefault?: boolean;
  longPressThreshold?: number;
}

export function useDragEvents({
  onDragStart,
  onDragMove,
  onDragEnd,
  threshold = 5,
  debounceMs = 16,
  preventDefault = true,
  longPressThreshold = 300
}: DragEventOptions) {
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const eventCleanupRef = useRef<(() => void)[]>([]);
  const lastMoveTime = useRef(0);
  const errorCountRef = useRef(0);
  const longPressTimeoutRef = useRef<number>();
  const isLongPressRef = useRef(false);
  
  const debouncedMove = useCallback(
    debounce((e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      
      const now = performance.now();
      if (now - lastMoveTime.current < 16) { // Skip if less than 16ms (60fps)
        return;
      }
      lastMoveTime.current = now;
      
      try {
        onDragMove?.(e);
        // Reset error count on successful move
        errorCountRef.current = 0;
      } catch (error) {
        // Track errors but don't abort immediately
        errorCountRef.current++;
        console.error("Error in drag move handler:", error);
        
        // If too many errors in sequence, abort drag
        if (errorCountRef.current > 3) {
          console.error("Too many errors during drag, aborting");
          cleanup();
        }
      }
    }, debounceMs, { maxWait: 32 }), // Ensure smoother updates
    [onDragMove]
  );

  const cleanup = useCallback(() => {
    window.clearTimeout(longPressTimeoutRef.current);
    isDraggingRef.current = false;
    isLongPressRef.current = false;
    
    try {
      onDragEnd?.();
    } catch (error) {
      console.error("Error in drag end handler:", error);
    }
    
    eventCleanupRef.current.forEach(cleanup => cleanup());
    eventCleanupRef.current = [];
    debouncedMove.cancel();
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    errorCountRef.current = 0;
  }, [onDragEnd, debouncedMove]);

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    try {
      const pos = 'touches' in e ? e.touches[0] : e;
      const deltaX = Math.abs(pos.clientX - startPosRef.current.x);
      const deltaY = Math.abs(pos.clientY - startPosRef.current.y);
      
      // Only prevent default if we've moved past threshold and preventDefault is true
      if (preventDefault && (deltaX > threshold || deltaY > threshold)) {
        e.preventDefault();
        
        requestAnimationFrame(() => {
          debouncedMove(e);
        });
      } else if (!preventDefault) {
        requestAnimationFrame(() => {
          debouncedMove(e);
        });
      }
    } catch (error) {
      console.error("Error in move handler:", error);
      errorCountRef.current++;
      
      // If too many errors, abort the drag
      if (errorCountRef.current > 3) {
        cleanup();
      }
    }
  }, [debouncedMove, threshold, cleanup, preventDefault]);

  const startDrag = useCallback((e: MouseEvent | TouchEvent) => {
    try {
      isDraggingRef.current = true;
      errorCountRef.current = 0;
      
      // Set up event listeners for drag tracking
      const addEventListenerWithCleanup = (
        target: EventTarget,
        type: string,
        handler: any,
        options?: AddEventListenerOptions
      ) => {
        target.addEventListener(type, handler, options);
        eventCleanupRef.current.push(() => 
          target.removeEventListener(type, handler, options)
        );
      };

      // Handle both mouse and touch events
      if ('touches' in e) {
        addEventListenerWithCleanup(document, 'touchmove', handleMove, { 
          passive: !preventDefault,
          capture: true 
        });
        addEventListenerWithCleanup(document, 'touchend', cleanup);
        addEventListenerWithCleanup(document, 'touchcancel', cleanup);
        
        // Prevent zoom gestures during drag
        if (preventDefault) {
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
          document.body.style.touchAction = 'none';
        }
      } else {
        addEventListenerWithCleanup(document, 'mousemove', handleMove, {
          passive: !preventDefault
        });
        addEventListenerWithCleanup(document, 'mouseup', cleanup);
      }

      onDragStart?.(e);
    } catch (error) {
      console.error("Error in drag start:", error);
      cleanup();
    }
  }, [handleMove, cleanup, onDragStart, preventDefault]);

  const handleStart = useCallback((e: MouseEvent | TouchEvent) => {
    try {
      // Clear any existing long press timeout
      window.clearTimeout(longPressTimeoutRef.current);
      
      const pos = 'touches' in e ? e.touches[0] : e;
      startPosRef.current = { x: pos.clientX, y: pos.clientY };
      
      // For mouse events, start drag immediately
      if (!('touches' in e)) {
        startDrag(e);
        return;
      }
      
      // For touch events, use long press or immediate start depending on configuration
      if (longPressThreshold > 0) {
        // Use long press for touch events
        longPressTimeoutRef.current = window.setTimeout(() => {
          isLongPressRef.current = true;
          startDrag(e);
        }, longPressThreshold);
        
        // Also add a touch move listener to cancel long press if moved too much
        const cancelLongPressOnMove = (moveEvent: TouchEvent) => {
          if (isLongPressRef.current) return; // Already triggered long press
          
          const touch = moveEvent.touches[0];
          const deltaX = Math.abs(touch.clientX - startPosRef.current.x);
          const deltaY = Math.abs(touch.clientY - startPosRef.current.y);
          
          // Cancel long press if moved too much
          if (deltaX > threshold || deltaY > threshold) {
            window.clearTimeout(longPressTimeoutRef.current);
            document.removeEventListener('touchmove', cancelLongPressOnMove);
          }
        };
        
        document.addEventListener('touchmove', cancelLongPressOnMove, { passive: true });
        eventCleanupRef.current.push(() => 
          document.removeEventListener('touchmove', cancelLongPressOnMove)
        );
      } else {
        // Start drag immediately for touch events if no long press threshold
        startDrag(e);
      }
    } catch (error) {
      console.error("Error in start handler:", error);
      cleanup();
    }
  }, [startDrag, cleanup, threshold, longPressThreshold]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.clearTimeout(longPressTimeoutRef.current);
      cleanup();
      debouncedMove.cancel();
    };
  }, [cleanup, debouncedMove]);

  return { handleStart };
}
