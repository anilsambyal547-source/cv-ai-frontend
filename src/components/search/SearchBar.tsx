"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Clock, Loader2, Sparkles } from "lucide-react";

const RECENT_KEY = "cv_ai_recent_searches";

const SUGGESTIONS = [
  "Senior Python engineer with AWS",
  "React developer 5 years TypeScript",
  "Machine learning engineer PyTorch",
  "DevOps engineer Kubernetes Docker",
  "Full stack developer Node.js PostgreSQL",
];

interface Props {
  onSearch:      (query: string) => void;
  loading?:      boolean;
  defaultValue?: string;
}

export function SearchBar({ onSearch, loading, defaultValue = "" }: Props) {
  const [value,   setValue]   = useState(defaultValue);
  const [recent,  setRecent]  = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")); } catch {}
  }, []);

  useEffect(() => {
    if (defaultValue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(defaultValue);
      onSearch(defaultValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  function saveRecent(q: string) {
    const updated = [q, ...recent.filter((r) => r !== q)].slice(0, 8);
    setRecent(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  }

  function handleSubmit(q: string) {
    if (!q.trim()) return;
    saveRecent(q.trim());
    onSearch(q.trim());
    setFocused(false);
    inputRef.current?.blur();
  }

  function clearRecent() {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  }

  const showDropdown = focused && (recent.length > 0 || (!value && SUGGESTIONS.length > 0));

  return (
    <div className="relative w-full">
      <div className={`flex items-center gap-3 h-12 px-4 rounded-2xl border transition-all duration-200 ${
        focused
          ? "border-blue-500/50 bg-white/8 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
          : "border-white/10 bg-white/5 hover:border-white/20"
      } backdrop-blur-md`}>

        {loading
          ? <Loader2 strokeWidth={1.5} className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
          : <Search  strokeWidth={1.5} className="w-4 h-4 text-muted-foreground shrink-0" />
        }

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={(e) => {
            if (e.key === "Enter")  handleSubmit(value);
            if (e.key === "Escape") { setValue(""); setFocused(false); inputRef.current?.blur(); }
          }}
          placeholder='Search candidates — e.g. "Senior Python engineer with AWS"'
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
        />

        {value && (
          <button
            onClick={() => { setValue(""); inputRef.current?.focus(); }}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X strokeWidth={1.5} className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => handleSubmit(value)}
          disabled={!value.trim() || !!loading}
          className="shrink-0 px-4 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-all"
        >
          Search
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 overflow-hidden"
          >
            {recent.length > 0 && (
              <>
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Recent
                  </span>
                  <button
                    onClick={clearRecent}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {recent.map((r) => (
                  <button
                    key={r}
                    onMouseDown={() => { setValue(r); handleSubmit(r); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                  >
                    <Clock strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />
                    {r}
                  </button>
                ))}
              </>
            )}

            {!value && (
              <>
                <div className="px-3 py-2 border-t border-white/5">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Try searching for
                  </span>
                </div>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => { setValue(s); handleSubmit(s); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                  >
                    <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0 text-blue-400/60" />
                    {s}
                  </button>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Need to import these at the top
import { AnimatePresence, motion } from "framer-motion";