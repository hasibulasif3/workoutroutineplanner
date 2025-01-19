import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { WorkoutFormType } from '@/components/workout/types';

export function useWorkoutForm(form: UseFormReturn<WorkoutFormType>) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load saved form state
  useEffect(() => {
    const savedState = localStorage.getItem('workout-form-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        form.reset(parsed);
      } catch (error) {
        console.error('Error parsing saved form state:', error);
        localStorage.removeItem('workout-form-state');
      }
    }

    // Handle beforeunload event
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Handle storage events (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'workout-form-state' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          form.reset(parsed);
        } catch (error) {
          console.error('Error parsing form state from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [form, hasUnsavedChanges]);

  // Save form state on changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        localStorage.setItem('workout-form-state', JSON.stringify(value));
        setHasUnsavedChanges(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const clearFormState = () => {
    localStorage.removeItem('workout-form-state');
    setHasUnsavedChanges(false);
    form.reset();
  };

  return {
    hasUnsavedChanges,
    clearFormState
  };
}