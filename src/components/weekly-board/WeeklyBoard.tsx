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
import { useMediaQuery } from "@/hooks/use-mobile";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function WeeklyBoard() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropSound] = useState(() => new Audio("/src/assets/drop-sound.mp3"));
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width: 768px)");

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

  const days = Object.keys(workouts);

  const {
    handleDragStart,
    handleDragEnd,
    undoLastMove,
    hasUndo
  } = useWorkoutDrag(workouts, async (newWorkouts) => {
    const updatedWorkout = Object.values(newWorkouts)
      .flat()
      .find(w => w.id === activeId);
    
    if (updatedWorkout) {
      await workoutService.updateWorkout(updatedWorkout);
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    }
  }, dropSound);

  useEffect(() => {
    const unsubscribe = workoutService.subscribeToWorkouts((updatedWorkouts) => {
      queryClient.setQueryData(['workouts'], updatedWorkouts);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  const handleNext = () => {
    setCurrentDayIndex((prev) => (prev + 1) % days.length);
  };

  const handlePrev = () => {
    setCurrentDayIndex((prev) => (prev - 1 + days.length) % days.length);
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
            onWorkoutCreate={(workout) => workoutService.createWorkout(workout)}
          />

          <div className="overflow-x-hidden pb-4">
            <DndContext 
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd} 
              collisionDetection={closestCenter}
            >
              {isMobile ? (
                <div className="relative">
                  <div className="flex justify-between items-center mb-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrev}
                      className="absolute left-0 z-10"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <h2 className="text-xl font-bold text-center w-full">
                      {days[currentDayIndex]}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNext}
                      className="absolute right-0 z-10"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="w-full">
                    <SortableContext
                      items={workouts[days[currentDayIndex]].map((w) => w.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <DayColumn 
                        day={days[currentDayIndex]} 
                        workouts={workouts[days[currentDayIndex]]} 
                      />
                    </SortableContext>
                  </div>
                </div>
              ) : (
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
              )}
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