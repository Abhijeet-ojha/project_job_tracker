import { COLUMNS } from "@/types/application";

const KanbanSkeleton = () => {
  return (
    <div className="flex gap-5 overflow-x-auto px-6 py-6">
      {COLUMNS.map((col) => (
        <div
          key={col.id}
          className="flex w-[280px] shrink-0 flex-col rounded-xl bg-surface-container-high/50"
        >
          {/* Column header */}
          <div className="flex items-center gap-2.5 px-4 py-3.5">
            <div className="h-3 w-20 rounded-full bg-surface-container animate-pulse" />
            <div className="h-5 w-6 rounded-full bg-surface-container animate-pulse" />
          </div>

          {/* Skeleton cards */}
          <div className="flex flex-1 flex-col gap-3 px-3 pb-3 min-h-[140px]">
            {Array.from({ length: col.id === "applied" ? 3 : col.id === "screening" ? 2 : 1 }).map(
              (_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-card p-4 space-y-3"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Company */}
                  <div className="h-4 w-3/4 rounded-full bg-surface-container animate-pulse" />
                  {/* Role */}
                  <div className="h-3 w-1/2 rounded-full bg-surface-container animate-pulse" />
                  {/* Date */}
                  <div className="h-3 w-1/3 rounded-full bg-surface-container animate-pulse" />
                  {/* Skill tags */}
                  <div className="flex gap-1.5">
                    <div className="h-5 w-14 rounded-md bg-surface-container animate-pulse" />
                    <div className="h-5 w-16 rounded-md bg-surface-container animate-pulse" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanSkeleton;
