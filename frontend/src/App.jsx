import { useUrls } from './hooks/useUrls';
import UrlList from './components/UrlList';

function App() {
  const { urls, isLoading, error } = useUrls();

  return (
    <div className="app">
      <h1>Uptime Monitor</h1>

      {isLoading ? (
        <p className="status-message">Loading…</p>
      ) : (
        <>
          {error && (
            <p className="error-banner">
              Couldn't refresh: {error} Showing last known data.
            </p>
          )}
          <UrlList urls={urls} />
        </>
      )}
    </div>
  );
}

export default App;
