import { createContext, useContext, useState, useCallback } from "react";
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
}

const DragContext = createContext<DragContextType | undefined>(undefined);

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.5;

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [dragState, setDragState] = useState<DragState>({
    isDropAnimating: false,
    sourceDay: null,
    targetDay: null,
    dragDistance: 0,
    isDragging: false,
    dragThreshold: 5,
    touchPoint: null,
  });

  const [columnPreferences, setColumnPreferences] = useState<ColumnPreferences>({
    collapsed: {},
    width: {},
    order: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    zoom: 1,
  });

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
    const clampedLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, level));
    setColumnPreferences(prev => ({
      ...prev,
      zoom: clampedLevel,
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