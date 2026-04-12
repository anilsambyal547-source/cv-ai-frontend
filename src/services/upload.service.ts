import { API_BASE_URL } from "@/lib/api-config";
const BASE_URL = API_BASE_URL;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export interface UploadResult {
  status:     "success" | "error" | "duplicate" | "processing";
  filename:   string;
  message:    string;
  candidates: number;
  indexed?:   number;
  skipped?:   boolean;
}

export interface DBStats {
  total:        number;
  needs_review: number;
  industries:   Record<string, number>;
  seniorities:  Record<string, number>;
  ids:          string[];
}

export async function uploadCV(file: File): Promise<UploadResult> {
  const token = getToken();
  const form  = new FormData();
  form.append("file", file);

  const res = await fetch(BASE_URL + "/api/ingest", {
    method:  "POST",
    headers: token ? { Authorization: "Bearer " + token } : {},
    body:    form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Upload failed with status " + res.status);
  }

  return res.json();
}

export async function getDBStats(): Promise<DBStats> {
  const token = getToken();
  const res   = await fetch(BASE_URL + "/api/ingest/stats", {
    headers: token ? { Authorization: "Bearer " + token } : {},
  });
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

export async function deleteCandidate(id: string): Promise<void> {
  const token = getToken();
  const res   = await fetch(BASE_URL + "/api/ingest/" + id, {
    method:  "DELETE",
    headers: token ? { Authorization: "Bearer " + token } : {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Delete failed");
  }
}