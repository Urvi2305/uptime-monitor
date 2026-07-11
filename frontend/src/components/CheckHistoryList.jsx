import { useEffect, useState } from 'react';
import { getUrlChecks } from '../api/urls';
import StatusBadge from './StatusBadge';
import { formatRelativeTime } from '../utils/formatRelativeTime';

const MAX_ENTRIES = 20;

function CheckHistoryList({ urlId }) {
  const [checks, setChecks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getUrlChecks(urlId)
      .then((data) => {
        if (!cancelled) setChecks(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [urlId, retryToken]);

  if (isLoading) {
    return <p className="history-status">Loading history…</p>;
  }

  if (error) {
    return (
      <div className="history-status history-error">
        <span>Couldn't load history: {error}</span>
        <button type="button" onClick={() => setRetryToken((t) => t + 1)}>
          Try again
        </button>
      </div>
    );
  }

  if (checks.length === 0) {
    return <p className="history-status">No checks recorded yet.</p>;
  }

  const visibleChecks = checks.slice(0, MAX_ENTRIES);

  return (
    <ul className="history-list">
      {visibleChecks.map((check) => (
        <li key={check.id} className="history-row">
          <StatusBadge isUp={check.is_up} />
          <span className="history-status-code">{check.status_code ?? '—'}</span>
          <span className="history-response-time">
            {check.response_time_ms != null ? `${check.response_time_ms} ms` : '—'}
          </span>
          <span className="history-time">{formatRelativeTime(check.checked_at)}</span>
          {check.error_message && (
            <span className="history-error-message">{check.error_message}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default CheckHistoryList;
