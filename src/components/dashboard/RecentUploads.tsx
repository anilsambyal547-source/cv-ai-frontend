"use client";

import { FileText, Clock, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface UploadItem {
  id:          string;
  name:        string;
  status:      "processed" | "processing" | "failed";
  size?:       string;
  created_at?: string;
}

interface Props {
  uploads?: UploadItem[];
  loading?: boolean;
  total?:   number;
}

const STATUS_CFG = {
  processed:  { label: "Indexed",    color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.18)"  },
  processing: { label: "Processing", color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.18)"  },
  failed:     { label: "Failed",     color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.18)" },
} as const;

const SKELETON = [...Array(4)];

export function RecentUploads({ uploads = [], loading, total }: Props) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="glass-panel p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "hsl(213,31%,92%)" }}>
            Recent Uploads
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "rgba(100,116,139,0.8)" }}>
            Latest CV processing activity
          </p>
        </div>
        {total != null && (
          <span
            className="text-[10px] font-mono-display px-2 py-0.5 rounded-full"
            style={{
              color: "rgba(100,116,139,0.8)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(148,163,184,0.10)",
            }}
          >
            {total.toLocaleString()} total
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1">
        {loading ? (
          SKELETON.map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl animate-pulse">
              <div className="w-7 h-7 rounded-lg shrink-0" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="flex-1 space-y-1.5">
                <div className="w-40 h-3 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="w-24 h-2.5 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
              <div className="w-16 h-5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
            </div>
          ))
        ) : uploads.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}
            >
              <FileText strokeWidth={1.5} className="w-4 h-4" style={{ color: "#14b8a6" }} />
            </div>
            <p className="text-xs" style={{ color: "rgba(100,116,139,0.7)" }}>
              No uploads yet
            </p>
            <button
              onClick={() => router.push("/upload")}
              className="btn-teal text-[11px]"
            >
              <Upload strokeWidth={1.5} className="w-3 h-3" />
              Upload CVs
            </button>
          </div>
        ) : (
          uploads.map((u, i) => {
            const cfg = STATUS_CFG[u.status] ?? STATUS_CFG.processed;
            return (
              <div
                key={u.id ?? i}
                className="flex items-center gap-3 p-2.5 rounded-xl cursor-default transition-colors duration-150"
                style={{}}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
              >
                {/* File icon */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(20,184,166,0.08)",
                    border:     "1px solid rgba(20,184,166,0.15)",
                  }}
                >
                  <FileText strokeWidth={1.5} className="w-3.5 h-3.5" style={{ color: "#14b8a6" }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: "hsl(213,31%,88%)" }}>
                    {u.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock strokeWidth={1.5} className="w-3 h-3" style={{ color: "rgba(100,116,139,0.5)" }} />
                    <span className="text-[11px]" style={{ color: "rgba(100,116,139,0.7)" }}>
                      {u.created_at
                        ? new Date(u.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Recently"
                      }
                    </span>
                    {u.size && (
                      <>
                        <span style={{ color: "rgba(100,116,139,0.4)" }}>·</span>
                        <span className="text-[11px]" style={{ color: "rgba(100,116,139,0.6)" }}>{u.size}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 font-mono-display"
                  style={{
                    color:      cfg.color,
                    background: cfg.bg,
                    border:     `1px solid ${cfg.border}`,
                  }}
                >
                  {cfg.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}