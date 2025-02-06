import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyWorkouts, Workout } from '@/types/workout';
import { toast } from 'sonner';

export function useRealtimeWorkouts() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('workouts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['workouts'] });
          
          const eventType = payload.eventType;
          const newRecord = payload.new as Workout;
          
          if (eventType === 'INSERT') {
            toast.info('New workout added');
          } else if (eventType === 'UPDATE') {
            toast.info('Workout updated');
          } else if (eventType === 'DELETE') {
            toast.info('Workout deleted');
          }
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          toast.success('Connected to real-time updates');
        } else if (status === 'CLOSED') {
          toast.error('Lost connection to real-time updates');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { isSubscribed };
}