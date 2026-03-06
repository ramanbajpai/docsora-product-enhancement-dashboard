import { motion } from "framer-motion";
import { CheckCircle2, PenTool, Calendar, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SigningDocument, SigningComment } from "./types";
import { cn } from "@/lib/utils";

interface SigningReviewSummaryProps {
  document: SigningDocument;
  comments: SigningComment[];
  onSubmit: () => void;
  onReviewDocument?: () => void;
  onAddComment?: () => void;
  onRequestExtension?: () => void;
  hasDeadlineExtension?: boolean;
}

export function SigningReviewSummary({ 
  document,
  comments,
  onSubmit,
  onReviewDocument,
  onAddComment,
  onRequestExtension,
  hasDeadlineExtension = true
}: SigningReviewSummaryProps) {
  const completedFields = document.fields.filter(f => f.completed);
  const signatureField = document.fields.find(f => f.type === "signature" && f.completed);
  const dateField = document.fields.find(f => f.type === "date" && f.completed);

  const checklistItems = [
    {
      label: "All required fields completed",
      completed: completedFields.length === document.fields.filter(f => f.required).length,
      icon: CheckCircle2
    },
    {
      label: "Signature applied",
      completed: !!signatureField,
      icon: PenTool
    },
    {
      label: "Date recorded",
      completed: !!dateField,
      icon: Calendar
    }
  ];

  const allComplete = checklistItems.every(item => item.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[460px] px-6 py-10"
    >
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">Review</span>
        </div>
        <div className="w-8 h-px bg-emerald-500" />
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">Sign</span>
        </div>
        <div className="w-8 h-px bg-border" />
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-primary">Complete</span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
          <FileText className="w-7 h-7 text-emerald-500" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-foreground mb-2 text-center">
          Ready to submit
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Review your completion status before submitting
        </p>

        {/* Checklist */}
        <div className="space-y-3 mb-8">
          {checklistItems.map((item, i) => (
            <div 
              key={i}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                item.completed ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "bg-muted/30"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                item.completed 
                  ? "bg-emerald-500 text-white" 
                  : "bg-muted text-muted-foreground"
              )}>
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <item.icon className="w-3.5 h-3.5" />
                )}
              </div>
              <span className={cn(
                "text-sm",
                item.completed ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Comments indicator */}
        {comments.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {comments.length} comment{comments.length !== 1 ? "s" : ""} added
            </span>
          </div>
        )}

        {/* Legal confirmation */}
        <p className="text-xs text-muted-foreground text-center mb-4">
          By submitting, you agree this signature is legally binding.
        </p>

        {/* Primary CTA */}
        <Button
          onClick={onSubmit}
          className="w-full h-12 text-base font-medium"
          disabled={!allComplete}
        >
          Finish & Submit
        </Button>

        {/* Secondary actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          {onReviewDocument && (
            <button
              onClick={onReviewDocument}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Review document
            </button>
          )}
          {onAddComment && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <button
                onClick={onAddComment}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Add final comment
              </button>
            </>
          )}
          {hasDeadlineExtension && onRequestExtension && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <button
                onClick={onRequestExtension}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Request extension
              </button>
            </>
          )}
        </div>

        {/* What happens next */}
        <p className="text-xs text-muted-foreground/70 text-center mt-6">
          Once signed, the final document will be shared with all parties.
        </p>
      </div>

      {/* Step indicator */}
      <p className="text-xs text-muted-foreground/60 mt-6">
        Step 3 of 3 — Complete
      </p>
    </motion.div>
  );
}
