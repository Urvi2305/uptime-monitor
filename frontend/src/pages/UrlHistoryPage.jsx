import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUrlById } from '../api/urls';
import { useUrlChecks } from '../hooks/useUrlChecks';
import StatusBadge from '../components/StatusBadge';
import ResponseTimeChart from '../components/ResponseTimeChart';
import CheckHistoryList from '../components/CheckHistoryList';
import Pagination from '../components/Pagination';

function UrlHistoryPage() {
  const { id } = useParams();
  const [url, setUrl] = useState(null);
  const [isUrlLoading, setIsUrlLoading] = useState(true);
  const [urlError, setUrlError] = useState(null);

  const {
    checks,
    pagination,
    page,
    setPage,
    isLoading: isChecksLoading,
    isPageLoading,
    error: checksError,
    refresh,
  } = useUrlChecks(id);

  useEffect(() => {
    let cancelled = false;

    setIsUrlLoading(true);
    setUrlError(null);

    getUrlById(id)
      .then((data) => {
        if (!cancelled) setUrl(data);
      })
      .catch((err) => {
        if (!cancelled) setUrlError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsUrlLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isUrlLoading) {
    return (
      <div className="app">
        <p className="status-message">Loading…</p>
      </div>
    );
  }

  if (urlError) {
    return (
      <div className="app">
        <header className="app-header">
          <Link to="/" className="back-link">
            ← Back to dashboard
          </Link>
        </header>
        <div className="empty-state">
          <p>URL not found. It may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="url-history-header">
        <Link to="/" className="back-link">
          ← Back to dashboard
        </Link>
        <div className="url-history-title">
          <StatusBadge isUp={url.is_up} />
          <span className="url-card-address">{url.url}</span>
        </div>
      </header>

      <ResponseTimeChart checks={checks} />

      <CheckHistoryList
        checks={checks}
        isLoading={isChecksLoading}
        error={checksError}
        onRetry={refresh}
      />

      {checks.length > 0 && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          isLoading={isPageLoading}
        />
      )}
    </div>
  );
}

export default UrlHistoryPage;
