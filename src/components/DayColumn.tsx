import { useDroppable } from "@dnd-kit/core";
import { WorkoutCard } from "./WorkoutCard";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useDragContext } from "./weekly-board/DragContext";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useDragEvents } from "@/hooks/useDragEvents";
import { MouseEvent, TouchEvent, useRef, useEffect } from "react";

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
  
  const columnRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  
  const { 
    dragState, 
    isColumnCollapsed, 
    toggleColumnCollapse,
    adjustColumnWidth,
    setColumnHeight
  } = useDragContext();

  const { handleStart: handleResizeStart } = useDragEvents({
    onDragMove: (e) => {
      const pos = 'touches' in e ? e.touches[0] : e;
      requestAnimationFrame(() => {
        adjustColumnWidth(day, pos.clientX);
      });
    },
    threshold: 2,
    debounceMs: 8
  });

  // Update column height with ResizeObserver
  useEffect(() => {
    if (columnRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          requestAnimationFrame(() => {
            setColumnHeight(day, entry.contentRect.height);
          });
        }
      });
      
      observer.observe(columnRef.current);
      return () => observer.disconnect();
    }
  }, [day, setColumnHeight]);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleResizeStart(e);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleResizeStart(e);
  };

  const isEmpty = workouts.length === 0;
  const isValidDropZone = !dragState.sourceDay || dragState.sourceDay !== day;
  const isCollapsed = isColumnCollapsed(day);

  return (
    <LayoutGroup>
      <motion.div 
        ref={columnRef}
        className="w-full min-h-[100px]"
        layout="position"
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          mass: 0.8 
        }}
        role="region"
        aria-label={`${day} workout column`}
      >
        <motion.div 
          className="flex items-center justify-between mb-4 px-2"
          layout
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleColumnCollapse(day)}
              className="p-2 h-auto hover:bg-accent/50 transition-colors focus:ring-2 focus:ring-primary"
            >
              <motion.div
                initial={false}
                animate={{ rotate: isCollapsed ? 0 : 90 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </motion.div>
            </Button>
            <h2 className="text-lg md:text-xl font-bold">{day}</h2>
          </div>
          
          <div 
            ref={resizeRef}
            className="w-2 h-full cursor-col-resize hover:bg-accent/50 transition-colors"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div 
              ref={setNodeRef} 
              className={cn(
                "day-column space-y-4 relative min-h-[200px] p-4 rounded-lg transition-colors",
                isEmpty && "empty bg-accent/5",
                isOver && isValidDropZone && "dragging-over bg-accent/10",
                "touch-none"
              )}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.8,
                opacity: { duration: 0.2 }
              }}
              layout="position"
              role="list"
              aria-label={`${day} workouts`}
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
                  className="flex flex-col items-center justify-center h-[200px] text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Calendar className="w-8 md:w-12 h-8 md:h-12 mb-2 opacity-50" />
                  <p className="text-sm">Drop workouts here</p>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-4"
                  layout="position"
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
      </motion.div>
    </LayoutGroup>
  );
}