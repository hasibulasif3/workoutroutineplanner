import { WeeklyWorkouts } from "@/types/workout";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export const downloadWorkouts = (workouts: WeeklyWorkouts, selectedDays: string[], format: "json" | "pdf" = "pdf"): string => {
  if (format === "json") {
    return downloadWorkoutsAsJSON(workouts, selectedDays);
  }
  return downloadWorkoutsAsPDF(workouts, selectedDays);
};

const downloadWorkoutsAsJSON = (workouts: WeeklyWorkouts, selectedDays: string[]): string => {
  const selectedWorkouts = selectedDays.reduce((acc, day) => {
    acc[day as keyof WeeklyWorkouts] = workouts[day as keyof WeeklyWorkouts];
    return acc;
  }, {} as WeeklyWorkouts);

  const fileName = `workouts-${new Date().toISOString().split('T')[0]}.json`;
  const dataStr = JSON.stringify(selectedWorkouts, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return fileName;
};

const downloadWorkoutsAsPDF = (workouts: WeeklyWorkouts, selectedDays: string[]): string => {
  const doc = new jsPDF();
  const fileName = `workouts-${new Date().toISOString().split('T')[0]}.pdf`;

  doc.setFontSize(20);
  doc.text('Weekly Workout Routine', 14, 20);
  doc.setFontSize(12);

  let yPos = 40;

  selectedDays.forEach(day => {
    const dayWorkouts = workouts[day as keyof WeeklyWorkouts];
    if (dayWorkouts.length === 0) return;

    doc.setFontSize(16);
    doc.text(day, 14, yPos);
    yPos += 10;

    dayWorkouts.forEach(workout => {
      const tableData = [
        ['Title', workout.title],
        ['Duration', `${workout.duration} minutes`],
        ['Type', workout.type],
        ['Difficulty', workout.difficulty || 'N/A'],
        ['Calories', workout.calories || 'N/A']
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 10 },
        margin: { left: 14 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      if (workout.exercises.length > 0) {
        doc.setFontSize(12);
        doc.text('Exercises:', 14, yPos);
        yPos += 5;

        const exerciseData = workout.exercises.map(ex => [
          ex.name,
          `${ex.sets} sets`,
          `${ex.reps} reps`,
          `${ex.restPeriod}s rest`
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Exercise', 'Sets', 'Reps', 'Rest']],
          body: exerciseData,
          theme: 'grid',
          styles: { fontSize: 8 },
          margin: { left: 14 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });
  });

  doc.save(fileName);
  return fileName;
};