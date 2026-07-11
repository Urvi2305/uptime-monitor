import StatusBadge from './StatusBadge';
import { formatRelativeTime } from '../utils/formatRelativeTime';

function CheckHistoryList({ checks, isLoading, error, onRetry }) {
  if (isLoading) {
    return <p className="history-status">Loading history…</p>;
  }

  if (error) {
    return (
      <div className="history-status history-error">
        <span>Couldn't load history: {error}</span>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (checks.length === 0) {
    return <p className="history-status">No checks recorded yet.</p>;
  }

  return (
    <ul className="history-list">
      {checks.map((check) => (
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
