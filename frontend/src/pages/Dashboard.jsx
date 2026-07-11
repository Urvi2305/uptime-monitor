import { useState } from 'react';
import { useUrls } from '../hooks/useUrls';
import { createUrl, deleteUrl } from '../api/urls';
import UrlList from '../components/UrlList';
import AddUrlForm from '../components/AddUrlForm';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

function Dashboard() {
  const { urls, pagination, page, setPage, isLoading, isPageLoading, error, refresh } = useUrls();
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleAdd(url) {
    await createUrl(url);
    await refresh();
    setIsModalOpen(false);
  }

  async function handleDelete(id) {
    await deleteUrl(id);
    await refresh();
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Uptime Monitor</h1>
        <button type="button" className="add-url-button" onClick={() => setIsModalOpen(true)}>
          + Add URL
        </button>
      </header>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2 className="modal-title">Add URL to monitor</h2>
          <AddUrlForm onAdd={handleAdd} />
        </Modal>
      )}

      {isLoading ? (
        <p className="status-message">Loading…</p>
      ) : (
        <>
          {error && (
            <p className="error-banner">
              Couldn't refresh: {error} Showing last known data.
            </p>
          )}
          <UrlList urls={urls} onDelete={handleDelete} />
          {urls.length > 0 && (
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              isLoading={isPageLoading}
            />
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
