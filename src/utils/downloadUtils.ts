
import { WeeklyWorkouts } from "@/types/workout";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export const downloadWorkouts = (workouts: WeeklyWorkouts, selectedDays: string[], format: "json" | "pdf" = "pdf"): string => {
  console.log(`[DownloadUtils] Starting download in ${format} format for days:`, selectedDays);
  
  try {
    if (selectedDays.length === 0) {
      throw new Error("No days selected for download");
    }
    
    if (format === "json") {
      return downloadWorkoutsAsJSON(workouts, selectedDays);
    }
    return downloadWorkoutsAsPDF(workouts, selectedDays);
  } catch (error) {
    console.error(`[DownloadUtils] Error downloading workouts as ${format}:`, error);
    throw error;
  }
};

const downloadWorkoutsAsJSON = (workouts: WeeklyWorkouts, selectedDays: string[]): string => {
  try {
    console.log("[DownloadUtils] Preparing JSON download");
    
    const selectedWorkouts = selectedDays.reduce((acc, day) => {
      if (day in workouts) {
        acc[day as keyof WeeklyWorkouts] = workouts[day as keyof WeeklyWorkouts];
      } else {
        console.warn(`[DownloadUtils] Day "${day}" not found in workouts`);
      }
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

    console.log("[DownloadUtils] JSON download completed:", fileName);
    return fileName;
  } catch (error) {
    console.error("[DownloadUtils] Error in JSON download:", error);
    throw new Error(`Failed to download workouts as JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const downloadWorkoutsAsPDF = (workouts: WeeklyWorkouts, selectedDays: string[]): string => {
  try {
    console.log("[DownloadUtils] Preparing PDF download");
    
    const doc = new jsPDF();
    const fileName = `workouts-${new Date().toISOString().split('T')[0]}.pdf`;

    doc.setFontSize(20);
    doc.text('Weekly Workout Routine', 14, 20);
    doc.setFontSize(12);

    let yPos = 40;
    let pageCount = 1;

    selectedDays.forEach(day => {
      if (!(day in workouts)) {
        console.warn(`[DownloadUtils] Day "${day}" not found in workouts`);
        return;
      }
      
      const dayWorkouts = workouts[day as keyof WeeklyWorkouts];
      if (dayWorkouts.length === 0) {
        console.log(`[DownloadUtils] No workouts for ${day}, skipping`);
        return;
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
        pageCount++;
        console.log(`[DownloadUtils] Added page ${pageCount}`);
      }

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

        // Check if we need a new page for exercises
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
          pageCount++;
          console.log(`[DownloadUtils] Added page ${pageCount} for exercises`);
        }

        if (workout.exercises && workout.exercises.length > 0) {
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

        // Check if we need a new page for the next workout
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
          pageCount++;
          console.log(`[DownloadUtils] Added page ${pageCount} for next workout`);
        }
      });
    });

    doc.save(fileName);
    console.log("[DownloadUtils] PDF download completed:", fileName);
    return fileName;
  } catch (error) {
    console.error("[DownloadUtils] Error in PDF download:", error);
    throw new Error(`Failed to download workouts as PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
};
