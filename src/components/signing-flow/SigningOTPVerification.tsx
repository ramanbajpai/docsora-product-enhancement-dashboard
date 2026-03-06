import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

interface SigningOTPVerificationProps {
  email: string;
  isGuest?: boolean;
  onVerified: () => void;
  onChangeEmail?: () => void;
}

export function SigningOTPVerification({ 
  email, 
  isGuest = false,
  onVerified,
  onChangeEmail 
}: SigningOTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0 && !canResend) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendCooldown === 0) {
      setCanResend(true);
    }
  }, [resendCooldown, canResend]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    
    setIsVerifying(true);
    setError(null);

    // Simulate verification - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Mock: accept "123456" as valid OTP
    if (otp === "123456") {
      onVerified();
    } else {
      setError("Invalid code. Please try again.");
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setResendCooldown(30);
    setOtp("");
    setError(null);
    // In real app, this would trigger a new OTP send
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[400px] px-6 py-10"
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Shield className="w-8 h-8 text-primary" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
        Confirm your identity
      </h2>

      {/* Description */}
      <p className="text-muted-foreground text-center mb-8 max-w-sm">
        We've sent a one-time code to{" "}
        <span className="font-medium text-foreground">{maskedEmail}</span>
      </p>

      {/* OTP Input */}
      <div className="mb-6">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          disabled={isVerifying}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive mb-4"
        >
          {error}
        </motion.p>
      )}

      {/* Verify button (hidden when auto-submitting) */}
      {otp.length === 6 && !isVerifying && error && (
        <Button
          onClick={handleVerify}
          className="w-full max-w-xs mb-4"
        >
          Verify
        </Button>
      )}

      {/* Loading state */}
      {isVerifying && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span>Verifying...</span>
        </div>
      )}

      {/* Secondary actions */}
      <div className="flex flex-col items-center gap-3 mt-2">
        <button
          onClick={handleResend}
          disabled={!canResend || isVerifying}
          className={cn(
            "text-sm flex items-center gap-1.5 transition-colors",
            canResend 
              ? "text-primary hover:text-primary/80 cursor-pointer" 
              : "text-muted-foreground/50 cursor-not-allowed"
          )}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {canResend ? "Resend code" : `Resend code in ${resendCooldown}s`}
        </button>

        {isGuest && onChangeEmail && (
          <button
            onClick={onChangeEmail}
            disabled={isVerifying}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="w-3.5 h-3.5 inline mr-1.5" />
            Change email
          </button>
        )}
      </div>

      {/* Security note */}
      <p className="text-xs text-muted-foreground/60 text-center mt-8 max-w-xs">
        This code expires in 10 minutes. Do not share it with anyone.
      </p>
    </motion.div>
  );
}
