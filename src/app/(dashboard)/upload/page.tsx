"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, CheckCircle, XCircle,
  Loader2, AlertTriangle, Trash2, RefreshCw,
  Database, Users, AlertCircle, Copy,
} from "lucide-react";
import { uploadCV, getDBStats, deleteCandidate } from "@/services/upload.service";
import type { UploadResult, DBStats } from "@/services/upload.service";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FileEntry {
  id:       string;
  file:     File;
  status:   "pending" | "uploading" | "success" | "duplicate" | "error" | "processing";
  result?:  UploadResult;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024)         return bytes + " B";
  if (bytes < 1024 * 1024)  return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ── DB Stats Panel ────────────────────────────────────────────────────────────
function DBStatsPanel({
  stats,
  onDelete,
  loading,
}: {
  stats:    DBStats | null;
  onDelete: (id: string) => Promise<void>;
  loading:  boolean;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirm,  setConfirm]  = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (confirm !== id) { setConfirm(id); return; }
    setDeleting(id);
    setConfirm(null);
    try {
      await onDelete(id);
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white/10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 space-y-4"
      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.2)" }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl" />

      <div className="flex items-center gap-2">
        <Database strokeWidth={1.5} className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-medium text-foreground">Database Status</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {stats.total} total candidates
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
          <p className="text-2xl font-semibold text-emerald-400">
            {stats.total - stats.needs_review}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Good quality</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
          <p className="text-2xl font-semibold text-amber-400">{stats.needs_review}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Needs review</p>
        </div>
      </div>

      {/* Seniority breakdown */}
      {Object.keys(stats.seniorities).length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Seniority breakdown</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(stats.seniorities).map(([s, count]) => (
              <span
                key={s}
                className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-muted-foreground capitalize"
              >
                {s}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Candidate IDs with delete */}
      {stats.ids.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Indexed candidates — click to delete
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {stats.ids.map((id) => (
              <div
                key={id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8 group"
              >
                <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
                  {id}
                </span>
                <button
                  onClick={() => handleDelete(id)}
                  disabled={deleting === id}
                  className={"flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border transition-colors shrink-0 " + (
                    confirm === id
                      ? "bg-red-500/20 border-red-500/30 text-red-400"
                      : "border-white/10 text-muted-foreground hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/10"
                  )}
                >
                  {deleting === id
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <Trash2 strokeWidth={1.5} className="w-3 h-3" />
                  }
                  {confirm === id ? "Confirm?" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UploadPage() {
  const [files,      setFiles]      = useState<FileEntry[]>([]);
  const [dragging,   setDragging]   = useState(false);
  const [running,    setRunning]    = useState(false);
  const [stats,      setStats]      = useState<DBStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load DB stats on mount
  async function loadStats() {
    setStatsLoading(true);
    try {
      const s = await getDBStats();
      setStats(s);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }

  useEffect(() => { loadStats(); }, []);

  function addFiles(newFiles: FileList | File[]) {
    const arr = Array.from(newFiles).filter((f) =>
      f.name.toLowerCase().endsWith(".pdf")
    );
    if (arr.length === 0) return;

    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.file.name));
      const fresh = arr
        .filter((f) => !existingNames.has(f.name))
        .map((f) => ({
          id:     Math.random().toString(36).slice(2),
          file:   f,
          status: "pending" as const,
        }));
      return [...prev, ...fresh];
    });
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function clearAll() {
    setFiles((prev) => prev.filter((f) => f.status === "uploading"));
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true);  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);

  async function processAll() {
    const pending = files.filter((f) => f.status === "pending" || f.status === "error");
    if (pending.length === 0 || running) return;

    setRunning(true);

    for (const entry of pending) {
      setFiles((prev) =>
        prev.map((f) => f.id === entry.id ? { ...f, status: "uploading" } : f)
      );

      try {
        const result = await uploadCV(entry.file);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { 
                  ...f, 
                  status: result.status === "duplicate" ? "duplicate" 
                        : result.status === "processing" ? "processing"
                        : result.status === "success" ? "success" 
                        : "error", 
                  result 
                }
              : f
          )
        );
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "error", result: { status: "error", filename: f.file.name, message: err?.message ?? "Upload failed", candidates: 0 } }
              : f
          )
        );
      }
    }

    setRunning(false);
    // Refresh stats after upload
    await loadStats();
  }

  async function handleDelete(id: string) {
    await deleteCandidate(id);
    await loadStats();
  }

  const pending    = files.filter((f) => f.status === "pending").length;
  const succeeded  = files.filter((f) => f.status === "success").length;
  const duplicates = files.filter((f) => f.status === "duplicate").length;
  const failed     = files.filter((f) => f.status === "error").length;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Upload CVs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload PDF CVs — AI extracts and indexes candidate data automatically
        </p>
      </div>

      {/* DB Stats */}
      <DBStatsPanel
        stats={stats}
        onDelete={handleDelete}
        loading={statsLoading}
      />

      {/* Drop zone */}
      <motion.div
        animate={{
          borderColor: dragging ? "rgba(59,130,246,0.6)" : "rgba(255,255,255,0.1)",
          background:  dragging ? "rgba(59,130,246,0.06)" : "rgba(255,255,255,0.02)",
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className="relative rounded-2xl border-2 border-dashed cursor-pointer p-10 flex flex-col items-center justify-center gap-4"
      >
        <AnimatePresence>
          {dragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.08), transparent 70%)" }}
            />
          )}
        </AnimatePresence>

        <div className={"w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors " + (
          dragging ? "bg-blue-500/20 border-blue-500/30" : "bg-white/5 border-white/10"
        )}>
          <Upload strokeWidth={1.5} className={"w-6 h-6 transition-colors " + (dragging ? "text-blue-400" : "text-muted-foreground")} />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {dragging ? "Drop PDFs here" : "Drag & drop PDF CVs here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse · PDF only · max 20MB each
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </motion.div>

      {/* Toolbar */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0  }}
          className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
        >
          {/* Stats */}
          <div className="flex items-center gap-4 flex-1 flex-wrap text-xs">
            <span className="text-muted-foreground">
              <span className="text-foreground font-medium">{files.length}</span> files
            </span>
            {pending > 0 && (
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">{pending}</span> pending
              </span>
            )}
            {succeeded > 0 && (
              <span className="text-emerald-400 font-medium">{succeeded} indexed</span>
            )}
            {duplicates > 0 && (
              <span className="text-blue-400 font-medium">{duplicates} duplicate{duplicates !== 1 ? "s" : ""}</span>
            )}
            {failed > 0 && (
              <span className="text-red-400 font-medium">{failed} failed</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={clearAll}
              disabled={running}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-red-400 hover:border-red-500/20 transition-colors disabled:opacity-40"
            >
              <Trash2 strokeWidth={1.5} className="w-3 h-3" />
              Clear
            </button>
            <button
              onClick={processAll}
              disabled={running || pending === 0}
              className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium transition-colors"
            >
              {running
                ? <><Loader2 className="w-3 h-3 animate-spin" />Processing...</>
                : <><Upload strokeWidth={1.5} className="w-3 h-3" />Upload {pending} file{pending !== 1 ? "s" : ""}</>
              }
            </button>
          </div>
        </motion.div>
      )}

      {/* File list */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-2">
          {files.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0   }}
              exit={{ opacity: 0,   x: 16   }}
              transition={{ duration: 0.2 }}
              className={"flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md " + (
                entry.status === "success"   ? "border-emerald-500/20 bg-emerald-500/5"
                : entry.status === "duplicate" ? "border-blue-500/20 bg-blue-500/5"
                : entry.status === "error"     ? "border-red-500/20   bg-red-500/5"
                : entry.status === "uploading" ? "border-blue-500/20  bg-blue-500/5"
                : "border-white/10 bg-white/5"
              )}
            >
              {/* Status icon */}
              <div className={"w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border " + (
                entry.status === "success"   ? "bg-emerald-500/15 border-emerald-500/25"
                : entry.status === "duplicate" ? "bg-blue-500/15   border-blue-500/25"
                : entry.status === "error"     ? "bg-red-500/15    border-red-500/25"
                : entry.status === "uploading" ? "bg-blue-500/15   border-blue-500/25"
                : "bg-white/8 border-white/10"
              )}>
                {entry.status === "uploading"  && <Loader2      className="w-4 h-4 text-blue-400 animate-spin" />}
                {entry.status === "processing" && <Loader2      className="w-4 h-4 text-blue-400 animate-spin" />}
                {entry.status === "success"    && <CheckCircle  strokeWidth={1.5} className="w-4 h-4 text-emerald-400" />}
                {entry.status === "duplicate"  && <Copy         strokeWidth={1.5} className="w-4 h-4 text-blue-400" />}
                {entry.status === "error"      && <XCircle      strokeWidth={1.5} className="w-4 h-4 text-red-400" />}
                {entry.status === "pending"    && <FileText     strokeWidth={1.5} className="w-4 h-4 text-muted-foreground" />}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{entry.file.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{formatBytes(entry.file.size)}</span>

                  {entry.result?.message && (
                    <span className={"text-xs " + (
                      entry.status === "success"   ? "text-emerald-400"
                      : entry.status === "duplicate" ? "text-blue-400"
                      : entry.status === "error"     ? "text-red-400"
                      : "text-muted-foreground"
                    )}>
                      · {entry.result.message}
                    </span>
                  )}

                  {entry.result?.candidates != null && entry.result.candidates > 0 && (
                    <span className="text-xs text-emerald-400 font-medium">
                      · {entry.result.candidates} candidate{entry.result.candidates !== 1 ? "s" : ""} extracted
                    </span>
                  )}
                </div>

                {/* Upload progress bar */}
                {entry.status === "uploading" && (
                  <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-blue-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 3, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>

              {/* Status badge */}
              <div className="shrink-0">
                {entry.status === "pending" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground">
                    Pending
                  </span>
                )}
                {entry.status === "uploading" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-300">
                    Uploading...
                  </span>
                )}
                {entry.status === "processing" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-600">
                    Extraction Started ✓
                  </span>
                )}
                {entry.status === "success" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
                    Indexed ✓
                  </span>
                )}
                {entry.status === "duplicate" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-300">
                    Already exists
                  </span>
                )}
                {entry.status === "error" && (
                  <button
                    onClick={() => setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: "pending", result: undefined } : f))}
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <RefreshCw strokeWidth={1.5} className="w-2.5 h-2.5" />
                    Retry
                  </button>
                )}
              </div>

              {/* Remove */}
              {entry.status !== "uploading" && (
                <button
                  onClick={() => removeFile(entry.id)}
                  className="w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 strokeWidth={1.5} className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Tips */}
      {files.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-3"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tips for best results
          </p>
          <div className="space-y-2">
            {[
              "Upload PDF format only — each PDF should contain one CV",
              "Text-based PDFs work best — scanned images may have lower accuracy",
              "Duplicate files are automatically detected and skipped",
              "Gemini AI extracts name, skills, experience, education automatically",
              "Poor quality extractions are flagged for review",
              "Delete bad candidates from the Database Status panel above",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60 mt-1.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
}