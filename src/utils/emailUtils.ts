import { WeeklyWorkouts } from "@/types/workout";
import { z } from "zod";

export const emailSchema = z.object({
  to: z.string().email("Invalid email address").min(1, "Email is required"),
  cc: z.string().email("Invalid CC email").optional().or(z.literal("")),
  bcc: z.string().email("Invalid BCC email").optional().or(z.literal("")),
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
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .day { margin-top: 20px; }
          .workout { margin: 10px 0; padding: 10px; background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h2>Weekly Workout Routine (${dateRange})</h2>
        ${selectedWorkouts.map(([day, dayWorkouts]) => `
          <div class="day">
            <h3>${day}</h3>
            ${dayWorkouts.map(workout => `
              <div class="workout">
                <h4>${workout.title}</h4>
                <p>Duration: ${workout.duration} minutes</p>
                <p>Type: ${workout.type}</p>
                ${workout.difficulty ? `<p>Difficulty: ${workout.difficulty}</p>` : ''}
                ${workout.notes ? `<p>Notes: ${workout.notes}</p>` : ''}
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
        `- ${w.title} (${w.duration} min)`
      ).join('\n')}`
    ).join('\n\n');

  return { htmlContent, plainText };
};