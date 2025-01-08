import { useDroppable } from "@dnd-kit/core";
import { WorkoutCard } from "./WorkoutCard";
import { Calendar } from "lucide-react";

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

  const isEmpty = workouts.length === 0;

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
        <span>{day}</span>
        {isEmpty ? (
          <span className="text-xs text-gray-400">(Rest Day)</span>
        ) : (
          <span className="text-xs text-primary">{workouts.length} workouts</span>
        )}
      </h2>
      <div 
        ref={setNodeRef} 
        className={`day-column space-y-4 ${isEmpty ? 'empty' : ''} ${isOver ? 'dragging-over' : ''}`}
        aria-label={`${day} workout column`}
      >
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Calendar className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">Drop workouts here</p>
          </div>
        ) : (
          workouts.map((workout) => (
            <WorkoutCard key={workout.id} {...workout} />
          ))
        )}
      </div>
    </div>
  );
}