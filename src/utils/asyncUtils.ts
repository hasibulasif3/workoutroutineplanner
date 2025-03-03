
/**
 * Utility to wrap useState setters in a Promise
 * @param stateSetter The React useState setter function
 * @param newValue The new value to set
 * @returns A Promise that resolves when the state is updated
 */
export function setStateAsync<T>(
  stateSetter: React.Dispatch<React.SetStateAction<T>>,
  newValue: T | ((prevState: T) => T)
): Promise<void> {
  return new Promise<void>(resolve => {
    stateSetter(prevState => {
      const updatedValue = typeof newValue === 'function'
        ? (newValue as ((prevState: T) => T))(prevState)
        : newValue;
        
      // Use setTimeout to ensure this runs after the state update is processed
      setTimeout(() => {
        resolve();
      }, 0);
      
      return updatedValue;
    });
  });
}

/**
 * Creates a delayed promise that resolves after a specified timeout
 * @param ms Milliseconds to delay
 * @returns A Promise that resolves after the specified delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks if a condition is met, retrying until timeout
 * @param checkFn Function that returns true when condition is met
 * @param timeoutMs Maximum time to wait for condition
 * @param intervalMs Interval between checks
 * @returns Promise that resolves when condition is met or rejects on timeout
 */
export async function waitForCondition(
  checkFn: () => boolean,
  timeoutMs = 5000,
  intervalMs = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    if (checkFn()) {
      return Promise.resolve();
    }
    await delay(intervalMs);
  }
  
  return Promise.reject(new Error(`Condition not met within ${timeoutMs}ms`));
}
