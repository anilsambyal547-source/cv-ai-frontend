"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title:      string;
  value:      string | number;
  change?:    string;
  positive?:  boolean;
  icon:       LucideIcon;
  accentColor?: string;  /* e.g. "#14b8a6" */
  delay?:     number;
  loading?:   boolean;
}

export function MetricCard({
  title, value, change, positive = true,
  icon: Icon,
  accentColor = "#14b8a6",
  delay = 0,
  loading = false,
}: MetricCardProps) {

  if (loading) {
    return (
      <div className="glass-panel p-5 animate-pulse overflow-hidden">
        <div className="flex items-start justify-between mb-5">
          <div className="w-9 h-9 rounded-xl bg-muted" />
          <div className="w-12 h-5 rounded-full bg-muted" />
        </div>
        <div className="w-24 h-8 rounded-lg mb-2 bg-muted" />
        <div className="w-32 h-3.5 rounded-lg bg-muted/60" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="glass-panel relative p-5 overflow-hidden cursor-default group"
    >
      {/* Top metallic edge — always subtle, accent on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentColor}40 50%, transparent 100%)`,
        }}
      />

      {/* Hover glow from accent color */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"
        style={{ background: `${accentColor}20` }}
      />

      {/* Bottom faint glow */}
      <div
        className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700 blur-3xl pointer-events-none"
        style={{ background: `${accentColor}15` }}
      />

      {/* Icon + badge row */}
      <div className="flex items-start justify-between mb-5 relative">
        {/* Icon container — glass square */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: `${accentColor}18`,
            border:     `1px solid ${accentColor}30`,
          }}
        >
          <Icon
            strokeWidth={1.5}
            className="w-4 h-4"
            style={{ color: accentColor }}
          />
        </div>

        {/* Change badge */}
        {change && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono-display border"
            style={{
              color:   positive ? "#10b981" : "#ef4444",
              background: positive ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)",
              borderColor: positive ? "rgba(16,185,129,0.20)" : "rgba(239,68,68,0.20)",
            }}
          >
            {positive ? "▲" : "▼"} {change}
          </span>
        )}
      </div>

      {/* Value */}
      <p
        className="metric-value mb-1"
        style={{ textShadow: `0 0 20px ${accentColor}30` }}
      >
        {value}
      </p>

      {/* Title */}
      <p className="text-xs text-muted-foreground font-medium tracking-wide">{title}</p>

      {/* Bottom accent line — on hover */}
      <div
        className="absolute bottom-0 inset-x-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)` }}
      />
    </motion.div>
  );
}