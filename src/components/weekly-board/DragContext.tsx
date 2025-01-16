import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { DragState, ColumnPreferences, DragContextType } from "./types";
import { toast } from "sonner";
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
  });

  const touchTimeoutRef = useRef<number>();
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimeoutRef = useRef<number>();
  const eventCleanupRef = useRef<(() => void)[]>([]);

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

  const adjustColumnWidth = useCallback((day: string, width: number) => {
    requestAnimationFrame(() => {
      setColumnPreferences(prev => ({
        ...prev,
        width: {
          ...prev.width,
          [day]: width,
        }
      }));
    });
  }, [setColumnPreferences]);

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

  const touchStartHandler = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    dragStartPositionRef.current = { x: touch.clientX, y: touch.clientY };
    
    cleanup();
    
    longPressTimeoutRef.current = window.setTimeout(() => {
      if (dragStartPositionRef.current) {
        document.body.style.overflow = 'hidden';
        setDragState(prev => ({ ...prev, isDragging: true }));
        
        if (window.navigator.vibrate) {
          window.navigator.vibrate([50]);
        }
      }
    }, LONG_PRESS_DURATION);
  }, [cleanup]);

  const touchMoveHandler = useCallback((e: TouchEvent) => {
    if (!lastTouchRef.current || !dragStartPositionRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartPositionRef.current.x;
    const deltaY = touch.clientY - dragStartPositionRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > DRAG_THRESHOLD) {
      window.clearTimeout(longPressTimeoutRef.current);
    }

    if (dragState.isDragging) {
      e.preventDefault();
      requestAnimationFrame(() => {
        setDragState(prevState => ({
          ...prevState,
          dragDistance: distance,
          touchPoint: { x: touch.clientX, y: touch.clientY },
        }));
      });
    }
  }, [dragState.isDragging]);

  useEffect(() => {
    return () => {
      cleanup();
    };
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
