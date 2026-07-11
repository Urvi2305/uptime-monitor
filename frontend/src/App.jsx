import { useUrls } from './hooks/useUrls';
import { createUrl, deleteUrl } from './api/urls';
import UrlList from './components/UrlList';
import AddUrlForm from './components/AddUrlForm';

function App() {
  const { urls, isLoading, error, refresh } = useUrls();

  async function handleAdd(url) {
    await createUrl(url);
    await refresh();
  }

  async function handleDelete(id) {
    await deleteUrl(id);
    await refresh();
  }

  return (
    <div className="app">
      <h1>Uptime Monitor</h1>

      <AddUrlForm onAdd={handleAdd} />

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
        </>
      )}
    </div>
  );
}

export default App;
