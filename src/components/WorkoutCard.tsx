import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WorkoutCardProps {
  id: string;
  title: string;
  duration: string;
  type: string;
}

export function WorkoutCard({ id, title, duration, type }: WorkoutCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="workout-card"
    >
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div className="flex justify-between text-sm text-gray-300">
        <span>{duration}</span>
        <span>{type}</span>
      </div>
    </div>
  );
}