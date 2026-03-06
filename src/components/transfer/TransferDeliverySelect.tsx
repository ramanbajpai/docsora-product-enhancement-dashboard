import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransferDeliverySelectProps {
  onSelect: (method: 'link' | 'email') => void;
}

const premiumEase = [0.22, 1, 0.36, 1] as const;

export function TransferDeliverySelect({ onSelect }: TransferDeliverySelectProps) {
  const [selected, setSelected] = useState<'link' | 'email' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = (method: 'link' | 'email') => {
    setSelected(method);
    setIsTransitioning(true);
    
    // Brief delay to show selection animation before advancing
    setTimeout(() => {
      onSelect(method);
    }, 400);
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: premiumEase }}
        className="w-full max-w-2xl"
      >
        {/* Title */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: premiumEase }}
        >
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            How would you like to send this?
          </h1>
        </motion.div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Generate Link Card */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: premiumEase }}
            onClick={() => handleSelect('link')}
            disabled={isTransitioning}
            className={cn(
              "relative p-8 rounded-2xl text-left transition-all overflow-hidden",
              "border-2 group",
              selected === 'link'
                ? "border-primary bg-primary/5"
                : selected === 'email'
                ? "border-border/30 bg-card/40 opacity-50"
                : "border-border/50 bg-card/60 hover:border-primary/50 hover:bg-card/80"
            )}
            whileHover={!isTransitioning ? { scale: 1.02 } : {}}
            whileTap={!isTransitioning ? { scale: 0.98 } : {}}
          >
            {/* Selection glow */}
            <AnimatePresence>
              {selected === 'link' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: "inset 0 0 0 2px hsl(var(--primary) / 0.4), 0 0 40px -10px hsl(var(--primary) / 0.4)"
                  }}
                />
              )}
            </AnimatePresence>

            {/* Border trace animation */}
            <AnimatePresence>
              {selected === 'link' && (
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                >
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.rect
                      x="1"
                      y="1"
                      width="98"
                      height="98"
                      rx="8"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="0.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300",
                selected === 'link' 
                  ? "bg-primary/20 text-primary shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]" 
                  : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <Link2 className="w-6 h-6" />
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-foreground">Generate link</h3>
                <AnimatePresence>
                  {selected === 'link' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-sm text-muted-foreground">Share anywhere</p>
            </div>
          </motion.button>

          {/* Send via Email Card */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: premiumEase }}
            onClick={() => handleSelect('email')}
            disabled={isTransitioning}
            className={cn(
              "relative p-8 rounded-2xl text-left transition-all overflow-hidden",
              "border-2 group",
              selected === 'email'
                ? "border-primary bg-primary/5"
                : selected === 'link'
                ? "border-border/30 bg-card/40 opacity-50"
                : "border-border/50 bg-card/60 hover:border-primary/50 hover:bg-card/80"
            )}
            whileHover={!isTransitioning ? { scale: 1.02 } : {}}
            whileTap={!isTransitioning ? { scale: 0.98 } : {}}
          >
            {/* Selection glow */}
            <AnimatePresence>
              {selected === 'email' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: "inset 0 0 0 2px hsl(var(--primary) / 0.4), 0 0 40px -10px hsl(var(--primary) / 0.4)"
                  }}
                />
              )}
            </AnimatePresence>

            {/* Border trace animation */}
            <AnimatePresence>
              {selected === 'email' && (
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                >
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.rect
                      x="1"
                      y="1"
                      width="98"
                      height="98"
                      rx="8"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="0.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300",
                selected === 'email' 
                  ? "bg-primary/20 text-primary shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]" 
                  : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <Mail className="w-6 h-6" />
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-foreground">Send via email</h3>
                <AnimatePresence>
                  {selected === 'email' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-sm text-muted-foreground">Deliver directly to recipients</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
