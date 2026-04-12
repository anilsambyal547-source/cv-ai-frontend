import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { useChartTheme } from "@/hooks/useChartTheme";

interface Props {
  data?: { range: string; count: number }[];
  loading?: boolean;
}

const FALLBACK = [
  { range: "0-1y",  count: 0 },
  { range: "1-3y",  count: 0 },
  { range: "3-5y",  count: 0 },
  { range: "5-8y",  count: 0 },
  { range: "8-12y", count: 0 },
  { range: "12y+",  count: 0 },
];

export function ExperienceHistogram({ data, loading }: Props) {
  const t = useChartTheme();
  const chartData = data
    ? data.map((d) => ({ range: d.range, count: d.count }))
    : FALLBACK;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-panel relative p-5 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <h3 className="text-sm font-medium text-foreground mb-1">Experience Distribution</h3>
      <p className="text-xs text-muted-foreground mb-4">
        {loading ? "Loading..." : "Candidates by years of experience"}
      </p>
      {loading ? (
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={28} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={t.colors.primary}   stopOpacity={0.9} />
                <stop offset="100%" stopColor={t.colors.secondary} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={t.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="range"
              tick={{ fill: t.text, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: t.text, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background:   t.tooltip.bg,
                border:       `1px solid ${t.tooltip.border}`,
                borderRadius: "10px",
                fontSize:     "12px",
                color:        t.tooltip.text,
                boxShadow:    "0 8px 32px rgba(0,0,0,0.12)",
                backdropFilter: "blur(12px)",
              }}
              itemStyle={{ color: t.tooltip.text }}
              cursor={{ fill: t.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
            />
            <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill="url(#barGrad)" />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}