import { useCallback, useEffect, useRef, useState } from 'react';
import { getUrlChecks } from '../api/urls';

const PAGE_SIZE = 20;

export function useUrlChecks(urlId) {
  const [page, setPage] = useState(1);
  const [checks, setChecks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasLoadedOnce = useRef(false);

  const fetchChecks = useCallback(async () => {
    try {
      const result = await getUrlChecks(urlId, { page, limit: PAGE_SIZE });
      setChecks(result.items);
      setPagination(result.pagination);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!hasLoadedOnce.current) {
        hasLoadedOnce.current = true;
        setIsLoading(false);
      }
      setIsPageLoading(false);
    }
  }, [urlId, page]);

  useEffect(() => {
    if (hasLoadedOnce.current) {
      setIsPageLoading(true);
    }
    fetchChecks();
  }, [fetchChecks]);

  return {
    checks,
    pagination,
    page,
    setPage,
    isLoading,
    isPageLoading,
    error,
    refresh: fetchChecks,
  };
}
