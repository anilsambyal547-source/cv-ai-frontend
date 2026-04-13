"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Inbox, Zap, BookmarkPlus } from "lucide-react";

import { SearchBar }     from "@/components/search/SearchBar";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { CandidateCard } from "@/components/search/CandidateCard";
import { useSearch }     from "@/hooks/useSearch";
import { useShortlistStore } from "@/stores/shortlistStore";
import { candidateService } from "@/services/candidate.service";
import type { SearchFilters } from "@/types/search";

const DEFAULT_FILTERS: Partial<SearchFilters> = {
  skills:    [],
  education: "any",
  seniority: "any",
  alpha:     0.5,
  limit:     20,
};

function SearchPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const prefilledQ   = searchParams.get("q") ?? "";

  const { results, loading, error, meta, search, clearResults } = useSearch();
  const { add: addToShortlist, has: isShortlisted, candidates: shortlisted } = useShortlistStore();

  const [filters,     setFilters]     = useState<Partial<SearchFilters>>({
    ...DEFAULT_FILTERS,
    query: prefilledQ,
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [justAdded,   setJustAdded]   = useState<Set<string>>(new Set());

  // Auto-search if query comes from dashboard quick search
  useEffect(() => {
    if (prefilledQ) {
      setHasSearched(true);
      search({ ...DEFAULT_FILTERS, query: prefilledQ });
    }
  }, [prefilledQ]);

  const handleSearch = useCallback((query: string) => {
    const f = { ...filters, query };
    setFilters(f);
    setHasSearched(true);
    search(f);
  }, [filters, search]);

  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(newFilters);
  }, []);

  const handleApplyFilters = useCallback(() => {
    const hasQuery     = !!filters.query?.trim();
    const hasSkills    = (filters.skills?.length ?? 0) > 0;
    const hasBoolean   = !!filters.boolean?.trim();
    const hasExpRange  = filters.minExp != null || filters.maxExp != null;
    const hasEdu       = filters.education && filters.education !== "any";
    const hasSeniority = filters.seniority && filters.seniority !== "any";

    if (!hasQuery && !hasSkills && !hasBoolean && !hasExpRange && !hasEdu && !hasSeniority) return;

    setHasSearched(true);
    search(filters);
  }, [filters, search]);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    clearResults();
    setHasSearched(false);
  }, [clearResults]);

  const handleShortlist = useCallback((id: string) => {
    const candidate = results.find((r) => r.id === id);
    if (!candidate) return;

    addToShortlist({
      id:               candidate.id,
      name:             candidate.metadata.name     ?? "Unknown",
      email:            candidate.metadata.email    ?? "",
      skills:           candidate.metadata.skills   ?? "",
      years_experience: candidate.metadata.years_experience ?? 0,
      seniority:        candidate.metadata.seniority,
      location:         candidate.metadata.location,
      industry:         candidate.metadata.industry,
      stage:            candidate.metadata.stage,
      addedAt:          new Date().toISOString(),
    });

    // Sync to pipeline
    candidateService.updateStage(candidate.id, "Shortlisted")
      .then(() => {
        // Update local results state so badge reflects change
        search(filters); // Re-run search to get fresh metadata
      })
      .catch(console.error);

    // Flash animation
    setJustAdded((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setTimeout(() => {
      setJustAdded((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  }, [results, addToShortlist, filters, search]);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Search</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Find candidates using natural language, filters, and boolean queries
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Results stats */}
          {meta && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1   }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5"
            >
              <Zap strokeWidth={1.5} className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">{meta.total}</span> results
                {" · "}
                <span className="text-foreground font-medium">{meta.time_ms}ms</span>
              </span>
            </motion.div>
          )}

          {/* Shortlist badge */}
          {shortlisted.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1   }}
              onClick={() => router.push("/outreach")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15 transition-colors"
            >
              <BookmarkPlus strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {shortlisted.length} shortlisted
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Search bar */}
      <SearchBar
        onSearch={handleSearch}
        loading={loading}
        defaultValue={prefilledQ}
      />

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout */}
      <div className="flex gap-5 items-start">

        {/* Filter sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          onApply={handleApplyFilters}
        />

        {/* Results area */}
        <div className="flex-1 min-w-0">

          {/* Empty — not searched yet */}
          {!hasSearched && !loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Search strokeWidth={1.5} className="w-7 h-7 text-blue-400" />
              </div>
              <div className="text-center max-w-sm">
                <p className="text-sm font-medium text-foreground">Start your search</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Use natural language like "Senior React developer with 5 years experience"
                  or apply filters and click Apply Filters
                </p>
              </div>
              {/* Quick search chips */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {[
                  "Python + AWS",
                  "Senior React dev",
                  "ML engineer PyTorch",
                  "DevOps Kubernetes",
                  "Full stack Node.js",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSearch(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground hover:border-blue-500/30 hover:text-blue-300 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty — searched but no results */}
          {hasSearched && !loading && results.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Inbox strokeWidth={1.5} className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">No candidates found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try adjusting your search query or filters
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Results grid */}
          <AnimatePresence mode="popLayout">
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-4"
              >
                {results.map((candidate, i) => {
                  const alreadyShortlisted = isShortlisted(candidate.id);
                  const justAddedThis      = justAdded.has(candidate.id);

                  return (
                    <div key={candidate.id} className="relative">
                      <CandidateCard
                        candidate={candidate}
                        index={i}
                        onView={(id) => router.push("/candidates/" + id)}
                        onEmail={(id) => console.log("email", id)}
                        onShortlist={alreadyShortlisted ? undefined : handleShortlist}
                      />

                      {/* Already shortlisted badge */}
                      {alreadyShortlisted && (
                        <div className="absolute top-3 right-3">
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                            <BookmarkPlus strokeWidth={1.5} className="w-3 h-3" />
                            Shortlisted
                          </span>
                        </div>
                      )}

                      {/* Just added flash */}
                      <AnimatePresence>
                        {justAddedThis && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1   }}
                            exit={{ opacity: 0,   scale: 0.9  }}
                            className="absolute inset-0 rounded-2xl border-2 border-emerald-500/40 pointer-events-none"
                            style={{ boxShadow: "0 0 20px rgba(16,185,129,0.15)" }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-52 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
