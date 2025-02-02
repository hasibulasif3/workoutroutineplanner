import { WeeklyWorkouts } from "@/types/workout";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export const downloadWorkoutsAsPDF = (workouts: WeeklyWorkouts) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text("Weekly Workout Schedule", 14, 15);
  
  // Prepare data for the table
  const tableData = Object.entries(workouts).flatMap(([day, dayWorkouts]) =>
    dayWorkouts.map(workout => [
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

  // Save the PDF
  doc.save('weekly-workouts.pdf');
};

export const downloadWorkoutsAsCSV = (workouts: WeeklyWorkouts) => {
  const headers = ['Day', 'Workout', 'Duration (min)', 'Type', 'Difficulty', 'Calories'];
  
  const rows = Object.entries(workouts).flatMap(([day, dayWorkouts]) =>
    dayWorkouts.map(workout => 
      `${day},${workout.title},${workout.duration},${workout.type},${workout.difficulty || 'N/A'},${workout.calories || 'N/A'}`
    )
  );

  const csvContent = [
    headers.join(','),
    ...rows
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'weekly-workouts.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};