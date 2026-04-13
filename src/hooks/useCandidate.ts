import { useState, useEffect, useCallback } from "react";
import { candidateService } from "@/services/candidate.service";
import type { CandidateProfile, CandidateInsights, CandidateListItem } from "@/types/candidates";

// ── Single candidate ──────────────────────────────────────────────────────────
export function useCandidate(id: string | null) {
  const [profile,  setProfile]  = useState<CandidateProfile | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    candidateService
      .get(id)
      .then(setProfile)
      .catch((err) => setError(err?.message ?? "Failed to load candidate"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { profile, loading, error, refetch: fetch };
}

// ── AI Insights ───────────────────────────────────────────────────────────────
export function useInsights(id: string | null) {
  const [insights, setInsights] = useState<CandidateInsights | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const generate = useCallback(async (jobDescription?: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await candidateService.insights(id, jobDescription);
      setInsights(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const clear = useCallback(() => {
    setInsights(null);
    setError(null);
  }, []);

  return { insights, loading, error, generate, clear };
}

// ── Candidates list ───────────────────────────────────────────────────────────
export function useCandidateList(limit = 20, offset = 0) {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [total,      setTotal]      = useState(0);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    candidateService
      .list(limit, offset)
      .then((data) => {
        setCandidates(data ?? []);
        setTotal(data?.length ?? 0);
      })
      .catch((err) => setError(err?.message ?? "Failed to load candidates"))
      .finally(() => setLoading(false));
  }, [limit, offset]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetch(); }, [fetch]);

  return { candidates, loading, error, total, refetch: fetch };
}