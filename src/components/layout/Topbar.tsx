"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, Sun, Moon,
  LogOut, Settings, ChevronDown, Command,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth }  from "@/context/AuthContext";

// ── Page title map ────────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  "/":           "Dashboard",
  "/upload":     "Upload CVs",
  "/candidates": "Candidates",
  "/search":     "Search",
  "/outreach":   "Outreach",
  "/analytics":  "Analytics",
  "/settings":   "Settings",
};

interface Props {
  onOpenCommandPalette: () => void;
}

// ── Icon button ───────────────────────────────────────────────────────────────
function IconBtn({
  onClick, label, children, active = false,
}: {
  onClick?: () => void;
  label:    string;
  children: React.ReactNode;
  active?:  boolean;
}) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <button
        aria-label={label}
        onClick={onClick}
        className={
          "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 " +
          "text-muted-foreground hover:text-foreground " +
          (active ? "topbar-btn-active" : "topbar-btn")
        }
      >
        {children}
      </button>

      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-1 rounded-lg text-[10px] whitespace-nowrap pointer-events-none z-50 topbar-tooltip"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Topbar ───────────────────────────────────────────────────────────────
export function Topbar({ onOpenCommandPalette }: Props) {
  const router              = useRouter();
  const pathname            = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout }    = useAuth();

  const [mounted,  setMounted]  = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const pageTitle = PAGE_TITLES[pathname] ?? "CV AI";
  const isDark    = mounted && theme === "dark";
  const initials  = (user?.username ?? "A")
    .split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="topbar h-[57px] shrink-0 sticky top-0 z-30 flex items-center gap-4 px-5 md:px-6 pl-16 md:pl-6">
      {/* Metallic top edge */}
      <div className="topbar-edge absolute inset-x-0 top-0 h-px pointer-events-none" />

      {/* Page title */}
      <div className="hidden md:flex items-center gap-2.5 min-w-0">
        <h2 className="text-sm font-semibold text-foreground tracking-tight truncate">
          {pageTitle}
        </h2>
        <div className="status-dot-teal" />
      </div>

      <div className="flex-1" />

      {/* Command palette trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-150 text-xs topbar-search"
      >
        <Search strokeWidth={1.5} className="w-3.5 h-3.5" />
        <span>Search anything...</span>
        <kbd className="flex items-center gap-0.5 ml-1 font-mono-display text-[9px] px-1.5 py-0.5 rounded-md topbar-kbd">
          <Command strokeWidth={1.5} className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      {/* Action strip */}
      <div className="flex items-center gap-1.5">

        {/* Mobile search */}
        <IconBtn onClick={onOpenCommandPalette} label="Command palette (⌘K)">
          <Search strokeWidth={1.5} className="w-4 h-4 sm:hidden" />
        </IconBtn>

        {/* Notifications */}
        <IconBtn label="Notifications">
          <div className="relative">
            <Bell strokeWidth={1.5} className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-teal-500"
              style={{ boxShadow: "0 0 4px rgba(20,184,166,0.8)" }} />
          </div>
        </IconBtn>

        {/* Theme toggle */}
        <IconBtn
          label={!mounted ? "Toggle theme" : isDark ? "Switch to light" : "Switch to dark"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {!mounted
            ? <div className="w-4 h-4" />
            : isDark
              ? <Sun  strokeWidth={1.5} className="w-4 h-4" />
              : <Moon strokeWidth={1.5} className="w-4 h-4" />}
        </IconBtn>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenu((v) => !v)}
            className="flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-150 topbar-btn"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{
                background: "linear-gradient(135deg, rgba(20,184,166,0.5) 0%, rgba(59,130,246,0.5) 100%)",
                border:     "1px solid rgba(20,184,166,0.30)",
              }}
            >
              {initials}
            </div>
            <span className="text-xs hidden sm:block text-foreground">{user?.username ?? "Admin"}</span>
            <ChevronDown
              strokeWidth={1.5}
              className={`w-3 h-3 transition-transform duration-150 ${userMenu ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {userMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{ opacity: 0,   y: -4, scale: 0.97  }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-1.5 w-48 rounded-xl z-50 overflow-hidden topbar-dropdown"
                >
                  {/* User info header */}
                  <div className="px-3 py-2.5 topbar-dropdown-header">
                    <p className="text-xs font-semibold text-foreground">
                      {user?.username ?? "Admin"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                      {user?.role ?? "admin"} · CV AI Platform
                    </p>
                  </div>

                  <button
                    onClick={() => { router.push("/settings"); setUserMenu(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors topbar-dropdown-item"
                  >
                    <Settings strokeWidth={1.5} className="w-3.5 h-3.5" />
                    Settings
                  </button>

                  <button
                    onClick={() => { logout(); setUserMenu(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/8 transition-colors"
                  >
                    <LogOut strokeWidth={1.5} className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
