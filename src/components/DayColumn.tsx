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
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleColumnCollapse(day)}
            className="p-1 h-auto"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <h2 className="text-lg md:text-xl font-bold">{day}</h2>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            ref={setNodeRef} 
            className={cn(
              "day-column space-y-4 relative",
              isEmpty && "empty",
              isOver && isValidDropZone && "dragging-over"
            )}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOver && isValidDropZone && (
              <motion.div
                className="absolute inset-0 border-2 border-dashed border-primary rounded-lg pointer-events-none"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            )}

            {isEmpty ? (
              <motion.div 
                className="flex flex-col items-center justify-center h-full text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Calendar className="w-8 md:w-12 h-8 md:h-12 mb-2 opacity-50" />
                <p className="text-sm">Drop workouts here</p>
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