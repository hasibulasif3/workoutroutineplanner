import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Heart, Activity } from "lucide-react";

interface WorkoutCardProps {
  id: string;
  title: string;
  duration: string;
  type: "strength" | "cardio" | "flexibility";
  difficulty?: "beginner" | "intermediate" | "advanced";
  calories?: string;
}

const typeColors = {
  strength: "bg-purple-500",
  cardio: "bg-blue-500",
  flexibility: "bg-pink-500",
};

const typeIcons = {
  strength: Dumbbell,
  cardio: Activity,
  flexibility: Heart,
};

export function WorkoutCard({ id, title, duration, type, difficulty, calories }: WorkoutCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = typeIcons[type];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className={`workout-card group hover:border-${typeColors[type]} transition-all duration-300`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-5 h-5 text-${typeColors[type]}`} />
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <div className="flex justify-between text-sm text-gray-300">
            <span>{duration} min</span>
            <Badge variant="outline" className={`${typeColors[type]} text-white`}>
              {type}
            </Badge>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
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
            <Badge variant="outline" className={`${typeColors[type]} text-white mt-1`}>
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