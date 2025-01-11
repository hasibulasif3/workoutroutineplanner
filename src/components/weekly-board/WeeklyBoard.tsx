import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { WeeklyWorkouts, Workout } from "@/types/workout";
import { storageService } from "@/services/storageService";
import { ErrorBoundary } from "../ErrorBoundary";
import { DayColumn } from "../DayColumn";
import { WorkoutCard } from "../WorkoutCard";
import { WeeklyBoardHeader } from "./WeeklyBoardHeader";
import { DragProvider } from "./DragContext";
import { useWorkoutDrag } from "./useWorkoutDrag";
import { initialWorkouts } from "./initialData";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function WeeklyBoard() {
  const [workouts, setWorkouts] = useState<WeeklyWorkouts>(initialWorkouts);
  const [dropSound] = useState(() => new Audio("/src/assets/drop-sound.mp3"));
  const [isLoading, setIsLoading] = useState(true);

  const {
    activeId,
    handleDragStart,
    handleDragEnd,
    undoLastMove,
    hasUndo
  } = useWorkoutDrag(workouts, setWorkouts, dropSound);

  useEffect(() => {
    const savedWorkouts = storageService.loadWorkouts();
    if (savedWorkouts) {
      setWorkouts(savedWorkouts);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      storageService.saveWorkouts(workouts);
    }
  }, [workouts, isLoading]);

  const handleWorkoutCreate = (workoutData: Omit<Workout, 'id' | 'lastModified'>) => {
    const newWorkout: Workout = {
      id: uuidv4(),
      lastModified: new Date(),
      ...workoutData,
    };
    
    setWorkouts(prev => ({
      ...prev,
      Monday: [...prev.Monday, newWorkout],
    }));
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

          <ScrollArea className="w-full rounded-lg border">
            <div className="p-4">
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
                    <div className="opacity-90 rotate-2 scale-105 pointer-events-none">
                      <WorkoutCard {...activeWorkout} />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {hasUndo && (
            <motion.button
              onClick={undoLastMove}
              className="fixed bottom-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-lg hover:opacity-90 transition-all focus:ring-2 focus:ring-accent focus:ring-offset-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              Undo
            </motion.button>
          )}
        </div>
      </DragProvider>
    </ErrorBoundary>
  );
}