import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { DayColumn } from "./DayColumn";
import { CreateWorkoutDialog } from "./CreateWorkoutDialog";
import { WorkoutCard } from "./WorkoutCard";
import { v4 as uuidv4 } from "uuid";
import { Activity, Calendar, Target, Trophy } from "lucide-react";
import { toast } from "sonner";

type WorkoutType = {
  id: string;
  title: string;
  duration: string;
  type: "strength" | "cardio" | "flexibility";
  difficulty?: "beginner" | "intermediate" | "advanced";
  calories?: string;
};

type WeeklyWorkouts = {
  [key: string]: WorkoutType[];
};

const initialWorkouts: WeeklyWorkouts = {
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
  const [workouts, setWorkouts] = useState<WeeklyWorkouts>(initialWorkouts);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropSound] = useState(() => new Audio("/src/assets/drop-sound.mp3"));

  const totalWorkouts = Object.values(workouts).flat().length;
  const activeDays = Object.entries(workouts).filter(([_, dayWorkouts]) => dayWorkouts.length > 0).length;
  const totalDuration = Object.values(workouts).flat().reduce((acc, workout) => acc + Number(workout.duration), 0);
  const totalCalories = Object.values(workouts).flat().reduce((acc, workout) => acc + Number(workout.calories || 0), 0);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
    // Trigger haptic feedback on mobile
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (!over) return;

    const activeDay = Object.entries(workouts).find(([day, items]) =>
      items.find((item) => item.id === active.id.toString())
    )?.[0];

    const overDay = over.id.toString();

    if (activeDay === overDay) return;

    if (activeDay) {
      setWorkouts(prev => {
        const workout = prev[activeDay].find(item => item.id === active.id.toString());
        const newWorkouts = {
          ...prev,
          [activeDay]: prev[activeDay].filter(item => item.id !== active.id.toString()),
          [overDay]: [...prev[overDay], workout!]
        };
        // Play drop sound
        dropSound.play().catch(() => {});
        toast.success("Workout moved successfully!");
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
    toast.success("New workout created!", {
      description: `${newWorkout.title} added to Monday`,
    });
  };

  const activeWorkout = activeId ? Object.values(workouts).flat().find(w => w.id === activeId) : null;

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-5xl font-bold title-gradient mb-4">
          Unfit Weekly Planner
        </h1>
        <p className="text-lg text-gray-400 mb-8">Plan your workouts, track your progress, achieve your goals</p>
        
        <div className="stats-bar w-full max-w-4xl">
          <div className="stats-item">
            <Activity className="w-6 h-6 text-primary mb-2" />
            <span className="text-2xl font-bold">{totalWorkouts}</span>
            <span className="text-sm text-gray-400">Total Workouts</span>
          </div>
          <div className="stats-item">
            <Calendar className="w-6 h-6 text-secondary mb-2" />
            <span className="text-2xl font-bold">{activeDays}</span>
            <span className="text-sm text-gray-400">Active Days</span>
          </div>
          <div className="stats-item">
            <Target className="w-6 h-6 text-accent mb-2" />
            <span className="text-2xl font-bold">{totalDuration}</span>
            <span className="text-sm text-gray-400">Total Minutes</span>
          </div>
          <div className="stats-item">
            <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
            <span className="text-2xl font-bold">{totalCalories}</span>
            <span className="text-sm text-gray-400">Total Calories</span>
          </div>
        </div>

        <CreateWorkoutDialog onWorkoutCreate={handleWorkoutCreate} />
      </div>

      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd} 
        collisionDetection={closestCenter}
      >
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
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
        <DragOverlay>
          {activeId && activeWorkout ? (
            <div className="opacity-80 rotate-3 scale-105">
              <WorkoutCard {...activeWorkout} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
