import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatRelativeTime } from '../utils/formatRelativeTime';

function UrlCard({ url, onDelete }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  async function handleDelete(event) {
    event.stopPropagation();
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

  function goToHistory() {
    navigate(`/urls/${url.id}`);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToHistory();
    }
  }

  return (
    <li
      className="url-card"
      onClick={goToHistory}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
    >
      <div className="url-card-main">
        <StatusBadge isUp={url.is_up} />
        <span className="url-card-address">{url.url}</span>
        <button
          type="button"
          className="url-card-delete"
          onClick={handleDelete}
          onKeyDown={(event) => event.stopPropagation()}
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
