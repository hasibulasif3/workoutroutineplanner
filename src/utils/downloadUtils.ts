import { WeeklyWorkouts } from "@/types/workout";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export const downloadWorkoutsAsPDF = (workouts: WeeklyWorkouts) => {
  const doc = new jsPDF();
  
  Object.entries(workouts).forEach(([day, dayWorkouts], index) => {
    if (index > 0) {
      doc.addPage();
    }
    
    doc.setFontSize(16);
    doc.text(day, 14, 15);
    
    const tableData = dayWorkouts.map(workout => [
      workout.title,
      workout.duration + ' min',
      workout.type,
      workout.difficulty || 'N/A',
      workout.calories || 'N/A'
    ]);
    
    autoTable(doc, {
      head: [['Title', 'Duration', 'Type', 'Difficulty', 'Calories']],
      body: tableData,
      startY: 25,
    });
  });
  
  doc.save('workouts.pdf');
};

export const downloadWorkouts = (workouts: WeeklyWorkouts) => {
  const dataStr = JSON.stringify(workouts, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'workouts.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};