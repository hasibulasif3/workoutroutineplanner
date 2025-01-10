import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragHandleProps {
  className?: string;
}

export function DragHandle({ className }: DragHandleProps) {
  return (
    <div 
      className={cn(
        "touch-none cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-white/10 transition-colors",
        className
      )}
      data-drag-handle
    >
      <GripVertical className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}