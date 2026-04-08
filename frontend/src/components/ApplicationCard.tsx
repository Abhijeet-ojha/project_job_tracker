import { useState } from "react";
import { motion } from "framer-motion";
import { Draggable } from "@hello-pangea/dnd";
import { Application, ColumnId } from "@/types/application";
import { CalendarDays, MapPin, Trash2, Clock } from "lucide-react";
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

// ─── Easing curve — iOS-style "fast out, soft in" ─────────────────────────────
const IOS_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Delete button — never instant: slides in with blur+opacity+y ─────────────
const deleteVariants = {
  hidden:  { opacity: 0, y: 3,  filter: "blur(3px)", scale: 0.9 },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)", scale: 1   },
};

// ─── Skill tags — drift up + fade in ──────────────────────────────────────────
const skillVariants = {
  hidden:  { opacity: 0, y: 4,  filter: "blur(2px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)" },
};

// ─── Metadata row (clock) — similar treatment ─────────────────────────────────
const metaVariants = {
  hidden:  { opacity: 0, y: 3 },
  visible: { opacity: 1, y: 0 },
};

// ─── Status pill config ────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ColumnId,
  { label: string; bg: string; text: string; dot: string }
> = {
  applied: {
    label: "Applied",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  screening: {
    label: "Phone Screen",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  interview: {
    label: "Interview",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  offer: {
    label: "Offer",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};

interface ApplicationCardProps {
  application: Application;
  index: number;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  isDragDisabled?: boolean;
}

const ApplicationCard = ({
  application,
  index,
  onDelete,
  isDeleting,
  isDragDisabled = false,
}: ApplicationCardProps) => {
  const [hovered, setHovered] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const statusCfg = STATUS_CONFIG[application.columnId];
  const visibleSkills = application.skills.slice(0, 3);
  const extraCount = application.skills.length - visibleSkills.length;

  return (
    <>
      <Draggable draggableId={application.id} index={index} isDragDisabled={isDragDisabled}>
        {(provided, snapshot) => (
          <motion.div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            // Track hover in state so child variants can key off it
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            animate={
              snapshot.isDragging
                ? {
                    scale: 1.03,
                    rotate: 0.5,
                    boxShadow: "0 24px 48px -10px rgba(42,52,57,0.22)",
                  }
                : { scale: 1, rotate: 0, boxShadow: "0 2px 8px -3px rgba(42,52,57,0.08)" }
            }
            transition={{
              scale:     { type: "spring", stiffness: 160, damping: 18, mass: 0.6 },
              rotate:    { type: "spring", stiffness: 120, damping: 20 },
              boxShadow: { type: "spring", stiffness: 60,  damping: 20, delay: 0.04 },
            }}
            className={`group relative rounded-xl border border-border/60 bg-card p-4 ${
              isDragDisabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"
            } ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
            whileHover={
              !snapshot.isDragging
                ? {
                    y: -2,
                    boxShadow: "0 10px 28px -6px rgba(42,52,57,0.12)",
                  }
                : undefined
            }
          >
            {/* Status pill — top right */}
            <div className="absolute top-3 right-3">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>

            {/* Delete button — blur + y + opacity, never instant */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmOpen(true);
              }}
              variants={deleteVariants}
              animate={hovered ? "visible" : "hidden"}
              transition={{
                duration: 0.18,
                ease: IOS_EASE,
                delay: hovered ? 0.04 : 0,
              }}
              className="absolute bottom-3 right-3 rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Delete application"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </motion.button>

            {/* Company */}
            <p className="text-[15px] font-bold text-foreground leading-tight tracking-tight pr-20">
              {application.company}
            </p>

            {/* Role */}
            <p className="mt-0.5 text-[13px] text-muted-foreground font-medium leading-tight">
              {application.role}
            </p>

            {/* Location + Seniority — drift up on hover */}
            {(application.location || application.seniority) && (
              <motion.div
                variants={metaVariants}
                animate={hovered ? "visible" : { opacity: 0.85, y: 0 }}
                transition={{ duration: 0.16, ease: IOS_EASE }}
                className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground"
              >
                <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                <span className="truncate">
                  {[application.location, application.seniority]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </motion.div>
            )}

            {/* Date applied */}
            <div className="mt-2.5 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {application.dateApplied}
              </span>
            </div>

            {/* Skills — each tag fades in with blur, staggered */}
            {application.skills.length > 0 && (
              <motion.div
                className="mt-3 flex flex-wrap gap-1.5"
                initial={false}
              >
                {visibleSkills.map((skill, i) => (
                  <motion.span
                    key={skill}
                    variants={skillVariants}
                    animate={hovered ? "visible" : { opacity: 0.8, y: 0, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.16,
                      ease: IOS_EASE,
                      delay: hovered ? 0.03 + i * 0.025 : 0,
                    }}
                    className="rounded-md bg-surface-container dark:bg-surface-container px-2 py-0.5 text-[11px] font-medium text-foreground/80"
                  >
                    {skill}
                  </motion.span>
                ))}
                {extraCount > 0 && (
                  <motion.span
                    variants={skillVariants}
                    animate={hovered ? "visible" : { opacity: 0.8, y: 0, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.16,
                      ease: IOS_EASE,
                      delay: hovered ? 0.03 + visibleSkills.length * 0.025 : 0,
                    }}
                    className="rounded-md bg-primary/8 dark:bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary"
                  >
                    +{extraCount} more
                  </motion.span>
                )}
              </motion.div>
            )}

            {/* Last updated — blur+y+opacity reveal, never instant */}
            <motion.div
              className="mt-2 flex items-center gap-1"
              variants={metaVariants}
              animate={hovered ? "visible" : "hidden"}
              transition={{
                duration: 0.18,
                ease: IOS_EASE,
                delay: hovered ? 0.06 : 0,
              }}
            >
              <Clock className="h-3 w-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50">
                Added {application.dateApplied}
              </span>
            </motion.div>
          </motion.div>
        )}
      </Draggable>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the{" "}
              <span className="font-semibold text-foreground">
                {application.role}
              </span>{" "}
              role at{" "}
              <span className="font-semibold text-foreground">
                {application.company}
              </span>
              . This action cannot be undone.
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

export default ApplicationCard;
