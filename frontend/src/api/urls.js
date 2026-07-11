const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4000';
const REQUEST_TIMEOUT_MS = 10_000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  } finally {
    clearTimeout(timeoutId);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Request failed (${response.status})`);
  }

  if (!body.success) {
    throw new Error(body.message || 'Request failed');
  }

  return body.data;
}

export function getUrls({ page = 1, limit = 100 } = {}) {
  const qs = new URLSearchParams({ page, limit }).toString();
  return request(`/api/urls?${qs}`);
}

export function createUrl(url) {
  return request('/api/urls', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export function deleteUrl(id) {
  return request(`/api/urls/${id}`, { method: 'DELETE' });
}

export function getUrlChecks(id) {
  return request(`/api/urls/${id}/checks`);
}
