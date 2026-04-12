"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { login as apiLogin, saveToken, getToken, clearToken } from "@/services/auth.service";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface AuthUser {
  username: string;
  role:     "admin" | "recruiter";
}

interface AuthContextValue {
  user:      AuthUser | null;
  isLoading: boolean;
  login:     (creds: { username: string; password: string }) => Promise<void>;
  logout:    () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
/** Decode a JWT payload without verification (verification done server-side). */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json   = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Extract user from token stored in localStorage. Returns null if missing/expired. */
function userFromToken(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  // Check expiry
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    clearToken();
    return null;
  }
  return {
    username: payload.sub   ?? "unknown",
    role:     payload.role  ?? "recruiter",
  };
}

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);   // true on first mount

  // Restore session from localStorage on mount
  useEffect(() => {
    const restored = userFromToken();
    setUser(restored);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (creds: { username: string; password: string }) => {
    const { access_token } = await apiLogin(creds);
    saveToken(access_token);
    const u = userFromToken();
    if (!u) throw new Error("Token invalid after login");
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    // Hard redirect so all state is cleared
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}