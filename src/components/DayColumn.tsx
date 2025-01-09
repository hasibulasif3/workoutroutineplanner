import { useDroppable } from "@dnd-kit/core";
import { WorkoutCard } from "./WorkoutCard";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useDragContext } from "./weekly-board/DragContext";

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
  const { dragState } = useDragContext();

  const isEmpty = workouts.length === 0;
  const isValidDropZone = !dragState.sourceDay || dragState.sourceDay !== day;

  return (
    <div className="w-full">
      <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center justify-center gap-2">
        <span>{day}</span>
        {isEmpty ? (
          <span className="text-xs text-gray-400">(Rest Day)</span>
        ) : (
          <span className="text-xs text-primary">{workouts.length} workouts</span>
        )}
      </h2>
      <motion.div 
        ref={setNodeRef} 
        className={`day-column space-y-4 ${isEmpty ? 'empty' : ''} ${isOver ? 'dragging-over' : ''}`}
        initial={false}
        animate={{
          backgroundColor: isOver && isValidDropZone ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          scale: isOver && isValidDropZone ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
        role="region"
        aria-label={`${day} workout column`}
        tabIndex={0}
      >
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
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} {...workout} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}