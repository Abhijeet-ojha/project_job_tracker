import { useState, useCallback, useEffect, useRef } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Application, COLUMNS, ColumnId } from "@/types/application";
import KanbanColumn from "./KanbanColumn";
import DeckPopup from "./DeckPopup";

// ─── Drag Ghost — floating card that follows cursor ───────────────────────────
interface DragGhostProps {
  app: Application;
  x: number;
  y: number;
}

const GHOST_W = 220;
const GHOST_OFFSET_X = GHOST_W / 2;
const GHOST_OFFSET_Y = 55;

const DragGhost = ({ app, x, y }: DragGhostProps) => (
  <motion.div
    className="fixed pointer-events-none z-[200]"
    style={{
      left: x - GHOST_OFFSET_X,
      top: y - GHOST_OFFSET_Y,
      width: GHOST_W,
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.14) 100%)",
      backdropFilter: "blur(20px) saturate(160%)",
      border: "1px solid rgba(255,255,255,0.28)",
      borderRadius: "18px",
      boxShadow: "0 24px 60px -8px rgba(0,0,0,0.45)",
      cursor: "grabbing",
      rotate: 2,
    }}
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1.06, opacity: 1 }}
    exit={{ scale: 0.9, opacity: 0 }}
    transition={{ type: "spring", stiffness: 200, damping: 22 }}
  >
    <div className="px-4 py-3.5">
      <p className="font-bold text-[14px] text-foreground truncate">{app.company}</p>
      <p className="mt-0.5 text-[12px] text-muted-foreground font-medium truncate">{app.role}</p>
      {app.skills.length > 0 && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {app.skills.slice(0, 2).map((s) => (
            <span
              key={s}
              className="rounded px-1.5 py-0.5 text-[10px] bg-white/15 border border-white/20 text-foreground/80"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

// ─── Board ────────────────────────────────────────────────────────────────────
interface KanbanBoardProps {
  applications: Application[];
  onMove: (id: string, destination: ColumnId, newIndex: number) => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;
  statusFilter?: ColumnId | "all";
}

const KanbanBoard = ({
  applications,
  onMove,
  onDelete,
  deletingId,
  statusFilter = "all",
}: KanbanBoardProps) => {
  // ── Popup state ──────────────────────────────────────────────────────────
  const [openColumnId, setOpenColumnId] = useState<ColumnId | null>(null);

  // ── Custom drag state (hold-to-drag from popup) ──────────────────────────
  const [draggingApp, setDraggingApp] = useState<Application | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoveredColumnId, setHoveredColumnId] = useState<ColumnId | null>(null);
  // Track the original column so we can ignore dropping on the same column
  const draggingFromRef = useRef<ColumnId | null>(null);

  const visibleColumns =
    statusFilter === "all"
      ? COLUMNS
      : COLUMNS.filter((col) => col.id === statusFilter);

  // ── DnD (hello-pangea) — handles drops from within Droppable zones ───────
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onMove(
      result.draggableId,
      result.destination.droppableId as ColumnId,
      result.destination.index
    );
  };

  // ── Custom drag handlers ─────────────────────────────────────────────────
  const handleStartDrag = useCallback(
    (app: Application, startX: number, startY: number) => {
      setOpenColumnId(null); // close popup
      setDraggingApp(app);
      setDragPos({ x: startX, y: startY });
      draggingFromRef.current = app.columnId;
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    },
    []
  );

  // Hit-test which column the given point is over
  const columnFromPoint = useCallback((x: number, y: number): ColumnId | null => {
    const els = document.elementsFromPoint(x, y);
    for (const el of els) {
      const colId = (el as HTMLElement).dataset?.columnId as ColumnId | undefined;
      if (colId) return colId;
    }
    return null;
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingApp) return;
      setDragPos({ x: e.clientX, y: e.clientY });
      setHoveredColumnId(columnFromPoint(e.clientX, e.clientY));
    },
    [draggingApp, columnFromPoint]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!draggingApp) return;

      const targetId = columnFromPoint(e.clientX, e.clientY);

      // Move only if dropping on a different column
      if (targetId && targetId !== draggingFromRef.current) {
        onMove(draggingApp.id, targetId, 0);
      }

      // Clean up
      setDraggingApp(null);
      setHoveredColumnId(null);
      draggingFromRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },
    [draggingApp, columnFromPoint, onMove]
  );

  // Attach/detach window pointer listeners when drag is active
  useEffect(() => {
    if (!draggingApp) return;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingApp, handlePointerMove, handlePointerUp]);

  // ── Render ───────────────────────────────────────────────────────────────
  const openColumn = openColumnId
    ? visibleColumns.find((c) => c.id === openColumnId)
    : null;

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-5 overflow-x-auto px-6 py-6 pb-8">
          <AnimatePresence mode="popLayout">
            {visibleColumns.map((col) => (
              <motion.div
                key={col.id}
                layout
                initial={{ opacity: 0, x: -20, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.97 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 24,
                  mass: 0.8,
                }}
              >
                <KanbanColumn
                  id={col.id}
                  title={col.title}
                  applications={applications.filter((a) => a.columnId === col.id)}
                  onDelete={onDelete}
                  deletingId={deletingId}
                  onOpen={() => {
                    // Don't open popup while a custom drag is in progress
                    if (!draggingApp) setOpenColumnId(col.id);
                  }}
                  isCustomDragTarget={
                    draggingApp !== null && hoveredColumnId === col.id
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </DragDropContext>

      {/* ── Deck Popup ── */}
      <AnimatePresence>
        {openColumn && (
          <DeckPopup
            key={openColumn.id}
            columnId={openColumn.id}
            columnTitle={openColumn.title}
            applications={applications.filter((a) => a.columnId === openColumn.id)}
            onClose={() => setOpenColumnId(null)}
            onStartDrag={handleStartDrag}
            onDelete={onDelete}
            deletingId={deletingId}
          />
        )}
      </AnimatePresence>

      {/* ── Custom drag ghost ── */}
      <AnimatePresence>
        {draggingApp && (
          <DragGhost app={draggingApp} x={dragPos.x} y={dragPos.y} />
        )}
      </AnimatePresence>
    </>
  );
};

export default KanbanBoard;
