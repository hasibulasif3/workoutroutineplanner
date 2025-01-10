import { Workout } from "@/types/workout";

export interface DragState {
  isDropAnimating: boolean;
  sourceDay: string | null;
  targetDay: string | null;
  dragDistance: number;
  isDragging: boolean;
  dragThreshold: number;
  touchPoint: { x: number; y: number } | null;
}

export interface ColumnPreferences {
  collapsed: { [key: string]: boolean };
  width: { [key: string]: number };
  order: string[];
  zoom: number;
}

export interface WorkoutMoveEvent {
  sourceDay: string;
  targetDay: string;
  workout: Workout;
  timestamp: Date;
}

export interface WorkoutRelation {
  id: string;
  sourceWorkoutId: string;
  targetWorkoutId: string;
  type: 'dependency' | 'related' | 'sequence';
  priority?: 'low' | 'medium' | 'high';
}

export interface WorkoutTag {
  id: string;
  name: string;
  color: string;
}

export interface DragFeedback {
  isDragging: boolean;
  isDropAnimating: boolean;
  isValidDropZone: boolean;
  touchFeedback: boolean;
}

export interface ColumnStats {
  totalDuration: number;
  averageIntensity: number;
  workoutCount: number;
  completionRate: number;
}