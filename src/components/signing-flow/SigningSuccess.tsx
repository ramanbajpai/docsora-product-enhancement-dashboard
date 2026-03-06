import { motion } from "framer-motion";
import { Check, FileText, Send, Eye, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SigningSuccessProps {
  documentName: string;
  isGuest?: boolean;
  onClose: () => void;
  waitingOnOthers?: boolean;
}

// Completion animation consistent with other Docsora success pages
function CompletionAnimation() {
  return (
    <div className="relative w-24 h-24 mb-8">
      {/* Outer glow pulse */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: [0, 0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      
      {/* Main circle */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/40 flex items-center justify-center bg-background"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      >
        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
        >
          <Check className="w-10 h-10 text-primary" strokeWidth={2} />
        </motion.div>
      </motion.div>
    </div>
  );
}

export function SigningSuccess({ 
  documentName,
  isGuest = false,
  onClose,
  waitingOnOthers = true
}: SigningSuccessProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center min-h-[500px] px-6 py-12"
    >
      {/* Success Animation */}
      <CompletionAnimation />

      {/* Primary Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-semibold text-foreground mb-4 text-center"
      >
        Signature recorded
      </motion.h2>

      {/* Explanation Copy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mb-8 max-w-md"
      >
        <p className="text-muted-foreground leading-relaxed">
          Your signature has been securely recorded and added to this document.
          {waitingOnOthers && (
            <> The final signed document will be automatically emailed to you once all required parties have completed signing.</>
          )}
        </p>
      </motion.div>

      {/* Document Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-md bg-muted/30 border border-border/50 rounded-xl p-4 mb-8"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-background border border-border/50 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{documentName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Signed just now</p>
            {waitingOnOthers && (
              <p className="text-xs text-muted-foreground mt-1">
                Status: <span className="text-foreground/70">Waiting on other signers</span>
              </p>
            )}
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>Audit trail active</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* What would you like to do next? */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-md mb-8"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 text-center">
          What would you like to do next?
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/sign')}
            variant="outline"
            className="flex-1 h-10"
          >
            <Send className="w-4 h-4 mr-2" />
            Send a document
          </Button>
          <Button
            onClick={() => navigate('/track')}
            variant="outline"
            className="flex-1 h-10"
          >
            <Eye className="w-4 h-4 mr-2" />
            Track status
          </Button>
        </div>
      </motion.div>

      {/* Close Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-md"
      >
        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full h-10 text-muted-foreground hover:text-foreground"
        >
          Close
        </Button>
      </motion.div>

      {/* Security Reassurance */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-xs text-muted-foreground/60 text-center mt-6"
      >
        Encrypted • Audit trail recorded • Legally binding under e-signature law
      </motion.p>

      {/* Platform Discovery */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-8"
      >
        <p className="text-xs text-muted-foreground mb-2">
          Docsora helps you manage the entire document lifecycle — from signing to storage, tracking, and sharing.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          See what else you can do
          <ArrowRight className="w-3 h-3" />
        </button>
      </motion.div>
    </motion.div>
  );
}
