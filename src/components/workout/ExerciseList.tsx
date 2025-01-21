import { Exercise } from "@/types/workout";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, GripVertical, X } from "lucide-react";
import { toast } from "sonner";

interface ExerciseListProps {
  exercises: Exercise[];
  onExercisesChange: (exercises: Exercise[]) => void;
  onDuplicate: (exercise: Exercise) => void;
  onRemove: (index: number) => void;
}

export function ExerciseList({ 
  exercises, 
  onExercisesChange,
  onDuplicate,
  onRemove 
}: ExerciseListProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onExercisesChange(items);
    toast.success("Exercise reordered successfully");
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="exercises">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {exercises.map((exercise, index) => (
              <Draggable
                key={index}
                draggableId={`exercise-${index}`}
                index={index}
              >
                {(provided) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="bg-card"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab"
                          >
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-medium">{exercise.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {exercise.sets} sets × {exercise.reps} reps | {exercise.restPeriod}s rest
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDuplicate(exercise)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemove(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}