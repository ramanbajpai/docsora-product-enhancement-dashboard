import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Check, X, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DocumentPasswordGateProps {
  documentId: string;
  documentName: string;
  mode: "setup" | "entry";
  senderEmail?: string;
  recipientEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// In-memory storage for document passwords (document-specific, recipient-specific)
// In production, this would be stored securely server-side
const documentPasswords = new Map<string, string>();

// Password validation rules
const validatePassword = (password: string) => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasNumber: /\d/.test(password),
});

export function DocumentPasswordGate({
  documentId,
  documentName,
  mode,
  senderEmail,
  recipientEmail,
  onSuccess,
  onCancel,
}: DocumentPasswordGateProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetupSubmit = useCallback(async () => {
    setError("");
    
    if (!password) {
      setError("Please enter a password");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Store password for this document (in production, hash and store securely)
    documentPasswords.set(documentId, password);
    
    setIsSubmitting(false);
    onSuccess();
  }, [password, documentId, onSuccess]);

  const handleEntrySubmit = useCallback(async () => {
    setError("");
    
    if (!password) {
      setError("Please enter the password");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedPassword = documentPasswords.get(documentId);
    
    if (storedPassword !== password) {
      setError("Incorrect password. Please try again.");
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(false);
    onSuccess();
  }, [password, documentId, onSuccess]);

  const handleSubmit = mode === "setup" ? handleSetupSubmit : handleEntrySubmit;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleSubmit();
    }
  };

  const handleContactSender = () => {
    const subject = encodeURIComponent(`Password request for "${documentName}"`);
    const mailtoLink = senderEmail 
      ? `mailto:${senderEmail}?subject=${subject}`
      : `mailto:?subject=${subject}`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
            <Shield className="w-7 h-7 text-muted-foreground" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-foreground mb-2">
            {mode === "setup" ? "Secure access required" : "Enter document password"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {mode === "setup" 
              ? "This document is protected. Please set a password to securely access it."
              : (
                <>
                  The sender secured this document with a password. We sent it to <span className="text-foreground">{recipientEmail || "john@example.com"}</span> from <span className="text-foreground">noreply@docsora.com</span>.
                </>
              )
            }
          </p>
          {mode === "entry" && (
            <p className="text-xs text-muted-foreground/60 mt-2">
              Check Spam/Junk if you can't see it.
            </p>
          )}
        </div>

        {/* Document context */}
        <div className="bg-muted/30 border border-border/50 rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-muted/50 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-muted-foreground/70" />
          </div>
          <span className="text-sm text-foreground truncate">{documentName}</span>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Password field */}
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter password"
              className={cn(
                "pr-10 h-11 bg-background",
                error && "border-destructive focus-visible:ring-destructive/30"
              )}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              {error}
            </motion.p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !password}
            className="w-full h-11"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full h-11 text-muted-foreground"
          >
            Cancel
          </Button>
        </div>

        {/* Recovery guidance (entry mode only) */}
        {mode === "entry" && (
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground/60">
              Still can't find it?{" "}
              <button
                type="button"
                onClick={handleContactSender}
                className="text-primary hover:text-primary/80 transition-colors underline-offset-2 hover:underline"
              >
                Contact sender
              </button>
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Password rule indicator component
function PasswordRule({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className={cn(
      "flex items-center gap-2 text-xs transition-colors",
      passed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60"
    )}>
      <div className={cn(
        "w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors",
        passed ? "bg-emerald-500/15" : "bg-muted/50"
      )}>
        {passed ? (
          <Check className="w-2 h-2" />
        ) : (
          <div className="w-1 h-1 rounded-full bg-current" />
        )}
      </div>
      {label}
    </div>
  );
}

// Helper to check if a document requires password setup or entry
export function useDocumentPasswordState(documentId: string): "setup" | "entry" | "unlocked" {
  const hasPassword = documentPasswords.has(documentId);
  // In a real app, we'd also check session state to see if password was entered this session
  // For now, we'll use a simple in-memory check
  return hasPassword ? "unlocked" : "setup";
}

// Helper to reset password state (for testing/development)
export function resetDocumentPassword(documentId: string) {
  documentPasswords.delete(documentId);
}
