// Thin wrapper around fetch that attaches the auth token and unwraps JSON.
// The base URL is empty in dev (Vite proxies /api) and can be overridden with
// VITE_API_URL for a deployed back-end.

const BASE_URL = import.meta.env.VITE_API_URL || "";

const TOKEN_KEY = "alp_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore storage errors (e.g. private mode) */
  }
}

export async function api(path, { method = "GET", body } = {}) {
  const token = getToken();

  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}
