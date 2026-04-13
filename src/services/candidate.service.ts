import { apiFetch, apiBlobFetch } from "./api.client";
import type { CandidateProfile, CandidateInsights, CandidateListItem } from "@/types/candidates";

export const candidateService = {
  list: (limit = 20, offset = 0) =>
    apiFetch<CandidateListItem[]>(
      `/api/candidates?limit=${limit}&offset=${offset}`
    ),

  get: (id: string) =>
    apiFetch<CandidateProfile>(`/api/candidate/${id}`),

  getCV: (id: string) =>
    apiBlobFetch(`/api/candidate/${id}/cv`),

  insights: (id: string, jobDescription?: string) =>
    apiFetch<CandidateInsights>(`/api/candidate/${id}/insights`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ job_description: jobDescription ?? null }),
    }),
};