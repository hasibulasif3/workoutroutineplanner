import { Workout } from "@/types/workout";

export interface DragState {
  isDropAnimating: boolean;
  sourceDay: string | null;
  targetDay: string | null;
}

export interface WorkoutMoveEvent {
  sourceDay: string;
  targetDay: string;
  workout: Workout;
  timestamp: Date;
}

export interface DragFeedbackProps {
  isDragging: boolean;
  isDropAnimating: boolean;
  isValidDropZone: boolean;
}