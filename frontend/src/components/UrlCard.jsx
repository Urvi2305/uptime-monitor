import { useState } from 'react';
import StatusBadge from './StatusBadge';
import CheckHistoryList from './CheckHistoryList';
import { formatRelativeTime } from '../utils/formatRelativeTime';

function UrlCard({ url, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasBeenExpanded, setHasBeenExpanded] = useState(false);

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

  function handleToggleHistory() {
    setIsExpanded((prev) => !prev);
    setHasBeenExpanded(true);
  }

  return (
    <li className="url-card">
      <div className="url-card-main">
        <StatusBadge isUp={url.is_up} />
        <span className="url-card-address">{url.url}</span>
        <button
          type="button"
          className="url-card-history-toggle"
          onClick={handleToggleHistory}
          aria-expanded={isExpanded}
        >
          {isExpanded ? '▾ History' : '▸ History'}
        </button>
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

      {hasBeenExpanded && (
        <div className={isExpanded ? 'url-card-history' : 'url-card-history is-hidden'}>
          <CheckHistoryList urlId={url.id} />
        </div>
      )}
    </li>
  );
}

export default UrlCard;
