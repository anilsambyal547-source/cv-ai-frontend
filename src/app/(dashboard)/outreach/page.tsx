"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Trash2, CheckSquare, Square,
  Users, Send, Inbox, BookmarkPlus,
} from "lucide-react";
import { useShortlistStore } from "@/stores/shortlistStore";
import { ShortlistCard }     from "@/components/outreach/ShortlistCard";
import { EmailModal }        from "@/components/outreach/EmailModal";
import type { ShortlistedCandidate } from "@/stores/shortlistStore";

export default function OutreachPage() {
  const router   = useRouter();
  const { candidates, remove, clear } = useShortlistStore();

  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [emailModal,    setEmailModal]     = useState(false);
  const [emailTargets,  setEmailTargets]   = useState<ShortlistedCandidate[]>([]);
  const [sentIds,       setSentIds]        = useState<Set<string>>(new Set());

  const allSelected  = selected.size === candidates.length && candidates.length > 0;
  const someSelected = selected.size > 0;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(candidates.map((c) => c.id)));
    }
  }

  function openEmailModal(targets: ShortlistedCandidate[]) {
    setEmailTargets(targets);
    setEmailModal(true);
  }

  function handleSent(ids: string[]) {
    setSentIds((prev) => new Set([...prev, ...ids]));
    setSelected(new Set());
  }

  const selectedCandidates = candidates.filter((c) => selected.has(c.id));

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Outreach</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your shortlisted candidates and send personalised emails
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5">
            <BookmarkPlus strokeWidth={1.5} className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">{candidates.length}</span> shortlisted
            </span>
          </div>
          {sentIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/8">
              <Send strokeWidth={1.5} className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400">
                {sentIds.size} sent
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {candidates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          className="flex flex-col items-center justify-center py-32 gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Inbox strokeWidth={1.5} className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">No candidates shortlisted yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Go to Search, find candidates, and click Shortlist to add them here
            </p>
          </div>
          <button
            onClick={() => router.push("/search")}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            <Users strokeWidth={1.5} className="w-3.5 h-3.5" />
            Go to Search
          </button>
        </motion.div>
      )}

      {/* Toolbar */}
      {candidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0  }}
          className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
        >
          {/* Select all */}
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {allSelected
              ? <CheckSquare strokeWidth={1.5} className="w-4 h-4 text-blue-400" />
              : <Square      strokeWidth={1.5} className="w-4 h-4" />
            }
            {allSelected ? "Deselect all" : "Select all"}
          </button>

          <div className="w-px h-4 bg-white/10" />

          {/* Bulk actions */}
          <AnimatePresence>
            {someSelected && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0  }}
                exit={{ opacity: 0,   x: -8  }}
                className="flex items-center gap-2"
              >
                <button
                  onClick={() => openEmailModal(selectedCandidates)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-300 hover:bg-blue-500/25 transition-colors"
                >
                  <Mail strokeWidth={1.5} className="w-3.5 h-3.5" />
                  Email {selected.size} selected
                </button>
                <button
                  onClick={() => {
                    selected.forEach((id) => remove(id));
                    setSelected(new Set());
                  }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-colors"
                >
                  <Trash2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                  Remove {selected.size}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => openEmailModal(candidates)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
            >
              <Send strokeWidth={1.5} className="w-3.5 h-3.5" />
              Email all ({candidates.length})
            </button>
            <button
              onClick={() => { if (confirm("Clear entire shortlist?")) clear(); }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-red-400 hover:border-red-500/20 transition-colors"
            >
              <Trash2 strokeWidth={1.5} className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>
        </motion.div>
      )}

      {/* Candidate list */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {candidates.map((c, i) => (
            <ShortlistCard
              key={c.id}
              candidate={c}
              index={i}
              selected={selected.has(c.id)}
              onSelect={toggleSelect}
              onRemove={(id) => {
                remove(id);
                setSelected((prev) => {
                  const next = new Set(prev);
                  next.delete(id);
                  return next;
                });
              }}
              onView={(id) => router.push("/candidates/" + id)}
              onEmail={(c) => openEmailModal([c])}
            />
          ))}
        </div>
      </AnimatePresence>

      {/* Email Modal */}
      <AnimatePresence>
        {emailModal && (
          <EmailModal
            candidates={emailTargets}
            onClose={() => setEmailModal(false)}
            onSent={handleSent}
          />
        )}
      </AnimatePresence>

    </div>
  );
}