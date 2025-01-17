import { WeeklyWorkouts, Workout } from "@/types/workout";
import { format } from "date-fns";

export interface ExportMetadata {
  createdAt: string;
  version: string;
  totalWorkouts: number;
  fileSize: number;
}

export interface EmailRecipients {
  to: string;
  cc: string;
  bcc: string;
}

export const EMAIL_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB limit
export const FILE_SIZE_WARNING = 5 * 1024 * 1024; // 5MB warning threshold

export const generateEmailContent = (workouts: WeeklyWorkouts, selectedDays: string[]) => {
  const selectedWorkouts = getSelectedWorkouts(workouts, selectedDays);
  const dateRange = `${format(new Date(), 'MMM d')} - ${format(new Date(new Date().setDate(new Date().getDate() + 7)), 'MMM d, yyyy')}`;
  
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          h2 { color: #2563eb; }
          h3 { color: #4b5563; margin-top: 20px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 15px; }
          .workout-details { background: #f3f4f6; padding: 10px; border-radius: 5px; }
          .workout-title { font-weight: bold; color: #1f2937; }
          .workout-meta { color: #6b7280; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <h2>Weekly Workout Routine (${dateRange})</h2>
        ${Object.entries(selectedWorkouts)
          .map(([day, exercises]) => `
            <h3>${day}</h3>
            <ul>
              ${(exercises as Workout[]).map(ex => `
                <li class="workout-details">
                  <div class="workout-title">${ex.title}</div>
                  <div class="workout-meta">
                    Duration: ${ex.duration} mins<br>
                    ${ex.calories ? `Calories: ${ex.calories}<br>` : ''}
                    Type: ${ex.type}<br>
                    ${ex.difficulty ? `Difficulty: ${ex.difficulty}` : ''}
                    ${ex.notes ? `<br>Notes: ${ex.notes}` : ''}
                  </div>
                </li>
              `).join('')}
            </ul>
          `).join('')}
      </body>
    </html>
  `;

  const plainText = Object.entries(selectedWorkouts)
    .map(([day, exercises]) => 
      `${day}:\n${(exercises as Workout[]).map(ex => 
        `- ${ex.title} (${ex.duration} mins)${ex.notes ? `\n  Notes: ${ex.notes}` : ''}`
      ).join('\n')}`
    )
    .join('\n\n');

  return { htmlContent, plainText };
};

export const getSelectedWorkouts = (workouts: WeeklyWorkouts, selectedDays: string[]) => {
  if (selectedDays.length === 0) return workouts;
  return Object.entries(workouts)
    .filter(([day]) => selectedDays.includes(day))
    .reduce((acc, [day, dayWorkouts]) => ({ ...acc, [day]: dayWorkouts }), {});
};

export const getMetadata = (workouts: WeeklyWorkouts): ExportMetadata => ({
  createdAt: new Date().toISOString(),
  version: "1.0",
  totalWorkouts: Object.values(workouts).flat().length,
  fileSize: new Blob([JSON.stringify(workouts)]).size,
});

export const formatWorkoutForExport = (workouts: WeeklyWorkouts, selectedDays: string[]) => {
  const selectedWorkouts = getSelectedWorkouts(workouts, selectedDays);
  const metadata = getMetadata(workouts);
  
  return {
    metadata,
    workouts: selectedWorkouts,
    exportDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    version: "1.0",
  };
};