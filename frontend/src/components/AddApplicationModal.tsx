import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { Application } from "@/types/application";
import { parseJobDescription } from "@/api/applications.api";
import { toast } from "sonner";

interface AddApplicationModalProps {
  open: boolean;
  onClose: () => void;
  isPending?: boolean;
  onAdd: (
    app: Omit<Application, "id" | "columnId"> & {
      jobDescription?: string;
      niceToHaveSkills?: string[];
      resumeSuggestions?: string[];
    }
  ) => void;
}

type Step = 1 | 2 | 3;

const STEPS = [
  { n: 1 as Step, icon: FileText, label: "Paste JD" },
  { n: 2 as Step, icon: Sparkles, label: "AI Parsing" },
  { n: 3 as Step, icon: Save, label: "Review & Save" },
];

const AddApplicationModal = ({
  open,
  onClose,
  onAdd,
  isPending = false,
}: AddApplicationModalProps) => {
  const [step, setStep] = useState<Step>(1);
  const [jobDescription, setJobDescription] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedOk, setParsedOk] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [seniority, setSeniority] = useState("");
  const [skills, setSkills] = useState("");
  const [niceToHaveSkills, setNiceToHaveSkills] = useState<string[]>([]);
  const [resumeSuggestions, setResumeSuggestions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const companyRef = useRef<HTMLInputElement>(null);

  // Auto-focus Company when on step 3
  useEffect(() => {
    if (open && step === 3) {
      const t = setTimeout(() => companyRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [open, step]);

  // Auto-focus Company on first open (no JD flow)
  useEffect(() => {
    if (open && step === 1) {
      // Only focus company if already on step 3 (manual mode)
    }
  }, [open]);

  const handleReset = () => {
    setStep(1);
    setJobDescription("");
    setCompany("");
    setRole("");
    setLocation("");
    setSeniority("");
    setSkills("");
    setNiceToHaveSkills([]);
    setResumeSuggestions([]);
    setCopiedIndex(null);
    setParsedOk(false);
    setParsing(false);
  };

  const handleParse = async () => {
    if (!jobDescription.trim()) return;
    setParsing(true);
    setStep(2);
    try {
      const { data } = await parseJobDescription(jobDescription);
      setCompany(data.company || "");
      setRole(data.role || "");
      setLocation(data.location || "");
      setSeniority(data.seniority || "");
      setSkills((data.requiredSkills || []).join(", "));
      setNiceToHaveSkills(data.niceToHaveSkills || []);
      setResumeSuggestions(data.resumeSuggestions || []);
      setParsedOk(true);
      setStep(3);
      toast.success("Job description parsed!");
    } catch {
      toast.error("AI parsing failed. Fill in the fields manually.");
      setStep(3);
      setParsedOk(false);
    } finally {
      setParsing(false);
    }
  };

  const handleSkipToManual = () => {
    setStep(3);
    setTimeout(() => companyRef.current?.focus(), 120);
  };

  const handleSubmit = () => {
    if (!company || !role || isPending) return;
    onAdd({
      company,
      role,
      dateApplied: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      location,
      seniority,
      jobDescription,
      niceToHaveSkills,
      resumeSuggestions,
    });
    handleReset();
    onClose();
  };

  const copyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          handleReset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-3xl rounded-2xl p-0 gap-0 overflow-hidden border-border/60 shadow-[0_24px_60px_-12px_rgba(42,52,57,0.12)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)]">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-lg font-bold tracking-tight">
            Add Application
          </DialogTitle>
        </DialogHeader>

        {/* 3-Step Progress Indicator */}
        <div className="flex items-center gap-0 px-6 pt-4 pb-3">
          {STEPS.map((s, i) => {
            const isComplete = step > s.n;
            const isCurrent = step === s.n;
            return (
              <div key={s.n} className="flex items-center flex-1">
                {/* Step pill */}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 ${
                      isComplete
                        ? "bg-emerald-500 text-white scale-100"
                        : isCurrent
                        ? "bg-primary text-white scale-105 ring-2 ring-primary/25"
                        : "bg-surface-container text-muted-foreground"
                    }`}
                  >
                    {isComplete ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <s.icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold whitespace-nowrap transition-colors duration-200 ${
                      isCurrent
                        ? "text-foreground"
                        : isComplete
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="mx-3 flex-1 h-px transition-colors duration-300 bg-border" />
                )}
              </div>
            );
          })}
        </div>

        <div className="h-px bg-border/50 mx-6" />

        {/* Body */}
        <div className="grid md:grid-cols-2">
          {/* Left pane — always visible */}
          <div className="flex flex-col gap-3 p-5 bg-surface-container/30 dark:bg-surface-container/20">
            <label className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              Paste Job Description
            </label>
            <Textarea
              placeholder="Paste the full job description here to auto-fill with AI…"
              className="min-h-[200px] resize-none rounded-xl border border-border/50 bg-card dark:bg-card text-sm focus-visible:ring-1 focus-visible:ring-primary"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={step === 2}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleParse}
                disabled={parsing || !jobDescription.trim() || step === 2}
                variant="outline"
                className="flex-1 gap-2 rounded-lg border-border/60 bg-card hover:bg-surface-container transition-colors"
              >
                {parsing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-primary" />
                    Parse with AI
                  </>
                )}
              </Button>
              {step === 1 && (
                <Button
                  variant="ghost"
                  onClick={handleSkipToManual}
                  className="text-muted-foreground text-sm px-3"
                >
                  Skip
                </Button>
              )}
            </div>
          </div>

          {/* Right pane */}
          <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-[480px]">
            {/* Step 2: Parsing in progress */}
            {step === 2 && parsing && (
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-col items-center justify-center gap-3 py-6">
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    AI is analyzing the job description…
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Extracting skills, role, and generating suggestions
                  </p>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-9 rounded-lg bg-surface-container animate-pulse"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            )}

            {/* Step 3: Review & Save */}
            {step === 3 && (
              <>
                {/* Parse success banner */}
                {parsedOk && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
                      Parsed successfully — review and save below
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <FieldInput
                    label="Company *"
                    value={company}
                    onChange={setCompany}
                    inputRef={companyRef}
                  />
                  <FieldInput label="Role *" value={role} onChange={setRole} />
                  <FieldInput
                    label="Location"
                    value={location}
                    onChange={setLocation}
                  />
                  <FieldInput
                    label="Seniority"
                    value={seniority}
                    onChange={setSeniority}
                  />
                  <FieldInput
                    label="Skills (comma separated)"
                    value={skills}
                    onChange={setSkills}
                  />
                </div>

                {resumeSuggestions.length > 0 && (
                  <div className="mt-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-2">
                      Resume Suggestions
                    </p>
                    <div className="flex flex-col gap-2">
                      {resumeSuggestions.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 rounded-lg bg-surface-container/60 dark:bg-surface-container/40 p-3 text-[12px] text-foreground/80 leading-relaxed"
                        >
                          <span className="flex-1">{s}</span>
                          <button
                            onClick={() => copyBullet(s, i)}
                            className="mt-0.5 shrink-0 transition-colors"
                            aria-label="Copy to clipboard"
                          >
                            {copiedIndex === i ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 1: prompt */}
            {step === 1 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Paste a job description
                </p>
                <p className="text-xs text-muted-foreground max-w-[180px]">
                  AI will auto-fill the form and generate tailored resume bullets
                </p>
                <div className="border-t border-border/40 pt-3 w-full">
                  <button
                    onClick={handleSkipToManual}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Or fill in manually →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border/50 bg-surface-container/20 dark:bg-surface-container/10">
          <Button
            variant="ghost"
            onClick={() => {
              handleReset();
              onClose();
            }}
            disabled={isPending}
            className="rounded-lg text-sm"
          >
            Cancel
          </Button>
          <Button
            id="submit-application-btn"
            onClick={handleSubmit}
            disabled={!company || !role || isPending || step !== 3}
            className="min-w-[150px] rounded-lg bg-gradient-to-br from-primary to-[hsl(220,90%,36%)] hover:brightness-110 transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Application
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FieldInput = ({
  label,
  value,
  onChange,
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}) => (
  <div>
    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
      {label}
    </label>
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border-border/50 bg-card dark:bg-card text-sm focus-visible:ring-1 focus-visible:ring-primary h-9"
    />
  </div>
);

export default AddApplicationModal;
