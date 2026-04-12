import { useState, useEffect } from "react";
import { analyticsService, type AnalyticsOverview } from "@/services/analytics.service";

export function useAnalyticsOverview() {
  const [data,    setData]    = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    analyticsService.overview()
      .then(setData)
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useSimilarCandidates(candidateId: string | null) {
  const [data,    setData]    = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!candidateId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    analyticsService.similar(candidateId)
      .then((res) => setData(res.similar))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [candidateId]);

  return { data, loading };
}