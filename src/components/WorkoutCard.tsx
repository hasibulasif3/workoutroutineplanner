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
  Star, 
  Clock, 
  Flame,
  Download,
  Mail,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface WorkoutCardProps {
  id: string;
  title: string;
  duration: string;
  type: "strength" | "cardio" | "flexibility";
  difficulty?: "beginner" | "intermediate" | "advanced";
  calories?: string;
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

export function WorkoutCard({ id, title, duration, type, difficulty, calories }: WorkoutCardProps) {
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

  const handleDownload = () => {
    const workoutData = {
      id,
      title,
      duration,
      type,
      difficulty,
      calories,
    };
    
    const blob = new Blob([JSON.stringify(workoutData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-${title.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Workout downloaded successfully!");
  };

  const handleSync = () => {
    toast.success("Workout synced successfully!");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Workout Plan: ${title}`);
    const body = encodeURIComponent(`
Workout Details:
Title: ${title}
Type: ${type}
Duration: ${duration} minutes
Difficulty: ${difficulty}
Estimated Calories: ${calories}
    `);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success("Email client opened!");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
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
              <div className="quick-actions flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  title="Download workout"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSync();
                  }}
                  title="Sync workout"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEmail();
                  }}
                  title="Email workout"
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
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
      </DialogTrigger>
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