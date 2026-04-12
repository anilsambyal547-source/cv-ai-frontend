import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { useChartTheme } from "@/hooks/useChartTheme";

interface Props {
  data?:    { skill: string; count: number }[];
  loading?: boolean;
}

export function SkillRadarChart({ data, loading }: Props) {
  const t = useChartTheme();
  const chartData = (data && data.length > 0)
    ? data.slice(0, 8).map((d) => ({ skill: d.skill, value: d.count }))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-panel relative p-5 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <h3 className="text-sm font-medium text-foreground mb-1">Skill Distribution</h3>
      <p className="text-xs text-muted-foreground mb-4">
        {loading ? "Loading..." : data && data.length > 0 ? "Top skills across all candidates" : "No skills data yet"}
      </p>

      {loading ? (
        <div className="h-60 rounded-xl bg-muted animate-pulse" />
      ) : chartData.length === 0 ? (
        <div className="h-60 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Upload CVs to see skill distribution</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={chartData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
            <defs>
              <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={t.colors.primary} stopOpacity={0.4} />
                <stop offset="100%" stopColor={t.colors.primary} stopOpacity={0.05} />
              </radialGradient>
            </defs>
            <PolarGrid stroke={t.grid} gridType="polygon" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: t.text, fontSize: 10 }}
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
            />
            <Radar
              name="Candidates"
              dataKey="value"
              stroke={t.colors.primary}
              strokeWidth={2}
              fill="url(#radarGrad)"
              dot={{ fill: t.colors.primary, r: 3, strokeWidth: 0 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}