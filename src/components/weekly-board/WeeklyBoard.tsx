import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { WeeklyWorkouts, Workout } from "@/types/workout";
import { ErrorBoundary } from "../ErrorBoundary";
import { DayColumn } from "../DayColumn";
import { WorkoutCard } from "../WorkoutCard";
import { WeeklyBoardHeader } from "./WeeklyBoardHeader";
import { DragProvider } from "./DragContext";
import { useWorkoutDrag } from "./useWorkoutDrag";
import { workoutService } from "@/services/workoutService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function WeeklyBoard() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropSound] = useState(() => new Audio("/src/assets/drop-sound.mp3"));
  const queryClient = useQueryClient();

  const { data: workouts = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  }, isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: workoutService.fetchWorkouts,
  });

  const {
    handleDragStart,
    handleDragEnd,
    undoLastMove,
    hasUndo
  } = useWorkoutDrag(workouts, async (newWorkouts) => {
    // Update workouts in database when drag ends
    const updatedWorkout = Object.values(newWorkouts)
      .flat()
      .find(w => w.id === activeId);
    
    if (updatedWorkout) {
      await workoutService.updateWorkout(updatedWorkout);
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    }
  }, dropSound);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = workoutService.subscribeToWorkouts((updatedWorkouts) => {
      queryClient.setQueryData(['workouts'], updatedWorkouts);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  const handleWorkoutCreate = async (workoutData: Omit<Workout, "id" | "lastModified">) => {
    const newWorkout = {
      ...workoutData,
      lastModified: new Date(),
    };
    
    const createdWorkout = await workoutService.createWorkout(newWorkout);
    if (createdWorkout) {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeWorkout = activeId ? 
    Object.values(workouts).flat().find(w => w.id === activeId) : null;

  return (
    <ErrorBoundary>
      <DragProvider>
        <div className="p-4 md:p-8 animate-fade-in">
          <WeeklyBoardHeader 
            workouts={workouts} 
            onWorkoutCreate={handleWorkoutCreate}
          />

          <div className="overflow-x-auto pb-4">
            <DndContext 
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd} 
              collisionDetection={closestCenter}
            >
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-w-[768px]">
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
                  <div className="opacity-80 rotate-3 scale-105 pointer-events-none">
                    <WorkoutCard {...activeWorkout} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>

          {hasUndo && (
            <button
              onClick={undoLastMove}
              className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg hover:opacity-90 transition-opacity"
              aria-label="Undo last move"
            >
              Undo
            </button>
          )}
        </div>
      </DragProvider>
    </ErrorBoundary>
  );
}