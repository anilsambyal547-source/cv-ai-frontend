"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, Upload, Users, Search,
  Mail, BarChart2, Settings, LogOut, X, Menu,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ── Width constants ───────────────────────────────────────────────────────────
const DRAWER_W   = 236;   // full open width (px)
const GRAB_W     = 14;    // visible peek strip (px) when closed
const HIDDEN_X   = -(DRAWER_W - GRAB_W); // translateX when closed → -222px

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV = [
  { href: "/",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/upload",     label: "Upload",     icon: Upload           },
  { href: "/candidates", label: "Candidates", icon: Users            },
  { href: "/search",     label: "Search",     icon: Search           },
  { href: "/outreach",   label: "Outreach",   icon: Mail             },
  { href: "/analytics",  label: "Analytics",  icon: BarChart2        },
  { href: "/settings",   label: "Settings",   icon: Settings         },
];

// ── Spring cubic-bezier (Apple-feel) ─────────────────────────────────────────
const SPRING = "cubic-bezier(0.25, 1, 0.5, 1)";

// ── Shared inner nav item (reused in both desktop + mobile) ───────────────────
function NavLink({
  href, label, icon: Icon, onClick,
}: {
  href: string; label: string; icon: React.ElementType; onClick?: () => void;
}) {
  const pathname = usePathname();
  const active   = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 outline-none"
      style={{
        background:  active ? "rgba(20,184,166,0.12)" : "transparent",
        color:       active ? "#14b8a6"               : "rgba(148,163,184,0.75)",
        borderLeft:  active ? "2px solid rgba(20,184,166,0.6)" : "2px solid transparent",
        boxShadow:   active ? "0 0 12px rgba(20,184,166,0.08)"  : "none",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
          (e.currentTarget as HTMLAnchorElement).style.color = "rgba(226,232,240,0.9)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          (e.currentTarget as HTMLAnchorElement).style.color = "rgba(148,163,184,0.75)";
        }
      }}
    >
      <Icon
        strokeWidth={active ? 2 : 1.5}
        className="w-4 h-4 shrink-0"
        style={{ color: active ? "#14b8a6" : "inherit" }}
      />
      <span className="truncate">{label}</span>

      {/* Teal glow dot for active */}
      {active && (
        <span
          className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: "#14b8a6", boxShadow: "0 0 6px rgba(20,184,166,0.8)" }}
        />
      )}
    </Link>
  );
}

// ── Proximity Drawer (desktop) ────────────────────────────────────────────────
function ProximityDrawer() {
  const [open, setOpen] = useState(false);
  const closeTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, logout } = useAuth();
  const pathname         = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);
  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const initials = (user?.username ?? "A")
    .split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  // Delayed close so cursor can reach nav items without flicker
  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }
  function handleMouseEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="hidden md:flex flex-col fixed left-0 top-0 h-screen z-[60] overflow-hidden select-none"
      style={{
        width: DRAWER_W,
        // iOS Glassmorphism
        background:          "rgba(10, 14, 22, 0.55)",
        backdropFilter:      "blur(25px) saturate(160%)",
        WebkitBackdropFilter:"blur(25px) saturate(160%)",
        borderRight:         "1px solid rgba(255,255,255,0.08)",
        boxShadow:           open
          ? "0 8px 40px rgba(0,0,0,0.55), 4px 0 0 rgba(20,184,166,0.04) inset"
          : "0 4px 16px rgba(0,0,0,0.35)",
        // Spring slide
        transform:  open ? "translateX(0)" : `translateX(${HIDDEN_X}px)`,
        transition: `transform 0.4s ${SPRING}, box-shadow 0.3s ease`,
      }}
    >
      {/* Teal edge — visible always on the grab strip */}
      <div
        className="absolute right-0 top-0 bottom-0 w-px pointer-events-none"
        style={{
          background: open
            ? "linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.25) 50%, transparent 100%)"
            : "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
          transition: `background 0.4s ease`,
        }}
      />

      {/* Grab hint — the subtle vertical pill visible when closed */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-10 rounded-full pointer-events-none transition-opacity duration-300"
        style={{
          background: "rgba(20,184,166,0.35)",
          right: 0,
          opacity: open ? 0 : 1,
        }}
      />

      {/* ── Logo strip ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 h-[57px] shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm text-white"
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)",
            boxShadow:  "0 0 16px rgba(20,184,166,0.35), 0 0 0 1px rgba(20,184,166,0.25) inset",
          }}
        >
          C
        </div>
        <div
          className="flex flex-col min-w-0 transition-opacity duration-200"
          style={{ opacity: open ? 1 : 0 }}
        >
          <span className="text-sm font-semibold text-slate-100 tracking-tight leading-none">
            CV AI
          </span>
          <span className="text-[10px] text-slate-500 tracking-widest uppercase mt-0.5">
            Recruiting
          </span>
        </div>
      </div>

      {/* ── Nav section label ──────────────────────────────────────────────── */}
      <div
        className="px-4 pt-4 pb-1 transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0 }}
      >
        <span className="section-label">Navigation</span>
      </div>

      {/* ── Nav links ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div
        className="p-2 space-y-1 shrink-0 transition-opacity duration-200"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          opacity: open ? 1 : 0,
        }}
      >
        {/* User info */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl">
          <div
            className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{
              background: "linear-gradient(135deg, rgba(20,184,166,0.3) 0%, rgba(59,130,246,0.3) 100%)",
              border:     "1px solid rgba(20,184,166,0.25)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">
              {user?.username ?? "Admin"}
            </p>
            <p className="text-[10px] text-slate-500 capitalize">
              {user?.role ?? "admin"}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl transition-all duration-150 text-xs font-medium"
          style={{ color: "rgba(100,116,139,0.8)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(100,116,139,0.8)";
            (e.currentTarget as HTMLButtonElement).style.background = "";
          }}
        >
          <LogOut strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ── Mobile hamburger + full-screen drawer ─────────────────────────────────────
function MobileDrawer() {
  const [open, setOpen]  = useState(false);
  const { user, logout } = useAuth();
  const pathname         = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  const initials = (user?.username ?? "A")
    .split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="md:hidden fixed top-3.5 left-4 z-[65] w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
        style={{
          background:          "rgba(10,14,22,0.88)",
          backdropFilter:      "blur(12px)",
          border:              "1px solid rgba(255,255,255,0.08)",
          boxShadow:           "0 2px 8px rgba(0,0,0,0.5)",
        }}
      >
        <Menu strokeWidth={1.5} className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="md:hidden fixed inset-0 z-[62]"
              style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-60 z-[63] flex flex-col"
              style={{
                background:          "rgba(10,14,22,0.96)",
                backdropFilter:      "blur(25px) saturate(160%)",
                borderRight:         "1px solid rgba(255,255,255,0.08)",
                boxShadow:           "8px 0 32px rgba(0,0,0,0.7)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 h-[57px] shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                    style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)" }}
                  >
                    C
                  </div>
                  <span className="text-sm font-semibold text-slate-100">CV AI</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-colors"
                >
                  <X strokeWidth={1.5} className="w-4 h-4" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                {NAV.map((item) => (
                  <NavLink key={item.href} {...item} onClick={() => setOpen(false)} />
                ))}
              </nav>

              {/* User */}
              <div
                className="p-3 space-y-1 shrink-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-3 px-2 py-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, rgba(20,184,166,0.3) 0%, rgba(59,130,246,0.3) 100%)",
                      border:     "1px solid rgba(20,184,166,0.25)",
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-200">{user?.username ?? "Admin"}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user?.role ?? "admin"}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all"
                >
                  <LogOut strokeWidth={1.5} className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────
// Props are kept for layout compatibility but collapse state is gone.
export function Sidebar(_props: { collapsed?: boolean; onCollapse?: (v: boolean) => void }) {
  return (
    <>
      <ProximityDrawer />
      <MobileDrawer />
    </>
  );
}
