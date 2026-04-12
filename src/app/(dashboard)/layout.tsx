"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Sidebar }        from "@/components/layout/Sidebar";
import { Topbar }         from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { useAuth }        from "@/context/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname                  = usePathname();
  const router                    = useRouter();
  const { user, isLoading }       = useAuth();
  const [cmdOpen,   setCmdOpen]   = useState(false);

  // Auth guard — redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Show spinner while auth resolves or redirecting
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden md:pl-[14px]">
        <Topbar onOpenCommandPalette={() => setCmdOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8  }}
              animate={{ opacity: 1, y: 0  }}
              exit={{ opacity: 0,    y: -8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="px-6 py-6 max-w-screen-2xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
      </AnimatePresence>

    </div>
  );
}
