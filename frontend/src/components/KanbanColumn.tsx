import { Droppable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { Application, ColumnId } from "@/types/application";

// ─── Stack layout ─────────────────────────────────────────────────────────────
// Compact offsets — x spread + y offset + scale taper + subtle rotation
const STACK = [
  { x: 0,  y: 0,  scale: 1,     opacity: 1,    rotate:  0,   z: 40 },
  { x: 4,  y: 14, scale: 0.985, opacity: 0.72, rotate: -0.6, z: 30 },
  { x: 8,  y: 26, scale: 0.970, opacity: 0.48, rotate:  0.5, z: 20 },
  { x: 12, y: 36, scale: 0.955, opacity: 0.28, rotate: -0.4, z: 10 },
];

const MAX_STACK = STACK.length;
const CARD_H = 128; // Compact height for stacked preview cards

// ─── Per-column theming ───────────────────────────────────────────────────────
const COLUMN_ACCENT: Record<ColumnId, string> = {
  applied:   "bg-blue-500",
  screening: "bg-amber-500",
  interview: "bg-violet-500",
  offer:     "bg-emerald-500",
  rejected:  "bg-rose-500",
};

const COLUMN_GLOW_COLOR: Record<ColumnId, string> = {
  applied:   "rgba(59,130,246,0.6)",
  screening: "rgba(245,158,11,0.6)",
  interview: "rgba(139,92,246,0.6)",
  offer:     "rgba(16,185,129,0.6)",
  rejected:  "rgba(244,63,94,0.6)",
};

const COLUMN_RING: Record<ColumnId, string> = {
  applied:   "ring-blue-400",
  screening: "ring-amber-400",
  interview: "ring-violet-400",
  offer:     "ring-emerald-400",
  rejected:  "ring-rose-400",
};

const COLUMN_ACCENT_TEXT: Record<ColumnId, string> = {
  applied:   "text-blue-500",
  screening: "text-amber-500",
  interview: "text-violet-500",
  offer:     "text-emerald-500",
  rejected:  "text-rose-500",
};

const COLUMN_DROP_BG: Record<ColumnId, string> = {
  applied:   "bg-blue-500/8 dark:bg-blue-500/12",
  screening: "bg-amber-500/8 dark:bg-amber-500/12",
  interview: "bg-violet-500/8 dark:bg-violet-500/12",
  offer:     "bg-emerald-500/8 dark:bg-emerald-500/12",
  rejected:  "bg-rose-500/8 dark:bg-rose-500/12",
};

// Pill badge for the top card preview
const STATUS_DOT: Record<ColumnId, string> = {
  applied:   "bg-blue-500",
  screening: "bg-amber-500",
  interview: "bg-violet-500",
  offer:     "bg-emerald-500",
  rejected:  "bg-rose-500",
};

// ─── Component ────────────────────────────────────────────────────────────────
interface KanbanColumnProps {
  id: ColumnId;
  title: string;
  applications: Application[];
  onDelete: (id: string) => void;
  deletingId?: string | null;
  onOpen: () => void;
  /** True when a custom-drag ghost is hovering over this column */
  isCustomDragTarget?: boolean;
}

const KanbanColumn = ({
  id,
  title,
  applications,
  onOpen,
  isCustomDragTarget = false,
}: KanbanColumnProps) => {
  const count = applications.length;
  const visibleCount = Math.min(count, MAX_STACK);
  const visible = applications.slice(0, visibleCount);

  // Stack container height = offset of last visible card + card height
  const stackH = visibleCount > 0 ? STACK[visibleCount - 1].y + CARD_H : 80;

  return (
    // Droppable lets @hello-pangea/dnd know this is a valid drop zone
    <Droppable droppableId={id}>
      {(provided, snapshot) => {
        const isOver = snapshot.isDraggingOver || isCustomDragTarget;

        return (
          <motion.div
            ref={provided.innerRef}
            {...provided.droppableProps}
            // data-column-id used by the custom drag hit-test in KanbanBoard
            data-column-id={id}
            onClick={onOpen}
            animate={isOver ? { scale: 1.03 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`
              relative w-[270px] flex-shrink-0 flex flex-col rounded-2xl border
              cursor-pointer p-3.5 select-none
              transition-[background,border-color] duration-200
              ${
                isOver
                  ? `${COLUMN_DROP_BG[id]} border-transparent ring-2 ${COLUMN_RING[id]}/70 drag-target-pulse`
                  : "bg-surface-container/60 dark:bg-surface-container/40 border-border/40 hover:border-border/70 hover:shadow-md"
              }
            `}
            style={isOver ? { "--glow-color": COLUMN_GLOW_COLOR[id] } as React.CSSProperties : undefined}
          >
            {/* ── Column header ── */}
            <div className="flex items-center gap-2 px-1 mb-3">
              <span className={`h-2 w-2 rounded-full ${COLUMN_ACCENT[id]} shrink-0`} />
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground flex-1">
                {title}
              </h3>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-surface-container-high dark:bg-surface-container px-1.5 text-[11px] font-bold text-muted-foreground">
                {count}
              </span>
            </div>

            {/* ── Stack or empty state ── */}
            {count === 0 ? (
              <div className={`flex flex-col h-24 items-center justify-center gap-1 rounded-xl border-2 border-dashed ${
                isOver ? `border-current ${COLUMN_ACCENT_TEXT[id]}` : "border-border/20 text-muted-foreground/30"
              } text-xs font-medium transition-colors duration-200`}>
                {isOver ? (
                  <>
                    <motion.div
                      animate={{ y: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                      className={`text-lg ${COLUMN_ACCENT_TEXT[id]}`}
                    >
                      ↓
                    </motion.div>
                    <span className={`font-semibold ${COLUMN_ACCENT_TEXT[id]}`}>Drop here</span>
                  </>
                ) : "Empty"}
              </div>
            ) : (
              <div className="relative" style={{ height: stackH }}>
                {/* Render in reverse so card 0 sits visually on top */}
                {[...visible].reverse().map((app, reversedIdx) => {
                  const idx = visibleCount - 1 - reversedIdx;
                  const s = STACK[idx] ?? STACK[MAX_STACK - 1];

                  return (
                    <motion.div
                      key={app.id}
                      className="absolute inset-x-0 top-0 rounded-xl border border-border/55 bg-card px-4 py-3 overflow-hidden"
                      style={{
                        height: CARD_H,
                        zIndex: s.z,
                        // Use static style for the stack — no hover expansion
                        transform: `translateX(${s.x}px) translateY(${s.y}px) scale(${s.scale}) rotate(${s.rotate}deg)`,
                        opacity: s.opacity,
                        willChange: "transform",
                      }}
                      // Subtle lift on hover for the top card only
                      whileHover={idx === 0 ? { y: s.y - 3 } : undefined}
                      transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    >
                      {/* Top card: full preview; back cards: minimal content */}
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-[13px] text-foreground truncate flex-1">
                          {app.company}
                        </p>
                        {idx === 0 && (
                          <span
                            className={`h-2 w-2 rounded-full ${STATUS_DOT[id]} shrink-0 mt-1`}
                          />
                        )}
                      </div>
                      {idx <= 1 && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground font-medium truncate">
                          {app.role}
                        </p>
                      )}
                      {idx === 0 && app.skills.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {app.skills.slice(0, 2).map((s) => (
                            <span
                              key={s}
                              className="rounded px-1.5 py-0.5 text-[10px] bg-surface-container text-foreground/70"
                            >
                              {s}
                            </span>
                          ))}
                          {app.skills.length > 2 && (
                            <span className="rounded px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary font-semibold">
                              +{app.skills.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Drop overlay — shown on non-empty columns during drag */}
                {isOver && count > 0 && (
                  <motion.div
                    className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-1.5 z-50"
                    style={{
                      background: COLUMN_GLOW_COLOR[id].replace("0.6", "0.15"),
                      backdropFilter: "blur(2px)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <motion.div
                      animate={{ y: [0, 6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.75, ease: "easeInOut" }}
                      className={`text-2xl font-bold ${COLUMN_ACCENT_TEXT[id]}`}
                    >
                      ↓
                    </motion.div>
                    <span className={`text-[13px] font-bold ${COLUMN_ACCENT_TEXT[id]} drop-shadow-sm`}>
                      Drop here
                    </span>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Bottom label ── */}
            <div className="mt-3.5 px-1 flex items-center justify-between">
              <span
                className={`text-[10px] font-medium transition-colors duration-150 ${
                  isOver ? `font-semibold ${COLUMN_ACCENT_TEXT[id]}` : "text-muted-foreground/45"
                }`}
              >
                {isOver
                  ? "Release to drop"
                  : count === 0
                  ? "No applications"
                  : `${count} application${count !== 1 ? "s" : ""}`}
              </span>
              {count > 0 && !isOver && (
                <span className="text-[10px] font-semibold text-primary/55">Tap to view →</span>
              )}
            </div>

            {/* DnD placeholder — hidden since stacking is static */}
            <div className="hidden">{provided.placeholder}</div>
          </motion.div>
        );
      }}
    </Droppable>
  );
};

export default KanbanColumn;
