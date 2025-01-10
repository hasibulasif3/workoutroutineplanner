import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragHandle } from "./DragHandle";
import { cn } from "@/lib/utils";
import { 
  Dumbbell, 
  Heart, 
  Activity,
  Clock, 
  Flame,
  MoreVertical,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    data: {
      type: 'workout',
    }
  });

  // Haptic feedback for mobile devices
  useEffect(() => {
    if (isDragging && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  }, [isDragging]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    scale: isDragging ? 1.05 : 1,
  };

  const Icon = typeIcons[type];

  const handleDoubleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "workout-card group relative",
        isDragging && "dragging",
        isExpanded && "expanded"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <DragHandle {...listeners} />
        <Icon className={`w-5 h-5 text-${typeColors[type]}`} />
        <h3 className="font-semibold text-lg flex-grow">{title}</h3>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "quick-action",
                isHovered && "opacity-100"
              )}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Collapse" : "Expand"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Workout duplicated")}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Workout deleted")} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 mt-4"
          >
            {/* Additional workout details */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Additional details and progress indicators will be shown here
              </p>
            </div>
          </motion.div>
        ) : (
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
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <Badge variant="outline" className={`${typeColors[type]}`}>
          {type}
        </Badge>
        {difficulty && (
          <Badge variant="outline" className={`difficulty-badge ${difficulty}`}>
            {difficulty}
          </Badge>
        )}
      </div>
    </motion.div>
  );
}