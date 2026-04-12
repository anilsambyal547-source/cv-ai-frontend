"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area, CartesianGrid,
} from "recharts";
import {
  Download, RefreshCw, TrendingUp, Users, Zap, Building2,
  Filter, X, MapPin, Briefcase, Calendar, ChevronDown,
  ArrowRight, AlertTriangle, CheckCircle, Target, Layers, LayoutGrid,
} from "lucide-react";
import { apiFetch } from "@/services/api.client";
import { useChartTheme } from "@/hooks/useChartTheme";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnalyticsData {
  total_candidates:     number;
  avg_experience:       number;
  top_skills:           { skill: string; count: number }[];
  seniority_dist:       Record<string, number>;
  industry_dist:        Record<string, number>;
  experience_histogram: { range: string; count: number }[];
}

interface ClusterData {
  clusters: { name: string; size: number; top_skills: string[] }[];
}

interface Filters {
  role:     string;
  location: string;
  remote:   string;
  dateRange: string;
  cluster:  string | null;
}

// ── Preset job requisitions for Gap Analysis ──────────────────────────────────
const JOB_REQUISITIONS: Record<string, { label: string; skills: Record<string, number> }> = {
  "": { label: "Select a role...", skills: {} },
  fullstack: {
    label: "Full Stack Engineer",
    skills: { React: 90, "Node.js": 85, TypeScript: 80, PostgreSQL: 70, Docker: 65, AWS: 60, GraphQL: 55, Redis: 50 },
  },
  devops: {
    label: "DevOps / Platform Engineer",
    skills: { Kubernetes: 95, Docker: 90, AWS: 85, Terraform: 80, "CI/CD": 75, Linux: 70, Python: 60, Prometheus: 55 },
  },
  data_scientist: {
    label: "Data Scientist",
    skills: { Python: 95, SQL: 85, "Machine Learning": 80, Pandas: 75, TensorFlow: 70, R: 60, Spark: 55, "Data Viz": 50 },
  },
  security: {
    label: "Security Engineer",
    skills: { "Network Security": 90, Python: 80, "Penetration Testing": 85, Linux: 75, SIEM: 70, AWS: 65, "Zero Trust": 60, SOC: 55 },
  },
  marketing: {
    label: "Digital Marketing Lead",
    skills: { SEO: 90, "Google Ads": 85, "Social Media": 80, Analytics: 75, "Content Strategy": 70, HubSpot: 65, Email: 60, CRO: 55 },
  },
};

// ── Colors ────────────────────────────────────────────────────────────────────
const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#14b8a6", "#f97316", "#ec4899", "#a855f7"];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  const t = useChartTheme();
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2 text-xs backdrop-blur-md"
      style={{
        background:   t.tooltip.bg,
        borderColor:  t.tooltip.border,
        boxShadow:    t.isDark ? "0 8px 24px rgba(0,0,0,0.6)" : "0 8px 24px rgba(0,0,0,0.12)"
      }}
    >
      {label && <p className="text-muted-foreground mb-1.5 font-medium">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color ?? p.fill ?? "#3b82f6" }} />
          <span className="text-muted-foreground">{p.name ?? p.dataKey}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function GlassCard({ children, className = "", delay = 0, title, subtitle, action, highlight = false }: {
  children: React.ReactNode; className?: string; delay?: number;
  title?: string; subtitle?: string; action?: React.ReactNode; highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={"glass-panel " + (highlight ? "glass-panel-teal" : "") + " " + className + " p-5 overflow-hidden"}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title    && <h3 className="text-sm font-medium text-foreground">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={"rounded-xl bg-muted/40 animate-pulse " + className} />;
}

// ── Gap Analysis Radar ────────────────────────────────────────────────────────
function GapAnalysisRadar({ data, topSkills, selectedRole }: {
  data: AnalyticsData | null;
  topSkills: { skill: string; count: number }[];
  selectedRole: string;
}) {
  const router = useRouter();
  const req    = JOB_REQUISITIONS[selectedRole];

  if (!selectedRole || !req) {
    return (
      <div className="h-72 flex flex-col items-center justify-center gap-3">
        <Target strokeWidth={1.5} className="w-10 h-10 text-muted-foreground/30" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Select a job requisition above</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Gap analysis will appear here</p>
        </div>
      </div>
    );
  }

  const total    = data?.total_candidates ?? 1;
  const skillMap: Record<string, number> = {};
  topSkills.forEach((s) => { skillMap[s.skill.toLowerCase()] = s.count; });

  const radarData = Object.entries(req.skills).map(([skill, required]) => {
    const found    = Object.entries(skillMap).find(([k]) => k.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(k.toLowerCase()));
    const poolPct  = found ? Math.min(100, Math.round((found[1] / total) * 100 * 2)) : 0;
    const gap      = Math.max(0, required - poolPct);
    return { skill, required, pool: poolPct, gap, critical: gap > 40 };
  });

  const t = useChartTheme();
  const criticalGaps = radarData.filter((d) => d.critical);

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <defs>
            <radialGradient id="reqGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor={t.colors.primary} stopOpacity={0.15} />
              <stop offset="100%" stopColor={t.colors.primary} stopOpacity={0} />
            </radialGradient>
            <radialGradient id="poolGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor={t.colors.accent} stopOpacity={0.2} />
              <stop offset="100%" stopColor={t.colors.accent} stopOpacity={0} />
            </radialGradient>
          </defs>
          <PolarGrid stroke={t.grid} gridType="polygon" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: t.text, fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Radar name="Required" dataKey="required" stroke={t.colors.primary} strokeWidth={2} fill="url(#reqGrad)" strokeDasharray="4 2" dot={{ fill: t.colors.primary, r: 3, strokeWidth: 0 }} />
          <Radar name="Our Pool"  dataKey="pool"     stroke={t.colors.accent} strokeWidth={2} fill="url(#poolGrad)" dot={{ fill: t.colors.accent, r: 3, strokeWidth: 0 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px", color: t.text }} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Gap indicators */}
      {criticalGaps.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <AlertTriangle strokeWidth={1.5} className="w-3.5 h-3.5 text-amber-400" />
            Critical skill gaps for {req.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {criticalGaps.map((g) => (
              <div key={g.skill} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500/20 bg-amber-500/8">
                <span className="text-xs text-amber-400">{g.skill}</span>
                <span className="text-[10px] text-amber-400/70">–{g.gap}%</span>
                <button
                  onClick={() => router.push("/search?q=" + encodeURIComponent(g.skill))}
                  className="text-[10px] text-blue-400 hover:text-blue-300 ml-1 underline transition-colors"
                >
                  Source →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {criticalGaps.length === 0 && selectedRole && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/8">
          <CheckCircle strokeWidth={1.5} className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-400">Your candidate pool covers the required skills for {req.label} well!</p>
        </div>
      )}
    </div>
  );
}

// ── Pipeline Health ───────────────────────────────────────────────────────────
function PipelineHealth({ data }: { data: AnalyticsData | null }) {
  // Simulated open roles — in a real system this would come from an ATS integration
  const openRoles: Record<string, number> = {
    senior: 2, mid: 4, junior: 1, lead: 1, executive: 0,
  };

  const seniorityDist = data?.seniority_dist ?? {};
  const allKeys = Array.from(new Set([...Object.keys(seniorityDist), ...Object.keys(openRoles)]));

  const chartData = allKeys.map((key) => ({
    name:      key,
    available: seniorityDist[key] ?? 0,
    open:      openRoles[key]     ?? 0,
    ratio:     (seniorityDist[key] ?? 0) / Math.max(openRoles[key] ?? 1, 1),
  }));

  const t = useChartTheme();

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
          <XAxis dataKey="name" tick={{ fill: t.text, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: t.text, fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="available" name="Candidates Available" fill={t.colors.primary} fillOpacity={0.8} radius={[4, 4, 0, 0]} />
          <Bar dataKey="open"      name="Open Roles"           fill={t.colors.warning} fillOpacity={0.8} radius={[4, 4, 0, 0]} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px", color: t.text }} />
        </BarChart>
      </ResponsiveContainer>

      {/* Health indicators */}
      <div className="space-y-2">
        {chartData.map((item) => {
          const health = item.ratio >= 2 ? "surplus" : item.ratio >= 1 ? "balanced" : item.open === 0 ? "no-demand" : "shortage";
          const colors: Record<string, string> = {
            surplus:   "text-emerald-400 border-emerald-500/20 bg-emerald-500/8",
            balanced:  "text-blue-400 border-blue-500/20 bg-blue-500/8",
            shortage:  "text-red-400 border-red-500/20 bg-red-500/8",
            "no-demand": "text-muted-foreground border-white/10 bg-white/5",
          };
          const labels: Record<string, string> = {
            surplus:   "Surplus — reduce sourcing",
            balanced:  "Balanced pipeline",
            shortage:  "Shortage — increase sourcing",
            "no-demand": "No open roles",
          };
          return (
            <div key={item.name} className={"flex items-center justify-between px-3 py-2 rounded-lg border " + colors[health]}>
              <span className="text-xs capitalize font-medium">{item.name}</span>
              <div className="flex items-center gap-3 text-xs">
                <span>{item.available} candidates / {item.open} roles</span>
                <span className="text-[10px] opacity-70">{labels[health]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const router  = useRouter();
  const t       = useChartTheme();
  const [data,          setData]          = useState<AnalyticsData | null>(null);
  const [clusters,      setClusters]      = useState<ClusterData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [tab,           setTab]           = useState<"overview" | "gap" | "pipeline" | "industry">("overview");
  const [selectedRole,  setSelectedRole]  = useState("");
  const [showFilters,   setShowFilters]   = useState(false);
  const [filters,       setFilters]       = useState<Filters>({
    role: "", location: "", remote: "", dateRange: "all", cluster: null,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, clusterRes] = await Promise.allSettled([
        apiFetch<AnalyticsData>("/api/analytics/overview"),
        apiFetch<ClusterData>("/api/analytics/clusters"),
      ]);
      if (overviewRes.status === "fulfilled") setData(overviewRes.value);
      else setError("Failed to load analytics");
      if (clusterRes.status === "fulfilled") setClusters(clusterRes.value);
    } catch (e: any) {
      setError(e.message ?? "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Apply cluster filter → navigate to candidates/search
  function handleClusterClick(clusterName: string) {
    setFilters((f) => ({ ...f, cluster: f.cluster === clusterName ? null : clusterName }));
  }

  function goToClusterSearch(clusterName: string, skills: string[]) {
    const query = skills.slice(0, 3).join(" ");
    router.push("/search?q=" + encodeURIComponent(query));
  }

  // Derived
  const topSkills     = data?.top_skills ?? [];
  const industryData  = Object.entries(data?.industry_dist  ?? {}).map(([name, value]) => ({ name, value }));
  const seniorityData = Object.entries(data?.seniority_dist ?? {}).map(([name, value]) => ({ name, value }));
  const histogramData = data?.experience_histogram ?? [];

  const activeFilterCount = [
    filters.role, filters.location, filters.remote,
    filters.dateRange !== "all" ? filters.dateRange : "",
    filters.cluster,
  ].filter(Boolean).length;

  // CSV Export
  const exportCSV = useCallback(() => {
    if (!data) return;
    const rows: string[][] = [
      ["Metric", "Value"],
      ["Total Candidates", String(data.total_candidates)],
      ["Avg Experience", String(data.avg_experience)],
      [],
      ["Skill", "Count"],
      ...topSkills.map((s) => [s.skill, String(s.count)]),
      [],
      ["Seniority", "Count"],
      ...Object.entries(data.seniority_dist).map(([k, v]) => [k, String(v)]),
      [],
      ["Industry", "Count"],
      ...Object.entries(data.industry_dist).map(([k, v]) => [k, String(v)]),
    ];
    const csv  = rows.map((r) => r.map((v) => '"' + v.replace(/"/g, '""') + '"').join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "cv_ai_analytics.csv"; a.click();
    URL.revokeObjectURL(url);
  }, [data, topSkills]);

  const TABS = [
    { key: "overview",  label: "Overview",       icon: Layers    },
    { key: "gap",       label: "Gap Analysis",    icon: Target    },
    { key: "pipeline",  label: "Pipeline Health", icon: TrendingUp },
    { key: "industry",  label: "Industry",        icon: Building2 },
  ] as const;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Recruitment intelligence — actionable insights, not vanity metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">
            <RefreshCw strokeWidth={1.5} className={"w-3.5 h-3.5 " + (loading ? "animate-spin" : "")} />Refresh
          </button>
          <button onClick={exportCSV} disabled={!data} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">
            <Download strokeWidth={1.5} className="w-3.5 h-3.5" />Export CSV
          </button>
        </div>
      </div>

      {/* ── Global Filter Bar ── */}
      <div className="glass-panel p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Filters</span>
            {activeFilterCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 dark:text-blue-300">
                {activeFilterCount} active
              </span>
            )}
          </div>

          <div className="w-px h-4 bg-muted" />

          {/* Date Range */}
          <div className="flex items-center gap-1.5">
            <Calendar strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters((f) => ({ ...f, dateRange: e.target.value }))}
              className="text-xs bg-transparent text-muted-foreground outline-none cursor-pointer hover:text-foreground transition-colors"
            >
              <option value="all">All time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          {/* Target Role */}
          <div className="flex items-center gap-1.5">
            <Target strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-xs bg-transparent text-muted-foreground outline-none cursor-pointer hover:text-foreground transition-colors max-w-[160px]"
            >
              {Object.entries(JOB_REQUISITIONS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={filters.location}
              onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
              placeholder="Location..."
              className="text-xs bg-transparent text-muted-foreground outline-none placeholder:text-muted-foreground/40 w-24 hover:text-foreground transition-colors"
            />
          </div>

          {/* Remote */}
          <div className="flex items-center gap-1.5">
            <Briefcase strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={filters.remote}
              onChange={(e) => setFilters((f) => ({ ...f, remote: e.target.value }))}
              className="text-xs bg-transparent text-muted-foreground outline-none cursor-pointer hover:text-foreground transition-colors"
            >
              <option value="">Any work type</option>
              <option value="remote">Remote only</option>
              <option value="onsite">On-site only</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Active cluster filter badge */}
          {filters.cluster && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs ml-auto">
              <Layers strokeWidth={1.5} className="w-3 h-3" />
              {filters.cluster}
              <button onClick={() => setFilters((f) => ({ ...f, cluster: null }))} className="hover:text-white transition-colors">
                <X strokeWidth={1.5} className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setFilters({ role: "", location: "", remote: "", dateRange: "all", cluster: null }); setSelectedRole(""); }}
              className="text-xs text-muted-foreground hover:text-red-400 transition-colors ml-auto"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />) : (
          <>
            {[
              { label: "Total Candidates",   value: data?.total_candidates ?? 0,                              icon: Users,       color: "#3b82f6" },
              { label: "Avg. Experience",     value: (data?.avg_experience  ?? 0) + "y",                      icon: TrendingUp,  color: "#6366f1" },
              { label: "Unique Skills Found", value: topSkills.length,                                         icon: Zap,         color: "#10b981" },
              { label: "Industries Covered",  value: Object.keys(data?.industry_dist ?? {}).length,           icon: Building2,   color: "#f59e0b" },
            ].map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="glass-panel p-4"
              >
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl" style={{ background: color }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-xl font-semibold text-foreground mt-0.5">{value}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ background: color + "20", borderColor: color + "40" }}>
                    <Icon strokeWidth={1.5} className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
          ⚠ {error} <button onClick={fetchData} className="underline ml-auto text-xs">Retry</button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 p-1 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={"flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-all " + (
              tab === key
                ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <Icon strokeWidth={1.5} className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══ OVERVIEW TAB ══ */}
        {tab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Seniority */}
              <GlassCard title="Seniority Distribution" subtitle="Candidates by career level" delay={0.05}>
                {loading ? <Skeleton className="h-52" /> : (
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart data={seniorityData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: t.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: t.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Candidates" radius={[6, 6, 0, 0]}>
                        {seniorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </GlassCard>

              {/* Industry Pie */}
              <GlassCard title="Industry Mix" subtitle="Candidate pool composition" delay={0.1}>
                {loading ? <Skeleton className="h-52" /> : (
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie data={industryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                        {industryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px", color: t.text }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </GlassCard>

            </div>

            {/* Top Skills ranked */}
            <GlassCard title="Top Skills — Ranked by Frequency" subtitle="All skills found across every CV in your database" delay={0.15}>
              {loading ? <Skeleton className="h-48" /> : topSkills.length === 0 ? (
                <div className="h-32 flex items-center justify-center"><p className="text-xs text-muted-foreground">No skills data — upload CVs first</p></div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {topSkills.map((s, i) => {
                    const pct = Math.round((s.count / (topSkills[0]?.count ?? 1)) * 100);
                    return (
                      <div key={s.skill} className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground w-5 shrink-0 text-right">{i + 1}</span>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">{s.skill}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">{s.count} candidates</span>
                              <button
                                onClick={() => router.push("/search?q=" + encodeURIComponent(s.skill))}
                                className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                Search →
                              </button>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: pct + "%" }}
                              transition={{ duration: 0.6, delay: i * 0.02 }}
                              className="h-full rounded-full"
                              style={{ background: "linear-gradient(90deg, " + COLORS[i % COLORS.length] + ", " + COLORS[(i + 1) % COLORS.length] + ")" }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* ══ GAP ANALYSIS TAB ══ */}
        {tab === "gap" && (
          <motion.div key="gap" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">

            {/* Role selector */}
            <GlassCard
              title="Candidate Pool vs. Job Requisition"
              subtitle="Select a role to see where your pool is strong and where you need to source more talent"
              delay={0}
              highlight={!!selectedRole}
            >
              <div className="flex items-center gap-3 mb-4">
                <Target strokeWidth={1.5} className="w-4 h-4 text-blue-400 shrink-0" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-xl bg-muted/50 border border-muted text-sm text-foreground outline-none focus:border-blue-500/40 transition-colors cursor-pointer"
                >
                  {Object.entries(JOB_REQUISITIONS).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                {selectedRole && (
                  <span className="text-xs text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20 bg-blue-500/10">
                    Active role
                  </span>
                )}
              </div>

              {loading ? <Skeleton className="h-72" /> : (
                <GapAnalysisRadar data={data} topSkills={topSkills} selectedRole={selectedRole} />
              )}
            </GlassCard>

            {/* Sourcing recommendations */}
            {selectedRole && (
              <GlassCard title="Sourcing Recommendations" subtitle="Actions based on gap analysis" delay={0.1}>
                <div className="space-y-2">
                  {Object.entries(JOB_REQUISITIONS[selectedRole]?.skills ?? {})
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([skill, required], i) => {
                      const found    = topSkills.find((s) => s.skill.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.skill.toLowerCase()));
                      const poolPct  = found ? Math.min(100, Math.round((found.count / Math.max(data?.total_candidates ?? 1, 1)) * 100 * 2)) : 0;
                      const gap      = Math.max(0, required - poolPct);
                      const status   = gap > 40 ? "critical" : gap > 20 ? "low" : "good";
                      const statusColors: Record<string, string> = {
                        critical: "text-red-400 bg-red-500/8 border-red-500/20",
                        low:      "text-amber-400 bg-amber-500/8 border-amber-500/20",
                        good:     "text-emerald-400 bg-emerald-500/8 border-emerald-500/20",
                      };
                      return (
                        <div key={skill} className={"flex items-center justify-between px-4 py-3 rounded-xl border " + statusColors[status]}>
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: status === "critical" ? "#ef4444" : status === "low" ? "#f59e0b" : "#10b981" }} />
                            <span className="text-sm font-medium">{skill}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-muted-foreground">Pool: {poolPct}% · Need: {required}%</span>
                            {status !== "good" && (
                              <button
                                onClick={() => router.push("/search?q=" + encodeURIComponent(skill))}
                                className="flex items-center gap-1 font-medium hover:opacity-80 transition-opacity"
                              >
                                Find candidates <ArrowRight strokeWidth={1.5} className="w-3 h-3" />
                              </button>
                            )}
                            {status === "good" && <span className="font-medium">✓ Covered</span>}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}

        {/* ══ PIPELINE HEALTH TAB ══ */}
        {tab === "pipeline" && (
          <motion.div key="pipeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">

            <GlassCard
              title="Supply vs. Demand by Seniority"
              subtitle="Available candidates vs. open roles — identifies sourcing waste and shortages"
              delay={0.05}
            >
              {loading ? <Skeleton className="h-64" /> : <PipelineHealth data={data} />}
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Experience area chart */}
              <GlassCard title="Experience Distribution" subtitle="Candidates by years of experience" delay={0.1}>
                {loading ? <Skeleton className="h-52" /> : (
                  <ResponsiveContainer width="100%" height={210}>
                    <AreaChart data={histogramData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
                      <XAxis dataKey="range" tick={{ fill: t.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: t.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="count" name="Candidates" stroke={t.colors.primary} strokeWidth={2} fill="url(#expGrad)" dot={{ fill: t.colors.primary, r: 4, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </GlassCard>

              {/* Seniority % cards */}
              <GlassCard title="Seniority Breakdown" subtitle="Share of total candidate pool" delay={0.15}>
                {loading ? <Skeleton className="h-52" /> : (
                  <div className="grid grid-cols-2 gap-2 h-52 content-start">
                    {seniorityData.map((item, i) => {
                      const total = seniorityData.reduce((a, b) => a + b.value, 0);
                      const pct   = total > 0 ? Math.round((item.value / total) * 100) : 0;
                      return (
                        <div key={item.name} className="flex flex-col items-center justify-center p-3 rounded-xl border border-muted bg-muted/30" style={{ borderColor: COLORS[i % COLORS.length] + "25" }}>
                          <p className="text-xl font-bold" style={{ color: COLORS[i % COLORS.length] }}>{pct}%</p>
                          <p className="text-xs text-foreground capitalize mt-0.5">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.value} candidates</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>

            </div>
          </motion.div>
        )}

        {/* ══ INDUSTRY TAB ══ */}
        {tab === "industry" && (
          <motion.div key="industry" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pie */}
              <GlassCard title="Industry Distribution" subtitle="Candidate pool by sector" delay={0.05}>
                {loading ? <Skeleton className="h-64" /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={industryData} cx="50%" cy="45%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name"
                        label={({ name, percent }) => name + " " + Math.round((percent || 0) * 100) + "%"}
                        labelLine={{ stroke: t.grid, strokeWidth: 1 }}
                      >
                        {industryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </GlassCard>

              {/* Rankings */}
              <GlassCard title="Industry Rankings" subtitle="Sorted by candidate count" delay={0.1}>
                {loading ? <Skeleton className="h-64" /> : (
                  <div className="space-y-3 mt-1">
                    {[...industryData].sort((a, b) => b.value - a.value).map((item, i) => {
                      const total = industryData.reduce((a, b) => a + b.value, 0);
                      const pct   = total > 0 ? Math.round((item.value / total) * 100) : 0;
                      const max   = Math.max(...industryData.map((d) => d.value));
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                              <span className="text-xs text-foreground capitalize">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{item.value} ({pct}%)</span>
                              <button
                                onClick={() => router.push("/search?q=" + encodeURIComponent(item.name))}
                                className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                View →
                              </button>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: Math.round((item.value / max) * 100) + "%" }}
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                              className="h-full rounded-full"
                              style={{ background: COLORS[i % COLORS.length] }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Interactive Tech Clusters */}
            {clusters?.clusters && clusters.clusters.length > 0 && (
              <GlassCard
                title="Technology Clusters — Click to Filter & Search"
                subtitle="Each cluster is an actionable cohort. Click to filter or export to Outreach."
                delay={0.15}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {clusters.clusters.slice(0, 6).map((cluster, i) => {
                    const isActive = filters.cluster === cluster.name;
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ y: -2, transition: { duration: 0.15 } }}
                        onClick={() => handleClusterClick(cluster.name)}
                        className={"p-4 rounded-xl border cursor-pointer transition-all " + (
                          isActive
                            ? "border-blue-500/50 bg-blue-500/10"
                            : "border-black/10 dark:border-white/8 bg-black/5 dark:bg-white/3 hover:border-black/20 dark:hover:border-white/15 hover:bg-black/10 dark:hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length], boxShadow: "0 0 8px " + COLORS[i % COLORS.length] + "60" }} />
                          <span className="text-sm font-medium text-foreground capitalize">{cluster.name}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{cluster.size} candidates</span>
                          {isActive && <span className="text-[10px] text-blue-300 px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30">Active</span>}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {(cluster.top_skills ?? []).slice(0, 4).map((skill) => (
                            <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded-md border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-muted-foreground">{skill}</span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); goToClusterSearch(cluster.name, cluster.top_skills ?? []); }}
                            className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Search candidates <ArrowRight strokeWidth={1.5} className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push("/outreach"); }}
                            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors ml-auto"
                          >
                            Outreach <ArrowRight strokeWidth={1.5} className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {filters.cluster && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-500/20 bg-blue-500/5"
                  >
                    <Layers strokeWidth={1.5} className="w-4 h-4 text-blue-400 shrink-0" />
                    <p className="text-xs text-blue-300">
                      Filtering by <span className="font-semibold">{filters.cluster}</span> cluster.
                      Search and outreach pages will prioritise these candidates.
                    </p>
                    <button
                      onClick={() => goToClusterSearch(filters.cluster!, clusters.clusters.find((c) => c.name === filters.cluster)?.top_skills ?? [])}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 ml-auto transition-colors font-medium"
                    >
                      View {filters.cluster} candidates <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </GlassCard>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
