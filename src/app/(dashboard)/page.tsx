"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Clock, Zap, Building2,
  Search, RefreshCw, X,
} from "lucide-react";
import { MetricCard }          from "@/components/dashboard/MetricCard";
import { SkillRadarChart }     from "@/components/dashboard/SkillRadarChart";
import { ExperienceHistogram } from "@/components/dashboard/ExperienceHistogram";
import { RecentUploads }       from "@/components/dashboard/RecentUploads";
import { RecentMatches }       from "@/components/dashboard/RecentMatches";
import { useDashboard }        from "@/hooks/useDashboard";

// ── Modal for metric card details ─────────────────────────────────────────────
function MetricModal({
  title,
  onClose,
  children,
}: {
  title:    string;
  onClose:  () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0,   scale: 0.96, y: 12  }}
        transition={{ duration: 0.18, ease: [0.4,0,0.2,1] }}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden max-h-[80vh] flex flex-col glass-card-elevated"
      >
        {/* Teal top edge */}
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.4), transparent)" }}
        />
        <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-white/10">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center transition-colors btn-metal"
          >
            <X strokeWidth={1.5} className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { metrics, topCandidates, allSkills, loading, error, lastUpdated, refresh } = useDashboard();

  const [quickSearch, setQuickSearch] = useState("");
  const [modal, setModal]             = useState<string | null>(null);

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  const metricCards = [
    {
      key:         "candidates",
      title:       "Total Candidates",
      value:       loading ? "—" : (metrics?.total_candidates ?? 0).toLocaleString(),
      icon:        Users,
      accentColor: "#3b82f6",
      delay:       0,
      clickable:   true,
    },
    {
      key:         "experience",
      title:       "Avg. Experience",
      value:       loading ? "—" : (metrics?.avg_experience ?? 0) + "y",
      icon:        Clock,
      accentColor: "#8b5cf6",
      delay:       0.05,
      clickable:   true,
    },
    {
      key:         "skills",
      title:       "Top Skills",
      value:       loading ? "—" : (metrics?.top_skills?.length ?? 0),
      icon:        Zap,
      accentColor: "#14b8a6",
      delay:       0.1,
      clickable:   true,
    },
    {
      key:         "industries",
      title:       "Industries",
      value:       loading ? "—" : Object.keys(metrics?.industry_dist ?? {}).length,
      icon:        Building2,
      accentColor: "#f59e0b",
      delay:       0.15,
      clickable:   true,
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm mt-0.5 text-muted-foreground">
            {formattedTime ? "Last updated " + formattedTime : "Recruitment intelligence overview"}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="btn-metal"
        >
          <RefreshCw strokeWidth={1.5} className={"w-3 h-3 " + (loading ? "animate-spin" : "")} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0  }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-sm"
        >
          ⚠ Backend not connected — showing cached or empty data.
          <button onClick={refresh} className="underline ml-1">Retry</button>
        </motion.div>
      )}

      {/* Quick Search */}
      <div className="flex items-center gap-3 h-11 px-4 rounded-xl max-w-lg transition-all duration-150 glass-panel-blue">
        <Search strokeWidth={1.5} className="w-4 h-4 shrink-0 text-muted-foreground" />
        <input
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && quickSearch.trim()) {
              router.push("/search?q=" + encodeURIComponent(quickSearch.trim()));
            }
          }}
          placeholder='Quick search — "React developer 3 years"'
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
          style={{ caretColor: "#14b8a6" }}
        />
        <kbd className="text-[9px] px-1.5 py-0.5 rounded font-mono-display shrink-0 topbar-kbd">
          ↵
        </kbd>
      </div>

      {/* Metric Cards — clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <div
            key={m.key}
            onClick={() => m.clickable && setModal(m.key)}
            className="cursor-pointer"
          >
            <MetricCard
              title={m.title}
              value={m.value}
              icon={m.icon}
              accentColor={m.accentColor}
              delay={m.delay}
              loading={loading}
            />
          </div>
        ))}
      </div>

      {/* Seniority Breakdown */}
      {!loading && metrics?.seniority_dist && Object.keys(metrics.seniority_dist).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="glass-panel p-5"
        >
          <h3 className="text-sm font-medium mb-4 text-foreground">Seniority Breakdown</h3>
          <div className="flex items-end gap-3 h-16">
            {Object.entries(metrics.seniority_dist).map(([level, count]) => {
              const total = Object.values(metrics.seniority_dist).reduce((a, b) => a + b, 0);
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={level} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs font-mono-display" style={{ color: "rgba(100,116,139,0.8)" }}>{pct}%</span>
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: Math.max(pct, 4) + "%",
                      minHeight: "8px",
                      background: "linear-gradient(to top, rgba(20,184,166,0.6), rgba(59,130,246,0.4))",
                      border: "1px solid rgba(20,184,166,0.25)",
                      boxShadow: "0 0 8px rgba(20,184,166,0.2)",
                    }}
                  />
                  <span className="text-[10px] capitalize" style={{ color: "rgba(100,116,139,0.7)" }}>{level}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkillRadarChart data={allSkills} loading={loading} />
        <ExperienceHistogram data={metrics?.experience_histogram} loading={loading} />
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentUploads loading={loading} total={metrics?.total_candidates} />
        <RecentMatches candidates={topCandidates} loading={loading} />
      </div>

      {/* ── Metric Modals ── */}
      <AnimatePresence>

        {/* Total Candidates */}
        {modal === "candidates" && (
          <MetricModal title="Total Candidates" onClose={() => setModal(null)}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm text-muted-foreground">Total indexed</span>
                <span className="text-sm font-semibold text-foreground">{metrics?.total_candidates ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm text-muted-foreground">Avg. experience</span>
                <span className="text-sm font-semibold text-foreground">{metrics?.avg_experience ?? 0}y</span>
              </div>
              {Object.entries(metrics?.seniority_dist ?? {}).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-sm text-muted-foreground capitalize">{level}</span>
                  <span className="text-sm font-semibold text-foreground">{count}</span>
                </div>
              ))}
              <button
                onClick={() => { setModal(null); router.push("/candidates"); }}
                className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors mt-2"
              >
                View all candidates →
              </button>
            </div>
          </MetricModal>
        )}

        {/* Avg Experience */}
        {modal === "experience" && (
          <MetricModal title="Experience Distribution" onClose={() => setModal(null)}>
            <div className="space-y-3">
              {(metrics?.experience_histogram ?? []).map((item) => {
                const total = (metrics?.experience_histogram ?? []).reduce((a, b) => a + b.count, 0);
                const pct   = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.range} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.range} years</span>
                      <span className="text-xs text-foreground font-medium">{item.count} candidates ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => { setModal(null); router.push("/candidates"); }}
                className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors mt-2"
              >
                Browse candidates →
              </button>
            </div>
          </MetricModal>
        )}

        {/* Top Skills */}
        {modal === "skills" && (
          <MetricModal title="Top Skills" onClose={() => setModal(null)}>
            <div className="space-y-2">
              {(metrics?.top_skills ?? []).map((item, i) => {
                const max = metrics?.top_skills?.[0]?.count ?? 1;
                const pct = Math.round((item.count / max) * 100);
                return (
                  <div key={item.skill} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground">{item.skill}</span>
                        <span className="text-xs text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400"
                          style={{ width: pct + "%" }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => { setModal(null); router.push("/search"); }}
                className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors mt-2"
              >
                Search by skill →
              </button>
            </div>
          </MetricModal>
        )}

        {/* Industries */}
        {modal === "industries" && (
          <MetricModal title="Industry Distribution" onClose={() => setModal(null)}>
            <div className="space-y-2">
              {Object.entries(metrics?.industry_dist ?? {}).map(([industry, count]) => {
                const total = Object.values(metrics?.industry_dist ?? {}).reduce((a, b) => a + b, 0);
                const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={industry} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground capitalize">{industry}</span>
                      <span className="text-xs text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => { setModal(null); router.push("/analytics"); }}
                className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors mt-2"
              >
                View analytics →
              </button>
            </div>
          </MetricModal>
        )}

      </AnimatePresence>
    </div>
  );
}