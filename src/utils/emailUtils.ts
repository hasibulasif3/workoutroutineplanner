import { z } from "zod";
import { WeeklyWorkouts } from "@/types/workout";

export const emailSchema = z.object({
  to: z.string().min(1, "Email is required"),
  cc: z.string().optional(),
  bcc: z.string().optional(),
});

export type EmailFormData = z.infer<typeof emailSchema>;

export const validateEmails = (emails: string): string[] => {
  return emails
    .split(",")
    .map(email => email.trim())
    .filter(email => {
      try {
        z.string().email().parse(email);
        return true;
      } catch {
        return false;
      }
    });
};

export const generateEmailContent = (workouts: WeeklyWorkouts, selectedDays: string[]) => {
  const selectedWorkouts = Object.entries(workouts)
    .filter(([day]) => selectedDays.includes(day));

  const dateRange = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  }) + ' - ' + 
  new Date(new Date().setDate(new Date().getDate() + 7))
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const htmlContent = `
    <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .day { 
            margin: 20px 0;
            padding: 15px;
            border-radius: 8px;
            background: #f8f9fa;
          }
          .workout {
            margin: 10px 0;
            padding: 15px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .workout-title {
            color: #2563eb;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .workout-meta {
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h2 style="color: #1f2937; text-align: center; margin-bottom: 30px;">
          Weekly Workout Routine (${dateRange})
        </h2>
        ${selectedWorkouts.map(([day, dayWorkouts]) => `
          <div class="day">
            <h3 style="color: #4b5563; margin-top: 0;">${day}</h3>
            ${dayWorkouts.map(workout => `
              <div class="workout">
                <div class="workout-title">${workout.title}</div>
                <div class="workout-meta">
                  <p>Duration: ${workout.duration} minutes</p>
                  ${workout.type ? `<p>Type: ${workout.type}</p>` : ''}
                  ${workout.difficulty ? `<p>Difficulty: ${workout.difficulty}</p>` : ''}
                  ${workout.notes ? `<p>Notes: ${workout.notes}</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </body>
    </html>
  `;

  const plainText = selectedWorkouts
    .map(([day, workouts]) => 
      `${day}:\n${workouts.map(w => 
        `- ${w.title} (${w.duration} min)${w.notes ? `\n  Notes: ${w.notes}` : ''}`
      ).join('\n')}`
    )
    .join('\n\n');

  return { htmlContent, plainText };
};