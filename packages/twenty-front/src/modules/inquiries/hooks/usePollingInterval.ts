import { useCallback, useEffect, useRef } from 'react';

export const usePollingInterval = (
  callback: () => void,
  delay: number,
  { startImmediately = false } = {},
) => {
  const savedCallback = useRef(callback);
  const intervalId = useRef<NodeJS.Timeout>();
  const isPageVisible = useRef(true);
  const isMounted = useRef(false);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up page visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document) return; // Safety check for SSR
      isPageVisible.current = document.visibilityState === 'visible';
    };

    if (typeof document !== 'undefined') {
      // Safety check for SSR
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
      };
    }
  }, []);

  // Set up the interval
  const startPolling = useCallback(() => {
    if (!isMounted.current) return; // Don't start if not mounted
    if (intervalId.current) return; // Prevent multiple intervals

    if (startImmediately) {
      savedCallback.current();
    }

    intervalId.current = setInterval(() => {
      if (isPageVisible.current && isMounted.current) {
        savedCallback.current();
      }
    }, delay);
  }, [delay, startImmediately]);

  const stopPolling = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = undefined;
    }
  }, []);

  // Clean up on unmount and handle mounting
  useEffect(() => {
    isMounted.current = true;
    startPolling();

    return () => {
      isMounted.current = false;
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  return { startPolling, stopPolling };
};
