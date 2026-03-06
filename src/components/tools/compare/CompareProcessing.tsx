import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";

interface CompareProcessingProps {
  files: File[];
  onComplete: () => void;
}

const stages = [
  "Extracting text",
  "Analyzing changes", 
  "Highlighting differences",
];

export function CompareProcessing({ files, onComplete }: CompareProcessingProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Stage progression - ~800ms per stage for smooth 2.4s total
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= stages.length - 1) {
          clearInterval(stageInterval);
          setTimeout(onComplete, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1.5, 100));
    }, 25);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background">
      <div className="max-w-3xl w-full px-6">
        {/* Document Scanning Visual */}
        <div className="flex justify-center items-center gap-6 mb-16">
          {/* Document A */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <div className="w-40 h-56 rounded-lg bg-blue-500/5 border border-blue-500/20 overflow-hidden relative">
              {/* Document content lines */}
              <div className="absolute inset-3 space-y-1.5">
                {[...Array(14)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    className="h-1.5 bg-blue-500/30 rounded-sm"
                    style={{ width: `${65 + Math.sin(i) * 25}%` }}
                  />
                ))}
              </div>
              
              {/* Scanning line */}
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400/80 to-transparent"
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <div className="text-center mt-3">
              <div className="text-[10px] font-medium text-blue-400/80 uppercase tracking-wider">Document A</div>
              <div className="text-xs text-muted-foreground/70 truncate max-w-[150px] mt-0.5">
                {files[0]?.name || "Document 1"}
              </div>
            </div>
          </motion.div>

          {/* Center comparison indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 hsl(var(--primary) / 0)",
                  "0 0 0 8px hsl(var(--primary) / 0.1)",
                  "0 0 0 0 hsl(var(--primary) / 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowLeftRight className="w-5 h-5 text-primary" />
            </motion.div>
          </motion.div>

          {/* Document B */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <div className="w-40 h-56 rounded-lg bg-red-500/5 border border-red-500/20 overflow-hidden relative">
              {/* Document content lines */}
              <div className="absolute inset-3 space-y-1.5">
                {[...Array(14)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: i * 0.03 + 0.1, duration: 0.2 }}
                    className="h-1.5 bg-red-500/30 rounded-sm"
                    style={{ width: `${60 + Math.cos(i) * 28}%` }}
                  />
                ))}
              </div>
              
              {/* Scanning line */}
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-400/80 to-transparent"
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.1
                }}
              />
            </div>
            
            <div className="text-center mt-3">
              <div className="text-[10px] font-medium text-red-400/80 uppercase tracking-wider">Document B</div>
              <div className="text-xs text-muted-foreground/70 truncate max-w-[150px] mt-0.5">
                {files[1]?.name || "Document 2"}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stage indicator */}
        <div className="text-center mb-8">
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentStage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-lg font-medium text-foreground"
            >
              {stages[currentStage]}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="max-w-sm mx-auto">
          <div className="h-1 bg-secondary/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-primary to-red-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>
        </div>

        {/* Stage dots */}
        <div className="flex justify-center gap-2 mt-6">
          {stages.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i <= currentStage ? "bg-primary" : "bg-muted/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
