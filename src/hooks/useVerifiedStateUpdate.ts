import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook that provides state management with verification that updates were applied
 * @param initialState The initial state value
 * @returns A tuple with the state, a setter function, and a verification function
 */
export function useVerifiedStateUpdate<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const stateRef = useRef<T>(initialState);
  
  // Keep the ref in sync with the state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Setter function that returns a promise
  const setVerifiedState = useCallback((updater: T | ((prevState: T) => T)): Promise<T> => {
    return new Promise((resolve, reject) => {
      // Update the state
      setState(prevState => {
        try {
          // Calculate the new state
          const newState = typeof updater === 'function' 
            ? (updater as ((prevState: T) => T))(prevState)
            : updater;
            
          // Use setTimeout to run after the state update is applied
          setTimeout(() => {
            // Verify that the state was updated by comparing with our ref
            if (stateRef.current === newState || 
                (Array.isArray(stateRef.current) && 
                 Array.isArray(newState) && 
                 JSON.stringify(stateRef.current) === JSON.stringify(newState))) {
              resolve(newState);
            } else {
              reject(new Error('State update was not applied'));
            }
          }, 100);
          
          // Return the new state for React's setState
          return newState;
        } catch (error) {
          reject(error);
          // Return the previous state unchanged if there was an error
          return prevState;
        }
      });
    });
  }, []);
  
  return [state, setVerifiedState, stateRef] as const;
}
