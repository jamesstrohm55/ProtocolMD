const BASE = import.meta.env.VITE_API_BASE_URL || '';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  protocols: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return apiFetch(`/api/protocols${q ? '?' + q : ''}`);
    },
    get: (id) => apiFetch(`/api/protocols/${id}`)
  },
  drugs: {
    search: (q) => apiFetch(`/api/drugs/search?q=${encodeURIComponent(q)}`),
    get: (name) => apiFetch(`/api/drugs/${encodeURIComponent(name)}`)
  },
  dose: {
    calculate: (payload) => apiFetch('/api/dose/calculate', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }
};
