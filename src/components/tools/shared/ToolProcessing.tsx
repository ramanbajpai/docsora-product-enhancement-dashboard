import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface ToolProcessingProps {
  title: string;
  subtitle: string;
  onComplete: () => void;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ToolProcessing({ title, subtitle, onComplete }: ToolProcessingProps) {
  const [progress, setProgress] = useState(0);

  const circleRadius = 48;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const duration = 1800;
    const interval = 30;
    let elapsed = 0;

    const progressTimer = setInterval(() => {
      elapsed += interval;
      const normalizedTime = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - normalizedTime, 3);
      setProgress(Math.min(easedProgress * 100, 100));

      if (elapsed >= duration) {
        clearInterval(progressTimer);
        // Transition directly to success without checkmark animation
        setTimeout(() => {
          onComplete();
        }, 200);
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
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: appleEasing }}
        className="relative"
      >
        <motion.div
          className="absolute -inset-16 rounded-[60px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 65%)',
            filter: 'blur(40px)',
          }}
        />

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
            <div className="relative w-32 h-32 mb-8">
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
                  filter: 'blur(15px)',
                }}
              />

              <svg width="128" height="128" viewBox="0 0 128 128" className="absolute inset-0 -rotate-90">
                <circle
                  cx="64" cy="64" r={circleRadius}
                  fill="none" 
                  stroke="hsl(var(--secondary))"
                  strokeWidth={strokeWidth}
                  className="opacity-50"
                />
                <motion.circle
                  cx="64" cy="64" r={circleRadius}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={strokeWidth} strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.1, ease: "linear" }}
                  style={{ 
                    filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.4))' 
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold text-foreground mb-2"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground"
            >
              {subtitle}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
