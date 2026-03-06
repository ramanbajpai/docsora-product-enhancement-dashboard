import { useEffect } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface ProtectProcessingProps {
  onComplete: () => void;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ProtectProcessing({ onComplete }: ProtectProcessingProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          animate={{
            opacity: [0.1, 0.18, 0.1],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Lock Icon with Animation */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: appleEasing }}
          className="relative w-24 h-24 mb-8"
        >
          {/* Pulsing glow */}
          <motion.div
            className="absolute inset-[-12px] rounded-full"
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.25), transparent 70%)",
              filter: "blur(16px)",
            }}
          />

          {/* Lock container */}
          <motion.div
            className="relative w-full h-full rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0)",
                "0 0 30px 4px hsl(var(--primary) / 0.2)",
                "0 0 0 0 hsl(var(--primary) / 0)",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              animate={{ 
                y: [0, -2, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Lock className="w-10 h-10 text-primary" />
            </motion.div>
          </motion.div>

          {/* Rotating ring */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
          >
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="hsl(var(--primary) / 0.3)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="30 70"
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ transformOrigin: "center" }}
            />
          </svg>
        </motion.div>

        {/* Status Text */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: appleEasing }}
          className="text-lg font-medium text-foreground mb-2"
        >
          Adding password protection to your file…
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-sm text-muted-foreground"
        >
          This will only take a moment
        </motion.p>
      </div>
    </div>
  );
}