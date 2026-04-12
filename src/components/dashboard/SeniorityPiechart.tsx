"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

const data = [
  { name: "Junior",    value: 35, color: "#6366f1" },
  { name: "Mid-level", value: 42, color: "#3b82f6" },
  { name: "Senior",    value: 18, color: "#0ea5e9" },
  { name: "Lead/Staff", value: 5, color: "#38bdf8" },
];

export function SeniorityPieChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 overflow-hidden"
      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.05) inset, 0 4px 24px rgba(0,0,0,0.3)" }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <h3 className="text-sm font-medium text-foreground mb-1">Seniority Breakdown</h3>
      <p className="text-xs text-muted-foreground mb-2">Candidate seniority levels</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <defs>
            {data.map((entry, i) => (
              <radialGradient key={i} id={`pieGlow${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={entry.color} stopOpacity={1} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
              </radialGradient>
            ))}
          </defs>
          <Pie
            data={data}
            cx="50%" cy="45%"
            innerRadius={55} outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={`url(#pieGlow${index})`}
                style={{ filter: `drop-shadow(0 0 6px ${entry.color}80)` }}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(15,15,20,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "white",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={6}
            formatter={(value) => (
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}