import UrlCard from './UrlCard';
import EmptyState from './EmptyState';

function UrlList({ urls }) {
  if (urls.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="url-list">
      {urls.map((url) => (
        <UrlCard key={url.id} url={url} />
      ))}
    </ul>
  );
}

export default UrlList;
