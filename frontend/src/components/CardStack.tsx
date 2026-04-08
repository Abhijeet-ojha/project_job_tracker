import { Application, ColumnId } from "@/types/application";

const STATUS_PILL: Record<ColumnId, { label: string; classes: string; dot: string }> = {
  applied: {
    label: "Applied",
    classes: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  screening: {
    label: "Phone Screen",
    classes: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  interview: {
    label: "Interview",
    classes: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  offer: {
    label: "Offer",
    classes: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};

// Stacking offsets — at most 3 cards shown
const STACK_OFFSETS = [
  { y: 0, scale: 1, opacity: 1, z: 30 },
  { y: 14, scale: 0.965, opacity: 0.76, z: 20 },
  { y: 26, scale: 0.93, opacity: 0.5, z: 10 },
];

interface CardStackProps {
  applications: Application[];
  columnId: ColumnId;
  onClick: () => void;
}

const CardStack = ({ applications, columnId, onClick }: CardStackProps) => {
  const pill = STATUS_PILL[columnId];
  const total = applications.length;
  const visibleCount = Math.min(total, 3);
  const visible = applications.slice(0, visibleCount);
  const extra = total - visibleCount;

  // Empty column placeholder
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 h-28 rounded-xl border-2 border-dashed border-border/25 text-center">
        <span className="text-muted-foreground/30 text-xs font-medium uppercase tracking-wider">
          Empty
        </span>
      </div>
    );
  }

  // Container height = base card (~130px) + stacking offsets + badge row
  const stackedOffset = (visibleCount - 1) * 14;
  const containerH = 132 + stackedOffset + 28; // 28px for badge row

  return (
    <div
      className="relative cursor-pointer"
      style={{ height: `${containerH}px` }}
      onClick={onClick}
    >
      {/* Render cards reversed so first card visually sits on top */}
      {[...visible].reverse().map((app, reversedIdx) => {
        const idx = visibleCount - 1 - reversedIdx;
        const offset = STACK_OFFSETS[idx] ?? STACK_OFFSETS[2];

        return (
          <div
            key={app.id}
            className="absolute inset-x-0 top-0 rounded-xl border border-border/60 bg-card px-4 py-3.5 shadow-[0_2px_8px_-2px_rgba(42,52,57,0.08)] transition-transform duration-200 ease-out group-hover:shadow-[0_4px_16px_-4px_rgba(42,52,57,0.14)]"
            style={{
              transform: `translateY(${offset.y}px) scale(${offset.scale})`,
              opacity: offset.opacity,
              zIndex: offset.z,
            }}
          >
            {/* Header row: company + status pill */}
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-[14px] text-foreground leading-tight truncate flex-1">
                {app.company}
              </p>
              <span
                className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${pill.classes}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
                {pill.label}
              </span>
            </div>

            {/* Role */}
            <p className="mt-0.5 text-[12px] text-muted-foreground font-medium leading-tight truncate">
              {app.role}
            </p>

            {/* Skills */}
            {app.skills.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {app.skills.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-surface-container dark:bg-surface-container px-2 py-0.5 text-[10px] font-medium text-foreground/80"
                  >
                    {s}
                  </span>
                ))}
                {app.skills.length > 2 && (
                  <span className="rounded-md bg-primary/8 dark:bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    +{app.skills.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom badge — "+N more · View all →" */}
      <div
        className="absolute bottom-0 right-0 left-0 flex items-center justify-end gap-2 px-1"
        style={{ zIndex: 40 }}
      >
        {extra > 0 && (
          <span className="text-[11px] font-semibold text-muted-foreground/70">
            +{extra} more
          </span>
        )}
        <span className="text-[11px] font-semibold text-primary/80 hover:text-primary transition-colors">
          View all →
        </span>
      </div>
    </div>
  );
};

export default CardStack;
