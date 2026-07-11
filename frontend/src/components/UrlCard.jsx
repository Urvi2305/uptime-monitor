import StatusBadge from './StatusBadge';

function formatRelativeTime(isoString) {
  if (!isoString) return 'never checked';

  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function UrlCard({ url }) {
  return (
    <li className="url-card">
      <div className="url-card-main">
        <StatusBadge isUp={url.is_up} />
        <span className="url-card-address">{url.url}</span>
      </div>
      <div className="url-card-meta">
        <span>{url.response_time_ms != null ? `${url.response_time_ms} ms` : '—'}</span>
        <span>{formatRelativeTime(url.checked_at)}</span>
      </div>
      {url.is_up === false && url.error_message && (
        <div className="url-card-error">{url.error_message}</div>
      )}
    </li>
  );
}

export default UrlCard;
