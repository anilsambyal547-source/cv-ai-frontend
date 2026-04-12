import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid
} from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { useChartTheme } from "@/hooks/useChartTheme";

const data = [
  { range: "0–1 yr", count: 12 },
  { range: "1–3 yr", count: 34 },
  { range: "3–5 yr", count: 28 },
  { range: "5–8 yr", count: 19 },
  { range: "8+ yr",  count:  9 },
];

export function ExperienceChart() {
  const t = useChartTheme();

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-foreground mb-4">Experience Distribution</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barCategoryGap="35%">
          <defs>
            {data.map((_, i) => (
              <linearGradient key={i} id={`bg-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={t.colors.primary} stopOpacity={0.9} />
                <stop offset="100%" stopColor={t.colors.secondary} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={t.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fill: t.text, fontSize: 11 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: t.text, fontSize: 11 }}
            axisLine={false} tickLine={false} width={28}
          />
          <Tooltip
            contentStyle={{
              background:   t.tooltip.bg,
              border:       `1px solid ${t.tooltip.border}`,
              borderRadius: "10px",
              fontSize:     "12px",
              color:        t.tooltip.text,
              boxShadow:    "0 8px 32px rgba(0,0,0,0.15)",
              backdropFilter: "blur(12px)",
            }}
            itemStyle={{ color: t.tooltip.text }}
            cursor={{ fill: t.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
            formatter={(val: any) => [val, "Candidates"]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`url(#bg-${i})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}