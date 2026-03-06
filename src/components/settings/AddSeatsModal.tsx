import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, Minus, Plus, CreditCard, Calendar, 
  Info, ArrowRight, Sparkles, CheckCircle2, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddSeatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSeats: number;
  seatsUsed: number;
  planName: string;
  billingCycle: "monthly" | "yearly";
  renewalDate: string;
  pricePerSeat: number;
  onSeatsAdded?: () => void;
}

export function AddSeatsModal({
  open,
  onOpenChange,
  currentSeats,
  seatsUsed,
  planName,
  billingCycle,
  renewalDate,
  pricePerSeat,
  onSeatsAdded,
}: AddSeatsModalProps) {
  const [additionalSeats, setAdditionalSeats] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when drawer opens
  useEffect(() => {
    if (open) {
      setAdditionalSeats(1);
      setIsProcessing(false);
    }
  }, [open]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onOpenChange]);

  // Calculate pricing
  const daysUntilRenewal = Math.ceil(
    (new Date(renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const daysInCycle = billingCycle === "monthly" ? 30 : 365;
  const proratedRatio = Math.max(0, daysUntilRenewal / daysInCycle);
  
  const fullCycleCost = additionalSeats * pricePerSeat;
  const proratedCost = fullCycleCost * proratedRatio;
  const newTotalSeats = currentSeats + additionalSeats;
  const newRecurringTotal = newTotalSeats * pricePerSeat;

  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    
    // Simulate redirect to Stripe Checkout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Members added successfully", {
      description: "You can invite new members now.",
    });
    
    // Mock success after "checkout"
    setTimeout(() => {
      setIsProcessing(false);
      onOpenChange(false);
      onSeatsAdded?.();
    }, 500);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:w-[460px] sm:max-w-[460px] p-0 flex flex-col overflow-hidden border-l border-border/50"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold text-foreground">Add members</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Add more members to collaborate securely on Docsora
              </SheetDescription>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {/* Current Plan Summary - Read Only */}
            <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">Current plan</span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                  {planName}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Members included</span>
                  <p className="font-medium text-foreground">{currentSeats} members</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Members active</span>
                  <p className="font-medium text-foreground">{seatsUsed} of {currentSeats}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Billing cycle</span>
                  <p className="font-medium text-foreground capitalize">{billingCycle}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Next renewal</span>
                  <p className="font-medium text-foreground">{renewalDate}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Additional Members Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Additional members</span>
                <span className="text-xs text-muted-foreground font-medium">
                  ${pricePerSeat} / member / {billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>
              
              {/* Stepper */}
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAdditionalSeats(Math.max(1, additionalSeats - 1))}
                  disabled={additionalSeats <= 1}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    "border-2 transition-all duration-200",
                    additionalSeats <= 1
                      ? "border-border bg-muted text-muted-foreground cursor-not-allowed"
                      : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5"
                  )}
                >
                  <Minus className="w-5 h-5" />
                </motion.button>
                
                <motion.div
                  key={additionalSeats}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 h-16 rounded-xl bg-primary/10 border-2 border-primary/30 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl font-bold text-primary">{additionalSeats}</span>
                  <span className="text-[10px] text-primary/70 -mt-0.5">
                    member{additionalSeats !== 1 ? 's' : ''}
                  </span>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAdditionalSeats(Math.min(50, additionalSeats + 1))}
                  disabled={additionalSeats >= 50}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    "border-2 transition-all duration-200",
                    additionalSeats >= 50
                      ? "border-border bg-muted text-muted-foreground cursor-not-allowed"
                      : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5"
                  )}
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Quick add chips */}
              <div className="flex items-center justify-center gap-2">
                {[1, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setAdditionalSeats(num)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                      additionalSeats === num
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Pricing Breakdown - Green positive card */}
            <div className="space-y-3">
              {/* Prorated cost card */}
              <div className="bg-success/5 dark:bg-success/10 rounded-xl p-4 border border-success/20">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <span className="text-sm font-semibold text-foreground">Due today</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Prorated for {daysUntilRenewal} remaining days
                    </p>
                  </div>
                  <motion.span 
                    key={proratedCost.toFixed(2)}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xl font-bold text-foreground"
                  >
                    ${proratedCost.toFixed(2)}
                  </motion.span>
                </div>
                
                {/* Proration explanation - positive messaging */}
                <div className="flex items-start gap-2 mt-4 pt-3 border-t border-success/15">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    You're only charged for the remaining time until your next billing date. New members renew at the full rate next cycle.
                  </p>
                </div>

                <Separator className="my-4 bg-success/15" />
                
                {/* Recurring cost */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Starting {renewalDate}
                    </span>
                  </div>
                  <motion.span 
                    key={newRecurringTotal.toFixed(2)}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-semibold text-foreground"
                  >
                    ${newRecurringTotal.toFixed(2)} / {billingCycle === "monthly" ? "month" : "year"}
                  </motion.span>
                </div>
              </div>
              
              {/* New total members summary */}
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-sm text-muted-foreground">New total members</span>
                <motion.span 
                  key={newTotalSeats}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-sm font-semibold text-foreground"
                >
                  {newTotalSeats} members
                </motion.span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 px-6 py-5 border-t border-border/50 bg-background">
          {/* Primary CTA */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleProceedToPayment}
            disabled={isProcessing}
            className={cn(
              "w-full relative inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl",
              "text-sm font-semibold text-primary-foreground",
              "bg-gradient-to-b from-primary to-primary/90",
              "shadow-[0_2px_16px_-4px_hsl(var(--primary)/0.4)]",
              "hover:shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.5)]",
              "transition-all duration-200",
              "overflow-hidden group",
              "disabled:opacity-70 disabled:cursor-not-allowed"
            )}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 group-hover:opacity-100"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1,
              }}
            />
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
                <span className="relative z-10">Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Confirm & pay</span>
              </>
            )}
          </motion.button>

          {/* Security note */}
          <p className="text-[11px] text-center text-muted-foreground mt-3">
            Secure checkout powered by Stripe. Cancel anytime.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Success nudge component
interface SeatsAddedNudgeProps {
  show: boolean;
  onDismiss: () => void;
}

export function SeatsAddedNudge({ show, onDismiss }: SeatsAddedNudgeProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDismiss, 8000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-card border border-success/30 rounded-xl p-4 shadow-lg shadow-success/10 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Members added successfully!
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Invite your team now to get started
                </p>
              </div>
              <button
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">
                The <strong className="text-foreground">Invite member</strong> button is highlighted below
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
