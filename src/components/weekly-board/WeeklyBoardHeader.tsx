
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, MoreHorizontal, PlusCircle } from "lucide-react";
import { useState } from "react";
import { WeeklyWorkouts, WorkoutInput } from "@/types/workout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateWorkoutDialog } from "../CreateWorkoutDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WeeklyBoardHeaderProps {
  workouts: WeeklyWorkouts;
  onWorkoutCreate: (workout: WorkoutInput) => Promise<void>;
  onFilterChange?: (filter: string) => void;
  onRefresh?: () => void;
}

export function WeeklyBoardHeader({ 
  workouts, 
  onWorkoutCreate, 
  onFilterChange, 
  onRefresh 
}: WeeklyBoardHeaderProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRefresh}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter: {activeFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleFilterChange('all')}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('strength')}>
              Strength
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('cardio')}>
              Cardio
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('flexibility')}>
              Flexibility
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <CreateWorkoutDialog onWorkoutCreate={onWorkoutCreate} />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Export Calendar</DropdownMenuItem>
          <DropdownMenuItem>Print View</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
