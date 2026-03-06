import { motion } from "framer-motion";
import { FileText, User, Calendar, PenTool, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { SigningDocument } from "./types";
import { cn } from "@/lib/utils";

interface SigningOverviewProps {
  document: SigningDocument;
  onStartSigning: () => void;
  onViewDocument?: () => void;
  onMoreOptions?: () => void;
}

export function SigningOverview({ 
  document, 
  onStartSigning,
  onViewDocument,
  onMoreOptions
}: SigningOverviewProps) {
  const requiredFields = document.fields.filter(f => f.required);
  const roleLabel = document.recipientRole === "approver" ? "Approver" : "Signer";

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
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-primary">Review</span>
        </div>
        <div className="w-8 h-px bg-border" />
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-muted" />
          <span className="text-xs text-muted-foreground">Sign</span>
        </div>
        <div className="w-8 h-px bg-border" />
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-muted" />
          <span className="text-xs text-muted-foreground">Complete</span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
          Ready to sign?
        </h2>

        {/* Document info */}
        <div className="space-y-4 mb-8">
          {/* Document name */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Document</p>
              <p className="text-sm font-medium text-foreground truncate">
                {document.name}
              </p>
            </div>
          </div>

          {/* Sender */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
              <User className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">From</p>
              <p className="text-sm font-medium text-foreground">
                {document.senderName}
              </p>
            </div>
          </div>

          {/* Your role */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
              <PenTool className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Your role</p>
              <p className="text-sm font-medium text-foreground">{roleLabel}</p>
            </div>
          </div>

          {/* Required fields */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Required fields</p>
              <p className="text-sm font-medium text-foreground">
                {requiredFields.length} field{requiredFields.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Due date */}
          {document.dueDate && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4.5 h-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Due date</p>
                <p className="text-sm font-medium text-foreground">
                  {format(document.dueDate, "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA */}
        <Button
          onClick={onStartSigning}
          className="w-full h-12 text-base font-medium"
        >
          Start signing
        </Button>

        {/* Secondary actions */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {onViewDocument && (
            <button
              onClick={onViewDocument}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View document
            </button>
          )}
          {onViewDocument && onMoreOptions && (
            <span className="text-muted-foreground/30">·</span>
          )}
          {onMoreOptions && (
            <button
              onClick={onMoreOptions}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              More options
            </button>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <p className="text-xs text-muted-foreground/60 mt-6">
        Step 1 of 3 — Review
      </p>
    </motion.div>
  );
}
