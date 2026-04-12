import { getToken } from "./auth.service";

import { API_BASE_URL } from "@/lib/api-config";
const BASE_URL = API_BASE_URL;

async function get<T>(path: string): Promise<T> {
  const token = getToken();
  const res   = await fetch(`${BASE_URL}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface AnalyticsOverview {
  total_candidates:     number;
  avg_experience:       number;
  seniority_dist:       Record<string, number>;
  industry_dist:        Record<string, number>;
  top_skills:           { skill: string; count: number }[];
  cluster_dist:         Record<string, number>;
  experience_histogram: { range: string; count: number }[];
}

export interface SimilarCandidate {
  id:         string;
  name:       string;
  similarity: number;
  skills:     string;
  seniority:  string;
}

export const analyticsService = {
  overview: () =>
    get<AnalyticsOverview>("/api/analytics/overview"),

  clusters: () =>
    get<{ clusters: { name: string; count: number }[] }>("/api/analytics/clusters"),

  similar: (id: string, limit = 5) =>
    get<{ candidate_id: string; similar: SimilarCandidate[] }>(
      `/api/analytics/similar/${id}?limit=${limit}`
    ),

  enrich: (id: string) =>
    get<Record<string, any>>(`/api/analytics/enrich/${id}`),
};