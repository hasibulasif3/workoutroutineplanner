import { motion } from "framer-motion";
import { StatsBar } from "../StatsBar";
import { ActionBar } from "../ActionBar";
import { WeeklyWorkouts } from "@/types/workout";

interface WeeklyBoardHeaderProps {
  workouts: WeeklyWorkouts;
  onWorkoutCreate: (workout: any) => void;
}

export function WeeklyBoardHeader({ workouts, onWorkoutCreate }: WeeklyBoardHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-6 md:mb-12 px-4">
      <motion.h1 
        className="text-3xl md:text-5xl font-bold title-gradient mb-2 md:mb-4 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Workout Routine Planner
      </motion.h1>
      
      <motion.p 
        className="text-sm md:text-lg text-gray-400 mb-4 md:mb-8 text-center px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Plan your workouts, track your progress, achieve your goals
      </motion.p>
      
      <div className="w-full max-w-[95vw] md:max-w-4xl">
        <StatsBar workouts={workouts} />
        <ActionBar workouts={workouts} onWorkoutCreate={onWorkoutCreate} />
      </div>
    </div>
  );
}