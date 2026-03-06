import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Lock, Sparkles } from "lucide-react";
import upgradeVisual from "@/assets/upgrade-dual-language.png";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  // Handle Escape key
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop - blurred, not black */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md"
          />
          
          {/* Modal - Perfectly centered */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.16, 1, 0.3, 1]
              }}
              className="w-full max-w-[720px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/30 overflow-hidden">
                {/* Ambient glow effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-40 -left-20 w-80 h-80 bg-primary/15 rounded-full blur-[100px]" />
                  <div className="absolute -bottom-20 right-0 w-60 h-60 bg-primary/10 rounded-full blur-[80px]" />
                </div>
                
                {/* Close button */}
                <motion.button
                  onClick={onClose}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition-all duration-200 z-20"
                  aria-label="Close"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
                
                {/* Two-column layout */}
                <div className="relative z-10 grid md:grid-cols-2 min-h-[420px]">
                  
                  {/* LEFT SIDE - Content */}
                  <div className="p-10 flex flex-col justify-center">
                    {/* Title */}
                    <motion.h2
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="text-2xl md:text-[28px] font-semibold text-foreground mb-3 tracking-tight leading-tight"
                    >
                      Unlock Dual-Language Translation
                    </motion.h2>
                    
                    {/* Subtitle */}
                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="text-[15px] text-muted-foreground mb-6 leading-relaxed"
                    >
                      Translate once. Read in two languages — perfectly aligned.
                    </motion.p>
                    
                    {/* Value bullets */}
                    <motion.ul
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-2.5 mb-8"
                    >
                      {[
                        "Original and translated text side-by-side",
                        "Preserves formatting and structure",
                        "Built for contracts, legal, and global teams"
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/80">
                          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </motion.ul>
                    
                    {/* CTAs */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-3 mb-6"
                    >
                      {/* Primary CTA */}
                      <motion.button
                        className="w-full py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-[15px] shadow-lg shadow-primary/25 transition-all duration-200"
                        whileHover={{ 
                          y: -2, 
                          boxShadow: "0 20px 40px -10px hsl(var(--primary) / 0.4)"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Upgrade to Pro
                      </motion.button>
                      
                      {/* Secondary CTA */}
                      <button
                        onClick={onClose}
                        className="w-full py-2 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                      >
                        Maybe later
                      </button>
                    </motion.div>
                    
                    {/* Trust row */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="flex items-center gap-5 text-xs text-muted-foreground/60"
                    >
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Enterprise-grade</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>No data used for training</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Encrypted</span>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* RIGHT SIDE - Visual */}
                  <div className="relative hidden md:block overflow-hidden">
                    {/* Gradient fade into left panel */}
                    <div className="absolute inset-0 bg-gradient-to-r from-card via-card/40 to-transparent z-10 pointer-events-none" />
                    
                    {/* Ambient glow */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"
                      animate={{ 
                        opacity: [0.4, 0.7, 0.4]
                      }}
                      transition={{ 
                        duration: 5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    />
                    
                    {/* Hero image with floating animation */}
                    <motion.div
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full relative"
                    >
                      <img
                        src={upgradeVisual}
                        alt="Unlock advanced capabilities"
                        className="absolute inset-0 w-full h-full object-cover object-top scale-125"
                      />
                      
                      {/* Pulsing glow overlay on lightning */}
                      <motion.div
                        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-primary/20 blur-3xl"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut"
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
