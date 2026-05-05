const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export const getAccessToken = () => localStorage.getItem('accessToken');

export const fetcher = async (path: string, opts: RequestInit = {}) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...((opts.headers as any) || {}) };
  const token = getAccessToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, { ...opts, headers, credentials: 'include' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'API error');
  }
  return res.json().catch(() => ({}));
};

export default { fetcher };
