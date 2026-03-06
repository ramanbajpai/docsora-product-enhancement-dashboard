import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SignVerifyEmailProps {
  onSendCode: (email: string) => void;
  onBack: () => void;
}

const premiumEase = [0.22, 1, 0.36, 1] as const;

const SignVerifyEmail = ({ onSendCode, onBack }: SignVerifyEmailProps) => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = () => {
    if (!isValidEmail) return;
    setIsSending(true);
    setTimeout(() => {
      onSendCode(email);
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] px-6">
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.5, ease: premiumEase }}
      >
        {/* Icon */}
        <motion.div
          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: premiumEase }}
        >
          <Mail className="w-8 h-8 text-primary" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl font-semibold text-foreground tracking-tight mb-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          Verify your identity
        </motion.h1>

        <motion.p
          className="text-sm text-muted-foreground mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Enter your email to receive a verification code
        </motion.p>

        {/* Email Input */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-12 text-center text-base bg-secondary/50 border-border/50 rounded-xl focus-visible:ring-primary/30"
            disabled={isSending}
            autoFocus
          />
        </motion.div>

        {/* Submit Button */}
        <motion.button
          onClick={handleSubmit}
          disabled={!isValidEmail || isSending}
          whileHover={isValidEmail && !isSending ? { scale: 1.02 } : {}}
          whileTap={isValidEmail && !isSending ? { scale: 0.98 } : {}}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={cn(
            "w-full relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl",
            "text-sm font-semibold text-primary-foreground",
            "bg-gradient-to-b from-primary via-primary to-primary/85",
            "shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]",
            "transition-all duration-300 overflow-hidden",
            (!isValidEmail || isSending)
              ? "opacity-50 cursor-not-allowed"
              : "hover:shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.6)]"
          )}
        >
          {isSending ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Sending code...</span>
            </>
          ) : (
            <>
              <span>Send verification code</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>

        {/* Back link */}
        <motion.button
          onClick={onBack}
          disabled={isSending}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Back to review
        </motion.button>

        {/* Security note */}
        <motion.p
          className="text-[11px] text-muted-foreground/50 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          We'll send a one-time code to verify your identity before sending.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SignVerifyEmail;
