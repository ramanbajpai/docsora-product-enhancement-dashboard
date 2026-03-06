import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface EditPDFProcessingProps {
  onComplete: () => void;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function EditPDFProcessing({ onComplete }: EditPDFProcessingProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  // Circular progress ring dimensions
  const circleRadius = 48;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    // Simulate processing progress
    const duration = 2000;
    const interval = 30;
    let elapsed = 0;

    const progressTimer = setInterval(() => {
      elapsed += interval;
      const normalizedTime = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - normalizedTime, 3);
      setProgress(Math.min(easedProgress * 100, 100));

      if (elapsed >= duration) {
        clearInterval(progressTimer);
        setIsComplete(true);

        // Hold at 100% briefly, then show checkmark
        setTimeout(() => {
          setShowCheckmark(true);
          
          // Hold checkmark, then transition to success
          setTimeout(() => {
            onComplete();
          }, 800);
        }, 400);
      }
    }, interval);

    return () => clearInterval(progressTimer);
  }, [onComplete]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{
            width: [300, 400, 300],
            height: [300, 400, 300],
            opacity: showCheckmark ? [0.4, 0.6, 0.4] : [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: showCheckmark 
              ? 'radial-gradient(circle, hsl(142 76% 36% / 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Processing Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: showCheckmark ? 1.02 : 1, 
          y: 0 
        }}
        transition={{ duration: 0.5, ease: appleEasing }}
        className="relative"
      >
        {/* Card glow */}
        <motion.div
          className="absolute -inset-16 rounded-[60px] pointer-events-none"
          animate={{
            opacity: showCheckmark ? 0.5 : 0.3,
          }}
          transition={{ duration: 0.4 }}
          style={{
            background: showCheckmark
              ? 'radial-gradient(ellipse at center, hsl(142 76% 36% / 0.2) 0%, transparent 65%)'
              : 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 65%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Glass Card */}
        <div 
          className="relative rounded-3xl overflow-hidden px-16 py-12"
          style={{
            background: 'hsl(var(--card) / 0.6)',
            backdropFilter: 'blur(40px)',
            border: '1px solid hsl(var(--border) / 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div className="flex flex-col items-center">
            {/* Progress Ring / Checkmark */}
            <div className="relative w-32 h-32 mb-8">
              {/* Outer glow */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background: showCheckmark
                    ? 'radial-gradient(circle, hsl(142 76% 36% / 0.3) 0%, transparent 70%)'
                    : 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
                  filter: 'blur(15px)',
                }}
              />

              {/* SVG Progress Ring */}
              <svg
                width="128"
                height="128"
                viewBox="0 0 128 128"
                className="absolute inset-0 -rotate-90"
              >
                {/* Background track */}
                <circle
                  cx="64"
                  cy="64"
                  r={circleRadius}
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={strokeWidth}
                  className="opacity-50"
                />
                {/* Progress arc */}
                <motion.circle
                  cx="64"
                  cy="64"
                  r={circleRadius}
                  fill="none"
                  stroke={showCheckmark ? "hsl(142 76% 36%)" : "hsl(var(--primary))"}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.1, ease: "linear" }}
                  style={{
                    filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.4))',
                  }}
                />
              </svg>

              {/* Center content */}
              <AnimatePresence mode="wait">
                {showCheckmark ? (
                  <motion.div
                    key="checkmark"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3, ease: appleEasing }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Check className="w-7 h-7 text-white" strokeWidth={3} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="spinner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.div
                      className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Text */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold text-foreground mb-2"
            >
              {showCheckmark ? "Changes applied" : "Applying changes"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground"
            >
              {showCheckmark ? "Your document is ready" : "Finalising your document"}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
