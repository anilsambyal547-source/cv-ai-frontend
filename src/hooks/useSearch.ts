import { useState, useCallback, useRef } from "react";
import { searchCandidates } from "@/services/search.service";
import type { SearchFilters, Candidate } from "@/types/search";

const cache  = new Map<string, { data: Candidate[]; time: number }>();
const CACHE_TTL = 1000 * 60 * 5;

export function useSearch() {
  const [results,  setResults]  = useState<Candidate[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [meta,     setMeta]     = useState<{ total: number; time_ms: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (filters: Partial<SearchFilters>) => {
    const key    = JSON.stringify(filters);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      setResults(cached.data);
      setMeta({ total: cached.data.length, time_ms: 0 });
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const data = await searchCandidates(filters);
      const results = data.results ?? [];
      setResults(results);
      setMeta({ total: data.total, time_ms: data.time_ms });
      cache.set(key, { data: results, time: Date.now() });
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message ?? "Search failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setMeta(null);
    setError(null);
  }, []);

  return { results, loading, error, meta, search, clearResults };
}