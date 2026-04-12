import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-card/60 backdrop-blur-md shadow-glass p-5",
        hover && "transition-all duration-200 hover:bg-card/80 hover:border-white/15 hover:shadow-deep hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}