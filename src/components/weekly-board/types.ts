import { Workout } from "@/types/workout";

export interface DragState {
  isDropAnimating: boolean;
  sourceDay: string | null;
  targetDay: string | null;
  dragDistance: number;
  isDragging: boolean;
}

export interface WorkoutMoveEvent {
  sourceDay: string;
  targetDay: string;
  workout: Workout;
  timestamp: Date;
}

export interface ColumnPreferences {
  collapsed: { [key: string]: boolean };
  width: { [key: string]: number };
  order: string[];
}

export interface DragFeedbackProps {
  isDragging: boolean;
  isDropAnimating: boolean;
  isValidDropZone: boolean;
}

export interface WorkoutRelation {
  id: string;
  sourceWorkoutId: string;
  targetWorkoutId: string;
  type: 'dependency' | 'related' | 'sequence';
}