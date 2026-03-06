import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";

const statusMessages = [
  "Analyzing document structure",
  "Preserving formatting",
  "Applying language model",
];

const smoothTransition: Transition = { duration: 0.4, ease: "easeOut" };

export const TranslateProcessing = () => {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={smoothTransition}
      className="flex flex-col items-center justify-center py-24 lg:py-32"
    >
      {/* Animated Document Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="relative w-64 h-36 rounded-xl overflow-hidden mb-8"
        style={{
          background: 'hsl(var(--background) / 0.5)',
          border: '1px solid hsl(var(--border) / 0.3)',
        }}
      >
        {/* Split document visualization */}
        <div className="absolute inset-0 flex">
          {/* Left side - Original text fading */}
          <div className="flex-1 p-3 border-r border-border/20 overflow-hidden">
            <motion.div
              animate={{ opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="space-y-2"
            >
              {[1, 0.85, 0.7, 0.55, 0.4].map((width, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    opacity: [0.4, 0.2, 0.4],
                    x: [0, -2, 0]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: i * 0.1 
                  }}
                  className="h-1.5 rounded-full bg-muted-foreground/30"
                  style={{ width: `${width * 100}%` }}
                />
              ))}
            </motion.div>
          </div>

          {/* Right side - Translated text appearing */}
          <div className="flex-1 p-3 overflow-hidden">
            <motion.div className="space-y-2">
              {[0.9, 0.75, 0.85, 0.6, 0.5].map((width, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    opacity: [0.2, 0.5, 0.2],
                    x: [2, 0, 2]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: i * 0.15 + 0.3
                  }}
                  className="h-1.5 rounded-full bg-primary/40"
                  style={{ width: `${width * 100}%`, marginLeft: 'auto' }}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Center divider with subtle glow */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-primary/30"
          />
        </div>

        {/* Subtle scanning line */}
        <motion.div
          animate={{ y: ['-100%', '200%'] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            repeatDelay: 1
          }}
          className="absolute left-0 right-0 h-8 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.08) 50%, transparent 100%)',
          }}
        />
      </motion.div>

      {/* Primary headline */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="text-xl font-medium text-foreground text-center mb-2"
      >
        Translating your document
      </motion.h3>

      {/* Secondary text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        className="text-sm text-muted-foreground text-center mb-6"
      >
        Preserving layout, formatting, and meaning
      </motion.p>

      {/* Rotating status message */}
      <div className="h-5 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={statusIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-xs text-muted-foreground/70 text-center"
          >
            {statusMessages[statusIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Trust indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
        className="mt-8 flex items-center justify-center gap-4 text-[11px] text-muted-foreground/50"
      >
        <span>Enterprise-grade translation</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span>No data used for training</span>
      </motion.div>
    </motion.div>
  );
};
