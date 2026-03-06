import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { FileData, CompressionMode } from "@/pages/Compress";

interface CompressProgressProps {
  file: FileData;
  mode: CompressionMode;
}

export const CompressProgress = ({ file, mode }: CompressProgressProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(prev + 0.6, 100);
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="text-center">
      {/* Header - calm, premium */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-16"
      >
        <h2 className="text-2xl font-medium tracking-tight text-foreground mb-2">
          Optimizing document
        </h2>
        <p className="text-sm text-muted-foreground/50">
          Preparing the best compression…
        </p>
      </motion.div>

      {/* Visual compression animation */}
      <div className="relative mx-auto w-[300px] h-52 flex items-center justify-center mb-16">
        
        {/* Ambient gradient glow sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
          }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [0.95, 1.02, 0.95],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Left compression bar - slower, calmer */}
        <motion.div
          className="absolute left-6 top-1/2 -translate-y-1/2"
          animate={{ 
            x: [0, 12, 0],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: [0.45, 0, 0.55, 1],
          }}
        >
          <div 
            className="w-px h-16 rounded-full bg-primary/30"
          />
        </motion.div>

        {/* Right compression bar - slower, calmer */}
        <motion.div
          className="absolute right-6 top-1/2 -translate-y-1/2"
          animate={{ 
            x: [0, -12, 0],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: [0.45, 0, 0.55, 1],
          }}
        >
          <div 
            className="w-px h-16 rounded-full bg-primary/30"
          />
        </motion.div>

        {/* Document card with subtle float and compression breathing */}
        <motion.div
          className="relative"
          style={{ width: 140, height: 180 }}
          animate={{
            scaleX: [1, 0.985, 1],
            y: [0, -2, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
          }}
        >
          {/* Shadow breathing */}
          <motion.div
            className="absolute -inset-4 rounded-2xl pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [0.98, 1.02, 0.98],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Document card */}
          <motion.div 
            className="relative w-full h-full rounded-xl overflow-hidden bg-card/80 dark:bg-card/50 backdrop-blur-sm border border-border/30"
            animate={{
              boxShadow: [
                "0 8px 32px -8px hsl(var(--primary) / 0.08)",
                "0 12px 40px -8px hsl(var(--primary) / 0.12)",
                "0 8px 32px -8px hsl(var(--primary) / 0.08)",
              ],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Page header */}
            <div className="px-3 py-2.5 border-b border-border/20 flex items-center gap-2">
              <FileText className="w-3 h-3 text-primary/50" />
              <span className="text-[9px] font-medium text-foreground/60 truncate max-w-[100px]">
                {file.name}
              </span>
            </div>
            
            {/* Content lines - static, calm */}
            <div className="p-3 space-y-2">
              {[80, 60, 72, 50, 65].map((width, j) => (
                <motion.div
                  key={j}
                  className="h-1 rounded-full bg-muted/25 dark:bg-muted/15"
                  style={{ width: `${width}%` }}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.5, 0.7, 0.5] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: j * 0.15,
                  }}
                />
              ))}
            </div>

            {/* Bottom accent - very subtle */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-primary/4 to-transparent" />
          </motion.div>
        </motion.div>
      </div>

      {/* Progress indicator - thin, minimal, calm */}
      <div className="max-w-[200px] mx-auto">
        <div className="h-[2px] rounded-full bg-border/20 overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full bg-primary/60"
            animate={{ width: `${progress}%` }}
            transition={{ 
              duration: 0.3, 
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        </div>
        
        <motion.p 
          className="text-xs text-muted-foreground/40 tracking-wide"
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          Optimizing… {Math.round(progress)}%
        </motion.p>
      </div>
    </div>
  );
};
