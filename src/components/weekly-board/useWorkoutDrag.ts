import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useState } from "react";
import { toast } from "sonner";
import { WeeklyWorkouts, Workout } from "@/types/workout";
import { WorkoutMoveEvent } from "./types";

export function useWorkoutDrag(
  workouts: WeeklyWorkouts,
  setWorkouts: (workouts: WeeklyWorkouts) => void,
  dropSound: HTMLAudioElement
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<WorkoutMoveEvent[]>([]);

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

        // Add to undo stack
        setUndoStack(prev => [...prev, {
          sourceDay: activeDay,
          targetDay: overDay,
          workout: updatedWorkout,
          timestamp: new Date()
        }]);
        
        dropSound.play().catch(() => {});
        toast.success("Workout moved successfully!", {
          description: `Moved from ${activeDay} to ${overDay}`,
        });
        
        return newWorkouts;
      });
    }
  };

  const undoLastMove = () => {
    const lastMove = undoStack[undoStack.length - 1];
    if (!lastMove) return;

    setWorkouts(prev => ({
      ...prev,
      [lastMove.sourceDay]: [...prev[lastMove.sourceDay], lastMove.workout],
      [lastMove.targetDay]: prev[lastMove.targetDay].filter(w => w.id !== lastMove.workout.id)
    }));

    setUndoStack(prev => prev.slice(0, -1));
    toast.success("Move undone successfully!");
  };

  return {
    activeId,
    handleDragStart,
    handleDragEnd,
    undoLastMove,
    hasUndo: undoStack.length > 0
  };
}