import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Shield, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProtectEditorProps {
  files: File[];
  onProcess: () => void;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ProtectEditor({ files, onProcess }: ProtectEditorProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const passwordStrength = getPasswordStrength(password);

  function getPasswordStrength(pwd: string): { label: string; color: string; width: string } {
    if (pwd.length === 0) return { label: "", color: "bg-muted", width: "w-0" };
    if (pwd.length < 6) return { label: "Weak", color: "bg-destructive", width: "w-1/4" };
    if (pwd.length < 10) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) {
      return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
    }
    return { label: "Good", color: "bg-primary", width: "w-3/4" };
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          animate={{
            opacity: [0.08, 0.12, 0.08],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: appleEasing }}
          className="mb-6"
        >
          <h1 className="text-2xl font-semibold text-foreground mb-1">Protect Document</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Add password protection to your PDF</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
              <FileText className="w-3.5 h-3.5" />
              <span>{files.length} {files.length === 1 ? 'file' : 'files'} selected</span>
            </div>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: appleEasing }}
          className="relative"
        >
          {/* Card glow */}
          <div 
            className="absolute -inset-6 rounded-[32px] pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          {/* Glass Card */}
          <div 
            className="relative rounded-2xl overflow-hidden p-6"
            style={{
              background: 'hsl(var(--card) / 0.7)',
              backdropFilter: 'blur(40px)',
              border: '1px solid hsl(var(--border) / 0.5)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Shield Icon - smaller and subtler */}
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-foreground mb-2 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-background px-4 pr-12 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="h-1 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: passwordStrength.width === "w-0" ? "0%" : 
                          passwordStrength.width === "w-1/4" ? "25%" :
                          passwordStrength.width === "w-2/4" ? "50%" :
                          passwordStrength.width === "w-3/4" ? "75%" : "100%" }}
                        className={cn("h-full transition-all", passwordStrength.color)}
                      />
                    </div>
                    <p className={cn("text-xs mt-1", 
                      passwordStrength.label === "Weak" ? "text-destructive" :
                      passwordStrength.label === "Strong" ? "text-emerald-500" : "text-muted-foreground"
                    )}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-foreground mb-2 block">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "w-full h-10 rounded-lg border bg-background px-4 pr-12 text-sm transition-colors",
                      confirmPassword.length > 0 && !passwordsMatch
                        ? "border-destructive focus:border-destructive focus:ring-destructive"
                        : passwordsMatch 
                          ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500"
                          : "border-border focus:border-primary focus:ring-primary"
                    )}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                )}
                {passwordsMatch && (
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>
            </div>

            {/* CTA Button - inside card */}
            <div className="mt-6">
              <Button
                onClick={onProcess}
                disabled={!passwordsMatch}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10"
              >
                <Lock className="w-4 h-4 mr-2" />
                Protect document
              </Button>
            </div>

            {/* Info Box */}
            <div className="mt-5 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Anyone with this password will be able to open and view your document. Make sure to store your password safely.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
