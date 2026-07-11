import { useEffect } from 'react';
import { createPortal } from 'react-dom';

function Modal({ onClose, children }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleBackdropClick(event) {
    event.stopPropagation();
    if (event.target === event.currentTarget) onClose();
  }

  function handleCloseClick(event) {
    event.stopPropagation();
    onClose();
  }

  return createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal" role="dialog" aria-modal="true">
        <button type="button" className="modal-close" onClick={handleCloseClick} aria-label="Close">
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
