"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, DragOverlay, closestCenter,
  useDraggable, useDroppable,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  Users, Mail, Eye, X, Plus, Briefcase,
  ChevronRight, TrendingUp, Award, Clock,
  CheckCircle, AlertCircle, Target,
  MoreHorizontal, StickyNote, MapPin,
} from "lucide-react";
import { usePipelineStore } from "@/stores/pipelineStore";
import type { Stage, PipelineCandidate } from "@/stores/pipelineStore";
import { useShortlistStore } from "@/stores/shortlistStore";

// ── Stage config ──────────────────────────────────────────────────────────────
const STAGES: {
  key:    Stage;
  label:  string;
  color:  string;
  bg:     string;
  border: string;
  icon:   React.ElementType;
}[] = [
  { key: "sourced",   label: "Sourced",   color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    icon: Users       },
  { key: "screening", label: "Screening", color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20",  icon: Target      },
  { key: "interview", label: "Interview", color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   icon: TrendingUp  },
  { key: "offer",     label: "Offer",     color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Award       },
  { key: "hired",     label: "Hired",     color: "text-green-400",   bg: "bg-green-500/10",   border: "border-green-500/20",   icon: CheckCircle },
  { key: "rejected",  label: "Rejected",  color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     icon: AlertCircle },
];

// ── Note Modal (unchanged) ───────────────────────────────────────────────────
function NoteModal({ candidate, onClose }: { candidate: PipelineCandidate; onClose: () => void }) {
  const { update } = usePipelineStore();
  const [note, setNote] = useState(candidate.notes ?? "");

  function save() {
    update(candidate.id, { notes: note });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0,   scale: 0.95, y: 16  }}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl p-6"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rounded-t-2xl" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Notes — {candidate.name}</h3>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add notes about this candidate..."
          rows={5}
          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-blue-500/40 resize-none transition-colors"
        />
        <div className="flex gap-2 mt-3">
          <button onClick={onClose} className="flex-1 h-9 rounded-xl border border-white/10 bg-white/5 text-sm text-muted-foreground hover:bg-white/8 transition-colors">
            Cancel
          </button>
          <button onClick={save} className="flex-1 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            Save Note
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Kanban Card (unchanged) ─────────────────────────────────────────────────
function KanbanCard({
  candidate, isDragging = false,
  onView, onEmail, onRemove, onNote, onMove,
}: {
  candidate:   PipelineCandidate;
  isDragging?: boolean;
  onView:      (id: string) => void;
  onEmail:     (id: string) => void;
  onRemove:    (id: string) => void;
  onNote:      (c: PipelineCandidate) => void;
  onMove:      (id: string, stage: Stage) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: candidate.id });
  const [showMenu, setShowMenu] = useState(false);

  const skills = candidate.skills
    ? candidate.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3)
    : [];

  const score = candidate.fit_score
    ? (candidate.fit_score > 1 ? Math.round(candidate.fit_score) : Math.round(candidate.fit_score * 100))
    : null;

  const scoreColor = score
    ? score >= 85 ? "#10b981" : score >= 70 ? "#3b82f6" : "#f59e0b"
    : "#6b7280";

  const updatedAt = new Date(candidate.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" });

  const style = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl border bg-white/5 backdrop-blur-sm p-3 cursor-grab active:cursor-grabbing select-none group ${
        isDragging ? "opacity-40" : "border-white/10 hover:border-white/20"
      }`}
      {...listeners}
      {...attributes}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-xl" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-white/80">
            {candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{candidate.name}</p>
            {candidate.seniority && (
              <p className="text-[10px] text-muted-foreground">{candidate.seniority}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {score !== null && (
            <span className="text-[10px] font-semibold" style={{ color: scoreColor }}>{score}%</span>
          )}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal strokeWidth={1.5} className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0  }}
                    exit={{ opacity: 0,   y: -4  }}
                    className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-white/15 overflow-hidden z-20"
                    style={{ background: "#0a0a0e", boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}
                  >
                    <div className="px-3 py-1.5 border-b border-white/8">
                      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Move to</p>
                    </div>
                    {STAGES.filter((s) => s.key !== candidate.stage).map((s) => (
                      <button
                        key={s.key}
                        onClick={() => { onMove(candidate.id, s.key); setShowMenu(false); }}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors hover:bg-white/5 ${s.color}`}
                      >
                        <s.icon strokeWidth={1.5} className="w-3 h-3" />
                        {s.label}
                      </button>
                    ))}
                    <div className="border-t border-white/8">
                      <button onClick={() => { onNote(candidate); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                        <StickyNote strokeWidth={1.5} className="w-3 h-3" />Add note
                      </button>
                      <button onClick={() => { onView(candidate.id); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                        <Eye strokeWidth={1.5} className="w-3 h-3" />View profile
                      </button>
                      <button onClick={() => { onEmail(candidate.id); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-blue-300 hover:bg-blue-500/8 transition-colors">
                        <Mail strokeWidth={1.5} className="w-3 h-3" />Email
                      </button>
                      <button onClick={() => { onRemove(candidate.id); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/8 transition-colors">
                        <X strokeWidth={1.5} className="w-3 h-3" />Remove
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {skills.map((s) => (
            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-md border border-white/8 bg-white/5 text-muted-foreground">{s}</span>
          ))}
        </div>
      )}

      {/* Notes preview */}
      {candidate.notes && (
        <div className="mt-2 px-2 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/15">
          <p className="text-[9px] text-amber-400/80 line-clamp-2">{candidate.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          {candidate.location && (
            <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground/60">
              <MapPin strokeWidth={1.5} className="w-2.5 h-2.5" />
              {candidate.location.split(",")[0]}
            </span>
          )}
          {candidate.years_experience && candidate.years_experience > 0 && (
            <span className="text-[9px] text-muted-foreground/60">{candidate.years_experience}y</span>
          )}
        </div>
        <span className="text-[9px] text-muted-foreground/40 flex items-center gap-0.5">
          <Clock strokeWidth={1.5} className="w-2.5 h-2.5" />{updatedAt}
        </span>
      </div>
    </div>
  );
}

// ── Droppable Column (unchanged) ─────────────────────────────────────────────
function KanbanColumn({
  stage, candidates, onView, onEmail, onRemove, onNote, onMove, activeId,
}: {
  stage:      typeof STAGES[0];
  candidates: PipelineCandidate[];
  onView:     (id: string) => void;
  onEmail:    (id: string) => void;
  onRemove:   (id: string) => void;
  onNote:     (c: PipelineCandidate) => void;
  onMove:     (id: string, stage: Stage) => void;
  activeId:   string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });

  return (
    <div className="flex flex-col min-w-[220px] max-w-[260px] w-full shrink-0">
      <div className={`flex items-center justify-between px-3 py-2 rounded-xl border mb-2 ${stage.bg} ${stage.border}`}>
        <div className="flex items-center gap-2">
          <stage.icon strokeWidth={1.5} className={`w-3.5 h-3.5 ${stage.color}`} />
          <span className={`text-xs font-medium ${stage.color}`}>{stage.label}</span>
        </div>
        <span className={`text-xs font-bold ${stage.color}`}>{candidates.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[200px] rounded-xl border border-dashed transition-all space-y-2 p-2 ${
          isOver ? "border-blue-500/40 bg-blue-500/5" : "border-white/8 bg-white/[0.02]"
        }`}
      >
        <AnimatePresence>
          {candidates.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8  }}
              animate={{ opacity: 1, y: 0  }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <KanbanCard
                candidate={c}
                isDragging={activeId === c.id}
                onView={onView}
                onEmail={onEmail}
                onRemove={onRemove}
                onNote={onNote}
                onMove={onMove}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {candidates.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-24">
            <p className="text-[10px] text-muted-foreground/30">Drop candidates here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page (with guard against undefined candidates) ──────────────────────
export default function PipelinePage() {
  const router = useRouter();
  const { candidates, move, remove, getByStage } = usePipelineStore();
  const { candidates: shortlisted } = useShortlistStore();

  // ✅ SAFETY GUARD: ensure candidates is always an array
  const safeCandidates = candidates ?? [];

  const [activeId,   setActiveId]   = useState<string | null>(null);
  const [noteTarget, setNoteTarget] = useState<PipelineCandidate | null>(null);

  // ✅ Now safe to use safeCandidates
  const activeCandidate = safeCandidates.find((c) => c.id === activeId) ?? null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const stage = over.id as Stage;
      if (STAGES.some((s) => s.key === stage)) {
        move(String(active.id), stage);
      }
    }
    setActiveId(null);
  }

  function importShortlist() {
    const { add } = usePipelineStore.getState();
    shortlisted.forEach((c) => {
      add({
        id:               c.id,
        name:             c.name,
        email:            c.email,
        skills:           c.skills,
        years_experience: c.years_experience,
        seniority:        c.seniority,
        location:         c.location,
        industry:         c.industry,
      });
    });
  }

  const total    = safeCandidates.length;
  const hired    = getByStage("hired").length;
  const rejected = getByStage("rejected").length;
  const active   = total - hired - rejected;
  const convRate = total > 0 ? Math.round((hired / total) * 100) : 0;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track candidates through your hiring process</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={importShortlist}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus strokeWidth={1.5} className="w-3.5 h-3.5" />
            Import Shortlist
          </button>
          <button
            onClick={() => router.push("/search")}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            <Plus strokeWidth={1.5} className="w-3.5 h-3.5" />
            Add Candidates
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total",           value: total,           color: "#3b82f6" },
          { label: "Active",          value: active,          color: "#6366f1" },
          { label: "Hired",           value: hired,           color: "#10b981" },
          { label: "Conversion Rate", value: convRate + "%",  color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} className="relative rounded-2xl border border-white/10 bg-white/5 p-4 overflow-hidden" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset" }}>
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full opacity-10 blur-xl" style={{ background: color }} />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-semibold mt-0.5" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Funnel */}
      {total > 0 && (
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl" />
          <p className="text-xs font-medium text-muted-foreground mb-3">Pipeline Funnel</p>
          <div className="flex items-center gap-2 flex-wrap">
            {STAGES.map((stage, i) => {
              const count = getByStage(stage.key).length;
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={stage.key} className="flex items-center gap-2 flex-1 min-w-[80px]">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] ${stage.color}`}>{stage.label}</span>
                      <span className="text-[10px] text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: pct + "%" }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ background: ["#3b82f6","#8b5cf6","#f59e0b","#10b981","#22c55e","#ef4444"][i] }}
                      />
                    </div>
                  </div>
                  {i < STAGES.length - 1 && (
                    <ChevronRight strokeWidth={1.5} className="w-3 h-3 text-muted-foreground/30 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {total === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          className="flex flex-col items-center justify-center py-24 gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Briefcase strokeWidth={1.5} className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Pipeline is empty</p>
            <p className="text-xs text-muted-foreground mt-1">Add candidates from Search or import your Shortlist</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/search")}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
            >
              <Users strokeWidth={1.5} className="w-3.5 h-3.5" />Search Candidates
            </button>
            <button
              onClick={importShortlist}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus strokeWidth={1.5} className="w-3.5 h-3.5" />Import Shortlist
            </button>
          </div>
        </motion.div>
      )}

      {/* Kanban Board */}
      {total > 0 && (
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.key}
                stage={stage}
                candidates={getByStage(stage.key)}
                onView={(id) => router.push("/candidates/" + id)}
                onEmail={() => router.push("/outreach")}
                onRemove={remove}
                onNote={setNoteTarget}
                onMove={move}
                activeId={activeId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCandidate && (
              <div className="rounded-xl border border-blue-500/40 bg-background/95 backdrop-blur-xl p-3 shadow-[0_16px_32px_rgba(0,0,0,0.5)] rotate-2 scale-105">
                <p className="text-xs font-medium text-foreground">{activeCandidate.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{activeCandidate.seniority}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Note Modal */}
      <AnimatePresence>
        {noteTarget && (
          <NoteModal candidate={noteTarget} onClose={() => setNoteTarget(null)} />
        )}
      </AnimatePresence>

    </div>
  );
}