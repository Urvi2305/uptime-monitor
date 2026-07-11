import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import Modal from './Modal';
import { formatRelativeTime } from '../utils/formatRelativeTime';

function UrlCard({ url, onDelete }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function openConfirm(event) {
    event.stopPropagation();
    setDeleteError(null);
    setIsConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(url.id);
      // On success this card unmounts once the parent's list refreshes —
      // no need to reset isDeleting/close the modal here.
    } catch (err) {
      setDeleteError(err.message);
      setIsDeleting(false);
      setIsConfirmOpen(false);
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
          onClick={openConfirm}
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

      {isConfirmOpen && (
        <Modal onClose={() => setIsConfirmOpen(false)}>
          <h2 className="modal-title">Remove this URL?</h2>
          <p className="confirm-dialog-text">
            <span className="url-card-address">{url.url}</span> will stop being monitored. This
            can't be undone.
          </p>
          <div className="confirm-dialog-actions">
            <button
              type="button"
              className="confirm-dialog-cancel"
              onClick={(event) => {
                event.stopPropagation();
                setIsConfirmOpen(false);
              }}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="confirm-dialog-confirm"
              onClick={(event) => {
                event.stopPropagation();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </Modal>
      )}
    </li>
  );
}

export default UrlCard;
