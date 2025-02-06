import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { DayColumn } from "../DayColumn";
import { WorkoutCard } from "../WorkoutCard";
import { motion } from "framer-motion";
import { WeeklyWorkouts, Workout } from "@/types/workout";
import { StatsBar } from "../StatsBar";
import { ActionBar } from "../ActionBar";
import { RetryableErrorBoundary } from "../RetryableErrorBoundary";
import { DragProvider } from "./DragContext";
import { useWorkoutSync } from "@/hooks/useWorkoutSync";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useRealtimeWorkouts } from "@/hooks/useRealtimeWorkouts";
import { useQuery } from "@tanstack/react-query";
import { workoutService } from "@/services/workoutService";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-mobile";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export function WeeklyBoard() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const { syncWorkout } = useWorkoutSync();
  const { isOnline, saveOffline } = useOfflineSync();
  const { isSubscribed } = useRealtimeWorkouts();

  const { data: workouts = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  }, isLoading, error } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutService.getWorkouts(),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
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

      if (!isOnline) {
        await saveOffline(workout);
        return;
      }

      await syncWorkout(workout, activeDay, overDay);
    }
  };

  const handlePrev = () => {
    setCurrentDayIndex((prev) => (prev === 0 ? DAYS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentDayIndex((prev) => (prev === DAYS.length - 1 ? 0 : prev + 1));
  };

  const activeWorkout = activeId ? 
    Object.values(workouts).flat().find(w => w.id === activeId) : null;

  if (error) {
    return (
      <RetryableErrorBoundary>
        <div className="p-8">
          <h1>Error loading workouts</h1>
        </div>
      </RetryableErrorBoundary>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <DragProvider>
      <div className="p-8 animate-fade-in">
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
            <div className="relative backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  className="absolute left-4 z-10 hover:bg-white/10"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <h2 className="text-xl font-bold text-center w-full text-white">
                  {DAYS[currentDayIndex]}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-4 z-10 hover:bg-white/10"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
              <div className="w-full">
                <SortableContext
                  items={workouts[DAYS[currentDayIndex]].map((w) => w.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DayColumn 
                    day={DAYS[currentDayIndex]} 
                    workouts={workouts[DAYS[currentDayIndex]]} 
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
    </DragProvider>
  );
}