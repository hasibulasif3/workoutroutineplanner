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
    <div className="flex flex-col items-center mb-12">
      <motion.h1 
        className="text-4xl md:text-5xl font-bold title-gradient mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Unfit Weekly Planner
      </motion.h1>
      
      <motion.p 
        className="text-base md:text-lg text-gray-400 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Plan your workouts, track your progress, achieve your goals
      </motion.p>
      
      <StatsBar workouts={workouts} />
      <ActionBar workouts={workouts} onWorkoutCreate={onWorkoutCreate} />
    </div>
  );
}