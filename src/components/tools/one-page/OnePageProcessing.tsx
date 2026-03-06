import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown } from "lucide-react";

interface OnePageProcessingProps {
  onComplete: () => void;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STATUS_HINTS = [
  "Analyzing page structure",
  "Measuring content dimensions",
  "Merging all pages into one",
  "Finalizing continuous document",
];

export function OnePageProcessing({ onComplete }: OnePageProcessingProps) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    // Rotate status hints
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_HINTS.length);
    }, 2000);

    // Complete after processing
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 6000);

    return () => {
      clearInterval(statusInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          animate={{
            opacity: [0.08, 0.15, 0.08],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: appleEasing }}
          className="relative"
        >
          {/* Card glow */}
          <div 
            className="absolute -inset-6 rounded-[32px] pointer-events-none opacity-40"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          {/* Glass Card */}
          <div 
            className="relative rounded-2xl overflow-hidden p-8"
            style={{
              background: 'hsl(var(--card) / 0.7)',
              backdropFilter: 'blur(40px)',
              border: '1px solid hsl(var(--border) / 0.5)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Loading Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                {/* Outer ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                {/* Inner spinning arc */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileDown className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <h2 className="text-lg font-medium text-foreground mb-2">
                Merging all pages into one continuous document
              </h2>

              {/* Rotating status hints */}
              <div className="h-5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={statusIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: appleEasing }}
                    className="text-xs text-muted-foreground/70"
                  >
                    {STATUS_HINTS[statusIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}