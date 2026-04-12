import { API_BASE_URL } from "@/lib/api-config";
const BASE_URL = API_BASE_URL;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type:   string;
}

export async function login(creds: LoginCredentials): Promise<TokenResponse> {
  const form = new URLSearchParams();
  form.append("username", creds.username);
  form.append("password", creds.password);

  const res = await fetch(`${BASE_URL}/token`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    form.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Invalid credentials");
  }

  return res.json();
}

export function saveToken(token: string): void {
  if (typeof window !== "undefined")
    localStorage.setItem("access_token", token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function clearToken(): void {
  if (typeof window !== "undefined")
    localStorage.removeItem("access_token");
}