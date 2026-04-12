import { apiFetch } from "./api.client";
import type { SearchFilters, SearchResponse } from "@/types/search";

export async function searchCandidates(
  filters: Partial<SearchFilters>
): Promise<SearchResponse> {
  const params = new URLSearchParams();

  // query is REQUIRED by backend
  if (filters.query?.trim()) {
    params.set("query", filters.query.trim());
  } else if ((filters.skills?.length ?? 0) > 0) {
    // If no query but skills selected, build query from skills
    params.set("query", filters.skills!.join(" "));
  } else {
    params.set("query", "software engineer");
  }

  if (filters.limit)                           params.set("limit",            String(filters.limit));
  if (filters.minExp != null)                  params.set("min_exp",          String(filters.minExp));
  if (filters.skills?.length)                  params.set("filter_skills",    filters.skills.join(","));
  if (filters.education && filters.education !== "any")
                                               params.set("filter_edu",       filters.education);
  if (filters.seniority && filters.seniority !== "any")
                                               params.set("filter_seniority", filters.seniority);
  if (filters.boolean?.trim())                 params.set("boolean",          filters.boolean.trim());

  const start = Date.now();
  const raw   = await apiFetch<any[]>(`/api/search?${params.toString()}`);
  const time  = Date.now() - start;

  // Backend returns array directly, we wrap it
  return {
    results:  raw ?? [],
    total:    raw?.length ?? 0,
    query:    filters.query ?? "",
    time_ms:  time,
  };
}