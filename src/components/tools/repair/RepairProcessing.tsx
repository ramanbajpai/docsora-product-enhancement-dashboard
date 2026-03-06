import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench } from "lucide-react";

interface RepairProcessingProps {
  onComplete: () => void;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STATUS_HINTS = [
  "Checking file structure",
  "Fixing corrupted metadata",
  "Restoring broken references",
  "Finalizing repaired document",
];

export function RepairProcessing({ onComplete }: RepairProcessingProps) {
  const [currentHint, setCurrentHint] = useState(0);

  // Rotate status hints
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHint((prev) => (prev + 1) % STATUS_HINTS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulate processing time
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          animate={{
            opacity: [0.06, 0.1, 0.06],
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

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: appleEasing }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Card glow */}
        <div 
          className="absolute -inset-6 rounded-[32px] pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        {/* Glass Card */}
        <div 
          className="relative rounded-2xl overflow-hidden p-8 flex flex-col items-center"
          style={{
            background: 'hsl(var(--card) / 0.7)',
            backdropFilter: 'blur(40px)',
            border: '1px solid hsl(var(--border) / 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Circular Progress with Wrench Icon */}
          <div className="relative w-24 h-24 mb-6">
            {/* Outer ring (background) */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(var(--primary) / 0.15)"
                strokeWidth="3"
              />
            </svg>
            
            {/* Animated ring */}
            <motion.svg 
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="60 200"
              />
            </motion.svg>

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  rotate: [0, -15, 15, -15, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Wrench className="w-8 h-8 text-primary" />
              </motion.div>
            </div>
          </div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: appleEasing }}
            className="text-lg font-medium text-foreground mb-2"
          >
            Repairing document
          </motion.h2>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: appleEasing }}
            className="text-sm text-muted-foreground text-center mb-4 max-w-[280px]"
          >
            Detecting and fixing corrupted elements while preserving your original content.
          </motion.p>

          {/* Rotating status hints */}
          <div className="h-5 relative w-full flex justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentHint}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: appleEasing }}
                className="text-xs text-muted-foreground/70 absolute"
              >
                {STATUS_HINTS[currentHint]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
