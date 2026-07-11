import { useState } from 'react';

function AddUrlForm({ onAdd }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onAdd(trimmed);
      setUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="add-url-form" onSubmit={handleSubmit}>
      <div className="add-url-row">
        <input
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          disabled={isSubmitting}
          aria-label="URL to monitor"
          autoFocus
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding…' : 'Add URL'}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}

export default AddUrlForm;
