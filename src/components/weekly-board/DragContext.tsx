import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { DragState, ColumnPreferences, DragContextType } from "./types";
import { debounce } from "lodash";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const DRAG_THRESHOLD = 8;
const TOUCH_TIMEOUT = 150;
const ANIMATION_DURATION = 200;
const LONG_PRESS_DURATION = 500;

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

  const cleanup = useCallback(() => {
    window.clearTimeout(touchTimeoutRef.current);
    window.clearTimeout(longPressTimeoutRef.current);
    eventCleanupRef.current.forEach(cleanup => cleanup());
    eventCleanupRef.current = [];
    
    document.body.style.overflow = '';
    
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      touchPoint: null,
    }));

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
  }, []);

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && dragState.isDragging) {
        cleanup();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanup();
    };
  }, [dragState.isDragging, cleanup]);

  const touchStartHandler = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    dragStartPositionRef.current = { x: touch.clientX, y: touch.clientY };
    
    cleanup();
    
    longPressTimeoutRef.current = window.setTimeout(() => {
      if (dragStartPositionRef.current) {
        document.body.style.overflow = 'hidden';
        setDragState(prev => ({ 
          ...prev, 
          isDragging: true,
          lastDragTime: Date.now()
        }));
        
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
    if (!lastTouchRef.current || !dragStartPositionRef.current) return;

    const touch = e.touches[0];
    const now = Date.now();
    const deltaTime = now - (dragState.lastDragTime || now);
    const deltaX = touch.clientX - dragStartPositionRef.current.x;
    const deltaY = touch.clientY - dragStartPositionRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const speed = distance / deltaTime;

    if (dragState.isDragging) {
      e.preventDefault();
      requestAnimationFrame(() => {
        setDragState(prevState => ({
          ...prevState,
          dragDistance: distance,
          touchPoint: { x: touch.clientX, y: touch.clientY },
          lastDragTime: now,
          dragSpeed: speed
        }));
      });
    }
  }, [dragState.isDragging, dragState.lastDragTime]);

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