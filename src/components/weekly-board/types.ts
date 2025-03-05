
import { Workout } from "@/types/workout";

export interface DragState {
  isDropAnimating: boolean;
  sourceDay: string | null;
  targetDay: string | null;
  dragDistance: number;
  isDragging: boolean;
  dragThreshold: number;
  touchPoint: { x: number; y: number } | null;
  lastDragTime?: number;
  dragSpeed?: number;
}

export interface ColumnPreferences {
  collapsed: { [key: string]: boolean };
  width: { [key: string]: number };
  height: { [key: string]: number };
  order: string[];
  zoom: number;
  version: number;
}

export interface WorkoutMoveEvent {
  sourceDay: string;
  targetDay: string;
  workout: Workout;
  timestamp: Date;
  index?: number;
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
  dragSpeed?: number;
}

export interface ColumnStats {
  totalDuration: number;
  averageIntensity: number;
  workoutCount: number;
  completionRate: number;
  height?: number;
}

export interface DragContextType {
  dragState: DragState;
  setDragState: (state: DragState | ((prev: DragState) => DragState)) => void;
  columnPreferences: ColumnPreferences;
  setColumnPreferences: (prefs: ColumnPreferences | ((prev: ColumnPreferences) => ColumnPreferences)) => void;
  isColumnCollapsed: (day: string) => boolean;
  toggleColumnCollapse: (day: string) => void;
  adjustColumnWidth: (day: string, width: number) => void;
  setColumnHeight: (day: string, height: number) => void;
  touchStartHandler: (e: TouchEvent) => void;
  touchMoveHandler: (e: TouchEvent) => void;
  cleanup: () => void;
}

export interface TransactionStatus {
  id: string;
  type: 'create' | 'move' | 'delete' | 'update' | 'load';
  status: 'pending' | 'success' | 'error';
  timestamp: Date;
  data?: any;
  error?: Error | string;
}
