import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyWorkouts, Workout, Exercise } from '@/types/workout';
import { toast } from 'sonner';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState<Workout[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingChanges();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOffline = async (workout: Workout) => {
    try {
      const offlineData = localStorage.getItem('offline_workouts');
      const offlineWorkouts = offlineData ? JSON.parse(offlineData) : [];
      offlineWorkouts.push({ ...workout, sync_status: 'pending' });
      localStorage.setItem('offline_workouts', JSON.stringify(offlineWorkouts));
      setPendingSync(prev => [...prev, workout]);
      
      toast.info('Changes saved offline', {
        description: 'Will sync when connection is restored'
      });
    } catch (error) {
      console.error('Error saving offline:', error);
      toast.error('Failed to save offline');
    }
  };

  const syncPendingChanges = async () => {
    if (!isOnline || pendingSync.length === 0) return;

    const syncPromises = pendingSync.map(async (workout) => {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .upsert({
            id: workout.id,
            title: workout.title,
            duration: workout.duration,
            type: workout.type,
            difficulty: workout.difficulty,
            calories: workout.calories,
            notes: workout.notes,
            exercises: JSON.stringify(workout.exercises),
            last_modified: workout.last_modified,
            sync_status: 'synced',
            last_synced_at: new Date().toISOString(),
            client_timestamp: new Date().toISOString()
          });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Sync error:', error);
        return null;
      }
    });

    try {
      await Promise.all(syncPromises);
      localStorage.removeItem('offline_workouts');
      setPendingSync([]);
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      
      toast.success('Changes synced successfully');
    } catch (error) {
      console.error('Batch sync error:', error);
      toast.error('Some changes failed to sync');
    }
  };

  return {
    isOnline,
    pendingSync,
    saveOffline,
    syncPendingChanges
  };
}