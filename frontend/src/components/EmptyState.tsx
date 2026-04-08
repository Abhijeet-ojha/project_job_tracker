import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddClick: () => void;
}

const EmptyState = ({ onAddClick }: EmptyStateProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-28">
      {/* Illustration */}
      <div className="relative">
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 shadow-[0_0_40px_-8px_hsl(var(--primary)/0.2)]">
          {/* Briefcase SVG */}
          <svg
            viewBox="0 0 48 48"
            className="h-14 w-14"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              x="6"
              y="16"
              width="36"
              height="26"
              rx="4"
              className="stroke-primary/70"
              strokeWidth="2"
              fill="hsl(var(--primary)/0.07)"
            />
            <path
              d="M16 16V12a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4"
              className="stroke-primary/70"
              strokeWidth="2"
            />
            <path
              d="M6 28h36"
              className="stroke-primary/40"
              strokeWidth="2"
            />
            <path
              d="M20 28v4"
              className="stroke-primary/60"
              strokeWidth="2"
            />
            <path
              d="M28 28v4"
              className="stroke-primary/60"
              strokeWidth="2"
            />
          </svg>
        </div>
        {/* Sparkle accent */}
        <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        {/* Floating dots */}
        <div className="absolute -bottom-1 -left-3 h-3 w-3 rounded-full bg-primary/20 animate-pulse" />
        <div 
          className="absolute top-2 -left-5 h-2 w-2 rounded-full bg-primary/15 animate-pulse"
          style={{ animationDelay: "400ms" }}
        />
      </div>

      {/* Copy */}
      <div className="text-center max-w-sm">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Track your dream job journey
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Paste any job description and let AI do the heavy lifting —
          auto-extract role, skills, and get tailored resume suggestions.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={onAddClick}
          className="gap-2 rounded-xl px-6 py-2.5 bg-gradient-to-br from-primary to-[hsl(220,90%,36%)] shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-150 text-[14px] font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add your first application
        </Button>
        <p className="text-[11px] text-muted-foreground/60">
          Press{" "}
          <kbd className="rounded border border-border px-1 py-0.5 text-[10px] font-mono bg-surface-container">
            A
          </kbd>{" "}
          anytime to add an application
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
