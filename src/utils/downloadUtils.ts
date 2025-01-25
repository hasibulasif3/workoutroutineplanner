import { WeeklyWorkouts, Workout } from "@/types/workout";
import { format } from "date-fns";
import jsPDF from "jspdf";

interface ExportMetadata {
  version: string;
  exportDate: string;
  totalWorkouts: number;
  fileSize: number;
}

export const validateFileSize = (data: string): boolean => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const size = new Blob([data]).size;
  return size <= MAX_FILE_SIZE;
};

const generatePDF = (workouts: WeeklyWorkouts, selectedDays: string[]): string => {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 10;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;

  // Title
  doc.setFontSize(20);
  doc.text("Workout Routine", pageWidth / 2, yPosition, { align: "center" });
  yPosition += lineHeight * 2;

  // Date range
  doc.setFontSize(12);
  const dateRange = `${format(new Date(), 'MMM d')} - ${format(new Date(new Date().setDate(new Date().getDate() + 7)), 'MMM d, yyyy')}`;
  doc.text(dateRange, pageWidth / 2, yPosition, { align: "center" });
  yPosition += lineHeight * 2;

  // Workouts by day
  doc.setFontSize(14);
  selectedDays.forEach(day => {
    // Check if we need a new page
    if (yPosition > doc.internal.pageSize.height - margin) {
      doc.addPage();
      yPosition = margin;
    }

    // Day header
    doc.setFont(undefined, 'bold');
    doc.text(day, margin, yPosition);
    yPosition += lineHeight;

    const dayWorkouts = workouts[day] || [];
    doc.setFont(undefined, 'normal');
    doc.setFontSize(12);

    dayWorkouts.forEach((workout: Workout) => {
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.height - margin) {
        doc.addPage();
        yPosition = margin;
      }

      // Workout details
      doc.text(`• ${workout.title}`, margin + 5, yPosition);
      yPosition += lineHeight;

      const details = [
        `Duration: ${workout.duration} mins`,
        workout.calories ? `Calories: ${workout.calories}` : undefined,
        `Type: ${workout.type}`,
        workout.difficulty ? `Difficulty: ${workout.difficulty}` : undefined,
        workout.notes ? `Notes: ${workout.notes}` : undefined
      ].filter(Boolean) as string[];

      details.forEach(detail => {
        // Check if we need a new page
        if (yPosition > doc.internal.pageSize.height - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(10);
        doc.text(detail, margin + 10, yPosition);
        yPosition += lineHeight;
      });

      yPosition += lineHeight / 2; // Add some space between workouts
    });

    yPosition += lineHeight; // Add space between days
  });

  const fileName = `workout-routine-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
  return fileName;
};

export const formatWorkoutForExport = (workouts: WeeklyWorkouts, selectedDays: string[]) => {
  const selectedWorkouts = Object.entries(workouts)
    .filter(([day]) => selectedDays.includes(day))
    .reduce((acc, [day, workouts]) => ({
      ...acc,
      [day]: workouts
    }), {} as WeeklyWorkouts);

  const metadata: ExportMetadata = {
    version: "1.0",
    exportDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    totalWorkouts: Object.values(selectedWorkouts).flat().length,
    fileSize: 0
  };

  const exportData = {
    metadata,
    workouts: selectedWorkouts
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  metadata.fileSize = new Blob([jsonString]).size;

  return { exportData, jsonString };
};

export const downloadWorkouts = (workouts: WeeklyWorkouts, selectedDays: string[], format: "json" | "pdf"): string => {
  if (selectedDays.length === 0) {
    throw new Error("Please select at least one day to download");
  }

  if (format === "pdf") {
    return generatePDF(workouts, selectedDays);
  }

  const { jsonString } = formatWorkoutForExport(workouts, selectedDays);

  if (!validateFileSize(jsonString)) {
    throw new Error("File size exceeds 10MB limit");
  }

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