import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { DragState, ColumnPreferences, DragContextType } from "./types";
import { toast } from "sonner";
import { debounce } from "lodash";

const DRAG_THRESHOLD = 8;
const TOUCH_TIMEOUT = 150;
const ANIMATION_DURATION = 200;
const LONG_PRESS_DURATION = 500;

const DragContext = createContext<DragContextType | undefined>(undefined);

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [dragState, setDragState] = useState<DragState>({
    isDropAnimating: false,
    sourceDay: null,
    targetDay: null,
    dragDistance: 0,
    isDragging: false,
    dragThreshold: DRAG_THRESHOLD,
    touchPoint: null,
  });

  // Persist column preferences in localStorage with version control
  const [columnPreferences, setColumnPreferences] = useState<ColumnPreferences>(() => {
    try {
      const saved = localStorage.getItem('columnPreferences');
      const defaultPrefs = {
        collapsed: {},
        width: {},
        order: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        zoom: 1,
        version: 1, // Add version control
      };
      
      if (!saved) return defaultPrefs;
      
      const parsed = JSON.parse(saved);
      return { ...defaultPrefs, ...parsed, version: 1 };
    } catch (error) {
      console.error('Error loading preferences:', error);
      return {
        collapsed: {},
        width: {},
        order: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        zoom: 1,
        version: 1,
      };
    }
  });

  const touchTimeoutRef = useRef<number>();
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimeoutRef = useRef<number>();

  // Optimized state persistence with error handling
  const persistColumnPreferences = useCallback(
    debounce((prefs: ColumnPreferences) => {
      try {
        localStorage.setItem('columnPreferences', JSON.stringify(prefs));
      } catch (error) {
        console.error('Error saving preferences:', error);
        toast.error("Failed to save column preferences");
      }
    }, 300),
    []
  );

  useEffect(() => {
    persistColumnPreferences(columnPreferences);
  }, [columnPreferences, persistColumnPreferences]);

  // Improved touch handling with better sensitivity
  const touchStartHandler = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return; // Prevent multi-touch issues
    
    const touch = e.touches[0];
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    dragStartPositionRef.current = { x: touch.clientX, y: touch.clientY };
    
    // Clear any existing timeouts
    window.clearTimeout(touchTimeoutRef.current);
    window.clearTimeout(longPressTimeoutRef.current);
    
    // Set up long press detection
    longPressTimeoutRef.current = window.setTimeout(() => {
      if (dragStartPositionRef.current) {
        setDragState(prev => ({ ...prev, isDragging: true }));
        if (window.navigator.vibrate) {
          window.navigator.vibrate([50]);
        }
      }
    }, LONG_PRESS_DURATION);
  }, []);

  // Enhanced touch move handling with improved scroll prevention
  const touchMoveHandler = useCallback((e: TouchEvent) => {
    if (!lastTouchRef.current || !dragStartPositionRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartPositionRef.current.x;
    const deltaY = touch.clientY - dragStartPositionRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Clear long press if movement exceeds threshold
    if (distance > DRAG_THRESHOLD) {
      window.clearTimeout(longPressTimeoutRef.current);
    }

    if (dragState.isDragging) {
      e.preventDefault();
      setDragState(prevState => ({
        ...prevState,
        dragDistance: distance,
        touchPoint: { x: touch.clientX, y: touch.clientY },
      }));
    }
  }, [dragState.isDragging]);

  // Cleanup touch handling
  const touchEndHandler = useCallback(() => {
    window.clearTimeout(touchTimeoutRef.current);
    window.clearTimeout(longPressTimeoutRef.current);
    lastTouchRef.current = null;
    dragStartPositionRef.current = null;
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      touchPoint: null,
    }));
  }, []);

  // Column management functions with improved error handling
  const isColumnCollapsed = useCallback(
    (day: string) => !!columnPreferences.collapsed[day],
    [columnPreferences.collapsed]
  );

  const toggleColumnCollapse = useCallback((day: string) => {
    setColumnPreferences(prev => {
      const newPrefs = {
        ...prev,
        collapsed: {
          ...prev.collapsed,
          [day]: !prev.collapsed[day],
        }
      };
      persistColumnPreferences(newPrefs);
      return newPrefs;
    });
  }, [persistColumnPreferences]);

  const collapseAllColumns = useCallback(() => {
    setColumnPreferences(prev => ({
      ...prev,
      collapsed: Object.fromEntries(prev.order.map(day => [day, true]))
    }));
  }, []);

  const expandAllColumns = useCallback(() => {
    setColumnPreferences(prev => ({
      ...prev,
      collapsed: {}
    }));
  }, []);

  const adjustColumnWidth = useCallback((day: string, width: number) => {
    setColumnPreferences(prev => ({
      ...prev,
      width: {
        ...prev.width,
        [day]: width,
      }
    }));
  }, []);

  const setColumnOrder = useCallback((order: string[]) => {
    setColumnPreferences(prev => ({
      ...prev,
      order,
    }));
    toast.success("Column order updated");
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    setColumnPreferences(prev => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(1.5, level)),
    }));
  }, []);

  const setColumnHeight = useCallback((day: string, height: number) => {
    setColumnPreferences(prev => ({
      ...prev,
      height: {
        ...prev.height,
        [day]: height,
      }
    }));
  }, []);

  return (
    <DragContext.Provider
      value={{
        dragState,
        setDragState,
        columnPreferences,
        setColumnPreferences,
        isColumnCollapsed,
        toggleColumnCollapse,
        collapseAllColumns,
        expandAllColumns,
        adjustColumnWidth,
        setColumnHeight,
        setColumnOrder,
        setZoomLevel,
        touchStartHandler,
        touchMoveHandler,
        touchEndHandler,
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
