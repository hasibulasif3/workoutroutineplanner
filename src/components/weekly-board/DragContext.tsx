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
  // Use local storage for persistent preferences
  const [columnPreferences, setColumnPreferences] = useLocalStorage<ColumnPreferences>(
    'columnPreferences',
    {
      collapsed: {},
      width: {},
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

  // Refs for cleanup and event tracking
  const touchTimeoutRef = useRef<number>();
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimeoutRef = useRef<number>();
  const eventCleanupRef = useRef<(() => void)[]>([]);

  // Enhanced cleanup function
  const cleanup = useCallback(() => {
    window.clearTimeout(touchTimeoutRef.current);
    window.clearTimeout(longPressTimeoutRef.current);
    eventCleanupRef.current.forEach(cleanup => cleanup());
    eventCleanupRef.current = [];
    
    // Reset scroll lock
    document.body.style.overflow = '';
    
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      touchPoint: null,
    }));
  }, []);

  // Improved touch handling with better sensitivity
  const touchStartHandler = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    dragStartPositionRef.current = { x: touch.clientX, y: touch.clientY };
    
    // Clear existing timeouts
    cleanup();
    
    // Set up long press detection with proper cleanup
    longPressTimeoutRef.current = window.setTimeout(() => {
      if (dragStartPositionRef.current) {
        document.body.style.overflow = 'hidden'; // Prevent scroll during drag
        setDragState(prev => ({ ...prev, isDragging: true }));
        
        if (window.navigator.vibrate) {
          window.navigator.vibrate([50]);
        }
      }
    }, LONG_PRESS_DURATION);
  }, [cleanup]);

  // Enhanced touch move handling
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Column management with optimized performance
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