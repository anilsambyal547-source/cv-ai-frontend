import { apiFetch } from "./api.client";

export interface DashboardMetrics {
  total_candidates:     number;
  avg_experience:       number;
  seniority_dist:       Record<string, number>;
  industry_dist:        Record<string, number>;
  top_skills:           { skill: string; count: number }[];
  cluster_dist:         Record<string, number>;
  experience_histogram: { range: string; count: number }[];
}

export interface RecentCandidate {
  id:       string;
  score:    number;
  metadata: {
    name:             string;
    email:            string;
    skills:           string;
    years_experience: number;
    seniority:        string;
    location?:        string;
    industry?:        string;
  };
}

export interface RecentUpload {
  id:         string;
  name:       string;
  status:     "processed" | "processing" | "failed";
  size?:      string;
  created_at?: string;
}

export const dashboardService = {
  // Real analytics from backend
  getMetrics: () =>
    apiFetch<DashboardMetrics>("/api/analytics/overview"),

  // Top candidates by search score (backend returns array directly)
  getTopCandidates: (limit = 5) =>
    apiFetch<RecentCandidate[]>(
      `/api/search?query=software+engineer&limit=${limit}&alpha=0.5`
    ),

  // All candidates for count
  getCandidates: (limit = 10) =>
    apiFetch<{ candidates: RecentCandidate[]; total: number }>(
      `/api/candidates?limit=${limit}&offset=0`
    ),
};