import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/api.client";

export interface DashboardMetrics {
  total_candidates:     number;
  avg_experience:       number;
  seniority_dist:       Record<string, number>;
  industry_dist:        Record<string, number>;
  top_skills:           { skill: string; count: number }[];
  cluster_dist:         Record<string, number>;
  experience_histogram: { range: string; count: number }[];
}

export interface TopCandidate {
  id:       string;
  score:    number;
  metadata: {
    name:             string;
    email:            string;
    skills:           string;
    years_experience: number;
    seniority?:       string;
    location?:        string;
    industry?:        string;
  };
}

export function useDashboard() {
  /**
   * Fetch core metrics and top candidates using React Query.
   * Enables automatic background refreshing to handle ingestion updates.
   */
  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const [metrics, candidates] = await Promise.all([
        apiFetch<DashboardMetrics>("/api/analytics/overview"),
        apiFetch<TopCandidate[]>("/api/search?query=software+engineer+developer&limit=6&alpha=0.5"),
      ]);
      
      return {
        metrics,
        topCandidates: candidates || [],
        allSkills: metrics.top_skills || [],
      };
    },
    // Auto-refresh every 30 seconds to show "live" ingestion updates
    refetchInterval: 30000,
    // Keep data fresh during navigation
    staleTime: 10000,
  });

  return {
    metrics:       data?.metrics ?? null,
    topCandidates: data?.topCandidates ?? [],
    allSkills:     data?.allSkills ?? [],
    loading:       isLoading,
    error:         error ? (error as Error).message : null,
    lastUpdated:   dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null,
    refresh:       () => refetch(),
  };
}