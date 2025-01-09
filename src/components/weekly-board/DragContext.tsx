import { createContext, useContext, useState } from "react";
import { DragState } from "./types";

interface DragContextType {
  dragState: DragState;
  setDragState: (state: DragState) => void;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [dragState, setDragState] = useState<DragState>({
    isDropAnimating: false,
    sourceDay: null,
    targetDay: null,
  });

  return (
    <DragContext.Provider value={{ dragState, setDragState }}>
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