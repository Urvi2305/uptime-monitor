import { useState } from 'react';
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

function UrlCard({ url, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(url.id);
      // On success this card unmounts once the parent's list refreshes —
      // no need to reset isDeleting here.
    } catch (err) {
      setDeleteError(err.message);
      setIsDeleting(false);
    }
  }

  return (
    <li className="url-card">
      <div className="url-card-main">
        <StatusBadge isUp={url.is_up} />
        <span className="url-card-address">{url.url}</span>
        <button
          type="button"
          className="url-card-delete"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Removing…' : 'Remove'}
        </button>
      </div>
      <div className="url-card-meta">
        <span>{url.response_time_ms != null ? `${url.response_time_ms} ms` : '—'}</span>
        <span>{formatRelativeTime(url.checked_at)}</span>
      </div>
      {url.is_up === false && url.error_message && (
        <div className="url-card-error">{url.error_message}</div>
      )}
      {deleteError && <div className="url-card-error">Couldn't remove: {deleteError}</div>}
    </li>
  );
}

export default UrlCard;
