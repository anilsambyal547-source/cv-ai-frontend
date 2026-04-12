import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type TagVariant = "default" | "blue" | "green" | "amber" | "purple" | "red";

interface TagProps {
  label:      string;
  variant?:   TagVariant;
  removable?: boolean;
  onClick?:   () => void;
  onRemove?:  () => void;
}

const variants: Record<TagVariant, string> = {
  default: "bg-white/5  border-white/10  text-muted-foreground hover:bg-white/10",
  blue:    "bg-blue-500/10   border-blue-500/20   text-blue-300   hover:bg-blue-500/20",
  green:   "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20",
  amber:   "bg-amber-500/10  border-amber-500/20  text-amber-300  hover:bg-amber-500/20",
  purple:  "bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20",
  red:     "bg-red-500/10    border-red-500/20    text-red-300    hover:bg-red-500/20",
};

export function Tag({ label, variant = "default", removable, onClick, onRemove }: TagProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all",
        onClick ? "cursor-pointer" : "cursor-default",
        variants[variant]
      )}
    >
      {label}
      {removable && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}