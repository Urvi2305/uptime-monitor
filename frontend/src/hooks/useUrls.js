import { useCallback, useEffect, useRef, useState } from 'react';
import { getUrls } from '../api/urls';

const POLL_INTERVAL_MS = 10_000;

export function useUrls() {
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoadedOnce = useRef(false);

  const fetchUrls = useCallback(async () => {
    try {
      const result = await getUrls();
      setUrls(result.items);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!hasLoadedOnce.current) {
        hasLoadedOnce.current = true;
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchUrls();
    const intervalId = setInterval(fetchUrls, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchUrls]);

  return { urls, isLoading, error, refresh: fetchUrls };
}
