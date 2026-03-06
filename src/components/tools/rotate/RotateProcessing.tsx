import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RotateProcessingProps {
  onComplete: () => void;
}

const appleEasing: [number, number, number, number] = [0.4, 0.0, 0.2, 1];

export function RotateProcessing({ onComplete }: RotateProcessingProps) {
  const [progress, setProgress] = useState(0);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [isHoldingComplete, setIsHoldingComplete] = useState(false);

  useEffect(() => {
    // Simulate processing progress
    const duration = 2500;
    const interval = 50;
    let elapsed = 0;

    const progressInterval = setInterval(() => {
      elapsed += interval;
      const normalizedTime = Math.min(elapsed / duration, 1);
      // Ease-out cubic for smooth progress
      const easedProgress = 1 - Math.pow(1 - normalizedTime, 3);
      setProgress(Math.min(easedProgress * 100, 100));

      if (elapsed >= duration) {
        clearInterval(progressInterval);
        setProgress(100);
        
        // Hold at 100% for 400ms
        setTimeout(() => {
          setIsHoldingComplete(true);
          // Show checkmark and hold for 800ms
          setTimeout(() => {
            setShowCheckmark(true);
            // Transition to success after checkmark display
            setTimeout(() => {
              onComplete();
            }, 800);
          }, 100);
        }, 400);
      }
    }, interval);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, hsl(var(${showCheckmark ? '--success' : '--primary'}) / 0.06) 0%, transparent 60%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Processing Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: showCheckmark ? 1.02 : 1,
        }}
        transition={{ duration: 0.5, ease: appleEasing }}
        className={cn(
          "relative z-10 w-full max-w-md mx-4",
          "rounded-[28px] overflow-hidden",
          "border border-border/30",
          "p-10",
        )}
        style={{
          background: 'hsl(var(--card) / 0.65)',
          backdropFilter: 'blur(60px)',
        }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Progress Ring / Checkmark */}
          <div className="relative w-24 h-24 mb-8">
            {/* Glow */}
            <motion.div
              className="absolute inset-[-20px] rounded-full"
              animate={{
                opacity: showCheckmark ? [0.3, 0.5, 0.3] : [0.2, 0.4, 0.2],
                scale: showCheckmark ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: `radial-gradient(circle, hsl(var(${showCheckmark ? '--success' : '--primary'}) / 0.25), transparent 70%)`,
                filter: 'blur(16px)',
              }}
            />

            {showCheckmark ? (
              /* Solid filled circle with white checkmark */
              <motion.div
                className="w-full h-full rounded-full bg-success flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <motion.svg
                  className="w-10 h-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.25 }}
                >
                  <motion.path
                    d="M6 12.5L10 16.5L18 8.5"
                    stroke="hsl(var(--success-foreground))"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
                  />
                </motion.svg>
              </motion.div>
            ) : (
              <svg className="w-full h-full" viewBox="0 0 96 96">
                {/* Background circle */}
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  fill="none"
                  stroke="hsl(var(--primary) / 0.1)"
                  strokeWidth="3"
                />
                
                {/* Progress ring */}
                <motion.circle
                  cx="48"
                  cy="48"
                  r="36"
                  fill="none"
                  stroke={isHoldingComplete ? "hsl(var(--success))" : "hsl(var(--primary))"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{
                    rotate: -90,
                    transformOrigin: "center",
                    filter: `drop-shadow(0 0 8px hsl(var(--primary) / 0.4))`,
                  }}
                />
              </svg>
            )}
          </div>

          {/* Title */}
          <motion.h2
            className="text-lg font-semibold text-foreground mb-2"
            animate={{
              opacity: showCheckmark ? 0 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {showCheckmark ? "Complete" : "Applying rotations"}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="text-sm text-muted-foreground"
            animate={{
              opacity: showCheckmark ? 0 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            Finalising your document
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
