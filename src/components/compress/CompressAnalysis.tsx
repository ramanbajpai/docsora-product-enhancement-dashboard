import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Scan, Layers, Zap } from "lucide-react";
import { FileData } from "@/pages/Compress";

interface CompressAnalysisProps {
  file: FileData;
}

const analysisSteps = [
  { icon: Scan, label: "Scanning document structure", duration: 1000 },
  { icon: Layers, label: "Analyzing content layers", duration: 1200 },
  { icon: Zap, label: "Calculating compression potential", duration: 1300 },
];

export const CompressAnalysis = ({ file }: CompressAnalysisProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  useEffect(() => {
    const stepTimers = analysisSteps.map((step, index) => {
      return setTimeout(() => {
        setCurrentStep(index + 1);
        
        // Add insights progressively
        if (index === 0) {
          setInsights(prev => [...prev, `Original size: ${formatSize(file.size)}`]);
        } else if (index === 1) {
          setInsights(prev => [...prev, "Image-heavy document detected"]);
        } else if (index === 2) {
          setInsights(prev => [...prev, "Estimated compression: ~58-72%"]);
        }
      }, step.duration * (index + 1));
    });

    return () => stepTimers.forEach(clearTimeout);
  }, [file.size]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      {/* Document visualization */}
      <div className="relative mb-10">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="relative mx-auto w-48 h-64"
        >
          {/* Document card */}
          <motion.div
            animate={{ 
              boxShadow: [
                "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                "0 25px 50px -12px rgba(18, 85, 218, 0.25)",
                "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-2xl bg-card/90 dark:bg-card/60 backdrop-blur-xl border border-border/50 overflow-hidden"
          >
            {/* Document header */}
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground truncate">{file.name}</span>
              </div>
            </div>

            {/* Scanning lines */}
            <div className="relative p-4 space-y-2">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.3, scaleX: 0.5 }}
                  animate={{ 
                    opacity: [0.3, 0.8, 0.3],
                    scaleX: [0.5, 1, 0.5],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                  className="h-2 rounded-full bg-muted/50 dark:bg-muted/30 origin-left"
                  style={{ width: `${60 + Math.random() * 40}%` }}
                />
              ))}
            </div>

            {/* Scanning beam */}
            <motion.div
              animate={{ y: [0, 200, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            />
          </motion.div>

          {/* Glow effect */}
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl -z-10"
          />
        </motion.div>
      </div>

      {/* Analysis steps */}
      <div className="space-y-3 mb-8">
        {analysisSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep > index;
          const isCurrent = currentStep === index + 1;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: isActive || isCurrent ? 1 : 0.4,
                x: 0,
              }}
              transition={{ delay: index * 0.2, duration: 0.4 }}
              className={`
                flex items-center justify-center gap-3 py-2 px-4 rounded-xl mx-auto w-fit
                transition-all duration-300
                ${isCurrent ? "bg-primary/10 text-primary" : ""}
                ${isActive && !isCurrent ? "text-muted-foreground" : ""}
              `}
            >
              {isCurrent ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Icon className="w-4 h-4" />
                </motion.div>
              ) : (
                <Icon className={`w-4 h-4 ${isActive ? "text-success" : ""}`} />
              )}
              <span className="text-sm font-medium">{step.label}</span>
              {isActive && !isCurrent && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-success text-xs"
                >
                  ✓
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            {insight}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
