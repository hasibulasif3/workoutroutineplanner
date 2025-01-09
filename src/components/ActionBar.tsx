import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Mail } from "lucide-react";
import { CreateWorkoutDialog } from "./CreateWorkoutDialog";
import { toast } from "sonner";
import { WeeklyWorkouts } from "@/types/workout";

interface ActionBarProps {
  workouts: WeeklyWorkouts;
  onWorkoutCreate: (workout: any) => void;
}

export function ActionBar({ workouts, onWorkoutCreate }: ActionBarProps) {
  const handleDownload = () => {
    const dataStr = JSON.stringify(workouts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workout-routine.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Workout routine downloaded successfully!');
  };

  const handleSync = () => {
    toast.success('Sync feature coming soon!');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('My Weekly Workout Routine');
    const body = encodeURIComponent(
      Object.entries(workouts)
        .map(([day, exercises]) => 
          `${day}:\n${exercises.map(ex => `- ${ex.title} (${ex.duration} mins)`).join('\n')}`
        )
        .join('\n\n')
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success('Opening email client...');
  };

  return (
    <div className="w-full max-w-4xl flex justify-between items-center mt-6">
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="gap-2 hover:scale-105 transition-transform"
          onClick={handleDownload}
        >
          <Download size={16} />
          Download
        </Button>
        <Button
          variant="outline"
          className="gap-2 hover:scale-105 transition-transform"
          onClick={handleSync}
        >
          <RefreshCw size={16} />
          Sync
        </Button>
        <Button
          variant="outline"
          className="gap-2 hover:scale-105 transition-transform"
          onClick={handleEmail}
        >
          <Mail size={16} />
          Email
        </Button>
      </div>
      <CreateWorkoutDialog onWorkoutCreate={onWorkoutCreate} />
    </div>
  );
}