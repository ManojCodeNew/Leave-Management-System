import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a rapidly changing value (e.g. search input).
 * @param value The raw value to debounce
 * @param delay Milliseconds to delay before updating the debounced value (default 400ms)
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

