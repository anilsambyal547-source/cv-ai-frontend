import { Star, TrendingUp } from "lucide-react";
import { GlassCard }         from "@/components/ui/glass-card";

const matches = [
  { name: "Sarah Johnson",  role: "Senior React Developer", score: 96 },
  { name: "Michael Chen",   role: "Full Stack Engineer",    score: 91 },
  { name: "Priya Sharma",   role: "ML Engineer",            score: 88 },
  { name: "James Wilson",   role: "DevOps Engineer",        score: 84 },
  { name: "Amara Okafor",   role: "Backend Engineer",       score: 79 },
];

function getScoreColor(score: number) {
  if (score >= 90) return { color: "#22c55e", glow: "rgba(34,197,94,0.5)"  };
  if (score >= 80) return { color: "#3b82f6", glow: "rgba(59,130,246,0.5)" };
  return               { color: "#f59e0b", glow: "rgba(245,158,11,0.5)"  };
}

export function TopMatches() {
  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Star strokeWidth={1.5} className="w-4 h-4 text-amber-400" />
        Top Matches
      </h3>
      <ul className="space-y-3">
        {matches.map((m, i) => {
          const { color, glow } = getScoreColor(m.score);
          const initials = m.name.split(" ").map((n) => n[0]).join("");
          return (
            <li key={i} className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/25 to-purple-500/25 border border-white/10 flex items-center justify-center text-xs font-semibold text-foreground shrink-0 group-hover:border-white/20 transition-colors">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground truncate">{m.role}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <TrendingUp strokeWidth={1.5} className="w-3 h-3" style={{ color }} />
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color, textShadow: `0 0 10px ${glow}` }}
                >
                  {m.score}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}