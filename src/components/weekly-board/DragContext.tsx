import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { DragState, ColumnPreferences } from "./types";
import { toast } from "sonner";

interface DragContextType {
  dragState: DragState;
  setDragState: (state: DragState) => void;
  columnPreferences: ColumnPreferences;
  setColumnPreferences: (prefs: ColumnPreferences) => void;
  isColumnCollapsed: (day: string) => boolean;
  toggleColumnCollapse: (day: string) => void;
  collapseAllColumns: () => void;
  expandAllColumns: () => void;
  adjustColumnWidth: (day: string, width: number) => void;
  setColumnOrder: (order: string[]) => void;
  setZoomLevel: (level: number) => void;
  touchStartHandler: (e: TouchEvent) => void;
  touchMoveHandler: (e: TouchEvent) => void;
  touchEndHandler: () => void;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

const DRAG_THRESHOLD = 5;
const TOUCH_TIMEOUT = 300;

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

  const [columnPreferences, setColumnPreferences] = useState<ColumnPreferences>({
    collapsed: {},
    width: {},
    order: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    zoom: 1,
  });

  const touchTimeoutRef = useRef<number>();
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  const touchStartHandler = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    
    touchTimeoutRef.current = window.setTimeout(() => {
      setDragState(prev => ({ ...prev, isDragging: true }));
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, TOUCH_TIMEOUT);
  }, []);

  const touchMoveHandler = useCallback((e: TouchEvent) => {
    if (!lastTouchRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - lastTouchRef.current.x;
    const deltaY = touch.clientY - lastTouchRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > DRAG_THRESHOLD) {
      window.clearTimeout(touchTimeoutRef.current);
      setDragState(prev => ({
        ...prev,
        dragDistance: distance,
        touchPoint: { x: touch.clientX, y: touch.clientY },
      }));
    }
  }, []);

  const touchEndHandler = useCallback(() => {
    window.clearTimeout(touchTimeoutRef.current);
    lastTouchRef.current = null;
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      touchPoint: null,
    }));
  }, []);

  useEffect(() => {
    const savedPrefs = localStorage.getItem('columnPreferences');
    if (savedPrefs) {
      try {
        setColumnPreferences(JSON.parse(savedPrefs));
      } catch (error) {
        console.error('Error loading column preferences:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('columnPreferences', JSON.stringify(columnPreferences));
  }, [columnPreferences]);

  const isColumnCollapsed = useCallback(
    (day: string) => !!columnPreferences.collapsed[day],
    [columnPreferences.collapsed]
  );

  const toggleColumnCollapse = useCallback((day: string) => {
    setColumnPreferences(prev => ({
      ...prev,
      collapsed: {
        ...prev.collapsed,
        [day]: !prev.collapsed[day],
      }
    }));
  }, []);

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