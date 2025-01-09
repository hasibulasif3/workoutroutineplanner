import { Activity, Calendar, Target, Trophy } from "lucide-react";
import { WeeklyWorkouts } from "@/types/workout";
import { motion } from "framer-motion";

interface StatsBarProps {
  workouts: WeeklyWorkouts;
}

export function StatsBar({ workouts }: StatsBarProps) {
  const totalWorkouts = Object.values(workouts).flat().length;
  const activeDays = Object.entries(workouts).filter(([_, dayWorkouts]) => dayWorkouts.length > 0).length;
  const totalMinutes = Object.values(workouts)
    .flat()
    .reduce((acc, workout) => acc + Number(workout.duration), 0);
  const totalCalories = Object.values(workouts)
    .flat()
    .reduce((acc, workout) => acc + Number(workout.calories || 0), 0);

  return (
    <motion.div 
      className="stats-bar w-full max-w-4xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="stats-item hover:scale-105 transition-transform cursor-pointer"
        whileHover={{ scale: 1.05 }}
      >
        <Activity className="w-6 h-6 text-primary mb-2" />
        <span className="text-2xl font-bold">{totalWorkouts}</span>
        <span className="text-sm text-gray-400">Total Workouts</span>
      </motion.div>
      
      <motion.div 
        className="stats-item hover:scale-105 transition-transform cursor-pointer"
        whileHover={{ scale: 1.05 }}
      >
        <Calendar className="w-6 h-6 text-secondary mb-2" />
        <span className="text-2xl font-bold">{activeDays}</span>
        <span className="text-sm text-gray-400">Active Days</span>
      </motion.div>
      
      <motion.div 
        className="stats-item hover:scale-105 transition-transform cursor-pointer"
        whileHover={{ scale: 1.05 }}
      >
        <Target className="w-6 h-6 text-accent mb-2" />
        <span className="text-2xl font-bold">{totalMinutes}</span>
        <span className="text-sm text-gray-400">Total Minutes</span>
      </motion.div>
      
      <motion.div 
        className="stats-item hover:scale-105 transition-transform cursor-pointer"
        whileHover={{ scale: 1.05 }}
      >
        <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
        <span className="text-2xl font-bold">{totalCalories}</span>
        <span className="text-sm text-gray-400">Total Calories</span>
      </motion.div>
    </motion.div>
  );
}