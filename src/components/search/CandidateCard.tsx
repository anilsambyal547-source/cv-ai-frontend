"use client";

import { motion } from "framer-motion";
import {
  MapPin, Briefcase, GraduationCap, Zap,
  Mail, User, BookmarkPlus, AlertTriangle,
} from "lucide-react";
import type { Candidate } from "@/types/search";

interface Props {
  candidate:   Candidate;
  index:       number;
  onView:      (id: string) => void;
  onEmail:     (id: string) => void;
  onShortlist?: (id: string) => void;
}

// ── Fit Score ─────────────────────────────────────────────────────────────────
function FitScore({ score }: { score: number }) {
  const pct   = score > 1 ? Math.round(score) : Math.round(score * 100);
  const color = pct >= 85 ? "#10b981" : pct >= 70 ? "#3b82f6" : "#f59e0b";
  const label = pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : "Fair";
  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0">
      <div className="flex items-center gap-1">
        <Zap strokeWidth={1.5} className="w-3.5 h-3.5" style={{ color }} />
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color, textShadow: "0 0 8px " + color + "60" }}
        >
          {pct}%
        </span>
      </div>
      <span className="text-[10px]" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Quality Badge ─────────────────────────────────────────────────────────────
function QualityBadge({
  label,
  needsReview,
}: {
  label?:       string;
  needsReview?: boolean;
}) {
  if (!label) return null;

  const styles: Record<string, string> = {
    excellent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    good:      "text-blue-400    bg-blue-500/10    border-blue-500/20",
    fair:      "text-amber-400   bg-amber-500/10   border-amber-500/20",
    poor:      "text-red-400     bg-red-500/10     border-red-500/20",
  };

  const cls = styles[label] ?? "text-muted-foreground bg-white/5 border-white/10";

  return (
    <div className="flex items-center gap-1">
      {needsReview && (
        <span title="Needs review — extraction may have issues">
          <AlertTriangle
            strokeWidth={1.5}
            className="w-3 h-3 text-amber-400"
          />
        </span>
      )}
      <span className={"text-[10px] px-2 py-0.5 rounded-full border capitalize " + cls}>
        {label}
      </span>
    </div>
  );
}

// ── Main Card ─────────────────────────────────────────────────────────────────
export function CandidateCard({
  candidate, index, onView, onEmail, onShortlist,
}: Props) {
  const m      = candidate.metadata;
  const skills = m.skills
    ? m.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const qualityLabel   = (candidate as any).quality_label   as string | undefined;
  const needsReview    = (candidate as any).needs_review    as boolean | undefined;
  const qualityIssues  = (candidate as any).quality_issues  as string[] | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 group cursor-default overflow-hidden"
      style={{
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      {/* Top glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, rgba(59,130,246,0.04), transparent 70%)" }}
      />

      {/* Needs review banner */}
      {needsReview && (
        <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/15">
          <AlertTriangle strokeWidth={1.5} className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p className="text-[11px] text-amber-400">
            CV extraction issues — data may be incomplete
          </p>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">

          {/* Avatar */}
          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center text-sm font-semibold text-white/80">
            {(m.name ?? "?")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {m.name ?? "Unknown"}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <QualityBadge label={qualityLabel} needsReview={needsReview} />
                {m.stage && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 capitalize whitespace-nowrap">
                    {m.stage}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
              {m.seniority && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Briefcase strokeWidth={1.5} className="w-3 h-3" />
                  {m.seniority}
                </span>
              )}
              {m.location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin strokeWidth={1.5} className="w-3 h-3" />
                  {m.location}
                </span>
              )}
              {m.education_level && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <GraduationCap strokeWidth={1.5} className="w-3 h-3" />
                  {m.education_level}
                </span>
              )}
              {m.years_experience != null && (
                <span className="text-xs text-muted-foreground">
                  {m.years_experience}y exp
                </span>
              )}
            </div>
          </div>
        </div>

        <FitScore score={candidate.score} />
      </div>

      {/* Summary */}
      {m.summary && (
        <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {m.summary}
        </p>
      )}

      {/* Quality issues */}
      {qualityIssues && qualityIssues.length > 0 && needsReview && (
        <div className="mt-2 space-y-0.5">
          {qualityIssues.slice(0, 2).map((issue: string, i: number) => (
            <p key={i} className="text-[10px] text-amber-400/70">
              · {issue}
            </p>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.slice(0, 5).map((skill: string) => (
            <span
              key={skill}
              className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground">
              +{skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Missing skills */}
      {(candidate.missing_skills ?? []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {candidate.missing_skills!.slice(0, 3).map((skill: string) => (
            <span
              key={skill}
              className="text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 bg-red-500/5 text-red-400"
            >
              missing: {skill}
            </span>
          ))}
        </div>
      )}

      {/* Fit breakdown bars */}
      {candidate.fit_breakdown && Object.keys(candidate.fit_breakdown).length > 0 && (
        <div className="mt-3 space-y-1.5 pt-3 border-t border-white/5">
          {Object.entries(candidate.fit_breakdown).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-20 capitalize shrink-0">
                {key.replace("_", " ")}
              </span>
              <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                  style={{ width: Math.round((val as number) * 100) + "%" }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-8 text-right shrink-0">
                {Math.round((val as number) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
        <button
          onClick={() => onView(candidate.id)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-300 hover:bg-blue-500/25 transition-colors"
        >
          <User strokeWidth={1.5} className="w-3 h-3" />
          View Profile
        </button>

        <button
          onClick={() => onEmail(candidate.id)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          <Mail strokeWidth={1.5} className="w-3 h-3" />
          Email
        </button>

        {onShortlist && (
          <button
            onClick={() => onShortlist(candidate.id)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400 transition-colors ml-auto"
          >
            <BookmarkPlus strokeWidth={1.5} className="w-3 h-3" />
            Shortlist
          </button>
        )}
      </div>
    </motion.div>
  );
}
