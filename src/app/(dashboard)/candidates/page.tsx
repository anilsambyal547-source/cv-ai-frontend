"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, SlidersHorizontal, Download,
  BookmarkPlus, User, Mail, MapPin, Briefcase,
  GraduationCap, AlertTriangle, RefreshCw, Inbox,
  Eye, X,
} from "lucide-react";
import { useCandidateList } from "@/hooks/useCandidate";
import { useShortlistStore } from "@/stores/shortlistStore";
import type { CandidateListItem } from "@/types/candidates";
import { getResourceUrl } from "@/lib/api-config";

// ── Quality Badge ─────────────────────────────────────────────────────────────
function QualityBadge({ label }: { label: string }) {
  const cfg: Record<string, { color: string; bg: string; border: string }> = {
    excellent: { color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.20)"  },
    good:      { color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.20)"  },
    fair:      { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.20)"  },
    poor:      { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.20)" },
  };
  const s = cfg[label] ?? { color: "rgba(100,116,139,0.8)", bg: "rgba(255,255,255,0.04)", border: "rgba(148,163,184,0.12)" };
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full capitalize font-mono-display"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {label}
    </span>
  );
}

// ── Candidate Card ────────────────────────────────────────────────────────────
function CandidateGridCard({
  candidate,
  index,
  onView,
  onViewCV,
  onShortlist,
  isShortlisted,
}: {
  candidate:    CandidateListItem;
  index:        number;
  onView:       (id: string) => void;
  onViewCV:     (c: CandidateListItem) => void;
  onShortlist:  (c: CandidateListItem) => void;
  isShortlisted: boolean;
  cvLoading?:    boolean;
}) {
  const skills = candidate.skills
    ? candidate.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const initials = (candidate.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative glass-panel p-5 cursor-default"
      style={{}}  // depth from glass-panel
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Hover glow — accent blue */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, rgba(20,184,166,0.05), transparent 70%)" }}
      />

      {/* Needs review banner */}
      {candidate.needs_review && (
        <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/15">
          <AlertTriangle strokeWidth={1.5} className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p className="text-[11px] text-amber-400">Extraction issues — needs review</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          onClick={(e) => { e.stopPropagation(); onViewCV(candidate); }}
          className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 hover:ring-teal-500/50 transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(59,130,246,0.2) 100%)",
            border: "1px solid rgba(148,163,184,0.14)",
            color: "rgba(226,232,240,0.9)",
          }}
          title="Click to view original CV"
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 
              onClick={(e) => { e.stopPropagation(); onViewCV(candidate); }}
              className="text-sm font-semibold text-foreground truncate cursor-pointer hover:text-teal-400 transition-colors"
              title="Click to view original CV"
            >
              {candidate.name}
            </h3>
            {candidate.quality_label && <QualityBadge label={candidate.quality_label} />}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            {candidate.seniority && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase strokeWidth={1.5} className="w-3 h-3" />
                {candidate.seniority}
              </span>
            )}
            {candidate.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin strokeWidth={1.5} className="w-3 h-3" />
                {candidate.location}
              </span>
            )}
            {candidate.education_level && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <GraduationCap strokeWidth={1.5} className="w-3 h-3" />
                {candidate.education_level}
              </span>
            )}
            {candidate.years_experience > 0 && (
              <span className="text-xs text-muted-foreground">
                {candidate.years_experience}y exp
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Email */}
      {candidate.email && (
        <div className="flex items-center gap-1.5 mt-3">
          <Mail strokeWidth={1.5} className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{candidate.email}</span>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skills.slice(0, 4).map((s) => (
            <span key={s} className="skill-tag">{s}</span>
          ))}
          {skills.length > 4 && (
            <span className="skill-tag">+{skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Industry */}
      {candidate.industry && (
        <div className="mt-3">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full capitalize font-mono-display"
            style={{ color: "#60a5fa", background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.18)" }}
          >
            {candidate.industry}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 transition-all duration-200">
        <button
          onClick={() => onView(candidate.id)}
          className="btn-teal text-[11px]"
        >
          <User strokeWidth={1.5} className="w-3 h-3" />
          View Profile
        </button>
        <button
          onClick={() => onShortlist(candidate)}
          className="btn-metal text-[11px] ml-auto"
          style={isShortlisted ? { color: "#4ade80", borderColor: "rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.08)" } : {}}
        >
          <BookmarkPlus strokeWidth={1.5} className="w-3 h-3" />
          {isShortlisted ? "Shortlisted" : "Shortlist"}
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CandidatesPage() {
  const router  = useRouter();
  const { candidates, loading, error, total, refetch } = useCandidateList(50, 0);
  const { add: addToShortlist, remove: removeFromShortlist, has: isShortlisted } = useShortlistStore();

  const [search,     setSearch]     = useState("");
  const [filterQual, setFilterQual] = useState<string>("all");
  const [sortBy,     setSortBy]     = useState<"name" | "experience" | "quality">("quality");

  // CV preview state
  const [showCV, setShowCV] = useState(false);
  const [cvCandidate, setCvCandidate] = useState<CandidateListItem | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [cvLoading, setCvLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (cvUrl) URL.revokeObjectURL(cvUrl);
    };
  }, [cvUrl]);

  const handleViewCV = useCallback(async (c: CandidateListItem) => {
    setCvCandidate(c);
    setShowCV(true);
    setCvLoading(true);
    try {
      const { candidateService } = await import("@/services/candidate.service");
      const blob = await candidateService.getCV(c.id);
      const url = URL.createObjectURL(blob);
      setCvUrl(url);
    } catch (err) {
      console.error("Failed to load CV:", err);
    } finally {
      setCvLoading(false);
    }
  }, []);

  // Filter + sort locally
  const filtered = candidates
    .filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.skills.toLowerCase().includes(q) ||
        (c.location ?? "").toLowerCase().includes(q) ||
        (c.industry ?? "").toLowerCase().includes(q);

      const matchesQuality =
        filterQual === "all" || c.quality_label === filterQual;

      return matchesSearch && matchesQuality;
    })
    .sort((a, b) => {
      if (sortBy === "name")       return a.name.localeCompare(b.name);
      if (sortBy === "experience") return b.years_experience - a.years_experience;
      if (sortBy === "quality")    return (b.quality_score ?? 0) - (a.quality_score ?? 0);
      return 0;
    });

  // CSV export
  const exportCSV = useCallback(() => {
    const headers = ["Name", "Email", "Location", "Seniority", "Experience", "Skills", "Industry", "Quality"];
    const rows = filtered.map((c) => [
      c.name, c.email, c.location ?? "",
      c.seniority, c.years_experience,
      c.skills_preview, c.industry ?? "",
      c.quality_label ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "candidates.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  return (
    <div className="space-y-6">

      {/* PDF View Modal */}
      <AnimatePresence>
        {showCV && cvCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowCV(false)}
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full h-full max-w-5xl bg-background rounded-3xl border border-white/10 overflow-hidden flex flex-col"
              style={{ boxShadow: "0 24px 64px -12px rgba(0,0,0,0.5)" }}
            >
              {/* Tool bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
                    <Eye className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Original CV</h2>
                    <p className="text-[10px] text-muted-foreground">{cvCandidate.name}.pdf</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <a 
                    href={getResourceUrl(`/api/candidate/${cvCandidate.id}/cv`)}
                    download
                    className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                  <button 
                    onClick={() => setShowCV(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
              
              {/* Viewer */}
              <div className="flex-1 bg-neutral-900 overflow-hidden flex items-center justify-center">
                {cvLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading CV...</p>
                  </div>
                ) : cvUrl ? (
                  <iframe 
                    src={`${cvUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-none"
                    title="PDF Viewer"
                  />
                ) : (
                  <div className="text-center p-8">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <p className="text-sm text-foreground">Failed to load CV</p>
                    <p className="text-xs text-muted-foreground mt-2">The file might be missing or inaccessible.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(213,31%,92%)" }}>Candidates</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(100,116,139,0.85)" }}>
            {loading ? "Loading..." : total + " candidates in database"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetch} disabled={loading} className="btn-metal">
            <RefreshCw strokeWidth={1.5} className={"w-3 h-3 " + (loading ? "animate-spin" : "")} />
            Refresh
          </button>
          <button onClick={exportCSV} disabled={filtered.length === 0} className="btn-metal">
            <Download strokeWidth={1.5} className="w-3 h-3" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400"
          >
            <AlertTriangle strokeWidth={1.5} className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={refetch} className="underline ml-auto text-xs">Retry</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 h-9 px-3 rounded-xl flex-1 min-w-[200px] max-w-sm"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(148,163,184,0.10)",
          }}
        >
          <Search strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(100,116,139,0.6)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skill, location..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "hsl(213,31%,92%)", caretColor: "#14b8a6" }}
          />
        </div>

        {/* Quality filter */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground" />
          {["all", "excellent", "good", "fair", "poor"].map((q) => (
            <button
              key={q}
              onClick={() => setFilterQual(q)}
              className="text-xs px-2.5 py-1 rounded-full capitalize transition-all duration-150"
              style={{
                background: filterQual === q ? "rgba(20,184,166,0.12)" : "rgba(255,255,255,0.04)",
                border: filterQual === q ? "1px solid rgba(20,184,166,0.28)" : "1px solid rgba(148,163,184,0.10)",
                color: filterQual === q ? "#14b8a6" : "rgba(100,116,139,0.8)",
                boxShadow: filterQual === q ? "0 0 8px rgba(20,184,166,0.10)" : "none",
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="h-9 px-3 rounded-xl text-sm outline-none cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(148,163,184,0.10)",
            color: "rgba(100,116,139,0.85)",
          }}
        >
          <option value="quality">Sort: Quality</option>
          <option value="experience">Sort: Experience</option>
          <option value="name">Sort: Name</option>
        </select>

        {/* Results count */}
        {search || filterQual !== "all" ? (
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} of {candidates.length}
          </span>
        ) : null}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          className="flex flex-col items-center justify-center py-32 gap-4"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.15)" }}
          >
            <Inbox strokeWidth={1.5} className="w-7 h-7" style={{ color: "#14b8a6" }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: "hsl(213,31%,88%)" }}>
              {search || filterQual !== "all" ? "No candidates match your filters" : "No candidates yet"}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(100,116,139,0.7)" }}>
              {search || filterQual !== "all"
                ? "Try adjusting your search or filters"
                : "Upload CVs to get started"}
            </p>
          </div>
          {!search && filterQual === "all" && (
            <button onClick={() => router.push("/upload")} className="btn-teal">
              <Users strokeWidth={1.5} className="w-3.5 h-3.5" />
              Upload CVs
            </button>
          )}
        </motion.div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filtered.map((c, i) => (
            <CandidateGridCard
              key={c.id}
              candidate={c}
              index={i}
              onView={(id) => router.push("/candidates/" + id)}
              onViewCV={handleViewCV}
              onShortlist={(c) => {
                if (isShortlisted(c.id)) {
                  removeFromShortlist(c.id);
                } else {
                  addToShortlist({
                    id:               c.id,
                    name:             c.name,
                    email:            c.email,
                    skills:           c.skills,
                    years_experience: c.years_experience,
                    seniority:        c.seniority,
                    location:         c.location,
                    industry:         c.industry,
                    addedAt:          new Date().toISOString(),
                  });
                }
              }}
              isShortlisted={isShortlisted(c.id)}
              cvLoading={cvLoading && cvCandidate?.id === c.id}
            />
          ))}
        </motion.div>
      )}

    </div>
  );
}