"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Lock, Bell, Palette, Database,
  Save, Eye, EyeOff, Check, AlertTriangle,
  Trash2, RefreshCw, Moon, Sun, Monitor,
  CheckCircle2, XCircle, Activity,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/services/api.client";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "profile" | "security" | "notifications" | "appearance" | "system";

interface DBStats {
  total:        number;
  needs_review: number;
  industries:   Record<string, number>;
  seniorities:  Record<string, number>;
  ids:          string[];
}

// ── SubComponents ─────────────────────────────────────────────────────────────
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"glass-panel p-6 " + className}>
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/60">{hint}</p>}
    </div>
  );
}

function SettingsInput({ value, onChange, placeholder, type = "text", disabled = false }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      className="input-glass disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

function Toggle({ enabled, onToggle, label, subtitle }: {
  enabled: boolean; onToggle: () => void; label: string; subtitle?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <button
        onClick={onToggle}
        className={"relative rounded-full transition-colors shrink-0 " + (enabled ? "bg-blue-600" : "bg-muted")}
        style={{ height: "22px", width: "40px" }}
        aria-checked={enabled}
        role="switch"
      >
        <motion.div
          animate={{ x: enabled ? 18 : 2 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </button>
    </div>
  );
}

function SaveButton({ onSave, saving, saved }: { onSave: () => void; saving: boolean; saved: boolean }) {
  return (
    <button
      onClick={onSave}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-all shadow-[0_0_12px_rgba(59,130,246,0.25)] active:scale-[0.97]"
    >
      {saving  ? <><RefreshCw className="w-4 h-4 animate-spin" />Saving...</> :
       saved   ? <><Check strokeWidth={1.5} className="w-4 h-4" />Saved!</>  :
                 <><Save  strokeWidth={1.5} className="w-4 h-4" />Save Changes</>}
    </button>
  );
}

// ── PROFILE STORAGE KEYS ──────────────────────────────────────────────────────
const PROFILE_KEY = "cv_ai_user_profile";

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveProfile(data: object) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}

// ── NOTIFICATION STORAGE ──────────────────────────────────────────────────────
const NOTIF_KEY = "cv_ai_notifications";
function loadNotifs() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) ?? "{}"); } catch { return {}; }
}
function saveNotifs(data: object) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(data));
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => { setMounted(true); }, []);

  // ── Profile state ──────────────────────────────────────────────────────────
  const [name,    setName]    = useState("Admin User");
  const [email,   setEmail]   = useState("admin@example.com");
  const [company, setCompany] = useState("My Company");
  const [role,    setRole]    = useState("Recruiter");
  const [bio,     setBio]     = useState("");

  // Load saved profile on mount
  useEffect(() => {
    const saved = loadProfile();
    if (saved) {
      if (saved.name)    setName(saved.name);
      if (saved.email)   setEmail(saved.email);
      if (saved.company) setCompany(saved.company);
      if (saved.role)    setRole(saved.role);
      if (saved.bio)     setBio(saved.bio);
    } else if (user) {
      setName(user.username === "admin" ? "Administrator" : "Recruiter User");
      setEmail(user.username + "@example.com");
      setRole(user.role === "admin" ? "Administrator" : "Recruiter");
    }
  }, [user]);

  // ── Security state ─────────────────────────────────────────────────────────
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [pwError,    setPwError]    = useState<string | null>(null);

  // ── Notifications ──────────────────────────────────────────────────────────
  const notifDefaults = { emailNotifs: true, newCandidate: true, weeklyDigest: false, soundEnabled: true, desktopNotif: false };
  const [emailNotifs,  setEmailNotifs]  = useState(notifDefaults.emailNotifs);
  const [newCandidate, setNewCandidate] = useState(notifDefaults.newCandidate);
  const [weeklyDigest, setWeeklyDigest] = useState(notifDefaults.weeklyDigest);
  const [soundEnabled, setSoundEnabled] = useState(notifDefaults.soundEnabled);
  const [desktopNotif, setDesktopNotif] = useState(notifDefaults.desktopNotif);

  useEffect(() => {
    const saved = loadNotifs();
    if (saved.emailNotifs  != null) setEmailNotifs(saved.emailNotifs);
    if (saved.newCandidate != null) setNewCandidate(saved.newCandidate);
    if (saved.weeklyDigest != null) setWeeklyDigest(saved.weeklyDigest);
    if (saved.soundEnabled != null) setSoundEnabled(saved.soundEnabled);
    if (saved.desktopNotif != null) setDesktopNotif(saved.desktopNotif);
  }, []);

  // ── Appearance ────────────────────────────────────────────────────────────
  const [accentColor, setAccentColor] = useState("blue");
  const currentTheme = mounted ? (theme ?? "dark") : "dark";

  useEffect(() => {
    const saved = localStorage.getItem("cv_ai_accent") ?? "blue";
    setAccentColor(saved);
  }, []);

  // ── System / DB stats ─────────────────────────────────────────────────────
  const [dbStats,     setDbStats]     = useState<DBStats | null>(null);
  const [dbLoading,   setDbLoading]   = useState(false);
  const [dbError,     setDbError]     = useState<string | null>(null);
  const [clearing,    setClearing]    = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const fetchDbStats = useCallback(async () => {
    setDbLoading(true);
    setDbError(null);
    try {
      const data = await apiFetch<DBStats>("/api/ingest/stats");
      setDbStats(data);
    } catch (err: any) {
      setDbError(err?.message ?? "Failed to load DB stats");
    } finally {
      setDbLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "system") fetchDbStats();
  }, [tab, fetchDbStats]);

  // ── Save Button state ──────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  async function handleSave() {
    if (tab === "security") {
      if (newPw && newPw !== confirmPw) { setPwError("Passwords do not match"); return; }
      if (newPw && newPw.length < 8)    { setPwError("Password must be at least 8 characters"); return; }
      // Note: password change requires backend support.
      // For demo, we just validate and show success.
      setPwError(null);
    }
    if (tab === "profile") {
      saveProfile({ name, email, company, role, bio });
    }
    if (tab === "notifications") {
      saveNotifs({ emailNotifs, newCandidate, weeklyDigest, soundEnabled, desktopNotif });
    }
    if (tab === "appearance") {
      localStorage.setItem("cv_ai_accent", accentColor);
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleClearDB() {
    if (!clearConfirm) { setClearConfirm(true); setTimeout(() => setClearConfirm(false), 4000); return; }
    setClearing(true);
    // There's no batch-delete endpoint, so we delete each candidate individually
    try {
      const stats = await apiFetch<DBStats>("/api/ingest/stats");
      for (const id of stats.ids) {
        await apiFetch(`/api/ingest/${id}`, { method: "DELETE" });
      }
      await fetchDbStats();
      setClearConfirm(false);
    } catch (err: any) {
      setDbError(err?.message ?? "Failed to clear database");
    } finally {
      setClearing(false);
    }
  }

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "profile",       label: "Profile",       icon: User     },
    { key: "security",      label: "Security",       icon: Lock     },
    { key: "notifications", label: "Notifications",  icon: Bell     },
    { key: "appearance",    label: "Appearance",     icon: Palette  },
    { key: "system",        label: "System",         icon: Database },
  ];

  const ACCENT_COLORS = [
    { key: "blue",    hex: "#3b82f6" },
    { key: "indigo",  hex: "#6366f1" },
    { key: "purple",  hex: "#8b5cf6" },
    { key: "emerald", hex: "#10b981" },
    { key: "amber",   hex: "#f59e0b" },
    { key: "rose",    hex: "#f43f5e" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and system preferences</p>
      </div>

      <div className="flex gap-6 flex-col md:flex-row">

        {/* Sidebar tabs */}
        <div className="md:w-48 shrink-0">
          <div className="space-y-0.5">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                id={`tab-${key}`}
                onClick={() => setTab(key)}
                className={
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-colors text-left " +
                  (tab === key
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5")
                }
              >
                <Icon strokeWidth={1.5} className={"w-4 h-4 shrink-0 " + (tab === key ? "text-blue-400" : "")} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0,   x: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >

              {/* ── Profile ── */}
              {tab === "profile" && (
                <>
                  <GlassCard>
                    <SectionHeader title="Personal Information" subtitle="Stored locally in your browser" />
                    <div className="space-y-4">
                      {/* Avatar */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                          style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.4), rgba(59,130,246,0.4))", border: "1px solid rgba(20,184,166,0.25)" }}>
                          {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground">{email}</p>
                          <p className="text-xs text-blue-400 mt-1">Role: <span className="capitalize font-medium">{user?.role ?? "admin"}</span></p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name">
                          <SettingsInput value={name} onChange={setName} placeholder="Your name" />
                        </Field>
                        <Field label="Email Address">
                          <SettingsInput value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
                        </Field>
                        <Field label="Company">
                          <SettingsInput value={company} onChange={setCompany} placeholder="Company name" />
                        </Field>
                        <Field label="Job Title">
                          <SettingsInput value={role} onChange={setRole} placeholder="e.g. Senior Recruiter" />
                        </Field>
                      </div>

                      <Field label="Bio" hint="Brief description shown on your profile">
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell your team about yourself..."
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-blue-500/40 resize-none transition-colors input-glass"
                          style={{ height: "auto" }}
                        />
                      </Field>

                      <div className="p-3 rounded-xl border border-border/40 bg-muted/30 text-xs text-muted-foreground flex items-start gap-2">
                        <AlertTriangle strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                        Profile changes are saved locally. User management is handled in the backend config.
                      </div>
                    </div>
                  </GlassCard>
                  <div className="flex justify-end">
                    <SaveButton onSave={handleSave} saving={saving} saved={saved} />
                  </div>
                </>
              )}

              {/* ── Security ── */}
              {tab === "security" && (
                <>
                  <GlassCard>
                    <SectionHeader
                      title="Change Password"
                      subtitle="Backend password changes require server restart. This is a demo validation."
                    />
                    <div className="space-y-4">
                      <Field label="Current Password">
                        <div className="relative">
                          <SettingsInput value={currentPw} onChange={setCurrentPw} type={showPw ? "text" : "password"} placeholder="••••••••" />
                          <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            {showPw ? <EyeOff strokeWidth={1.5} className="w-4 h-4" /> : <Eye strokeWidth={1.5} className="w-4 h-4" />}
                          </button>
                        </div>
                      </Field>
                      <Field label="New Password" hint="Minimum 8 characters">
                        <SettingsInput value={newPw} onChange={setNewPw} type={showPw ? "text" : "password"} placeholder="••••••••" />
                      </Field>
                      <Field label="Confirm New Password">
                        <SettingsInput value={confirmPw} onChange={setConfirmPw} type={showPw ? "text" : "password"} placeholder="••••••••" />
                      </Field>

                      {pwError && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
                          <AlertTriangle strokeWidth={1.5} className="w-4 h-4 shrink-0" />
                          {pwError}
                        </div>
                      )}

                      <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-400/80 flex items-start gap-2">
                        <AlertTriangle strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        Demo mode: passwords are hardcoded in <code className="font-mono-display">app/api/auth.py</code>. Change them there directly.
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <SectionHeader title="Session" />
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
                      <div>
                        <p className="text-sm text-foreground">Signed in as</p>
                        <p className="text-xs text-muted-foreground capitalize">{user?.username} · {user?.role}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">Active</span>
                    </div>
                  </GlassCard>

                  <div className="flex justify-end">
                    <SaveButton onSave={handleSave} saving={saving} saved={saved} />
                  </div>
                </>
              )}

              {/* ── Notifications ── */}
              {tab === "notifications" && (
                <>
                  <GlassCard>
                    <SectionHeader title="Email Notifications" subtitle="Preferences saved in browser storage" />
                    <Toggle label="Email notifications" subtitle="Receive notifications via email" enabled={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} />
                    <Toggle label="New candidate alerts" subtitle="When a new CV is uploaded and indexed" enabled={newCandidate} onToggle={() => setNewCandidate(!newCandidate)} />
                    <Toggle label="Weekly digest" subtitle="A summary of your recruitment activity every Monday" enabled={weeklyDigest} onToggle={() => setWeeklyDigest(!weeklyDigest)} />
                  </GlassCard>

                  <GlassCard>
                    <SectionHeader title="In-App" />
                    <Toggle label="Sound effects" subtitle="Play sounds for important notifications" enabled={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />
                    <Toggle label="Desktop notifications" subtitle="Show browser notifications when not in the app" enabled={desktopNotif} onToggle={() => {
                      if (!desktopNotif && "Notification" in window) {
                        Notification.requestPermission().then((p) => { if (p === "granted") setDesktopNotif(true); });
                      } else {
                        setDesktopNotif(!desktopNotif);
                      }
                    }} />
                  </GlassCard>

                  <div className="flex justify-end">
                    <SaveButton onSave={handleSave} saving={saving} saved={saved} />
                  </div>
                </>
              )}

              {/* ── Appearance ── */}
              {tab === "appearance" && (
                <>
                  <GlassCard>
                    <SectionHeader title="Theme" subtitle="Choose how CV AI looks" />

                    {/* Theme mode */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {([
                        { key: "dark",   label: "Dark",   icon: Moon    },
                        { key: "light",  label: "Light",  icon: Sun     },
                        { key: "system", label: "System", icon: Monitor },
                      ] as const).map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          id={`theme-${key}`}
                          onClick={() => setTheme(key)}
                        className={
                          "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all " +
                          (currentTheme === key || (key === "system" && theme === "system")
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-400 font-semibold"
                            : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-muted-foreground hover:border-black/20 dark:hover:border-white/20")
                        }
                        >
                          <Icon strokeWidth={1.5} className="w-5 h-5" />
                          <span className="text-xs font-medium">{label}</span>
                          {(key === theme || (key === "system" && theme === "system")) && (
                            <span className="text-[10px] text-blue-400 font-mono-display">active</span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Live preview */}
                    {mounted && (
                      <div className="p-3 rounded-xl border border-border/30 bg-muted/20 text-xs text-muted-foreground">
                        Current: <span className="text-foreground font-medium capitalize">{resolvedTheme}</span> mode
                        {theme === "system" && <span className="text-muted-foreground"> (system preference)</span>}
                      </div>
                    )}
                  </GlassCard>

                  <GlassCard>
                    <SectionHeader title="Accent Color" subtitle="Saved to browser — affects future sessions" />
                    <div className="flex items-center gap-3">
                      {ACCENT_COLORS.map(({ key, hex }) => (
                        <button
                          key={key}
                          onClick={() => { setAccentColor(key); localStorage.setItem("cv_ai_accent", key); }}
                          title={key}
                          className={"w-8 h-8 rounded-full border-2 transition-all " +
                            (accentColor === key ? "border-white scale-110 shadow-lg" : "border-transparent hover:scale-105")}
                          style={{ background: hex }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Selected: <span className="text-foreground font-medium capitalize">{accentColor}</span>
                    </p>
                  </GlassCard>

                  <div className="flex justify-end">
                    <SaveButton onSave={handleSave} saving={saving} saved={saved} />
                  </div>
                </>
              )}

              {/* ── System ── */}
              {tab === "system" && (
                <>
                  {/* Live DB Stats */}
                  <GlassCard>
                    <div className="flex items-center justify-between mb-5">
                      <SectionHeader title="Database Stats" subtitle="Live from ChromaDB vector store" />
                      <button
                        onClick={fetchDbStats}
                        disabled={dbLoading}
                        className="btn-metal"
                        id="refresh-db-stats"
                      >
                        <RefreshCw strokeWidth={1.5} className={"w-3 h-3 " + (dbLoading ? "animate-spin" : "")} />
                        Refresh
                      </button>
                    </div>

                    {dbError && (
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400 mb-4">
                        <XCircle strokeWidth={1.5} className="w-4 h-4 shrink-0" />
                        {dbError}
                      </div>
                    )}

                    {dbStats ? (
                      <div className="space-y-3">
                        {/* Stats tiles */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { label: "Total Candidates", value: dbStats.total, color: "text-blue-400" },
                            { label: "Needs Review",     value: dbStats.needs_review, color: "text-amber-400" },
                            { label: "Industries",       value: Object.keys(dbStats.industries).length, color: "text-emerald-400" },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
                              <p className={"text-xl font-bold " + color}>{value}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Seniority breakdown */}
                        {Object.keys(dbStats.seniorities).length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Seniority Distribution</p>
                            {Object.entries(dbStats.seniorities).map(([level, count]) => {
                              const pct = dbStats.total > 0 ? Math.round((count / dbStats.total) * 100) : 0;
                              return (
                                <div key={level} className="flex items-center gap-3">
                                  <span className="text-xs text-muted-foreground capitalize w-20 shrink-0">{level}</span>
                                  <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500" style={{ width: pct + "%" }} />
                                  </div>
                                  <span className="text-xs text-foreground w-8 text-right shrink-0">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Connection status */}
                        <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
                          <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                          ChromaDB connected · {dbStats.ids.length} vectors indexed
                        </div>
                      </div>
                    ) : dbLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                        <Activity strokeWidth={1.5} className="w-4 h-4 animate-pulse" />
                        Loading stats...
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Start the backend to see database statistics.</p>
                    )}
                  </GlassCard>

                  {/* AI Config */}
                  <GlassCard>
                    <SectionHeader title="AI Configuration" subtitle="Gemini API — set in .env file" />
                    <div className="space-y-3 text-sm">
                      {[
                        ["GOOGLE_API_KEY",   "Set in backend .env",      "text-muted-foreground"],
                        ["GEMINI_MODEL",     "gemini-3.1-flash-lite-preview", "text-foreground"],
                        ["EMBEDDING",        "all-MiniLM-L6-v2",        "text-foreground"],
                        ["CROSS_ENCODER",    "ms-marco-MiniLM-L-6-v2",  "text-foreground"],
                      ].map(([key, val, cls]) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                          <span className="text-xs text-muted-foreground font-mono-display">{key}</span>
                          <span className={"text-xs font-mono-display " + cls}>{val}</span>
                        </div>
                      ))}
                      <div className="p-3 rounded-xl border border-border/30 bg-muted/20 text-xs text-muted-foreground">
                        To change AI settings, edit <code className="font-mono-display text-foreground">cv_ai/.env</code> and restart the backend.
                      </div>
                    </div>
                  </GlassCard>

                  {/* Danger Zone */}
                  <GlassCard>
                    <SectionHeader title="Danger Zone" subtitle="Irreversible database actions" />
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        This will permanently delete <span className="text-foreground font-semibold">{dbStats?.total ?? "all"} candidates</span> from the vector store. This cannot be undone.
                      </p>
                      <button
                        id="clear-db-btn"
                        onClick={handleClearDB}
                        disabled={clearing || !dbStats || dbStats.total === 0}
                        className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed " +
                          (clearConfirm
                            ? "bg-red-600 border border-red-500/60 text-white"
                            : "border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/12")}
                      >
                        {clearing
                          ? <><RefreshCw strokeWidth={1.5} className="w-4 h-4 animate-spin" />Clearing...</>
                          : clearConfirm
                            ? <><AlertTriangle strokeWidth={1.5} className="w-4 h-4" />Click again to confirm</>
                            : <><Trash2 strokeWidth={1.5} className="w-4 h-4" />Clear all candidate data</>}
                      </button>
                    </div>
                  </GlassCard>

                  {/* About */}
                  <GlassCard>
                    <SectionHeader title="About" />
                    <div className="space-y-0 text-xs text-muted-foreground">
                      {[
                        ["Application",  "CV AI Recruiter Platform"],
                        ["Version",      "1.0.0"],
                        ["Frontend",     "Next.js 14 + TypeScript"],
                        ["Backend",      "FastAPI (Python 3.11+)"],
                        ["AI Engine",    "Google Gemini"],
                        ["Vector Store", "ChromaDB (local)"],
                        ["Auth",         "JWT HS256 (demo mode)"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                          <span>{label}</span>
                          <span className="text-foreground font-medium font-mono-display text-[11px]">{value}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
