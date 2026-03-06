import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";

interface FileData {
  name: string;
  size: number;
  type: string;
}

interface ConvertProgressProps {
  file: FileData;
  targetFormat: string;
}

const statusMessages = [
  "Mapping layout and structure",
  "Preserving text hierarchy",
  "Processing embedded elements",
  "Optimizing images",
  "Finalizing document",
];

const ConvertProgress = ({ file, targetFormat }: ConvertProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    // Smooth progress with easing
    const duration = 4000;
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const linear = Math.min(elapsed / duration, 1);
      // Ease-in-out cubic
      const eased = linear < 0.5 
        ? 4 * linear * linear * linear 
        : 1 - Math.pow(-2 * linear + 2, 3) / 2;
      
      setProgress(Math.round(eased * 100));
      
      if (linear >= 1) {
        clearInterval(progressInterval);
      }
    }, 30);

    // Status message rotation
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statusMessages.length);
    }, 900);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
      <div className="flex flex-col items-center -mt-[5vh]">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="text-xl font-medium text-foreground mb-10 tracking-tight"
        >
          Converting to {targetFormat}
        </motion.h2>

        {/* Document Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          className="relative mb-10"
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{
              boxShadow: [
                "0 0 40px -10px hsl(var(--primary) / 0.2)",
                "0 0 60px -10px hsl(var(--primary) / 0.35)",
                "0 0 40px -10px hsl(var(--primary) / 0.2)",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Card */}
          <motion.div
            className="relative rounded-2xl border border-primary/30 overflow-hidden"
            style={{
              width: 140,
              height: 180,
              background: "hsl(var(--card) / 0.7)",
              backdropFilter: "blur(16px)",
            }}
            animate={{
              borderColor: [
                "hsl(var(--primary) / 0.3)",
                "hsl(var(--primary) / 0.5)",
                "hsl(var(--primary) / 0.3)",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Inner content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              {/* Document icon with fill animation */}
              <div className="relative w-12 h-12 mb-3">
                {/* Background icon (unfilled) */}
                <FileText 
                  className="absolute inset-0 w-12 h-12 text-muted-foreground/20" 
                  strokeWidth={1.5}
                />
                {/* Foreground icon (filling) */}
                <motion.div
                  className="absolute inset-0 overflow-hidden"
                  animate={{ 
                    clipPath: `inset(${100 - progress}% 0 0 0)` 
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <FileText 
                    className="w-12 h-12 text-primary" 
                    strokeWidth={1.5}
                  />
                </motion.div>
              </div>

              {/* Format label */}
              <motion.span
                animate={{ 
                  opacity: [0.6, 1, 0.6] 
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-sm font-medium text-primary"
              >
                {targetFormat}
              </motion.span>

              {/* Subtle content lines */}
              <div className="mt-4 w-full space-y-1.5 px-2">
                {[0.7, 0.9, 0.5].map((width, i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 rounded-full bg-muted/40"
                    style={{ width: `${width * 100}%` }}
                    animate={{
                      opacity: progress > (i + 1) * 25 ? 0.8 : 0.3,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          className="w-64 mb-6"
        >
          <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-center mt-3">
            <span className="text-lg font-medium text-foreground tabular-nums">
              {progress}%
            </span>
          </div>
        </motion.div>

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="h-5 relative"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={statusIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="text-sm text-muted-foreground text-center"
            >
              {statusMessages[statusIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ConvertProgress;
