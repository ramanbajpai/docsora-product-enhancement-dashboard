import { useState, useEffect } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { FileText, Check, ArrowRight, Shield } from "lucide-react";
import { FileData, CompressionMode } from "@/pages/Compress";
import { cn } from "@/lib/utils";

interface CompressModeSelectProps {
  file: FileData;
  selectedMode: CompressionMode;
  onModeSelect: (mode: CompressionMode) => void;
  onStartCompression: () => void;
}

const compressionModes = [
  {
    id: "quality" as CompressionMode,
    label: "Preserve Quality",
    description: "Visually identical output",
    reduction: 32,
    quality: "Lossless",
  },
  {
    id: "balanced" as CompressionMode,
    label: "Balanced",
    description: "No visible quality loss",
    reduction: 58,
    quality: "Optimal",
    recommended: true,
  },
  {
    id: "maximum" as CompressionMode,
    label: "Maximum",
    description: "Minor quality adjustment",
    reduction: 72,
    quality: "Good",
  },
];

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    const controls = animate(motionValue.get(), value, {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => setDisplay(Math.round(v * 10) / 10),
    });
    motionValue.set(value);
    return () => controls.stop();
  }, [value]);
  
  return <>{display.toFixed(1)}{suffix}</>;
}

function AnimatedPercent({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    const controls = animate(display, value, {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);
  
  return <>{display}%</>;
}

export const CompressModeSelect = ({
  file,
  selectedMode,
  onModeSelect,
  onStartCompression,
}: CompressModeSelectProps) => {
  const [hoveredMode, setHoveredMode] = useState<CompressionMode | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1);
    if (bytes >= 1024) return (bytes / 1024).toFixed(1);
    return bytes.toString();
  };

  const getSizeUnit = (bytes: number) => {
    if (bytes >= 1024 * 1024) return "MB";
    if (bytes >= 1024) return "KB";
    return "B";
  };

  const activeMode = hoveredMode || selectedMode;
  const activeModeData = compressionModes.find(m => m.id === activeMode);
  const estimatedSize = file.size * (1 - (activeModeData?.reduction || 58) / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-semibold text-foreground mb-2"
        >
          Choose compression level
        </motion.h2>
        <p className="text-muted-foreground">
          Select how much to optimize your document
        </p>
      </div>

      {/* File preview with live size */}
      <motion.div
        layout
        className="relative mx-auto w-64 mb-10"
      >
        <motion.div
          animate={{ 
            scale: activeMode === "maximum" ? 0.75 : activeMode === "balanced" ? 0.85 : 0.95,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative"
        >
          {/* Document card with glassmorphic style */}
          <motion.div 
            animate={{
              boxShadow: [
                "0 20px 50px -12px hsl(var(--foreground) / 0.15), 0 8px 24px -8px hsl(var(--foreground) / 0.1)",
                "0 24px 60px -12px hsl(var(--foreground) / 0.18), 0 10px 28px -8px hsl(var(--foreground) / 0.12)",
                "0 20px 50px -12px hsl(var(--foreground) / 0.15), 0 8px 24px -8px hsl(var(--foreground) / 0.1)",
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="rounded-2xl bg-card/30 dark:bg-white/5 backdrop-blur-2xl border border-white/10 dark:border-white/5 overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground truncate">{file.name}</span>
              </div>
            </div>
            <div className="p-4 space-y-2 bg-gradient-to-b from-transparent to-white/5 dark:to-white/[0.02]">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1,
                  }}
                  className="h-2 rounded-full bg-foreground/10 dark:bg-white/10"
                  style={{ width: `${60 + (i % 3) * 15}%` }}
                />
              ))}
            </div>
          </motion.div>

          {/* Squeeze bars - positioned outside document, animate inward */}
          <motion.div
            animate={{ 
              x: activeMode === "maximum" ? 8 : activeMode === "balanced" ? 4 : 0,
              opacity: activeMode !== "quality" ? 0.8 : 0,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 30, duration: 0.6 }}
            className="absolute -left-5 top-1/2 -translate-y-1/2"
          >
            <div className="w-1.5 h-16 rounded-full bg-primary/50 shadow-[0_0_12px_2px_hsl(var(--primary)/0.3)]" />
          </motion.div>
          
          <motion.div
            animate={{ 
              x: activeMode === "maximum" ? -8 : activeMode === "balanced" ? -4 : 0,
              opacity: activeMode !== "quality" ? 0.8 : 0,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 30, duration: 0.6 }}
            className="absolute -right-5 top-1/2 -translate-y-1/2"
          >
            <div className="w-1.5 h-16 rounded-full bg-primary/50 shadow-[0_0_12px_2px_hsl(var(--primary)/0.3)]" />
          </motion.div>
        </motion.div>

        {/* Size indicator with smooth counting */}
        <motion.div
          layout
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-foreground/80">
              {formatSize(file.size)} {getSizeUnit(file.size)}
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
            <span className="font-semibold text-primary">
              <AnimatedNumber value={parseFloat(formatSize(estimatedSize))} suffix={` ${getSizeUnit(estimatedSize)}`} />
            </span>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-1.5">
            −<AnimatedPercent value={activeModeData?.reduction || 58} /> reduction
          </p>
        </motion.div>
      </motion.div>

      {/* Mode selection */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {compressionModes.map((mode, index) => {
          const isSelected = selectedMode === mode.id;
          const isHovered = hoveredMode === mode.id;
          
          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              onClick={() => onModeSelect(mode.id)}
              onMouseEnter={() => setHoveredMode(mode.id)}
              onMouseLeave={() => setHoveredMode(null)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative text-left"
            >
              {/* Selection glow */}
              {isSelected && (
                <motion.div
                  layoutId="selection-glow"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "radial-gradient(ellipse 100% 100% at 50% 0%, hsl(var(--primary) / 0.15), transparent 70%)",
                    boxShadow: "0 8px 32px -8px hsl(var(--primary) / 0.3), 0 0 0 1px hsl(var(--primary) / 0.15)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <div className={cn(
                "relative p-5 rounded-2xl transition-all duration-300",
                "bg-card/40 dark:bg-card/20 backdrop-blur-sm",
                isSelected 
                  ? "bg-card/60 dark:bg-card/40" 
                  : "hover:bg-card/60 dark:hover:bg-card/30",
                !isSelected && "shadow-[0_2px_16px_-4px_hsl(var(--foreground)/0.06)]",
                isSelected && "shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.25)]"
              )}>
                {mode.recommended && (
                  <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20">
                    Recommended
                  </span>
                )}
                
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-foreground">{mode.label}</h3>
                  <motion.div
                    initial={false}
                    animate={{ 
                      scale: isSelected ? 1 : 0,
                      opacity: isSelected ? 1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
                  >
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3">{mode.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground/90">−{mode.reduction}%</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    mode.quality === "Lossless" && "bg-muted/40 text-muted-foreground",
                    mode.quality === "Optimal" && "bg-primary/10 text-primary",
                    mode.quality === "Good" && "bg-muted/40 text-muted-foreground"
                  )}>
                    {mode.quality}
                  </span>
                </div>

                {/* Progress bar visual */}
                <div className="mt-3 h-1 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${mode.reduction}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      mode.quality === "Lossless" && "bg-muted-foreground/30",
                      mode.quality === "Optimal" && "bg-primary",
                      mode.quality === "Good" && "bg-muted-foreground/40"
                    )}
                  />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Compress button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center"
      >
        <motion.button
          onClick={onStartCompression}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative inline-flex items-center justify-center gap-3",
            "px-10 py-4 rounded-2xl",
            "text-base font-semibold text-primary-foreground",
            "bg-gradient-to-b from-primary via-primary to-primary/85",
            "shadow-[0_6px_32px_-6px_hsl(var(--primary)/0.5),0_2px_8px_-2px_hsl(var(--primary)/0.3)]",
            "transition-all duration-300",
            "hover:shadow-[0_10px_40px_-6px_hsl(var(--primary)/0.6),0_4px_16px_-4px_hsl(var(--primary)/0.4)]",
            "overflow-hidden group"
          )}
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          />
          <span className="relative z-10">Compress Document</span>
          <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
        </motion.button>
        
        {/* Reassurance text */}
      </motion.div>
    </motion.div>
  );
};
