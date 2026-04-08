import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Application, ColumnId } from "@/types/application";
import { X, CalendarDays, MapPin, Trash2, GripHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─── Physics ──────────────────────────────────────────────────────────────────
const IOS_SPRING = { type: "spring" as const, stiffness: 90, damping: 18, mass: 1 };
const IOS_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Status pills ─────────────────────────────────────────────────────────────
const STATUS_PILL: Record<ColumnId, { label: string; classes: string; dot: string }> = {
  applied:   { label: "Applied",      classes: "bg-blue-50/80 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",       dot: "bg-blue-500" },
  screening: { label: "Phone Screen", classes: "bg-amber-50/80 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400", dot: "bg-amber-500" },
  interview: { label: "Interview",    classes: "bg-violet-50/80 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400", dot: "bg-violet-500" },
  offer:     { label: "Offer",        classes: "bg-emerald-50/80 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400", dot: "bg-emerald-500" },
  rejected:  { label: "Rejected",     classes: "bg-rose-50/80 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",       dot: "bg-rose-500" },
};

const COLUMN_ACCENT: Record<ColumnId, string> = {
  applied:   "bg-blue-500",
  screening: "bg-amber-500",
  interview: "bg-violet-500",
  offer:     "bg-emerald-500",
  rejected:  "bg-rose-500",
};

const COLUMN_GRADIENT: Record<ColumnId, string> = {
  applied:   "from-blue-500/10 to-transparent",
  screening: "from-amber-500/10 to-transparent",
  interview: "from-violet-500/10 to-transparent",
  offer:     "from-emerald-500/10 to-transparent",
  rejected:  "from-rose-500/10 to-transparent",
};

// ─── Hold-to-Drag Constants ───────────────────────────────────────────────────
const HOLD_MS = 250;
const MOVE_THRESHOLD = 8; // px — beyond this, cancel hold (scrolling intent)

// ─── PopupCard ────────────────────────────────────────────────────────────────
interface PopupCardProps {
  application: Application;
  onStartDrag: (app: Application, startX: number, startY: number) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const PopupCard = ({ application, onStartDrag, onDelete, isDeleting }: PopupCardProps) => {
  const [holding, setHolding] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  const pill = STATUS_PILL[application.columnId];

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHolding(false);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only left mouse or touch
      if (e.button !== undefined && e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      startPosRef.current = { x: e.clientX, y: e.clientY };
      setHolding(false);

      holdTimerRef.current = setTimeout(() => {
        setHolding(true);
        // Small delay so the scale-up animation is visible before popup closes
        setTimeout(() => {
          onStartDrag(application, startPosRef.current.x, startPosRef.current.y);
        }, 60);
      }, HOLD_MS);
    },
    [application, onStartDrag]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
        cancelHold();
      }
    },
    [cancelHold]
  );

  // Clean up on unmount
  useEffect(() => () => cancelHold(), [cancelHold]);

  return (
    <>
      <motion.div
        className={`relative flex-shrink-0 w-[260px] rounded-2xl overflow-hidden select-none ${
          isDeleting ? "opacity-40 pointer-events-none" : ""
        }`}
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.22)",
          scrollSnapAlign: "center",
          cursor: holding ? "grabbing" : "grab",
          boxShadow: hovered
            ? "0 16px 48px -8px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.12) inset"
            : "0 8px 24px -4px rgba(0,0,0,0.20), 0 0 0 1px rgba(255,255,255,0.08) inset",
        }}
        animate={
          holding
            ? { scale: 1.05, rotate: 2, y: -4 }
            : hovered
            ? { scale: 1.02, rotate: 0, y: -2 }
            : { scale: 1, rotate: 0, y: 0 }
        }
        transition={IOS_SPRING}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        {/* Subtle gradient accent at top */}
        <div
          className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${COLUMN_GRADIENT[application.columnId]} pointer-events-none`}
        />

        {/* Drag affordance — grip dots at top + label on hover */}
        <motion.div
          className="flex items-center justify-center gap-1.5 pt-1 pb-2"
          animate={hovered ? { opacity: 1 } : { opacity: 0.35 }}
          transition={{ duration: 0.18 }}
        >
          <GripHorizontal className="h-4 w-4 text-foreground" />
          <motion.span
            className="text-[10px] font-semibold text-foreground leading-none"
            animate={hovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
            transition={{ duration: 0.18 }}
          >
            {holding ? "Dragging…" : "Hold to drag"}
          </motion.span>
        </motion.div>

        <div className="relative p-5 pt-1">
          {/* Status pill */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pill.classes}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
            {pill.label}
          </span>

          {/* Company + role */}
          <p className="mt-3 font-bold text-[18px] text-foreground leading-tight">
            {application.company}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground font-medium leading-snug">
            {application.role}
          </p>

          {/* Location / seniority */}
          {(application.location || application.seniority) && (
            <div className="mt-2.5 flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <MapPin className="h-3 w-3 opacity-70 shrink-0" />
              <span>
                {[application.location, application.seniority].filter(Boolean).join(" · ")}
              </span>
            </div>
          )}

          {/* Date */}
          <div className="mt-2 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
              {application.dateApplied}
            </span>
          </div>

          {/* Skills */}
          {application.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {application.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-white/10 dark:bg-white/5 border border-white/15 px-2 py-0.5 text-[10px] font-medium text-foreground/80"
                >
                  {skill}
                </span>
              ))}
              {application.skills.length > 4 && (
                <span className="rounded-md bg-primary/15 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  +{application.skills.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Delete button - fades in on hover */}
          <motion.button
            className="absolute bottom-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-destructive/20 text-muted-foreground/60 hover:text-destructive transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15, ease: IOS_EASE }}
            onClick={(e) => {
              e.stopPropagation();
              cancelHold();
              setConfirmOpen(true);
            }}
            aria-label="Delete application"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </motion.button>

          {/* Hold indicator ring */}
          {holding && (
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-primary/60 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            />
          )}
        </div>
      </motion.div>

      {/* Delete confirm dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the{" "}
              <span className="font-semibold text-foreground">{application.role}</span> role at{" "}
              <span className="font-semibold text-foreground">{application.company}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(application.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ─── DeckPopup ────────────────────────────────────────────────────────────────
export interface DeckPopupProps {
  columnId: ColumnId;
  columnTitle: string;
  applications: Application[];
  onClose: () => void;
  onStartDrag: (app: Application, startX: number, startY: number) => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;
}

const DeckPopup = ({
  columnId,
  columnTitle,
  applications,
  onClose,
  onStartDrag,
  onDelete,
  deletingId,
}: DeckPopupProps) => {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const hintTimer = setTimeout(() => setShowHint(true), 350);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      clearTimeout(hintTimer);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog">
      {/* ── Backdrop ── */}
      <motion.div
        className="absolute inset-0"
        style={{ backdropFilter: "blur(12px) saturate(140%)", background: "rgba(0,0,0,0.45)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: IOS_EASE }}
        onClick={onClose}
      />

      {/* ── Panel ── */}
      <motion.div
        className="relative z-10 w-full max-w-3xl flex flex-col"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)",
          backdropFilter: "blur(28px) saturate(200%)",
          border: "1px solid rgba(255,255,255,0.20)",
          borderRadius: "28px",
          boxShadow:
            "0 40px 100px -16px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset",
        }}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={IOS_SPRING}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-7 pt-6 pb-5">
          <span className={`h-3 w-3 rounded-full ${COLUMN_ACCENT[columnId]} shadow-sm`} />
          <h2 className="text-lg font-bold tracking-tight text-foreground flex-1">
            {columnTitle}
          </h2>
          <span className="flex h-6 min-w-[28px] items-center justify-center rounded-full bg-white/12 border border-white/15 px-2.5 text-[12px] font-bold text-muted-foreground">
            {applications.length}
          </span>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.18)" }}
            whileTap={{ scale: 0.9 }}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/15 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close popup"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        {/* ── Divider ── */}
        <div className="mx-7 h-px bg-white/10" />

        {/* ── Card scroll row ── */}
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-sm font-semibold text-foreground/60">No applications here</p>
            <p className="text-xs text-muted-foreground/40">
              Move cards here by dragging from another column.
            </p>
          </div>
        ) : (
          <div
            className="flex gap-4 px-7 py-5 pb-3 overflow-x-auto deck-scroll"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {applications.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  ...IOS_SPRING,
                  delay: i * 0.04,
                  filter: { duration: 0.2, ease: IOS_EASE, delay: i * 0.04 },
                }}
              >
                <PopupCard
                  application={app}
                  onStartDrag={onStartDrag}
                  onDelete={onDelete}
                  isDeleting={deletingId === app.id}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Drag hint ── */}
        <AnimatePresence>
          {showHint && applications.length > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: IOS_EASE }}
              className="text-center text-[11px] font-semibold text-foreground pb-5 px-7 select-none"
            >
              Hold a card to drag it to another stage
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DeckPopup;
