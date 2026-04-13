"use client";

import { motion } from "framer-motion";
import { X, Mail, User, MapPin, Briefcase, Clock } from "lucide-react";
import type { ShortlistedCandidate } from "@/stores/shortlistStore";

interface Props {
  candidate: ShortlistedCandidate;
  index:     number;
  selected:  boolean;
  onSelect:  (id: string) => void;
  onRemove:  (id: string) => void;
  onView:    (id: string) => void;
  onEmail:   (c: ShortlistedCandidate) => void;
}

export function ShortlistCard({
  candidate, index, selected,
  onSelect, onRemove, onView, onEmail,
}: Props) {
  const skills = candidate.skills
    ? candidate.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const addedAt = new Date(candidate.addedAt).toLocaleDateString([], {
    month: "short", day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{ opacity: 0, x: -16   }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`relative rounded-2xl border backdrop-blur-md p-5 overflow-hidden group transition-all ${
        selected
          ? "border-blue-500/40 bg-blue-500/8"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.2)" }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex items-start gap-4">

        {/* Checkbox */}
        <button
          onClick={() => onSelect(candidate.id)}
          className={`w-5 h-5 shrink-0 rounded-md border flex items-center justify-center mt-0.5 transition-all ${
            selected
              ? "bg-blue-600 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
              : "border-white/20 bg-white/5 hover:border-white/40"
          }`}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center text-sm font-semibold text-white/80">
          {candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{candidate.name}</h3>
            {candidate.stage && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 capitalize whitespace-nowrap">
                {candidate.stage}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            {candidate.email && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground truncate max-w-[180px]">
                <Mail strokeWidth={1.5} className="w-3 h-3 shrink-0" />
                {candidate.email}
              </span>
            )}
            {candidate.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin strokeWidth={1.5} className="w-3 h-3" />
                {candidate.location}
              </span>
            )}
            {candidate.seniority && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase strokeWidth={1.5} className="w-3 h-3" />
                {candidate.seniority} · {candidate.years_experience}y
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock strokeWidth={1.5} className="w-3 h-3" />
              Added {addedAt}
            </span>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.slice(0, 5).map((s) => (
                <span
                  key={s}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground"
                >
                  {s}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground">
                  +{skills.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onView(candidate.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
            title="View profile"
          >
            <User strokeWidth={1.5} className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEmail(candidate)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
            title="Send email"
          >
            <Mail strokeWidth={1.5} className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRemove(candidate.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Remove from shortlist"
          >
            <X strokeWidth={1.5} className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}