import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface FileData {
  name: string;
  size: number;
  type: string;
}

interface ConvertAnalysisProps {
  file: FileData;
}

const ConvertAnalysis = ({ file }: ConvertAnalysisProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 6000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased * 100);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        {/* Glassmorphic document card */}
        <motion.div 
          className="relative mb-10 overflow-hidden rounded-2xl"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Light sweep animation */}
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1,
            }}
          >
            <div 
              className="h-full w-1/3"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.15), transparent)"
              }}
            />
          </motion.div>

          {/* Card with glassmorphism */}
          <motion.div 
            className="relative w-44 p-6 rounded-2xl border border-white/10"
            animate={{
              boxShadow: [
                "0 0 0 1px hsl(var(--primary) / 0.05) inset, 0 1px 0 0 hsl(var(--foreground) / 0.03) inset, 0 24px 48px -12px hsl(var(--foreground) / 0.12)",
                "0 0 0 1px hsl(var(--primary) / 0.1) inset, 0 1px 0 0 hsl(var(--foreground) / 0.03) inset, 0 32px 56px -12px hsl(var(--primary) / 0.15)",
                "0 0 0 1px hsl(var(--primary) / 0.05) inset, 0 1px 0 0 hsl(var(--foreground) / 0.03) inset, 0 24px 48px -12px hsl(var(--foreground) / 0.12)",
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "hsl(var(--card) / 0.6)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Document lines with staggered pulse */}
            <div className="space-y-2.5">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 rounded-full"
                  style={{ 
                    width: `${50 + (i % 3) * 20}%`,
                    background: "hsl(var(--foreground) / 0.08)"
                  }}
                  animate={{ 
                    opacity: [0.4, 0.8, 0.4],
                    scaleX: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* File info */}
            <div className="mt-5 pt-4 border-t border-foreground/5 flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <FileText className="w-3 h-3 text-primary/60" />
              </motion.div>
              <span className="text-[10px] text-muted-foreground/50 truncate max-w-[105px]">
                {file.name}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Text content */}
        <h2 className="text-base font-medium text-foreground mb-1.5">
          Preparing conversion options
        </h2>
        <p className="text-sm text-muted-foreground/55 mb-7">
          Optimizing structure and layout for best results
        </p>

        {/* Progress bar */}
        <div className="w-40">
          <div className="h-[2px] bg-foreground/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/80 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center mt-3 text-[11px] text-muted-foreground/45 tabular-nums">
            Preparing… {Math.round(progress)}%
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ConvertAnalysis;
