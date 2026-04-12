"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp, SlidersHorizontal, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SearchFilters } from "@/types/search";

interface Props {
  filters:  Partial<SearchFilters>;
  onChange: (f: Partial<SearchFilters>) => void;
  onReset:  () => void;
  onApply:  () => void;
}

const SKILL_SUGGESTIONS = [
  "Python", "React", "TypeScript", "Node.js", "SQL",
  "AWS", "Docker", "Java", "Go", "Kubernetes",
  "FastAPI", "PostgreSQL", "Redis", "GraphQL", "Rust",
];

const EDUCATION_OPTIONS = [
  { value: "any",      label: "Any Level"    },
  { value: "bachelor", label: "Bachelor's"   },
  { value: "master",   label: "Master's"     },
  { value: "phd",      label: "PhD"          },
];

const SENIORITY_OPTIONS = [
  { value: "any",       label: "Any Level"  },
  { value: "junior",    label: "Junior"     },
  { value: "mid",       label: "Mid-level"  },
  { value: "senior",    label: "Senior"     },
  { value: "lead",      label: "Lead"       },
  { value: "principal", label: "Principal"  },
];

function Section({
  title, children, defaultOpen = true,
}: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 pb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
      >
        {title}
        {open
          ? <ChevronUp   strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground" />
          : <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground" />
        }
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FilterSidebar({ filters, onChange, onReset, onApply }: Props) {
  const [skillInput, setSkillInput] = useState("");

  const activeFiltersCount = [
    (filters.skills?.length ?? 0) > 0,
    filters.minExp != null,
    filters.maxExp != null,
    filters.education && filters.education !== "any",
    filters.seniority && filters.seniority !== "any",
    filters.boolean?.trim(),
  ].filter(Boolean).length;

  function addSkill(skill: string) {
    const s = skill.trim();
    if (!s) return;
    const current = filters.skills ?? [];
    if (!current.map(x => x.toLowerCase()).includes(s.toLowerCase())) {
      onChange({ ...filters, skills: [...current, s] });
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    onChange({ ...filters, skills: (filters.skills ?? []).filter((s) => s !== skill) });
  }

  return (
    <aside className="w-64 shrink-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-3 h-fit sticky top-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <SlidersHorizontal strokeWidth={1.5} className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset all
        </button>
      </div>

      {/* Skills */}
      <Section title="Skills">
        {/* Selected */}
        {(filters.skills ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(filters.skills ?? []).map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300"
              >
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input */}
        <input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(skillInput); }
            if (e.key === "Backspace" && !skillInput && (filters.skills ?? []).length > 0) {
              removeSkill((filters.skills ?? []).slice(-1)[0]);
            }
          }}
          placeholder="Type skill + Enter"
          className="w-full h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-blue-500/40 transition-colors"
        />

        {/* Suggestions */}
        <div className="flex flex-wrap gap-1 mt-2">
          {SKILL_SUGGESTIONS
            .filter((s) => !(filters.skills ?? []).map(x => x.toLowerCase()).includes(s.toLowerCase()))
            .filter((s) => !skillInput || s.toLowerCase().includes(skillInput.toLowerCase()))
            .slice(0, 8)
            .map((s) => (
              <button
                key={s}
                onClick={() => addSkill(s)}
                className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground hover:border-blue-500/30 hover:text-blue-300 hover:bg-blue-500/5 transition-all"
              >
                + {s}
              </button>
            ))
          }
        </div>
      </Section>

      {/* Experience */}
      <Section title="Experience (years)">
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} max={50} placeholder="Min"
            value={filters.minExp ?? ""}
            onChange={(e) => onChange({ ...filters, minExp: e.target.value ? Number(e.target.value) : null })}
            className="w-full h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-blue-500/40 transition-colors"
          />
          <span className="text-muted-foreground text-xs shrink-0">–</span>
          <input
            type="number" min={0} max={50} placeholder="Max"
            value={filters.maxExp ?? ""}
            onChange={(e) => onChange({ ...filters, maxExp: e.target.value ? Number(e.target.value) : null })}
            className="w-full h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-blue-500/40 transition-colors"
          />
        </div>
      </Section>

      {/* Education */}
      <Section title="Education" defaultOpen={false}>
        <div className="space-y-1">
          {EDUCATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, education: opt.value as any })}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                (filters.education ?? "any") === opt.value
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/25"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Seniority */}
      <Section title="Seniority" defaultOpen={false}>
        <div className="space-y-1">
          {SENIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, seniority: opt.value as any })}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                (filters.seniority ?? "any") === opt.value
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/25"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Boolean Query */}
      <Section title="Boolean Query" defaultOpen={false}>
        <textarea
          value={filters.boolean ?? ""}
          onChange={(e) => onChange({ ...filters, boolean: e.target.value })}
          placeholder={"python AND docker\nOR (java NOT kotlin)"}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-blue-500/40 resize-none transition-colors"
        />
        <p className="text-[10px] text-muted-foreground mt-1">AND · OR · NOT operators supported</p>
      </Section>

      {/* Search Mode */}
      <Section title="Search Mode" defaultOpen={false}>
        <div className="space-y-2 pt-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>← Semantic</span>
            <span>Keyword →</span>
          </div>
          <input
            type="range" min={0} max={1} step={0.1}
            value={filters.alpha ?? 0.5}
            onChange={(e) => onChange({ ...filters, alpha: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Vector search</span>
            <span className="font-medium text-blue-300">α = {filters.alpha ?? 0.5}</span>
            <span>BM25 search</span>
          </div>
        </div>
      </Section>

      {/* Apply Button */}
      <button
        onClick={onApply}
        className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
      >
        <Search strokeWidth={1.5} className="w-3.5 h-3.5" />
        Apply Filters
      </button>
    </aside>
  );
}