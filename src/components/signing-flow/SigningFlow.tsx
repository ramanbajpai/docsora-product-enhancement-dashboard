import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SigningOTPVerification } from "./SigningOTPVerification";
import { SigningOverview } from "./SigningOverview";
import { SigningDocument } from "./SigningDocument";
import { SigningReviewSummary } from "./SigningReviewSummary";
import { SigningSuccess } from "./SigningSuccess";
import { SigningDeclineModal } from "./SigningDeclineModal";
import { 
  SigningFlowStep, 
  SigningDocument as SigningDocumentType, 
  SigningComment,
  SigningField,
  DeclineReason
} from "./types";
import { cn } from "@/lib/utils";

interface SigningFlowProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  recipientRole: "signer" | "approver" | "viewer";
  dueDate?: Date;
  isGuest?: boolean;
  requiresOTP?: boolean;
  onComplete?: () => void;
  onDecline?: (reason: string, note?: string) => void;
}

// Mock document with fields
const createMockDocument = (props: SigningFlowProps): SigningDocumentType => ({
  id: props.documentId,
  name: props.documentName,
  type: "pdf",
  senderName: props.senderName,
  senderEmail: props.senderEmail,
  recipientRole: props.recipientRole,
  dueDate: props.dueDate,
  totalPages: 3,
  fields: [
    {
      id: "sig-1",
      type: "signature",
      label: "Signature",
      page: 1,
      position: { x: 10, y: 65, width: 30, height: 8 },
      required: true,
      completed: false
    },
    {
      id: "init-1",
      type: "initials",
      label: "Initials",
      page: 1,
      position: { x: 60, y: 65, width: 15, height: 6 },
      required: true,
      completed: false
    },
    {
      id: "date-1",
      type: "date",
      label: "Date",
      page: 1,
      position: { x: 10, y: 77, width: 20, height: 5 },
      required: true,
      completed: false
    },
    {
      id: "check-1",
      type: "checkbox",
      label: "I agree to terms",
      page: 1,
      position: { x: 10, y: 85, width: 25, height: 5 },
      required: true,
      completed: false
    },
    {
      id: "text-1",
      type: "text",
      label: "Title/Role",
      page: 1,
      position: { x: 45, y: 85, width: 25, height: 5 },
      required: true,
      completed: false
    },
    {
      id: "init-2",
      type: "initials",
      label: "Initials (Page 2)",
      page: 2,
      position: { x: 75, y: 85, width: 15, height: 6 },
      required: true,
      completed: false
    }
  ]
});

export function SigningFlow({
  isOpen,
  onClose,
  documentId,
  documentName,
  senderName,
  senderEmail,
  recipientEmail,
  recipientRole,
  dueDate,
  isGuest = false,
  requiresOTP = true,
  onComplete,
  onDecline
}: SigningFlowProps) {
  // Determine initial step
  const initialStep: SigningFlowStep = requiresOTP ? "otp" : "overview";
  
  const [step, setStep] = useState<SigningFlowStep>(initialStep);
  const [document, setDocument] = useState<SigningDocumentType>(() => 
    createMockDocument({
      isOpen, onClose, documentId, documentName, senderName, 
      senderEmail, recipientEmail, recipientRole, dueDate, isGuest, requiresOTP
    })
  );
  const [comments, setComments] = useState<SigningComment[]>([]);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP verified handler
  const handleOTPVerified = useCallback(() => {
    setStep("overview");
  }, []);

  // Start signing handler
  const handleStartSigning = useCallback(() => {
    setStep("document");
  }, []);

  // Field complete handler
  const handleFieldComplete = useCallback((fieldId: string, value: string) => {
    setDocument(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.id === fieldId ? { ...f, completed: true, value } : f
      )
    }));
  }, []);

  // Field clear handler (for undo)
  const handleFieldClear = useCallback((fieldId: string) => {
    setDocument(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.id === fieldId ? { ...f, completed: false, value: undefined } : f
      )
    }));
  }, []);

  // All fields complete handler
  const handleAllFieldsComplete = useCallback(() => {
    setStep("review");
  }, []);

  // Add comment handler
  const handleAddComment = useCallback((comment: Omit<SigningComment, "id" | "createdAt">) => {
    const newComment: SigningComment = {
      id: `comment-${Date.now()}`,
      ...comment,
      createdAt: new Date()
    };
    setComments(prev => [...prev, newComment]);
    toast.success("Comment added");
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    setStep("submitting");
    setIsSubmitting(true);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setStep("success");
    onComplete?.();
  }, [onComplete]);

  // Decline handler
  const handleDecline = useCallback((reason: DeclineReason, note?: string) => {
    setShowDeclineModal(false);
    onDecline?.(reason, note);
    onClose();
    toast.success("Document declined", {
      description: "The sender has been notified."
    });
  }, [onDecline, onClose]);

  // Download handler
  const handleDownload = useCallback(() => {
    toast.success("Downloading signed document...");
  }, []);

  // View audit trail handler
  const handleViewAuditTrail = useCallback(() => {
    toast.success("Opening audit trail...");
  }, []);

  // Return to dashboard handler
  const handleReturnToDashboard = useCallback(() => {
    onClose();
  }, [onClose]);

  // Create account handler (for guests)
  const handleCreateAccount = useCallback(() => {
    toast.success("Redirecting to account creation...");
    // In real app, this would navigate to signup
  }, []);

  // More options handler
  const handleMoreOptions = useCallback(() => {
    // This opens the dropdown, handled by the DropdownMenu
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
                {documentName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* More options (only show during signing) */}
              {(step === "document" || step === "review") && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => setShowDeclineModal(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      Decline to sign
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Close button */}
              {step !== "success" && step !== "submitting" && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className={cn(
          "h-[calc(100vh-56px)] overflow-auto",
          step === "document" && "overflow-hidden"
        )}>
          <AnimatePresence mode="wait">
            {/* Step 0: OTP Verification */}
            {step === "otp" && (
              <SigningOTPVerification
                key="otp"
                email={recipientEmail}
                isGuest={isGuest}
                onVerified={handleOTPVerified}
                onChangeEmail={isGuest ? () => toast.info("Email change not implemented in demo") : undefined}
              />
            )}

            {/* Step 1: Overview */}
            {step === "overview" && (
              <SigningOverview
                key="overview"
                document={document}
                onStartSigning={handleStartSigning}
                onViewDocument={() => setStep("document")}
                onMoreOptions={handleMoreOptions}
              />
            )}

            {/* Step 2: Document Signing */}
            {step === "document" && (
              <motion.div
                key="document"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <SigningDocument
                  document={document}
                  onFieldComplete={handleFieldComplete}
                  onFieldClear={handleFieldClear}
                  onAllFieldsComplete={handleAllFieldsComplete}
                  onAddComment={handleAddComment}
                  signerName="John Doe"
                  signerEmail={recipientEmail}
                />
              </motion.div>
            )}

            {/* Step 3: Review Summary */}
            {step === "review" && (
              <SigningReviewSummary
                key="review"
                document={document}
                comments={comments}
                onSubmit={handleSubmit}
                onReviewDocument={() => setStep("document")}
                onAddComment={() => setStep("document")}
                onRequestExtension={() => toast.info("Extension request sent")}
                hasDeadlineExtension={!!dueDate}
              />
            )}

            {/* Submitting state */}
            {step === "submitting" && (
              <motion.div
                key="submitting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Submitting your signed document...</p>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === "success" && (
              <SigningSuccess
                key="success"
                documentName={documentName}
                isGuest={isGuest}
                onClose={handleReturnToDashboard}
                waitingOnOthers={true}
              />
            )}
          </AnimatePresence>
        </main>

        {/* Decline modal */}
        <SigningDeclineModal
          isOpen={showDeclineModal}
          onClose={() => setShowDeclineModal(false)}
          onDecline={handleDecline}
        />
      </motion.div>
    </AnimatePresence>
  );
}
