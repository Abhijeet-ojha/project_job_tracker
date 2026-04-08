import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Application, ColumnId } from "@/types/application";
import { CalendarDays, MapPin, Trash2, X } from "lucide-react";
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

// ─── Easing ───────────────────────────────────────────────────────────────────
const IOS_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Modal panel spring — distinct from card springs ─────────────────────────
const MODAL_SPRING = {
  type: "spring" as const,
  stiffness: 260,
  damping: 26,
  mass: 0.9,
};

// ─── Card entrance inside modal ───────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)", scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 24,
      mass: 0.8,
      delay: i * 0.04,
    },
  }),
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.97,
    filter: "blur(2px)",
    transition: { duration: 0.15, ease: IOS_EASE },
  },
};

// ─── Delete button variants ────────────────────────────────────────────────────
const deleteVariants = {
  hidden:  { opacity: 0, x: 4, filter: "blur(3px)", scale: 0.88 },
  visible: { opacity: 1, x: 0, filter: "blur(0px)", scale: 1    },
};

// ─── Status pills ─────────────────────────────────────────────────────────────
const STATUS_PILL: Record<ColumnId, { label: string; classes: string; dot: string }> = {
  applied:   { label: "Applied",      classes: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",     dot: "bg-blue-500" },
  screening: { label: "Phone Screen", classes: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400", dot: "bg-amber-500" },
  interview: { label: "Interview",    classes: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400", dot: "bg-violet-500" },
  offer:     { label: "Offer",        classes: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400", dot: "bg-emerald-500" },
  rejected:  { label: "Rejected",     classes: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",     dot: "bg-rose-500" },
};

const COLUMN_ACCENT: Record<ColumnId, string> = {
  applied:   "bg-blue-500",
  screening: "bg-amber-500",
  interview: "bg-violet-500",
  offer:     "bg-emerald-500",
  rejected:  "bg-rose-500",
};

// ─── ModalCard ─────────────────────────────────────────────────────────────────

interface ModalCardProps {
  application: Application;
  onDelete: (id: string) => void;
  deletingId?: string | null;
  index: number;
}

const ModalCard = ({ application, onDelete, deletingId, index }: ModalCardProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const pill = STATUS_PILL[application.columnId];
  const visibleSkills = application.skills.slice(0, 3);
  const extraCount = application.skills.length - visibleSkills.length;
  const isDeleting = deletingId === application.id;

  return (
    <>
      <motion.div
        layout
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -2 }}
        className={`group relative rounded-xl border border-border/60 bg-card p-4 ${
          isDeleting ? "opacity-40 pointer-events-none" : ""
        }`}
        style={{
          // Shadow animates separately: grows on hover, settles softly
          boxShadow: hovered
            ? "0 12px 32px -8px rgba(42,52,57,0.14)"
            : "0 2px 8px -3px rgba(42,52,57,0.06)",
          transition: "box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Status pill */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${pill.classes}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
            {pill.label}
          </span>
        </div>

        {/* Delete button — blur + slide, never instant */}
        <motion.button
          onClick={() => setConfirmOpen(true)}
          variants={deleteVariants}
          animate={hovered ? "visible" : "hidden"}
          transition={{ duration: 0.18, ease: IOS_EASE, delay: hovered ? 0.04 : 0 }}
          className="absolute bottom-3 right-3 rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Delete application"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </motion.button>

        <p className="text-[15px] font-bold text-foreground leading-tight pr-20">
          {application.company}
        </p>
        <p className="mt-0.5 text-[13px] text-muted-foreground font-medium">
          {application.role}
        </p>

        {(application.location || application.seniority) && (
          <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0 opacity-70" />
            <span className="truncate">
              {[application.location, application.seniority].filter(Boolean).join(" · ")}
            </span>
          </div>
        )}

        <div className="mt-2 flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/70" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {application.dateApplied}
          </span>
        </div>

        {/* Skills — staggered blur/fade, never instant */}
        {application.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {visibleSkills.map((skill, i) => (
              <motion.span
                key={skill}
                animate={
                  hovered
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0.8, y: 0, filter: "blur(0px)" }
                }
                transition={{ duration: 0.14, ease: IOS_EASE, delay: hovered ? 0.02 + i * 0.02 : 0 }}
                className="rounded-md bg-surface-container px-2 py-0.5 text-[11px] font-medium text-foreground/80"
              >
                {skill}
              </motion.span>
            ))}
            {extraCount > 0 && (
              <span className="rounded-md bg-primary/8 dark:bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                +{extraCount} more
              </span>
            )}
          </div>
        )}
      </motion.div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">{application.role}</span>{" "}
              at{" "}
              <span className="font-semibold text-foreground">{application.company}</span>.
              This action cannot be undone.
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

// ─── ColumnModal ───────────────────────────────────────────────────────────────

interface ColumnModalProps {
  open: boolean;
  onClose: () => void;
  columnId: ColumnId;
  columnTitle: string;
  applications: Application[];
  onDelete: (id: string) => void;
  deletingId?: string | null;
}

const ColumnModal = ({
  open,
  onClose,
  columnId,
  columnTitle,
  applications,
  onDelete,
  deletingId,
}: ColumnModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop — blur + opacity, not instant */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: IOS_EASE }}
            onClick={onClose}
          />

          {/* Modal panel — spring entry with scale + y + blur */}
          <motion.div
            className="relative z-10 w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-border/60 bg-card shadow-[0_32px_80px_-16px_rgba(42,52,57,0.18)] dark:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, scale: 0.94, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1,    y: 0,  filter: "blur(0px)" }}
            exit={{   opacity: 0, scale: 0.96,  y: 12, filter: "blur(2px)" }}
            transition={{
              opacity: { duration: 0.2,  ease: IOS_EASE },
              scale:   MODAL_SPRING,
              y:       MODAL_SPRING,
              filter:  { duration: 0.22, ease: IOS_EASE },
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 shrink-0">
              <span className={`h-3 w-3 rounded-full ${COLUMN_ACCENT[columnId]}`} />
              <h2 className="text-base font-bold tracking-tight text-foreground flex-1">
                {columnTitle}
              </h2>
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-surface-container px-2 text-[12px] font-bold text-muted-foreground">
                {applications.length}
              </span>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--surface-container))" }}
                whileTap={{ scale: 0.9 }}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Body — staggered card grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <p className="text-sm font-semibold text-foreground">No applications here</p>
                  <p className="text-xs text-muted-foreground">
                    Add applications to this stage to track progress.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {applications.map((app, i) => (
                      <ModalCard
                        key={app.id}
                        application={app}
                        onDelete={onDelete}
                        deletingId={deletingId}
                        index={i}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ColumnModal;
