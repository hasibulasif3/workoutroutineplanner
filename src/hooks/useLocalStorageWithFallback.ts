import { useState, useEffect, useCallback } from 'react';

interface StorageOptions<T> {
  key: string;
  initialValue: T;
  version?: number;
  maxSize?: number; // in bytes
}

export function useLocalStorageWithFallback<T>({
  key,
  initialValue,
  version = 1,
  maxSize = 5 * 1024 * 1024 // 5MB default limit
}: StorageOptions<T>) {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<Error | null>(null);

  // Check if localStorage is available
  const isStorageAvailable = useCallback(() => {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  // Load value from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === version) {
          setValue(parsed.data);
        }
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      setError(e instanceof Error ? e : new Error('Failed to load from storage'));
    }
  }, [key, version]);

  // Save value to storage with size check
  const updateValue = useCallback((newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      
      // Prepare storage object
      const storageObject = {
        version,
        timestamp: new Date().toISOString(),
        data: valueToStore
      };
      
      const serialized = JSON.stringify(storageObject);
      
      // Check size
      if (serialized.length > maxSize) {
        throw new Error('Data exceeds storage limit');
      }
      
      if (isStorageAvailable()) {
        localStorage.setItem(key, serialized);
      }
      
      setValue(valueToStore);
      setError(null);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      setError(e instanceof Error ? e : new Error('Failed to save to storage'));
      
      // Still update state even if storage fails
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
    }
  }, [key, maxSize, value, version, isStorageAvailable]);

  return {
    value,
    setValue: updateValue,
    error,
    clearError: () => setError(null)
  };
}