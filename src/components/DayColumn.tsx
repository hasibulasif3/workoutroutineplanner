import { useDroppable } from "@dnd-kit/core";
import { WorkoutCard } from "./WorkoutCard";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDragContext } from "./weekly-board/DragContext";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface DayColumnProps {
  day: string;
  workouts: Array<{
    id: string;
    title: string;
    duration: string;
    type: "strength" | "cardio" | "flexibility";
    difficulty?: "beginner" | "intermediate" | "advanced";
    calories?: string;
  }>;
}

export function DayColumn({ day, workouts }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: day,
  });
  
  const { 
    dragState, 
    isColumnCollapsed, 
    toggleColumnCollapse,
  } = useDragContext();

  const isEmpty = workouts.length === 0;
  const isValidDropZone = !dragState.sourceDay || dragState.sourceDay !== day;
  const isCollapsed = isColumnCollapsed(day);

  return (
    <div className="w-full min-w-[280px] md:min-w-0">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 border-b border-border">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleColumnCollapse(day)}
              className="p-1 h-auto hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-accent"
            >
              {isCollapsed ? 
                <ChevronRight className="w-5 h-5 text-muted-foreground" /> : 
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              }
            </Button>
            <h2 className="text-lg font-semibold tracking-tight">{day}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {!isEmpty && (
              <>
                <span className="font-medium">{workouts.length}</span>
                <span className="text-xs">workouts</span>
                <span>•</span>
                <span className="font-medium">
                  {workouts.reduce((sum, w) => sum + parseInt(w.duration), 0)}
                </span>
                <span className="text-xs">min</span>
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            ref={setNodeRef} 
            className={cn(
              "p-4 space-y-4 min-h-[calc(100vh-12rem)] relative transition-all duration-200",
              isEmpty && "empty bg-accent/5 border-2 border-dashed border-accent/20 rounded-lg",
              isOver && isValidDropZone && "bg-accent/10 border-accent/40"
            )}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isEmpty ? (
              <motion.div 
                className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Calendar className="w-10 h-10 opacity-50" />
                <p className="text-sm font-medium">Drop workouts here</p>
                <motion.div 
                  className="absolute inset-0 pointer-events-none"
                  animate={{ 
                    boxShadow: isOver ? "inset 0 0 0 2px hsl(var(--accent))" : "inset 0 0 0 0 transparent" 
                  }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                layout
              >
                {workouts.map((workout, index) => (
                  <WorkoutCard 
                    key={workout.id} 
                    {...workout} 
                    isFirst={index === 0}
                    isLast={index === workouts.length - 1}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}