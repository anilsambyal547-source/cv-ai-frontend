/**
 * Centralized API configuration for CV AI Platform.
 * Ensures environment portability for production deployment (e.g., Vercel + Render).
 */

const getApiUrl = (): string => {
  // Priority 1: Environment variable set during build/runtime
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Priority 2: Inferred from domain (if running on same host)
  if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
    return `https://${window.location.host}`; // Fallback for reverse-proxy setups
  }

  // Priority 3: Local development default
  return "http://localhost:8000";
};

export const API_BASE_URL = getApiUrl();

/**
 * Helper to build backend resource URLs (like CV PDF links)
 */
export const getResourceUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
