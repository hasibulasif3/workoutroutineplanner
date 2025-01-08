import { useDroppable } from "@dnd-kit/core";
import { WorkoutCard } from "./WorkoutCard";

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
  const { setNodeRef } = useDroppable({
    id: day,
  });

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">{day}</h2>
      <div ref={setNodeRef} className="day-column space-y-4">
        {workouts.map((workout) => (
          <WorkoutCard key={workout.id} {...workout} />
        ))}
      </div>
    </div>
  );
}