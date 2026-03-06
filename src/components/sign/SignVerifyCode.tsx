import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignVerifyCodeProps {
  email: string;
  onVerified: () => void;
  onChangeEmail: () => void;
}

const premiumEase = [0.22, 1, 0.36, 1] as const;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

const SignVerifyCode = ({ email, onVerified, onChangeEmail }: SignVerifyCodeProps) => {
  const [code, setCode] = useState<string[]>(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((p) => p - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d?$/.test(value)) return;
      const next = [...code];
      next[index] = value;
      setCode(next);
      setError("");

      if (value && index < 4) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [code]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [code]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
      if (!pasted) return;
      const next = [...code];
      for (let i = 0; i < 5; i++) {
        next[i] = pasted[i] || "";
      }
      setCode(next);
      const focusIdx = Math.min(pasted.length, 4);
      inputRefs.current[focusIdx]?.focus();
    },
    [code]
  );

  const handleVerify = useCallback(() => {
    const fullCode = code.join("");
    if (fullCode.length !== 5) return;

    setIsVerifying(true);
    setError("");

    setTimeout(() => {
      // Demo: accept any 5-digit code except "00000"
      if (fullCode === "00000") {
        setError("Invalid or expired code. Please try again.");
        setIsVerifying(false);
      } else {
        onVerified();
      }
    }, 1200);
  }, [code, onVerified]);

  // Auto-submit when all digits filled
  useEffect(() => {
    if (code.every((d) => d)) {
      handleVerify();
    }
  }, [code, handleVerify]);

  const handleResend = () => {
    setResendCooldown(30);
    setCode(["", "", "", "", ""]);
    setError("");
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const isFilled = code.every((d) => d);

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
          <Shield className="w-8 h-8 text-primary" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl font-semibold text-foreground tracking-tight mb-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Enter verification code
        </motion.h1>

        <motion.p
          className="text-sm text-muted-foreground mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          We sent a 5-digit code to{" "}
          <span className="text-foreground/70 font-medium">{maskEmail(email)}</span>
        </motion.p>

        {/* OTP Inputs */}
        <motion.div
          className="flex justify-center gap-2.5 mb-4"
          onPaste={handlePaste}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {code.map((digit, i) => (
            <motion.input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={isVerifying}
              className={cn(
                "w-12 h-14 text-center text-xl font-semibold rounded-xl border-2",
                "transition-all duration-200 bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30",
                error
                  ? "border-destructive/50 text-destructive"
                  : digit
                  ? "border-primary/50 text-foreground"
                  : "border-border/50 text-foreground"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.04 }}
            />
          ))}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-destructive mb-3"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Helper */}
        <motion.p
          className="text-xs text-muted-foreground/60 mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Can't find the email? Check your junk or spam folder.
        </motion.p>

        {/* Resend */}
        <motion.button
          onClick={handleResend}
          disabled={resendCooldown > 0 || isVerifying}
          className={cn(
            "text-sm font-medium transition-colors mb-6 inline-flex items-center gap-1.5",
            resendCooldown > 0 || isVerifying
              ? "text-muted-foreground/50 cursor-not-allowed"
              : "text-primary hover:text-primary/80"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </motion.button>

        {/* Verify Button (shown after auto-submit fails) */}
        {isFilled && !isVerifying && error && (
          <motion.button
            onClick={handleVerify}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl mb-4",
              "text-sm font-semibold text-primary-foreground",
              "bg-gradient-to-b from-primary via-primary to-primary/85",
              "shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]",
              "hover:shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.6)]",
              "transition-all duration-300"
            )}
          >
            <Check className="w-4 h-4" />
            Verify & continue
          </motion.button>
        )}

        {/* Loading */}
        {isVerifying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4"
          >
            <motion.div
              className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Verifying...
          </motion.div>
        )}

        {/* Change email */}
        <motion.button
          onClick={onChangeEmail}
          disabled={isVerifying}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          Change email
        </motion.button>

        {/* Security note */}
        <motion.p
          className="text-[11px] text-muted-foreground/50 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          This code expires in 10 minutes. Do not share it with anyone.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SignVerifyCode;
