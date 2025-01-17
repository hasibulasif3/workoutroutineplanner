import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { DayColumn } from "./DayColumn";
import { WorkoutCard } from "./WorkoutCard";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { WeeklyWorkouts, Workout, WorkoutType, WorkoutDifficulty } from "@/types/workout";
import { StatsBar } from "./StatsBar";
import { ActionBar } from "./ActionBar";
import { ErrorBoundary } from "./ErrorBoundary";
import { DragProvider } from "./weekly-board/DragContext";
import { useWorkoutSync } from "@/hooks/useWorkoutSync";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function WeeklyBoard() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropSound] = useState(() => new Audio("/src/assets/drop-sound.mp3"));
  const queryClient = useQueryClient();
  const { syncWorkout } = useWorkoutSync();

  // Fetch workouts with React Query
  const { data: workouts = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  }, isLoading, error: fetchError } = useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group workouts by day using metadata
      const groupedWorkouts: WeeklyWorkouts = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };

      data.forEach((workout) => {
        const metadata = workout.metadata as { day?: string } | null;
        const day = metadata?.day || 'Monday';
        
        // Ensure type safety for workout type and difficulty
        const workoutType = validateWorkoutType(workout.type);
        const workoutDifficulty = validateWorkoutDifficulty(workout.difficulty);

        groupedWorkouts[day].push({
          id: workout.id,
          title: workout.title,
          type: workoutType,
          duration: workout.duration,
          difficulty: workoutDifficulty,
          calories: workout.calories,
          notes: workout.notes,
          completed: workout.completed,
          lastModified: new Date(workout.last_modified),
        });
      });

      return groupedWorkouts;
    },
    retry: 3,
    staleTime: 1000 * 60, // 1 minute
  });

  // Validation functions for type safety
  const validateWorkoutType = (type: string): WorkoutType => {
    const validTypes: WorkoutType[] = ["strength", "cardio", "flexibility"];
    return validTypes.includes(type as WorkoutType) 
      ? type as WorkoutType 
      : "strength";
  };

  const validateWorkoutDifficulty = (difficulty: string | null): WorkoutDifficulty | undefined => {
    const validDifficulties: WorkoutDifficulty[] = ["beginner", "intermediate", "advanced"];
    return difficulty && validDifficulties.includes(difficulty as WorkoutDifficulty)
      ? difficulty as WorkoutDifficulty
      : undefined;
  };

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
      try {
        const workout = workouts[activeDay].find(item => item.id === active.id.toString());
        if (!workout) return;

        const updatedWorkout: Workout = {
          ...workout,
          lastModified: new Date()
        };

        // Optimistically update UI
        queryClient.setQueryData<WeeklyWorkouts>(['workouts'], (old) => {
          if (!old) return old;
          return {
            ...old,
            [activeDay]: old[activeDay].filter(item => item.id !== active.id.toString()),
            [overDay]: [...old[overDay], updatedWorkout]
          };
        });

        // Sync with Supabase
        await syncWorkout(updatedWorkout, overDay);
        
        dropSound.play().catch(() => {});
        toast.success("Workout moved successfully!");
      } catch (error) {
        console.error('Error moving workout:', error);
        toast.error("Failed to move workout. Please try again.");
        
        // Revert optimistic update
        queryClient.invalidateQueries({ queryKey: ['workouts'] });
      }
    }
  };

  const handleWorkoutCreate = async (workoutData: Omit<Workout, "id" | "lastModified">) => {
    const newWorkout: Workout = {
      id: uuidv4(),
      lastModified: new Date(),
      ...workoutData,
    };
    
    try {
      // Optimistically update UI
      queryClient.setQueryData<WeeklyWorkouts>(['workouts'], (old) => ({
        ...old,
        Monday: [...(old?.Monday || []), newWorkout],
      }));

      // Sync with Supabase
      await syncWorkout(newWorkout, 'Monday');
      
      toast.success("New workout created!");
    } catch (error) {
      console.error('Error creating workout:', error);
      toast.error("Failed to create workout. Please try again.");
      
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    }
  };

  const activeWorkout = activeId ? 
    Object.values(workouts).flat().find(w => w.id === activeId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DragProvider>
        <div className="p-8 animate-fade-in">
          <div className="flex flex-col items-center mb-12">
            <motion.h1 
              className="text-5xl font-bold title-gradient mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Unfit Weekly Planner
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
            <ActionBar workouts={workouts} onWorkoutCreate={handleWorkoutCreate} />
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
      </DragProvider>
    </ErrorBoundary>
  );
}