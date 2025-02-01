import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { DayColumn } from "./DayColumn";
import { WorkoutCard } from "./WorkoutCard";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { WeeklyWorkouts, Workout } from "@/types/workout";
import { StatsBar } from "./StatsBar";
import { ActionBar } from "./ActionBar";
import { ErrorBoundary } from "./ErrorBoundary";
import { DragProvider } from "./weekly-board/DragContext";
import { useWorkouts } from "@/hooks/useWorkouts";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";

export function WeeklyBoard() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropSound] = useState(() => new Audio("/src/assets/drop-sound.mp3"));
  
  const {
    workouts,
    isLoading,
    isError,
    createWorkout,
    updateWorkout,
  } = useWorkouts();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (!over) return;

    const activeWorkout = workouts.find(w => w.id === active.id.toString());
    const overDay = over.id.toString();

    if (!activeWorkout) return;

    updateWorkout({
      id: activeWorkout.id,
      workout: {
        ...activeWorkout,
        day: overDay,
        last_modified: new Date().toISOString()
      }
    });

    dropSound.play().catch(() => {});
  };

  const handleWorkoutCreate = (workoutData: Omit<Workout, 'id' | 'last_modified'>) => {
    createWorkout({
      ...workoutData,
      day: "Monday",
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Error loading workouts"
        description="There was a problem loading your workouts. Please try again."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  const workoutsByDay = workouts.reduce((acc, workout) => {
    const day = workout.day || "Monday";
    if (!acc[day]) acc[day] = [];
    acc[day].push(workout);
    return acc;
  }, {} as WeeklyWorkouts);

  const activeWorkout = activeId ? 
    workouts.find(w => w.id === activeId) : null;

  return (
    <ErrorBoundary>
      <DragProvider>
        <div className="p-4 md:p-8 animate-fade-in">
          <div className="flex flex-col items-center mb-8 md:mb-12">
            <motion.h1 
              className="text-3xl md:text-5xl font-bold title-gradient mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Workout Routine Planner
            </motion.h1>
            
            <motion.p 
              className="text-base md:text-lg text-gray-400 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Plan your workouts, track your progress, achieve your goals
            </motion.p>
            
            <StatsBar workouts={workoutsByDay} />
            <ActionBar workouts={workoutsByDay} onWorkoutCreate={handleWorkoutCreate} />
          </div>

          <DndContext 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd} 
            collisionDetection={closestCenter}
          >
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {Object.entries(workoutsByDay).map(([day, dayWorkouts]) => (
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
      </DragProvider>
    </ErrorBoundary>
  );
}