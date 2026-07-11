import UrlCard from './UrlCard';
import EmptyState from './EmptyState';

function UrlList({ urls, onDelete }) {
  if (urls.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="url-list">
      {urls.map((url) => (
        <UrlCard key={url.id} url={url} onDelete={onDelete} />
      ))}
    </ul>
  );
}

export default UrlList;
