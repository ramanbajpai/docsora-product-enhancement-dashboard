import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeclineReason, declineReasonLabels, clauseReferenceReasons } from "./types";

interface SigningDeclineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecline: (reason: DeclineReason, note?: string, clauseReference?: string) => void;
}

export function SigningDeclineModal({ 
  isOpen, 
  onClose, 
  onDecline
}: SigningDeclineModalProps) {
  const [reason, setReason] = useState<DeclineReason | null>(null);
  const [clauseReference, setClauseReference] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showClauseField = reason && clauseReferenceReasons.includes(reason);

  const handleDecline = async () => {
    if (!reason) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onDecline(
      reason, 
      additionalContext || undefined, 
      showClauseField && clauseReference ? clauseReference : undefined
    );
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setReason(null);
    setClauseReference("");
    setAdditionalContext("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Decline signing?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              The sender will be notified that you've declined to sign this document.
            </p>

            {/* Reason selector */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Reason <span className="text-destructive">*</span>
              </label>
              <Select
                value={reason || undefined}
                onValueChange={(value) => setReason(value as DeclineReason)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(declineReasonLabels) as DeclineReason[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {declineReasonLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional clause reference field */}
            <AnimatePresence>
              {showClauseField && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Clause or section reference <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Input
                    value={clauseReference}
                    onChange={(e) => setClauseReference(e.target.value)}
                    placeholder="e.g. Section 4.2 – Termination"
                    className="mb-1.5"
                  />
                  <p className="text-xs text-muted-foreground">
                    Helps the sender understand exactly what needs attention.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Additional context */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Additional context <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Briefly explain what needs to change or why you can't sign."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDecline}
                className="flex-1"
                disabled={!reason || isSubmitting}
              >
                {isSubmitting ? "Declining..." : "Decline & notify sender"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
