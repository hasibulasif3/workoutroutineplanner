
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dumbbell, 
  Heart, 
  Activity, 
  MoreVertical, 
  Clock, 
  Flame,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash
} from "lucide-react";
import { useState, useCallback, memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Exercise } from "@/types/workout";

interface WorkoutCardProps {
  id: string;
  title: string;
  duration: string;
  type: "strength" | "cardio" | "flexibility";
  difficulty?: "beginner" | "intermediate" | "advanced";
  calories?: string;
  isFirst?: boolean;
  isLast?: boolean;
  exercises?: Exercise[];
  last_modified?: string;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

const typeColors = {
  strength: "bg-primary text-primary-foreground",
  cardio: "bg-secondary text-secondary-foreground",
  flexibility: "bg-accent text-accent-foreground",
};

const typeIcons = {
  strength: Dumbbell,
  cardio: Activity,
  flexibility: Heart,
};

const difficultyIcons = {
  beginner: "★☆☆",
  intermediate: "★★☆",
  advanced: "★★★",
};

export const WorkoutCard = memo(function WorkoutCard({ 
  id, 
  title, 
  duration, 
  type, 
  difficulty, 
  calories,
  isFirst,
  isLast,
  exercises,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown
}: WorkoutCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled: isDialogOpen // Disable dragging when dialog is open
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const Icon = typeIcons[type];

  // Handlers with proper error handling
  const handleDuplicate = useCallback(() => {
    try {
      if (onDuplicate) {
        onDuplicate(id);
      } else {
        toast.success(`Workout "${title}" duplicated!`, {
          description: "The workout has been duplicated successfully."
        });
      }
    } catch (error) {
      console.error("Error duplicating workout:", error);
      toast.error("Failed to duplicate workout", {
        description: "An error occurred while duplicating the workout."
      });
    }
  }, [id, title, onDuplicate]);

  const handleDelete = useCallback(() => {
    try {
      if (onDelete) {
        onDelete(id);
      } else {
        toast.success(`Workout "${title}" deleted!`, {
          description: "The workout has been removed from your schedule."
        });
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast.error("Failed to delete workout", {
        description: "An error occurred while deleting the workout."
      });
    }
  }, [id, title, onDelete]);

  const handleMoveUp = useCallback(() => {
    try {
      if (!isFirst && onMoveUp) {
        onMoveUp(id);
      } else if (!isFirst) {
        toast.success(`Moved "${title}" up`, {
          description: "The workout position has been updated."
        });
      }
    } catch (error) {
      console.error("Error moving workout up:", error);
      toast.error("Failed to move workout", {
        description: "An error occurred while updating the workout position."
      });
    }
  }, [isFirst, id, title, onMoveUp]);

  const handleMoveDown = useCallback(() => {
    try {
      if (!isLast && onMoveDown) {
        onMoveDown(id);
      } else if (!isLast) {
        toast.success(`Moved "${title}" down`, {
          description: "The workout position has been updated."
        });
      }
    } catch (error) {
      console.error("Error moving workout down:", error);
      toast.error("Failed to move workout", {
        description: "An error occurred while updating the workout position."
      });
    }
  }, [isLast, id, title, onMoveDown]);

  const handleViewDetails = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="workout-card group relative bg-card p-4 rounded-lg shadow-sm border border-border hover:shadow-md transition-all"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        aria-label={`${title} workout card`}
        data-workout-id={id}
      >
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`w-5 h-5 text-${typeColors[type]}`} />
          <h3 className="font-semibold text-lg flex-grow">{title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="quick-action h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewDetails}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleMoveUp}
                disabled={isFirst}
                className={isFirst ? "opacity-50 cursor-not-allowed" : ""}
              >
                <ChevronUp className="w-4 h-4 mr-2" />
                Move Up
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleMoveDown}
                disabled={isLast}
                className={isLast ? "opacity-50 cursor-not-allowed" : ""}
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Move Down
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{duration} min</span>
          {calories && (
            <>
              <Flame className="w-4 h-4 text-gray-400 ml-2" />
              <span className="text-sm text-gray-300">{calories} cal</span>
            </>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Badge variant="outline" className={`${typeColors[type]}`}>
            {type}
          </Badge>
          {difficulty && (
            <span className={`difficulty-badge ${difficulty}`} title={`Difficulty: ${difficulty}`}>
              {difficultyIcons[difficulty]}
            </span>
          )}
        </div>
      </div>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`w-6 h-6 text-${typeColors[type]}`} />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Duration</p>
              <p className="text-lg font-semibold">{duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Calories</p>
              <p className="text-lg font-semibold">{calories || "N/A"}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400">Type</p>
            <Badge variant="outline" className={`${typeColors[type]} mt-1`}>
              {type}
            </Badge>
          </div>
          {difficulty && (
            <div>
              <p className="text-sm text-gray-400">Difficulty</p>
              <p className="text-lg font-semibold capitalize">{difficulty}</p>
            </div>
          )}
          {exercises && exercises.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Exercises</p>
              <ul className="space-y-2">
                {exercises.map((exercise, index) => (
                  <li key={index} className="border-l-2 border-primary pl-3">
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-sm text-gray-400">
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight ? ` · ${exercise.weight}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

