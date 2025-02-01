import { format } from 'date-fns';
import { WeeklyWorkouts } from '@/types/workout';

export const downloadWorkouts = (workouts: WeeklyWorkouts, selectedDays: string[], format: "json" | "pdf"): string => {
  const selectedWorkouts = Object.entries(workouts)
    .filter(([day]) => selectedDays.includes(day))
    .reduce((acc, [day, workouts]) => ({ ...acc, [day]: workouts }), {});

  if (format === "json") {
    return downloadWorkoutJson(JSON.stringify(selectedWorkouts, null, 2));
  } else {
    // TODO: Implement PDF download
    throw new Error("PDF download not implemented yet");
  }
};

const downloadWorkoutJson = (jsonString: string): string => {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `workout-routine-${format(new Date(), 'yyyy-MM-dd')}.json`;
  
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return fileName;
};