import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface AICheckProcessingProps {
  fileName: string;
  onComplete?: () => void;
}

const processingStages = [
  { label: "Reading document" },
  { label: "Analyzing structure" },
  { label: "Checking grammar" },
  { label: "Reviewing clarity" },
  { label: "Finalizing" },
];

export function AICheckProcessing({ fileName, onComplete }: AICheckProcessingProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasCompleted = useRef(false);

  useEffect(() => {
    // Smooth progress over ~4.5 seconds to reach 100%
    const duration = 4500;
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min((elapsed / duration) * 100, 100);
      
      // Ease-out curve for natural feel
      const easedProgress = 100 * (1 - Math.pow(1 - rawProgress / 100, 3));
      setProgress(easedProgress);
      
      // Update stage based on progress
      const newStage = Math.min(
        Math.floor((easedProgress / 100) * processingStages.length),
        processingStages.length - 1
      );
      setCurrentStage(newStage);
      
      // Trigger completion when we hit 100%
      if (rawProgress >= 100 && !hasCompleted.current) {
        hasCompleted.current = true;
        clearInterval(progressInterval);
        // Small delay after hitting 100% before transitioning
        setTimeout(() => {
          onComplete?.();
        }, 400);
      }
    }, 40);

    return () => {
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  const circumference = 2 * Math.PI * 88;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center py-8">
      {/* Integrated document + progress ring */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Subtle animated glow behind the document */}
        <motion.div
          className="absolute -inset-6 rounded-3xl pointer-events-none"
          animate={{
            boxShadow: [
              "0 0 40px 8px hsl(var(--primary) / 0.08)",
              "0 0 60px 12px hsl(var(--primary) / 0.15)",
              "0 0 40px 8px hsl(var(--primary) / 0.08)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Progress ring wrapping the document */}
        <svg 
          className="absolute -inset-4" 
          viewBox="0 0 200 260" 
          fill="none"
          style={{ width: 'calc(100% + 32px)', height: 'calc(100% + 32px)' }}
        >
          {/* Background track - rounded rectangle path */}
          <rect
            x="10"
            y="10"
            width="180"
            height="240"
            rx="24"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="2"
            opacity="0.5"
          />
          {/* Progress stroke */}
          <motion.rect
            x="10"
            y="10"
            width="180"
            height="240"
            rx="24"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="840"
            initial={{ strokeDashoffset: 840 }}
            animate={{ strokeDashoffset: 840 - (840 * progress) / 100 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ opacity: 0.9 }}
          />
        </svg>

        {/* Document card with subtle float animation */}
        <motion.div 
          className="relative w-40 h-52 rounded-2xl bg-background border border-border/60 overflow-hidden"
          initial={{ y: 10 }}
          animate={{ 
            y: [0, -2, 0],
            boxShadow: [
              "0 4px 20px -4px hsl(var(--foreground) / 0.08)",
              "0 8px 30px -4px hsl(var(--foreground) / 0.12)",
              "0 4px 20px -4px hsl(var(--foreground) / 0.08)",
            ]
          }}
          transition={{ 
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {/* Document header */}
          <div className="absolute top-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary/70" />
              <div className="h-1.5 w-12 rounded-full bg-foreground/8" />
            </div>
          </div>

          {/* Text lines - subtle scanning effect */}
          <div className="absolute inset-x-4 top-12 space-y-2">
            {[0.85, 0.95, 0.7, 0.9, 0.75, 0.88, 0.6].map((width, i) => (
              <motion.div
                key={i}
                className="h-1.5 rounded-full bg-foreground/6"
                style={{ width: `${width * 100}%` }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.12,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Subtle gradient sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                "linear-gradient(180deg, transparent 0%, transparent 100%)",
                "linear-gradient(180deg, hsl(var(--primary) / 0.04) 0%, transparent 40%)",
                "linear-gradient(180deg, transparent 0%, transparent 100%)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>

      {/* Progress text - directly beneath */}
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="flex items-baseline justify-center gap-1.5 mb-2">
          <motion.span 
            className="text-3xl font-semibold text-foreground tabular-nums tracking-tight"
            key={Math.floor(progress)}
            initial={{ opacity: 0.8, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            {Math.floor(progress)}
          </motion.span>
          <span className="text-lg text-muted-foreground font-medium">%</span>
        </div>
        
        <motion.p
          key={currentStage}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-muted-foreground"
        >
          {processingStages[currentStage]?.label}
        </motion.p>
      </motion.div>

      {/* File name */}
      <motion.p 
        className="mt-4 text-xs text-muted-foreground/60 truncate max-w-[200px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {fileName}
      </motion.p>

      {/* Reassurance line */}
      <motion.p
        className="mt-6 text-[11px] text-muted-foreground/50 text-center max-w-[280px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        Your document remains private and unchanged until you review it.
      </motion.p>
    </div>
  );
}
