import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface WorkoutCardProps {
  id: string;
  title: string;
  duration: string;
  type: "strength" | "cardio" | "flexibility";
  difficulty?: "beginner" | "intermediate" | "advanced";
  calories?: string;
  isFirst?: boolean;
  isLast?: boolean;
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

export function WorkoutCard({ 
  id, 
  title, 
  duration, 
  type, 
  difficulty, 
  calories,
  isFirst,
  isLast 
}: WorkoutCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = typeIcons[type];

  const handleDuplicate = () => {
    toast.success("Workout duplicated!");
    // Implement duplication logic
  };

  const handleDelete = () => {
    toast.success("Workout deleted!");
    // Implement deletion logic
  };

  const handleMoveUp = () => {
    if (!isFirst) {
      toast.success("Moved workout up");
      // Implement move up logic
    }
  };

  const handleMoveDown = () => {
    if (!isLast) {
      toast.success("Moved workout down");
      // Implement move down logic
    }
  };

  return (
    <Dialog>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="workout-card group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        aria-label={`${title} workout card`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`w-5 h-5 text-${typeColors[type]}`} />
          <h3 className="font-semibold text-lg flex-grow">{title}</h3>
          {isHovered && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="quick-action">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DialogTrigger asChild>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleMoveUp}
                  disabled={isFirst}
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Move Up
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleMoveDown}
                  disabled={isLast}
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
          )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}