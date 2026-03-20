import { useState, useEffect } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://api.nanaska.com').trim().replace(/\/+$/, '');

export function useApi(path, options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}${path}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message || 'Failed to fetch data'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [path]);

  return { data, loading, error };
}
