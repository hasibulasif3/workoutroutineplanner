
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { DragState, ColumnPreferences, DragContextType } from "./types";
import { debounce } from "lodash";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

const DRAG_THRESHOLD = 5; // Reduced for more responsive drag
const ANIMATION_DURATION = 200;
const LONG_PRESS_DURATION = 400; // Reduced for more immediate response

const DragContext = createContext<DragContextType | undefined>(undefined);

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [columnPreferences, setColumnPreferences] = useLocalStorage<ColumnPreferences>(
    'columnPreferences',
    {
      collapsed: {},
      width: {},
      height: {},
      order: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      zoom: 1,
      version: 1,
    }
  );

  const [dragState, setDragState] = useState<DragState>({
    isDropAnimating: false,
    sourceDay: null,
    targetDay: null,
    dragDistance: 0,
    isDragging: false,
    dragThreshold: DRAG_THRESHOLD,
    touchPoint: null,
    lastDragTime: Date.now(),
    dragSpeed: 0
  });

  const touchTimeoutRef = useRef<number>();
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimeoutRef = useRef<number>();
  const eventCleanupRef = useRef<(() => void)[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const dragInProgressRef = useRef(false);
  const errorRecoveryTimeoutRef = useRef<number>();

  const cleanup = useCallback(() => {
    window.clearTimeout(touchTimeoutRef.current);
    window.clearTimeout(longPressTimeoutRef.current);
    window.clearTimeout(errorRecoveryTimeoutRef.current);
    
    eventCleanupRef.current.forEach(cleanup => cleanup());
    eventCleanupRef.current = [];
    
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    dragInProgressRef.current = false;
    
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      touchPoint: null,
    }));

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
  }, []);

  // Handle automatic cleanup if the component gets stuck in drag state
  useEffect(() => {
    if (dragState.isDragging) {
      const autoCleanupTimeout = window.setTimeout(() => {
        console.warn("Automatically cleaning up drag state after timeout");
        cleanup();
      }, 30000); // 30 seconds max drag time
      
      return () => {
        window.clearTimeout(autoCleanupTimeout);
      };
    }
  }, [dragState.isDragging, cleanup]);

  const isColumnCollapsed = useCallback(
    (day: string) => !!columnPreferences.collapsed[day],
    [columnPreferences.collapsed]
  );

  const toggleColumnCollapse = useCallback((day: string) => {
    requestAnimationFrame(() => {
      setColumnPreferences(prev => ({
        ...prev,
        collapsed: {
          ...prev.collapsed,
          [day]: !prev.collapsed[day],
        }
      }));
    });
  }, [setColumnPreferences]);

  const adjustColumnWidth = useCallback(
    debounce((day: string, width: number) => {
      requestAnimationFrame(() => {
        setColumnPreferences(prev => ({
          ...prev,
          width: {
            ...prev.width,
            [day]: Math.max(200, Math.min(800, width)), // Constrain width
          }
        }));
      });
    }, 16),
    [setColumnPreferences]
  );

  const setColumnHeight = useCallback((day: string, height: number) => {
    requestAnimationFrame(() => {
      setColumnPreferences(prev => ({
        ...prev,
        height: {
          ...prev.height,
          [day]: height,
        }
      }));
    });
  }, [setColumnPreferences]);

  // Handle visibility changes to abort drag operations when the app loses focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && dragState.isDragging) {
        cleanup();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle touch cancel events that might occur during drag
    const handleTouchCancel = () => {
      if (dragState.isDragging) {
        cleanup();
      }
    };
    
    document.addEventListener('touchcancel', handleTouchCancel);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchcancel', handleTouchCancel);
      cleanup();
    };
  }, [dragState.isDragging, cleanup]);

  const touchStartHandler = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1 || dragInProgressRef.current) return;
    
    const touch = e.touches[0];
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    dragStartPositionRef.current = { x: touch.clientX, y: touch.clientY };
    
    cleanup();
    
    longPressTimeoutRef.current = window.setTimeout(() => {
      if (dragStartPositionRef.current) {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        dragInProgressRef.current = true;
        
        setDragState(prev => ({ 
          ...prev, 
          isDragging: true,
          lastDragTime: Date.now()
        }));
        
        // Provide haptic feedback
        if (window.navigator.vibrate) {
          window.navigator.vibrate([50]);
        }
      }
    }, LONG_PRESS_DURATION);

    const preventScroll = (e: TouchEvent) => {
      if (dragState.isDragging) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventScroll, { passive: false });
    eventCleanupRef.current.push(() => {
      document.removeEventListener('touchmove', preventScroll);
    });
  }, [cleanup, dragState.isDragging]);

  const touchMoveHandler = useCallback((e: TouchEvent) => {
    // Only process touch moves if dragging or we're in the initial drag detection phase
    if (!lastTouchRef.current || !dragStartPositionRef.current) return;

    const touch = e.touches[0];
    const now = Date.now();
    const deltaTime = now - (dragState.lastDragTime || now);
    
    if (deltaTime < 16) {
      // Skip processing if we're updating too frequently (more than 60fps)
      return;
    }
    
    const deltaX = touch.clientX - dragStartPositionRef.current.x;
    const deltaY = touch.clientY - dragStartPositionRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const speed = deltaTime > 0 ? distance / deltaTime : 0;

    // Cancel long press if user moved more than the threshold
    if (!dragState.isDragging && distance > DRAG_THRESHOLD) {
      window.clearTimeout(longPressTimeoutRef.current);
    }

    if (dragState.isDragging) {
      // Prevent default to stop scrolling during drag
      e.preventDefault();
      
      try {
        requestAnimationFrame(() => {
          setDragState(prevState => ({
            ...prevState,
            dragDistance: distance,
            touchPoint: { x: touch.clientX, y: touch.clientY },
            lastDragTime: now,
            dragSpeed: speed
          }));
        });
      } catch (error) {
        console.error("Error updating drag state:", error);
        // Attempt recovery rather than immediate cleanup
        errorRecoveryTimeoutRef.current = window.setTimeout(() => {
          cleanup();
        }, 300);
      }
    }
  }, [dragState.isDragging, dragState.lastDragTime, cleanup]);

  const touchEndHandler = useCallback(() => {
    // Clear long press timeout if touch ends before long press timer fires
    window.clearTimeout(longPressTimeoutRef.current);
    
    // Only handle touch end if we were dragging
    if (dragState.isDragging) {
      cleanup();
    }
    
    // Reset refs
    lastTouchRef.current = null;
    dragStartPositionRef.current = null;
  }, [cleanup, dragState.isDragging]);

  useEffect(() => {
    // Set up global touch end handler
    document.addEventListener('touchend', touchEndHandler);
    
    return () => {
      document.removeEventListener('touchend', touchEndHandler);
    };
  }, [touchEndHandler]);

  // Added error recovery to provide a better UX
  const handleDragError = useCallback((error: Error) => {
    console.error("Drag operation failed:", error);
    toast.error("Drag operation failed", {
      description: "Please try again. If the issue persists, reload the page."
    });
    cleanup();
  }, [cleanup]);

  return (
    <DragContext.Provider
      value={{
        dragState,
        setDragState,
        columnPreferences,
        setColumnPreferences,
        isColumnCollapsed,
        toggleColumnCollapse,
        adjustColumnWidth,
        setColumnHeight,
        touchStartHandler,
        touchMoveHandler,
        cleanup,
        handleDragError,
      }}
    >
      {children}
    </DragContext.Provider>
  );
}

export function useDragContext() {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error("useDragContext must be used within a DragProvider");
  }
  return context;
}
