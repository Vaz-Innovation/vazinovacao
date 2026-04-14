import { cn } from "@/lib/utils";

interface CategoryFilterItemProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  count?: number | null;
}

export function CategoryFilterItem({
  label,
  active = false,
  onClick,
  count,
}: CategoryFilterItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-foreground/40 bg-foreground text-background"
          : "border-foreground/15 bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
      aria-pressed={active}
    >
      <span>{label}</span>
      {typeof count === "number" && count > 0 ? (
        <span className={cn("opacity-80", active ? "text-background/80" : "text-muted-foreground")}>{count}</span>
      ) : null}
    </button>
  );
}
