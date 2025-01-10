import { ColumnStats } from './types';
import { Progress } from '@/components/ui/progress';
import { Clock, Activity, CheckCircle2, Users } from 'lucide-react';

interface ColumnStatsProps {
  stats: ColumnStats;
}

export function ColumnStats({ stats }: ColumnStatsProps) {
  return (
    <div className="p-4 space-y-4 glass-card mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Total Duration</span>
        </div>
        <span className="font-medium">{stats.totalDuration} min</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Intensity</span>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={stats.averageIntensity * 33.33} className="w-20" />
          <span className="font-medium">{stats.averageIntensity.toFixed(1)}/3</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Workouts</span>
        </div>
        <span className="font-medium">{stats.workoutCount}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Completion</span>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={stats.completionRate} className="w-20" />
          <span className="font-medium">{stats.completionRate}%</span>
        </div>
      </div>
    </div>
  );
}