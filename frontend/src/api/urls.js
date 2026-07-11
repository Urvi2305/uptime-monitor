const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const body = await response.json();

  if (!body.success) {
    throw new Error(body.message || 'Request failed');
  }

  return body.data;
}

export function getUrls({ page = 1, limit = 100 } = {}) {
  return request(`/api/urls?page=${page}&limit=${limit}`);
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
