import { WeeklyWorkouts } from "@/types/workout";
import { format } from "date-fns";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ExportMetadata {
  version: string;
  exportDate: string;
  totalWorkouts: number;
  fileSize: number;
}

export const validateFileSize = (data: string): boolean => {
  const size = new Blob([data]).size;
  return size <= MAX_FILE_SIZE;
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
    throw new Error("PDF export is not supported yet");
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