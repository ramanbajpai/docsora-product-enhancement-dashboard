import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, Calendar, Download, Eye, EyeOff, Shield, 
  X, ChevronDown, Crown, ArrowLeft, Send
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { TransferSettings as TransferSettingsType } from "@/pages/Transfer";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface TransferSettingsProps {
  deliveryMethod: 'link' | 'email';
  settings: TransferSettingsType;
  onSettingsChange: (settings: TransferSettingsType) => void;
  onBack: () => void;
  onSubmit: () => void;
  fileCount: number;
  totalSize?: number;
}

const premiumEase = [0.22, 1, 0.36, 1] as const;

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export function TransferSettingsPanel({
  deliveryMethod,
  settings,
  onSettingsChange,
  onBack,
  onSubmit,
  fileCount,
  totalSize = 0,
}: TransferSettingsProps) {
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const expiryDate = addDays(new Date(), settings.expiryDays);

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (!email) {
      setEmailError(null);
      return;
    }
    
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    if (settings.recipients.includes(email)) {
      setEmailError("This email has already been added");
      return;
    }
    
    onSettingsChange({
      ...settings,
      recipients: [...settings.recipients, email]
    });
    setEmailInput("");
    setEmailError(null);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    onSettingsChange({
      ...settings,
      recipients: settings.recipients.filter(e => e !== emailToRemove)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleEmailInputChange = (value: string) => {
    setEmailInput(value);
    if (emailError) setEmailError(null);
  };

  // For email: require recipients and non-empty subject
  const canSubmit = deliveryMethod === 'link' 
    ? true 
    : settings.recipients.length > 0 && settings.subject.trim().length > 0;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: premiumEase }}
        className="w-full max-w-lg"
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Title & Context */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: premiumEase }}
        >
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {deliveryMethod === 'email' ? 'Send via email' : 'Generate secure link'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
            <span>{fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
            {totalSize > 0 && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span>{formatFileSize(totalSize)}</span>
              </>
            )}
            <span className="text-muted-foreground/40">•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              End-to-end encrypted
            </span>
          </p>
        </motion.div>

        {/* Settings Container */}
        <div className="space-y-5">
          {/* Email Recipients (only for email method) */}
          {deliveryMethod === 'email' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: premiumEase }}
              className={cn(
                "rounded-2xl p-5",
                "bg-card/60 backdrop-blur-xl",
                "border border-border/40"
              )}
            >
              <Label className="font-semibold text-foreground text-sm mb-3 block">Recipients</Label>
              
              {/* Email Chips */}
              <AnimatePresence>
                {settings.recipients.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 mb-3"
                  >
                    {settings.recipients.map((email) => (
                      <motion.span
                        key={email}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                      >
                        {email}
                        <button
                          onClick={() => handleRemoveEmail(email)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Input
                type="email"
                placeholder="name@example.com"
                value={emailInput}
                onChange={(e) => handleEmailInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleAddEmail}
                className={cn(
                  "bg-background/60",
                  emailError && "border-destructive focus-visible:ring-destructive"
                )}
              />
              
              {/* Error or Helper Text */}
              <AnimatePresence mode="wait">
                {emailError ? (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-destructive mt-2"
                  >
                    {emailError}
                  </motion.p>
                ) : (
                  <motion.p
                    key="helper"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-muted-foreground mt-2"
                  >
                    Press Enter to add recipients
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Subject Field (only for email method) */}
          {deliveryMethod === 'email' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4, ease: premiumEase }}
              className={cn(
                "rounded-2xl p-5",
                "bg-card/60 backdrop-blur-xl",
                "border border-border/40"
              )}
            >
              <Label className="font-semibold text-foreground text-sm mb-3 block">Subject</Label>
              <Input
                type="text"
                placeholder="Docsora file transfer"
                value={settings.subject}
                onChange={(e) => onSettingsChange({ ...settings, subject: e.target.value })}
                className="bg-background/60"
              />
            </motion.div>
          )}

          {/* Optional Message (only for email) */}
          {deliveryMethod === 'email' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.21, duration: 0.4, ease: premiumEase }}
              className={cn(
                "rounded-2xl p-5",
                "bg-card/60 backdrop-blur-xl",
                "border border-border/40"
              )}
            >
              <Label className="font-semibold text-foreground text-sm mb-3 block">Message (optional)</Label>
              <Textarea
                placeholder="Add a personal message…"
                value={settings.message}
                onChange={(e) => onSettingsChange({ ...settings, message: e.target.value })}
                className="bg-background/60 min-h-[80px] resize-none"
              />
            </motion.div>
          )}

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: deliveryMethod === 'email' ? 0.24 : 0.15, duration: 0.4, ease: premiumEase }}
            className={cn(
              "rounded-2xl p-5",
              "bg-card/60 backdrop-blur-xl",
              "border border-border/40"
            )}
          >
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-4 h-4 text-primary" />
              <Label className="font-semibold text-foreground text-sm">Security</Label>
            </div>

            <div className="space-y-4">
              {/* Password Protection */}
              <div className={cn(
                "p-4 rounded-xl transition-all duration-200",
                settings.password.length > 0 
                  ? "bg-primary/5 border border-primary/20" 
                  : "bg-muted/30 border border-transparent"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                      settings.password.length > 0 
                        ? "bg-primary/15 text-primary" 
                        : "bg-muted/50 text-muted-foreground"
                    )}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <Label className="font-medium text-sm">Password protection</Label>
                      <p className="text-xs text-muted-foreground">Require password to access</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.password.length > 0}
                    onCheckedChange={(checked) => {
                      if (!checked) setShowPassword(false);
                      onSettingsChange({ ...settings, password: checked ? 'secure' : '' });
                    }}
                  />
                </div>
                <AnimatePresence>
                  {settings.password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="relative mt-3">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={settings.password === 'secure' ? '' : settings.password}
                          onChange={(e) => onSettingsChange({ ...settings, password: e.target.value })}
                          className="bg-background/60 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Expiry Date */}
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <Label className="font-medium text-sm">Expires</Label>
                      <p className="text-xs text-muted-foreground">
                        {format(expiryDate, 'MMM d, yyyy')} · {settings.expiryDays} days
                      </p>
                    </div>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="px-3 py-1.5 rounded-lg bg-background/60 border border-border/50 text-sm font-medium hover:bg-background transition-colors flex items-center gap-1.5">
                        {format(expiryDate, 'MMM d')}
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={expiryDate}
                        onSelect={(date) => {
                          if (date) {
                            const days = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            onSettingsChange({ ...settings, expiryDays: Math.max(1, days) });
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Download Limit */}
              <div className={cn(
                "p-4 rounded-xl transition-all duration-200",
                settings.downloadLimit !== null 
                  ? "bg-primary/5 border border-primary/20" 
                  : "bg-muted/30 border border-transparent"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                      settings.downloadLimit !== null 
                        ? "bg-primary/15 text-primary" 
                        : "bg-muted/50 text-muted-foreground"
                    )}>
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <Label className="font-medium text-sm">Download limit</Label>
                      <p className="text-xs text-muted-foreground">Max number of downloads</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.downloadLimit !== null}
                    onCheckedChange={(checked) => 
                      onSettingsChange({ ...settings, downloadLimit: checked ? 10 : null })
                    }
                  />
                </div>
                <AnimatePresence>
                  {settings.downloadLimit !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        type="number"
                        value={settings.downloadLimit}
                        onChange={(e) => onSettingsChange({ 
                          ...settings, 
                          downloadLimit: parseInt(e.target.value) || 1 
                        })}
                        className="mt-3 w-24 bg-background/60"
                        min={1}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View Only */}
              <div className={cn(
                "p-4 rounded-xl transition-all duration-200",
                settings.viewOnly 
                  ? "bg-primary/5 border border-primary/20" 
                  : "bg-muted/30 border border-transparent"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                      settings.viewOnly 
                        ? "bg-primary/15 text-primary" 
                        : "bg-muted/50 text-muted-foreground"
                    )}>
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <Label className="font-medium text-sm">View only</Label>
                      <p className="text-xs text-muted-foreground">Prevent downloads</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Pro
                    </span>
                    <Switch
                      checked={settings.viewOnly}
                      onCheckedChange={(checked) => 
                        onSettingsChange({ ...settings, viewOnly: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Primary CTA */}
          <motion.div 
            className="pt-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: deliveryMethod === 'email' ? 0.28 : 0.2, duration: 0.4, ease: premiumEase }}
          >
            <motion.button
              onClick={onSubmit}
              disabled={!canSubmit}
              whileHover={canSubmit ? { scale: 1.02, y: -2 } : {}}
              whileTap={canSubmit ? { scale: 0.98 } : {}}
              className={cn(
                "w-full relative inline-flex items-center justify-center gap-2.5",
                "px-8 py-4 rounded-2xl",
                "text-base font-semibold text-primary-foreground",
                "bg-gradient-to-b from-primary via-primary to-primary/85",
                "shadow-[0_6px_32px_-6px_hsl(var(--primary)/0.5),0_2px_8px_-2px_hsl(var(--primary)/0.3)]",
                "transition-all duration-300",
                canSubmit && "hover:shadow-[0_12px_44px_-6px_hsl(var(--primary)/0.6),0_4px_16px_-4px_hsl(var(--primary)/0.4)]",
                "overflow-hidden group",
                !canSubmit && "opacity-50 cursor-not-allowed"
              )}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
              />
              {deliveryMethod === 'email' ? (
                <Send className="w-4 h-4 relative z-10" />
              ) : (
                <Shield className="w-4 h-4 relative z-10" />
              )}
              <span className="relative z-10">
                {deliveryMethod === 'email' ? 'Send transfer' : 'Generate link'}
              </span>
            </motion.button>
          </motion.div>

          {/* Trust Footer */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="text-center text-[11px] text-muted-foreground/60 flex items-center justify-center gap-1.5 pt-1"
          >
            <Lock className="w-3 h-3" />
            End-to-end encrypted • Files auto-expire after delivery
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
