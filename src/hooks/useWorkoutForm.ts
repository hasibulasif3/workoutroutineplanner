import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { WorkoutFormType } from '@/components/workout/types';
import { toast } from 'sonner';

const AUTOSAVE_DELAY = 2000; // 2 seconds

export function useWorkoutForm(form: UseFormReturn<WorkoutFormType>) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);

  // Load saved form state
  useEffect(() => {
    const savedState = localStorage.getItem('workout-form-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        form.reset(parsed);
        setHasUnsavedChanges(true);
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

  // Autosave form state
  useEffect(() => {
    let autosaveTimeout: NodeJS.Timeout;

    const subscription = form.watch((value) => {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        setHasUnsavedChanges(true);
        setIsAutosaving(true);

        // Clear existing timeout
        if (autosaveTimeout) {
          clearTimeout(autosaveTimeout);
        }

        // Set new timeout for autosave
        autosaveTimeout = setTimeout(() => {
          try {
            localStorage.setItem('workout-form-state', JSON.stringify(value));
            setIsAutosaving(false);
            toast.success('Changes autosaved', { duration: 2000 });
          } catch (error) {
            console.error('Error autosaving form state:', error);
            toast.error('Failed to autosave changes');
          }
        }, AUTOSAVE_DELAY);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (autosaveTimeout) {
        clearTimeout(autosaveTimeout);
      }
    };
  }, [form.watch]);

  const clearFormState = () => {
    localStorage.removeItem('workout-form-state');
    setHasUnsavedChanges(false);
    form.reset();
  };

  return {
    hasUnsavedChanges,
    isAutosaving,
    clearFormState
  };
}