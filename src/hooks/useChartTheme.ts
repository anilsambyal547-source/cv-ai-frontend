"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Hook to provide theme-aware colors for Recharts.
 * Many Recharts props don't support CSS variables directly (HSL strings),
 * so we provide resolved values.
 */
export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to dark theme colors during SSR
  const isDark = !mounted || resolvedTheme === "dark";

  return {
    isDark,
    grid: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    axis: isDark ? "rgba(255, 255, 255, 0.4)"  : "rgba(0, 0, 0, 0.45)",
    text: isDark ? "rgba(255, 255, 255, 0.5)"  : "rgba(0, 0, 0, 0.6)",
    tooltip: {
      bg:     isDark ? "rgba(10, 15, 24, 0.95)" : "rgba(255, 255, 255, 0.98)",
      border: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
      text:   isDark ? "#f1f5f9" : "#0f172a",
    },
    colors: {
      primary: "#3b82f6",
      secondary: "#6366f1",
      accent: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      teal: "#14b8a6",
      electric: "#2563eb",
      steel: isDark ? "#94a3b8" : "#64748b",
    }
  };
}
