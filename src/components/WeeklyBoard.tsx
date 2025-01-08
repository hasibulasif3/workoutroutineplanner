import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { DayColumn } from "./DayColumn";
import { CreateWorkoutDialog } from "./CreateWorkoutDialog";
import { v4 as uuidv4 } from "uuid";

const initialWorkouts = {
  Monday: [
    { id: "1", title: "Morning Run", duration: "30", type: "cardio", difficulty: "beginner", calories: "300" },
    { id: "2", title: "Push-ups", duration: "15", type: "strength", difficulty: "intermediate", calories: "150" },
  ],
  Tuesday: [
    { id: "3", title: "Yoga", duration: "45", type: "flexibility", difficulty: "beginner", calories: "200" },
  ],
  Wednesday: [
    { id: "4", title: "HIIT", duration: "25", type: "cardio", difficulty: "advanced", calories: "400" },
  ],
  Thursday: [
    { id: "5", title: "Swimming", duration: "40", type: "cardio", difficulty: "intermediate", calories: "450" },
  ],
  Friday: [
    { id: "6", title: "Weight Training", duration: "50", type: "strength", difficulty: "advanced", calories: "500" },
  ],
  Saturday: [],
  Sunday: [],
};

export function WeeklyBoard() {
  const [workouts, setWorkouts] = useState(initialWorkouts);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeDay = Object.entries(workouts).find(([day, items]) =>
      items.find((item) => item.id === active.id)
    )?.[0];

    const overDay = over.id as string;

    if (activeDay === overDay) return;

    if (activeDay) {
      setWorkouts(prev => {
        const workout = prev[activeDay].find(item => item.id === active.id);
        const newWorkouts = {
          ...prev,
          [activeDay]: prev[activeDay].filter(item => item.id !== active.id),
          [overDay]: [...prev[overDay], workout!]
        };
        return newWorkouts;
      });
    }
  };

  const handleWorkoutCreate = (workoutData: any) => {
    const newWorkout = {
      id: uuidv4(),
      ...workoutData,
    };
    
    setWorkouts(prev => ({
      ...prev,
      Monday: [...prev.Monday, newWorkout],
    }));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Unfit Weekly Planner
        </h1>
        <CreateWorkoutDialog onWorkoutCreate={handleWorkoutCreate} />
      </div>
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="grid grid-cols-7 gap-4">
          {Object.entries(workouts).map(([day, dayWorkouts]) => (
            <SortableContext
              key={day}
              items={dayWorkouts.map((w) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <DayColumn day={day} workouts={dayWorkouts} />
            </SortableContext>
          ))}
        </div>
      </DndContext>
    </div>
  );
}