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
      const newWorkouts: WeeklyWorkouts = { ...workouts };
      const workout = workouts[activeDay].find(item => item.id === active.id.toString());
      
      if (!workout) return;

      const updatedWorkout: Workout = {
        ...workout,
        lastModified: new Date()
      };

      newWorkouts[activeDay] = workouts[activeDay].filter(item => item.id !== active.id.toString());
      newWorkouts[overDay] = [...workouts[overDay], updatedWorkout];
      
      setWorkouts(newWorkouts);
      
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
    }
  };

  const undoLastMove = () => {
    const lastMove = undoStack[undoStack.length - 1];
    if (!lastMove) return;

    const newWorkouts: WeeklyWorkouts = { ...workouts };
    newWorkouts[lastMove.sourceDay] = [...workouts[lastMove.sourceDay], lastMove.workout];
    newWorkouts[lastMove.targetDay] = workouts[lastMove.targetDay].filter(w => w.id !== lastMove.workout.id);
    
    setWorkouts(newWorkouts);
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