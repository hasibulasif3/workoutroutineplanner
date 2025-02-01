import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutService } from "@/services/workoutService";
import { WorkoutValidationType } from "@/utils/validation";
import { toast } from "sonner";

export function useWorkouts() {
  const queryClient = useQueryClient();

  const workoutsQuery = useQuery({
    queryKey: ["workouts"],
    queryFn: workoutService.getWorkouts,
  });

  const createWorkoutMutation = useMutation({
    mutationFn: workoutService.createWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout created successfully");
    },
  });

  const updateWorkoutMutation = useMutation({
    mutationFn: ({ id, workout }: { id: string; workout: Partial<WorkoutValidationType> }) =>
      workoutService.updateWorkout(id, workout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout updated successfully");
    },
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: workoutService.deleteWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout deleted successfully");
    },
  });

  return {
    workouts: workoutsQuery.data ?? [],
    isLoading: workoutsQuery.isLoading,
    isError: workoutsQuery.isError,
    error: workoutsQuery.error,
    createWorkout: createWorkoutMutation.mutate,
    updateWorkout: updateWorkoutMutation.mutate,
    deleteWorkout: deleteWorkoutMutation.mutate,
  };
}