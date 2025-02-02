import { WeeklyWorkouts } from "@/types/workout";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export const downloadWorkouts = (workouts: WeeklyWorkouts, selectedDays: string[], format: "json" | "pdf" = "pdf"): string => {
  if (format === "pdf") {
    return downloadWorkoutsAsPDF(workouts, selectedDays);
  } else {
    return downloadWorkoutsAsJSON(workouts, selectedDays);
  }
};

const downloadWorkoutsAsPDF = (workouts: WeeklyWorkouts, selectedDays: string[]): string => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text("Weekly Workout Schedule", 14, 15);
  
  // Prepare data for the table
  const tableData = selectedDays.flatMap(day =>
    workouts[day as keyof WeeklyWorkouts].map(workout => [
      day,
      workout.title,
      workout.duration,
      workout.type,
      workout.difficulty || 'N/A',
      workout.calories || 'N/A'
    ])
  );

  // Add table
  autoTable(doc, {
    head: [['Day', 'Workout', 'Duration (min)', 'Type', 'Difficulty', 'Calories']],
    body: tableData,
    startY: 25,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 66, 66],
    },
  });

  const fileName = 'weekly-workouts.pdf';
  doc.save(fileName);
  return fileName;
};

const downloadWorkoutsAsJSON = (workouts: WeeklyWorkouts, selectedDays: string[]): string => {
  const selectedWorkouts = selectedDays.reduce((acc, day) => {
    acc[day] = workouts[day as keyof WeeklyWorkouts];
    return acc;
  }, {} as Partial<WeeklyWorkouts>);

  const blob = new Blob([JSON.stringify(selectedWorkouts, null, 2)], { 
    type: 'application/json' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = 'weekly-workouts.json';
  
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return fileName;
};