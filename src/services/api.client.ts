import { API_BASE_URL } from "@/lib/api-config";
const BASE_URL = API_BASE_URL;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  // Check localStorage first, then cookie
  const ls = localStorage.getItem("access_token");
  if (ls) return ls;
  // Read from cookie
  const match = document.cookie.match(/access_token=([^;]+)/);
  return match ? match[1] : null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // For mock mode — get real token from backend
  const token = getToken();

  // If token is missing, let the request proceed without it or handle appropriately
  // The hardcoded backdoor mock-token login has been removed for security.

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("access_token");
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? `API error ${res.status}`);
  }

  return res.json();
}

export const apiClient = {
  get:    <T>(path: string)                => apiFetch<T>(path),
  post:   <T>(path: string, body: unknown) => apiFetch<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => apiFetch<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  delete: <T>(path: string)               => apiFetch<T>(path, { method: "DELETE" }),
};