"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, ChevronRight, MoreVertical, 
  Mail, Phone, MapPin, Star, AlertCircle, Clock,
  CheckCircle2, XCircle, PauseCircle, Send, Briefcase, Inbox
} from "lucide-react";
import { candidateService } from "@/services/candidate.service";
import { CandidateListItem } from "@/types/candidates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const STAGES = [
  { id: "Lead",        label: "New Leads",    icon: Star,         color: "text-blue-400",   bg: "bg-blue-400/10" },
  { id: "Shortlisted", label: "Shortlisted",  icon: CheckCircle2,  color: "text-teal-400",   bg: "bg-teal-400/10" },
  { id: "Outreach",    label: "Outreach",     icon: Mail,         color: "text-purple-400", bg: "bg-purple-400/10" },
  { id: "Applied",     label: "Applied",      icon: Inbox,        color: "text-sky-400",    bg: "bg-sky-400/10" },
  { id: "Screening",   label: "Screening",    icon: Search,       color: "text-amber-400",  bg: "bg-amber-400/10" },
  { id: "Interview",   label: "Interviewing", icon: Briefcase,    color: "text-orange-400", bg: "bg-orange-400/10" },
  { id: "On Hold",     label: "On Hold",      icon: PauseCircle,  color: "text-slate-400",  bg: "bg-slate-400/10" },
  { id: "Offer",       label: "Negotiation",  icon: Send,         color: "text-pink-400",   bg: "bg-pink-400/10" },
  { id: "Rejected",    label: "Rejected",     icon: XCircle,       color: "text-red-400",    bg: "bg-red-400/10" },
  { id: "Hired",       label: "Hired",        icon: CheckCircle2,  color: "text-emerald-400",bg: "bg-emerald-400/10" },
];

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    try {
      const data = await candidateService.list(100, 0);
      setCandidates(data);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMoveStage(id: string, stage: string) {
    setUpdatingId(id);
    try {
      await candidateService.updateStage(id, stage);
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, stage } : c));
    } catch (err) {
      console.error("Failed to update stage:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  const grouped = useMemo(() => {
    const acc: Record<string, CandidateListItem[]> = {};
    STAGES.forEach(s => acc[s.id] = []);
    candidates.forEach(c => {
      const stage = c.stage || "Lead";
      if (acc[stage]) acc[stage].push(c);
      else acc["Lead"].push(c);
    });
    return acc;
  }, [candidates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading Pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Recruitment Pipeline
        </h1>
        <p className="text-muted-foreground">
          Track and manage candidates through each stage of the hiring process.
        </p>
      </header>

      {/* Horizontal scrolling Kanban board */}
      <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x">
        {STAGES.map((stage) => (
          <div 
            key={stage.id} 
            className="flex-shrink-0 w-80 flex flex-col gap-4 snap-start"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${stage.bg} ${stage.color}`}>
                  <stage.icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-200">{stage.label}</h3>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] h-5 px-1.5">
                  {grouped[stage.id]?.length || 0}
                </Badge>
              </div>
            </div>

            {/* Column Body */}
            <div 
              className="flex-1 flex flex-col gap-3 p-3 rounded-2xl bg-black/40 border border-white/5 min-h-[500px]"
              style={{
                backdropFilter: "blur(8px)",
              }}
            >
              <AnimatePresence mode="popLayout">
                {grouped[stage.id]?.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/5 rounded-xl text-slate-600 italic text-sm"
                  >
                    No candidates
                  </motion.div>
                ) : (
                  grouped[stage.id].map((candidate, idx) => (
                    <CandidateCard 
                      key={candidate.id} 
                      candidate={candidate} 
                      onMove={(s) => handleMoveStage(candidate.id, s)}
                      isUpdating={updatingId === candidate.id}
                      index={idx}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CandidateCard({ 
  candidate, 
  onMove, 
  isUpdating,
  index 
}: { 
  candidate: CandidateListItem; 
  onMove: (s: string) => void;
  isUpdating: boolean;
  index: number;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className={`group relative p-4 rounded-xl border border-white/10 bg-white/5 hover:border-teal-500/30 hover:bg-white/10 transition-all cursor-default ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="flex flex-col gap-3">
        {/* Quality Score */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`text-[9px] uppercase tracking-wider py-0 px-1.5 border-none ${
              candidate.quality_label === 'excellent' ? 'bg-emerald-400/20 text-emerald-400' :
              candidate.quality_label === 'good' ? 'bg-blue-400/20 text-blue-400' :
              'bg-slate-400/20 text-slate-400'
            }`}
          >
            {candidate.quality_label}
          </Badge>
          <button 
            onClick={() => setShowActions(!showActions)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Candidate Info */}
        <Link href={`/candidates/${candidate.id}`} className="flex flex-col gap-1 group/link">
          <h4 className="font-medium text-slate-200 group-hover/link:text-teal-400 transition-colors">
            {candidate.name}
          </h4>
          <p className="text-[11px] text-slate-500 line-clamp-1">
            {candidate.industry || "General"} • {candidate.years_experience} YOE
          </p>
        </Link>

        {/* Action Menu (Stage selector) */}
        {showActions && (
          <div className="absolute top-10 right-2 z-10 w-40 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-1 animate-in zoom-in-95 duration-150">
            <p className="text-[10px] text-slate-500 px-2 py-1 mb-1">Move to:</p>
            {STAGES.filter(s => s.id !== candidate.stage).map(s => (
              <button
                key={s.id}
                onClick={() => { onMove(s.id); setShowActions(false); }}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <s.icon className={`w-3 h-3 ${s.color}`} />
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
          <Clock className="w-4 h-4 text-teal-400 animate-spin" />
        </div>
      )}
    </motion.div>
  );
}