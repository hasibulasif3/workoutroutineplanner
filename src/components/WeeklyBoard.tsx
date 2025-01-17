import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { DayColumn } from "./DayColumn";
import { WorkoutCard } from "./WorkoutCard";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { WeeklyWorkouts, Workout } from "@/types/workout";
import { storageService } from "@/services/storageService";
import { StatsBar } from "./StatsBar";
import { ActionBar } from "./ActionBar";
import { ErrorBoundary } from "./ErrorBoundary";
import { DragProvider } from "./weekly-board/DragContext";

const initialWorkouts: WeeklyWorkouts = {
  Monday: [
    { 
      id: "1", 
      title: "Morning Run", 
      duration: "30", 
      type: "cardio", 
      difficulty: "beginner", 
      calories: "300",
      lastModified: new Date()
    },
    { 
      id: "2", 
      title: "Push-ups", 
      duration: "15", 
      type: "strength", 
      difficulty: "intermediate", 
      calories: "150",
      lastModified: new Date()
    },
  ],
  Tuesday: [
    { 
      id: "3", 
      title: "Yoga", 
      duration: "45", 
      type: "flexibility", 
      difficulty: "beginner", 
      calories: "200",
      lastModified: new Date()
    },
  ],
  Wednesday: [
    { 
      id: "4", 
      title: "HIIT", 
      duration: "25", 
      type: "cardio", 
      difficulty: "advanced", 
      calories: "400",
      lastModified: new Date()
    },
  ],
  Thursday: [
    { 
      id: "5", 
      title: "Swimming", 
      duration: "40", 
      type: "cardio", 
      difficulty: "intermediate", 
      calories: "450",
      lastModified: new Date()
    },
  ],
  Friday: [
    { 
      id: "6", 
      title: "Weight Training", 
      duration: "50", 
      type: "strength", 
      difficulty: "advanced", 
      calories: "500",
      lastModified: new Date()
    },
  ],
  Saturday: [],
  Sunday: [],
};

export function WeeklyBoard() {
  const [workouts, setWorkouts] = useState<WeeklyWorkouts>(initialWorkouts);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropSound] = useState(() => new Audio("/src/assets/drop-sound.mp3"));
  const [isLoading, setIsLoading] = useState(true);

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
      setWorkouts(prev => {
        const workout = prev[activeDay].find(item => item.id === active.id.toString());
        if (!workout) return prev;

        const updatedWorkout: Workout = {
          ...workout,
          lastModified: new Date()
        };

        const newWorkouts = {
          ...prev,
          [activeDay]: prev[activeDay].filter(item => item.id !== active.id.toString()),
          [overDay]: [...prev[overDay], updatedWorkout]
        };
        
        dropSound.play().catch(() => {});
        toast.success("Workout moved successfully!");
        return newWorkouts;
      });
    }
  };

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
    
    toast.success("New workout created!", {
      description: `${newWorkout.title} added to Monday`,
    });
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
