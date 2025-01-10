import { createContext, useContext, useState } from "react";
import { DragState, ColumnPreferences } from "./types";

interface DragContextType {
  dragState: DragState;
  setDragState: (state: DragState) => void;
  columnPreferences: ColumnPreferences;
  setColumnPreferences: (prefs: ColumnPreferences) => void;
  isColumnCollapsed: (day: string) => boolean;
  toggleColumnCollapse: (day: string) => void;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [dragState, setDragState] = useState<DragState>({
    isDropAnimating: false,
    sourceDay: null,
    targetDay: null,
    dragDistance: 0,
    isDragging: false,
  });

  const [columnPreferences, setColumnPreferences] = useState<ColumnPreferences>({
    collapsed: {},
    width: {},
    order: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  });

  const isColumnCollapsed = (day: string) => !!columnPreferences.collapsed[day];
  
  const toggleColumnCollapse = (day: string) => {
    setColumnPreferences(prev => ({
      ...prev,
      collapsed: {
        ...prev.collapsed,
        [day]: !prev.collapsed[day],
      }
    }));
  };

  return (
    <DragContext.Provider 
      value={{ 
        dragState, 
        setDragState, 
        columnPreferences, 
        setColumnPreferences,
        isColumnCollapsed,
        toggleColumnCollapse,
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