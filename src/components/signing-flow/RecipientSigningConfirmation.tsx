import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Shield, Lock, Award, FileText, Send, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type FlowStep = "legal" | "email-confirm" | "otp" | "success";

interface RecipientSigningConfirmationProps {
  documentName: string;
  signaturePreview?: string;
  signatureFont?: string;
  fullName: string;
  email: string;
  isAuthenticated?: boolean;
  isFinalSigner?: boolean; // Whether this is the last signer
  onComplete: () => void;
  onBack: () => void;
  onViewDocument: () => void;
  onBackToTrack: () => void;
  onClose?: () => void; // For closing/returning to email
}

// Animated completion checkmark component (matching AI Check style)
function CompletionAnimation() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative w-20 h-20 mx-auto"
    >
      {/* Glow pulse */}
      <motion.div
        className="absolute inset-[-10px] rounded-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0, 0.4, 0.15],
          scale: [0.8, 1.1, 1],
        }}
        transition={{ 
          duration: 1.2,
          times: [0, 0.4, 1],
          ease: "easeOut"
        }}
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.2), transparent 65%)",
          filter: "blur(12px)",
        }}
      />

      <svg className="w-full h-full" viewBox="0 0 80 80">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="hsl(var(--primary) / 0.08)"
          strokeWidth="2.5"
        />
        
        {/* Progress ring */}
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="hsl(var(--primary) / 0.5)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          style={{
            rotate: -90,
            transformOrigin: "center",
            filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.3))",
          }}
        />
        
        {/* Checkmark */}
        <motion.path
          d="M26 42 L36 52 L56 32"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ 
            pathLength: { delay: 0.5, duration: 0.35, ease: "easeOut" },
            opacity: { delay: 0.5, duration: 0.1 }
          }}
          style={{
            filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))",
          }}
        />
      </svg>
    </motion.div>
  );
}

// Success step component
function SuccessStep({ 
  documentName, 
  isFinalSigner, 
  onClose 
}: { 
  documentName: string; 
  isFinalSigner: boolean; 
  onClose: () => void;
}) {
  const navigate = useNavigate();

  return (
    <motion.div
      key="success"
      className="w-full max-w-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated Completion Checkmark */}
      <CompletionAnimation />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="text-xl font-semibold text-foreground tracking-tight mt-6 mb-3 text-center"
      >
        Signature submitted
      </motion.h1>

      {/* Explanation Copy - Clear hierarchy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.4 }}
        className="text-center mb-8"
      >
        <p className="text-sm text-muted-foreground mb-1.5">
          Your signature has been securely added to this document.
        </p>
        {!isFinalSigner && (
          <p className="text-xs text-muted-foreground/60">
            You'll receive the final signed copy by email once all required parties have completed signing.
          </p>
        )}
        {isFinalSigner && (
          <p className="text-xs text-muted-foreground/60">
            All parties have signed. A final copy has been sent to your email.
          </p>
        )}
      </motion.div>

      {/* Document card with audit trail */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.4 }}
        className="w-full bg-muted/30 border border-border/50 rounded-xl p-4 mb-8"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-background border border-border/50 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-foreground truncate">
              {documentName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Signed just now</p>
            {!isFinalSigner && (
              <p className="text-xs text-muted-foreground mt-1">
                Status: <span className="text-foreground/70">Waiting on other signers</span>
              </p>
            )}
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/70">
              <Shield className="w-3 h-3" />
              <span>Audit trail active</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* What would you like to do next? */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.4 }}
        className="mb-6"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 text-center">
          What would you like to do next?
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/track')}
            className="flex-1 h-11"
          >
            <Eye className="w-4 h-4 mr-2" />
            Track document
          </Button>
          <Button
            onClick={() => navigate('/sign')}
            variant="outline"
            className="flex-1 h-11"
          >
            <Send className="w-4 h-4 mr-2" />
            Send a document
          </Button>
        </div>
      </motion.div>

      {/* Close Button - Tertiary style */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="mb-8"
      >
        <button
          onClick={onClose}
          className="w-full text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors py-2"
        >
          Close
        </button>
      </motion.div>

      {/* Security Reassurance */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.4 }}
        className="text-[11px] text-muted-foreground/40 text-center mb-6"
      >
        Encrypted • Audit trail recorded • Legally binding under e-signature law
      </motion.p>

      {/* Platform Discovery */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.4 }}
        className="text-center"
      >
        <p className="text-xs text-muted-foreground/50 mb-2">
          Manage signing, tracking, storage, and sharing — all in one secure workspace.
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

export function RecipientSigningConfirmation({
  documentName,
  signaturePreview,
  signatureFont = "'Dancing Script', cursive",
  fullName,
  email,
  isAuthenticated = false,
  isFinalSigner = false,
  onComplete,
  onBack,
  onViewDocument,
  onBackToTrack,
  onClose,
}: RecipientSigningConfirmationProps) {
  const [step, setStep] = useState<FlowStep>("legal");
  const [agreed, setAgreed] = useState(false);
  const [guestEmail, setGuestEmail] = useState(email);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);

  const trustIndicators = [
    { icon: Shield, label: "SOC 2" },
    { icon: Award, label: "ISO 27001" },
    { icon: Lock, label: "Encrypted" },
  ];

  const startCooldownTimer = useCallback(() => {
    setResendCooldown(30);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLegalConfirm = useCallback(() => {
    if (!agreed) return;
    if (isAuthenticated) {
      setStep("otp");
      startCooldownTimer();
    } else {
      setStep("email-confirm");
    }
  }, [agreed, isAuthenticated, startCooldownTimer]);

  const handleEmailConfirm = useCallback(() => {
    if (!guestEmail.trim() || !guestEmail.includes("@")) return;
    setStep("otp");
    startCooldownTimer();
  }, [guestEmail, startCooldownTimer]);

  const handleVerifyOTP = useCallback(async () => {
    if (otp.length !== 5) return;
    setIsVerifying(true);
    setOtpError(null);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (otp === "12345") {
      setStep("success");
      onComplete();
    } else {
      setOtpError("Invalid code. Please try again.");
      setIsVerifying(false);
    }
  }, [otp, onComplete]);

  const handleOTPChange = useCallback((value: string) => {
    setOtp(value);
    setOtpError(null);
    if (value.length === 5) {
      setTimeout(() => handleVerifyOTP(), 100);
    }
  }, [handleVerifyOTP]);

  const handleResend = useCallback(() => {
    setOtp("");
    setOtpError(null);
    startCooldownTimer();
  }, [startCooldownTimer]);

  const maskedEmail = (isAuthenticated ? email : guestEmail).replace(
    /(.{2})(.*)(@.*)/,
    "$1***$3"
  );

  // Get back handler based on current step
  const getBackHandler = () => {
    switch (step) {
      case "legal":
        return onBack;
      case "email-confirm":
        return () => setStep("legal");
      case "otp":
        return () => setStep(isAuthenticated ? "legal" : "email-confirm");
      default:
        return undefined;
    }
  };

  const backHandler = getBackHandler();

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Back Button - Top Left Corner */}
      {backHandler && step !== "success" && (
        <motion.button
          className="fixed top-6 left-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
          onClick={backHandler}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>
      )}

      {/* Centered Content Container */}
      <div className="min-h-screen flex items-center justify-center px-6 py-10">
        <AnimatePresence mode="wait">
          {/* ========== LEGAL CONFIRMATION STEP ========== */}
          {step === "legal" && (
            <motion.div
              key="legal"
              className="w-full max-w-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-3xl font-light text-foreground tracking-tight mb-3">
                  Ready to sign
                </h1>
                <p className="text-muted-foreground">Review your signature below</p>
              </div>

              {/* Signature Preview */}
              <div className="mb-10 p-8 bg-card/50 rounded-2xl border border-border/50">
                {signaturePreview ? (
                  <img
                    src={signaturePreview}
                    alt="Your signature"
                    className="max-h-16 mx-auto object-contain"
                  />
                ) : (
                  <div
                    className="text-3xl text-primary text-center"
                    style={{ fontFamily: signatureFont }}
                  >
                    {fullName}
                  </div>
                )}
              </div>

              {/* Legal Checkbox */}
              <div className="mb-10">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked as boolean)}
                    className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                    I agree to sign this document electronically and understand this is legally binding.
                  </span>
                </label>
              </div>

              {/* Sign Button */}
              <Button
                size="lg"
                className="w-full h-14 text-base font-medium"
                onClick={handleLegalConfirm}
                disabled={!agreed}
              >
                Sign Document
              </Button>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 mt-10">
                {trustIndicators.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 text-muted-foreground/50"
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ========== EMAIL CONFIRMATION STEP ========== */}
          {step === "email-confirm" && (
            <motion.div
              key="email-confirm"
              className="w-full max-w-md text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Confirm your email
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                We'll send a verification code to confirm your identity before signing.
              </p>

              {/* Email Input */}
              <div className="mb-6">
                <Input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="text-center text-base h-12"
                />
              </div>

              {/* Continue Button */}
              <Button
                size="lg"
                className="w-full h-14 text-base font-medium"
                onClick={handleEmailConfirm}
                disabled={!guestEmail.trim() || !guestEmail.includes("@")}
              >
                Send verification code
              </Button>
            </motion.div>
          )}

          {/* ========== OTP VERIFICATION STEP ========== */}
          {step === "otp" && (
            <motion.div
              key="otp"
              className="w-full max-w-md text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Confirm your identity
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                We've sent a one-time code to{" "}
                <span className="font-medium text-foreground">{maskedEmail}</span>
              </p>

              {/* OTP Input */}
              <div className="flex justify-center mb-6">
                <InputOTP
                  maxLength={5}
                  value={otp}
                  onChange={handleOTPChange}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Error message */}
              {otpError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive mb-4"
                >
                  {otpError}
                </motion.p>
              )}

              {/* Loading state */}
              {isVerifying && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              )}

              {/* Verify Button */}
              <Button
                size="lg"
                className="w-full h-14 text-base font-medium mt-6"
                onClick={() => {
                  if (otp.length === 5) {
                    setIsVerifying(true);
                    setTimeout(() => {
                      setIsVerifying(false);
                      setStep("success");
                    }, 1000);
                  }
                }}
                disabled={otp.length !== 5 || isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </Button>

              {/* Resend */}
              <button
                onClick={handleResend}
                disabled={!canResend || isVerifying}
                className={cn(
                  "text-sm transition-colors mt-4",
                  canResend
                    ? "text-primary hover:text-primary/80 cursor-pointer"
                    : "text-muted-foreground/50 cursor-not-allowed"
                )}
              >
                {canResend ? "Resend code" : `Resend code in ${resendCooldown}s`}
              </button>

              {/* Security note */}
              <p className="text-xs text-muted-foreground/60 mt-8">
                This code expires in 10 minutes. Do not share it with anyone.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                {"Can't find the code? Check your Junk/Spam folder."}
              </p>
            </motion.div>
          )}

          {/* ========== SUCCESS STEP ========== */}
          {step === "success" && (
            <SuccessStep 
              documentName={documentName}
              isFinalSigner={isFinalSigner}
              onClose={onClose || onBackToTrack}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
