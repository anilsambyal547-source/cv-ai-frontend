"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Users, Upload, BarChart2, Mail,
  Settings, Home, ArrowRight, Clock, Zap,
  BookmarkPlus, ChevronRight,
} from "lucide-react";

interface Command {
  id:       string;
  label:    string;
  subtitle?: string;
  icon:     React.ElementType;
  action:   () => void;
  keywords: string[];
  category: string;
}

interface Props {
  onClose: () => void;
}

export function CommandPalette({ onClose }: Props) {
  const router  = useRouter();
  const [query, setQuery]     = useState("");
  const [active, setActive]   = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  const COMMANDS: Command[] = [
    // Navigation
    { id: "dashboard",  label: "Go to Dashboard",   icon: Home,         category: "Navigation", keywords: ["home", "dashboard", "overview"], action: () => { router.push("/");            onClose(); } },
    { id: "upload",     label: "Upload CVs",         icon: Upload,       category: "Navigation", keywords: ["upload", "cv", "pdf", "ingest"], action: () => { router.push("/upload");      onClose(); } },
    { id: "candidates", label: "Browse Candidates",  icon: Users,        category: "Navigation", keywords: ["candidates", "list", "browse"],  action: () => { router.push("/candidates");  onClose(); } },
    { id: "search",     label: "Search Candidates",  icon: Search,       category: "Navigation", keywords: ["search", "find", "query"],       action: () => { router.push("/search");      onClose(); } },
    { id: "outreach",   label: "Outreach & Shortlist", icon: Mail,       category: "Navigation", keywords: ["outreach", "email", "shortlist"],action: () => { router.push("/outreach");    onClose(); } },
    { id: "analytics",  label: "View Analytics",     icon: BarChart2,    category: "Navigation", keywords: ["analytics", "charts", "data"],   action: () => { router.push("/analytics");   onClose(); } },
    { id: "settings",   label: "Settings",           icon: Settings,     category: "Navigation", keywords: ["settings", "config"],            action: () => { router.push("/settings");    onClose(); } },

    // Quick actions
    { id: "search-react",     label: "Search React developers",   subtitle: "Find React candidates",    icon: Zap, category: "Quick Search", keywords: ["react"],     action: () => { router.push("/search?q=React");          onClose(); } },
    { id: "search-python",    label: "Search Python developers",  subtitle: "Find Python candidates",   icon: Zap, category: "Quick Search", keywords: ["python"],    action: () => { router.push("/search?q=Python");         onClose(); } },
    { id: "search-devops",    label: "Search DevOps engineers",   subtitle: "Find DevOps candidates",   icon: Zap, category: "Quick Search", keywords: ["devops", "kubernetes", "docker"], action: () => { router.push("/search?q=DevOps"); onClose(); } },
    { id: "search-senior",    label: "Search Senior engineers",   subtitle: "5+ years experience",      icon: Zap, category: "Quick Search", keywords: ["senior"],    action: () => { router.push("/search?q=senior+engineer"); onClose(); } },
    { id: "shortlist",        label: "View Shortlist",            subtitle: "See saved candidates",     icon: BookmarkPlus, category: "Quick Actions", keywords: ["shortlist", "saved"], action: () => { router.push("/outreach"); onClose(); } },
  ];

  const filtered = query.trim()
    ? COMMANDS.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          c.keywords.some((k) => k.includes(q)) ||
          c.category.toLowerCase().includes(q)
        );
      })
    : COMMANDS;

  // Group by category
  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const flat = filtered;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, flat.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        flat[active]?.action();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flat, active, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector("[data-active='true']");
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let flatIndex = 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Palette container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -8 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{ opacity: 0,   scale: 0.97, y: -8  }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl rounded-2xl overflow-hidden"
          style={{
            background:  "rgba(8,13,22,0.97)",
            backdropFilter: "blur(32px) saturate(200%)",
            WebkitBackdropFilter: "blur(32px) saturate(200%)",
            border:      "1px solid rgba(148,163,184,0.12)",
            boxShadow:   "0 0 0 1px rgba(255,255,255,0.07) inset, 0 32px 64px rgba(0,0,0,0.85), 0 0 80px rgba(20,184,166,0.04)",
          }}
        >
          {/* Teal metallic top edge */}
          <div
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.45) 50%, transparent 100%)" }}
          />

          {/* Search input */}
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}
          >
            <Search strokeWidth={1.5} className="w-4 h-4 shrink-0" style={{ color: "rgba(100,116,139,0.7)" }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, candidates, actions..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "hsl(213,31%,92%)", caretColor: "#14b8a6" }}
            />
            <kbd
              className="font-mono-display text-[9px] px-1.5 py-0.5 rounded-md ml-1"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(148,163,184,0.12)", color: "rgba(100,116,139,0.8)" }}
            >
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {flat.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Search strokeWidth={1.5} className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No results for "{query}"</p>
              </div>
            ) : (
              Object.entries(grouped).map(([category, cmds]) => (
                <div key={category}>
                  <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider px-4 py-1.5">
                    {category}
                  </p>
                  {cmds.map((cmd) => {
                    const isActive = flat[active]?.id === cmd.id;
                    flatIndex++;
                    return (
                      <button
                        key={cmd.id}
                        data-active={isActive}
                        onClick={cmd.action}
                        className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-100 text-left"
                        style={{
                          background: isActive ? "rgba(20,184,166,0.08)" : "",
                          color: isActive ? "hsl(213,31%,92%)" : "rgba(100,116,139,0.85)",
                          borderLeft: isActive ? "2px solid rgba(20,184,166,0.6)" : "2px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = ""; }
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: isActive ? "rgba(20,184,166,0.12)" : "rgba(255,255,255,0.04)",
                            border: isActive ? "1px solid rgba(20,184,166,0.25)" : "1px solid rgba(148,163,184,0.10)",
                          }}
                        >
                          <cmd.icon
                            strokeWidth={1.5}
                            className="w-3.5 h-3.5"
                            style={{ color: isActive ? "#14b8a6" : "rgba(100,116,139,0.7)" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ color: isActive ? "hsl(213,31%,92%)" : "hsl(213,31%,78%)" }}>
                            {cmd.label}
                          </p>
                          {cmd.subtitle && (
                            <p className="text-[10px] truncate" style={{ color: "rgba(100,116,139,0.6)" }}>  
                              {cmd.subtitle}
                            </p>
                          )}
                        </div>
                        {isActive && (
                          <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0" style={{ color: "#14b8a6" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center gap-4 px-4 py-2.5"
            style={{ borderTop: "1px solid rgba(148,163,184,0.07)" }}
          >
            {[["↑↓", "navigate"], ["↵", "select"], ["ESC", "close"]].map(([k, label]) => (
              <div key={k} className="flex items-center gap-1.5">
                <kbd
                  className="font-mono-display text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(148,163,184,0.12)", color: "rgba(100,116,139,0.7)" }}
                >
                  {k}
                </kbd>
                <span className="text-[10px]" style={{ color: "rgba(100,116,139,0.5)" }}>{label}</span>
              </div>
            ))}
            <div className="ml-auto text-[10px] font-mono-display" style={{ color: "rgba(100,116,139,0.45)" }}>
              {flat.length} result{flat.length !== 1 ? "s" : ""}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
