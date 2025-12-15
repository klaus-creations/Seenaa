import { useEffect, useState } from "react";

/**
 * useDebounce Hook
 *
 * This hook allows you to debounce any fast-changing value.
 * It is commonly used for search inputs to delay the API call
 * until the user has stopped typing for a specific amount of time.
 *
 * @param value - The value to debounce (usually the search string)
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes (also on component unmount)
      // This is the cleanup function that prevents the previous value from setting
      // if the user types again before the delay is over.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}
