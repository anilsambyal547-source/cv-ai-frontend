"use client";

import { motion } from "framer-motion";
import { Zap, MapPin, ArrowRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TopCandidate } from "@/hooks/useDashboard";

interface Props {
  candidates?: TopCandidate[];
  loading?:    boolean;
}

function FitScore({ score }: { score: number }) {
  const pct = score > 1 ? Math.round(score) : Math.round(score * 100);
  const color =
    pct >= 85 ? "#4ade80"
    : pct >= 70 ? "#14b8a6"
    : "#f59e0b";

  return (
    <div className="flex items-center gap-1">
      <Zap strokeWidth={1.5} className="w-3 h-3" style={{ color }} />
      <span
        className="text-xs font-semibold font-mono-display"
        style={{ color, textShadow: `0 0 8px ${color}60` }}
      >
        {pct}%
      </span>
    </div>
  );
}

export function RecentMatches({ candidates = [], loading }: Props) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="glass-panel p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "hsl(213,31%,92%)" }}>
            Top Matches
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "rgba(100,116,139,0.8)" }}>
            Best AI-scored candidates
          </p>
        </div>
        {candidates.length > 0 && (
          <button
            onClick={() => router.push("/search")}
            className="flex items-center gap-1 text-[11px] transition-colors duration-150"
            style={{ color: "#14b8a6" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "hsl(174,72%,72%)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#14b8a6"; }}
          >
            View all <ArrowRight strokeWidth={1.5} className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-1">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl animate-pulse">
              <div className="w-8 h-8 rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="flex-1 space-y-1.5">
                <div className="w-32 h-3 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="w-48 h-2.5 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
              <div className="w-10 h-4 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
            </div>
          ))
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}
            >
              <Users strokeWidth={1.5} className="w-4 h-4" style={{ color: "#60a5fa" }} />
            </div>
            <p className="text-xs" style={{ color: "rgba(100,116,139,0.7)" }}>No candidates yet</p>
            <button
              onClick={() => router.push("/upload")}
              className="btn-teal text-[11px]"
            >
              Upload CVs →
            </button>
          </div>
        ) : (
          candidates.map((c, i) => {
            const m      = c.metadata;
            const skills = m.skills
              ? m.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3)
              : [];
            const initials = (m.name ?? "?")
              .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            const pct = c.score > 1 ? Math.round(c.score) : Math.round(c.score * 100);
            const accentColor =
              pct >= 85 ? "rgba(74,222,128,0.25)"
              : pct >= 70 ? "rgba(20,184,166,0.25)"
              : "rgba(245,158,11,0.25)";

            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push("/candidates/" + c.id)}
                onKeyDown={(e) => e.key === "Enter" && router.push("/candidates/" + c.id)}
                className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150"
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = "rgba(255,255,255,0.04)";
                  el.style.transform = "translateX(2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = "";
                  el.style.transform = "";
                }}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{
                      background: "linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(59,130,246,0.2) 100%)",
                      border:     "1px solid rgba(148,163,184,0.14)",
                      color:      "rgba(226,232,240,0.9)",
                    }}
                  >
                    {initials}
                  </div>
                  {/* Top 2 — live indicator */}
                  {i < 2 && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                      style={{
                        background: "#4ade80",
                        border:     "1.5px solid hsl(220,47%,5%)",
                        boxShadow:  "0 0 5px rgba(74,222,128,0.6)",
                      }}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "hsl(213,31%,88%)" }}>
                    {m.name ?? "Unknown"}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    {m.location && (
                      <>
                        <MapPin strokeWidth={1.5} className="w-3 h-3 shrink-0" style={{ color: "rgba(100,116,139,0.5)" }} />
                        <span className="text-[11px] truncate max-w-[80px]" style={{ color: "rgba(100,116,139,0.75)" }}>
                          {m.location}
                        </span>
                        <span style={{ color: "rgba(100,116,139,0.3)" }}>·</span>
                      </>
                    )}
                    <span className="text-[11px]" style={{ color: "rgba(100,116,139,0.7)" }}>
                      {m.years_experience}y
                    </span>
                    {m.stage && (
                      <>
                        <span style={{ color: "rgba(100,116,139,0.3)" }}>·</span>
                        <span 
                          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                          style={{ 
                            background: m.stage === "Hired" ? "rgba(34,197,94,0.1)" : "rgba(148,163,184,0.1)",
                            color: m.stage === "Hired" ? "#4ade80" : "rgba(226,232,240,0.6)",
                            border: `1px solid ${m.stage === "Hired" ? "rgba(34,197,94,0.2)" : "rgba(148,163,184,0.2)"}`
                          }}
                        >
                          {m.stage}
                        </span>
                      </>
                    )}
                  </div>
                  {skills.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {skills.map((skill) => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>

                <FitScore score={c.score} />
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}