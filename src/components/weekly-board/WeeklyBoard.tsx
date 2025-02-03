import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { DayColumn } from "../DayColumn";
import { WorkoutCard } from "../WorkoutCard";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { WeeklyWorkouts, Workout } from "@/types/workout";
import { StatsBar } from "../StatsBar";
import { ActionBar } from "../ActionBar";
import { ErrorBoundary } from "../ErrorBoundary";
import { DragProvider } from "./DragContext";
import { useQuery } from "@tanstack/react-query";
import { workoutService } from "@/services/workoutService";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function WeeklyBoard() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropSound] = useState(() => new Audio("/src/assets/drop-sound.mp3"));
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
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
    queryFn: () => workoutService.getWorkouts(),
  });

  const days = Object.keys(workouts) as Array<keyof WeeklyWorkouts>;

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

    const activeDay = Object.entries(workouts).find(([day, items]) =>
      items.find((item) => item.id === active.id.toString())
    )?.[0];

    const overDay = over.id.toString();

    if (activeDay === overDay) return;

    if (activeDay) {
      const workout = workouts[activeDay as keyof WeeklyWorkouts].find(
        item => item.id === active.id.toString()
      );
      
      if (!workout) return;

      const updatedWorkout: Workout = {
        ...workout,
        last_modified: new Date().toISOString()
      };

      workoutService.updateWorkout(updatedWorkout.id, updatedWorkout)
        .then(() => {
          dropSound.play().catch(() => {});
          toast.success("Workout moved successfully!");
        })
        .catch((error) => {
          console.error('Error updating workout:', error);
          toast.error("Failed to move workout");
        });
    }
  };

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
        <div className="relative p-4 md:p-8 min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-sm transition-all duration-300 animate-fade-in dark:bg-gradient-to-br dark:from-background/95 dark:via-background/90 dark:to-background/85">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-12">
              <motion.h1 
                className="text-5xl font-bold title-gradient mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Workout Routine Planner
              </motion.h1>
              
              <motion.p 
                className="text-lg text-gray-400 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Plan your workouts, track your progress, achieve your goals
              </motion.p>
              
              <StatsBar workouts={workouts} />
              <ActionBar workouts={workouts} onWorkoutCreate={(workout) => workoutService.createWorkout(workout)} />
            </div>

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
        </div>
      </DragProvider>
    </ErrorBoundary>
  );
}