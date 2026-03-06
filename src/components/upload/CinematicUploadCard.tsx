import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Upload, ChevronDown, Check, X, Plus, FileText, LucideIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
}

export interface CinematicUploadCardProps {
  // Display
  title: string;
  subtitle: string;
  readyTitle?: string; // Title shown when files are queued (e.g., "Ready to process")
  hint?: string;
  icon?: LucideIcon;
  supportedFormats?: string[];
  accept?: string;
  
  // Behavior
  mode: 'single' | 'multi';
  acceptMultiple?: boolean;
  minFiles?: number; // Minimum files required to proceed (default: 1)
  maxFiles?: number; // Maximum files allowed
  minFilesMessage?: string; // Message shown when minimum not met
  
  // Callbacks
  onFilesReady: (files: File[]) => void;
  onUploadStart?: () => void;
  
  // Upload state (for controlled mode)
  isUploading?: boolean;
  uploadProgress?: number;
  isComplete?: boolean;
  
  // Styling
  className?: string;
}

// Apple-style easing
const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function CinematicUploadCard({
  title,
  subtitle,
  readyTitle = "Ready to process",
  hint,
  icon: Icon = Upload,
  supportedFormats = ['PDF'],
  accept = ".pdf",
  mode,
  acceptMultiple = false,
  minFiles = 1,
  maxFiles,
  minFilesMessage,
  onFilesReady,
  onUploadStart,
  isUploading = false,
  uploadProgress = 0,
  isComplete = false,
  className,
}: CinematicUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showFormats, setShowFormats] = useState(false);
  const [isDropped, setIsDropped] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<UploadedFileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for card tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [3, -3]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-3, 3]), { stiffness: 300, damping: 30 });

  // Disable tilt during upload
  useEffect(() => {
    if (isUploading || isDropped) {
      mouseX.set(0);
      mouseY.set(0);
    }
  }, [isUploading, isDropped, mouseX, mouseY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || isUploading || isDropped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  }, [mouseX, mouseY, isUploading, isDropped]);

  const handleMouseEnter = useCallback(() => {
    if (!isUploading && !isDropped) setIsHovering(true);
  }, [isUploading, isDropped]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading && !isDropped) setIsDragging(true);
  }, [isUploading, isDropped]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const addFilesToQueue = useCallback((files: File[]) => {
    const newFiles: UploadedFileItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
    }));
    setQueuedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueuedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isUploading || (mode === 'single' && isDropped)) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    if (mode === 'single') {
      // Single file mode: immediately start upload flow
      setIsDropped(true);
      setTimeout(() => {
        onFilesReady(droppedFiles.slice(0, 1));
      }, 150);
    } else {
      // Multi-file mode: add to queue
      addFilesToQueue(droppedFiles);
    }
  }, [mode, isUploading, isDropped, onFilesReady, addFilesToQueue]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading || (mode === 'single' && isDropped)) return;
    
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length === 0) return;

    if (mode === 'single') {
      setIsDropped(true);
      setTimeout(() => {
        onFilesReady(selectedFiles.slice(0, 1));
      }, 150);
    } else {
      addFilesToQueue(selectedFiles);
    }
    
    e.target.value = '';
  }, [mode, isUploading, isDropped, onFilesReady, addFilesToQueue]);

  const handleStartUpload = useCallback(() => {
    if (queuedFiles.length === 0) return;
    setIsDropped(true);
    onUploadStart?.();
    setTimeout(() => {
      onFilesReady(queuedFiles.map(f => f.file));
    }, 150);
  }, [queuedFiles, onFilesReady, onUploadStart]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Determine current visual state
  const showUploadingState = isUploading || (mode === 'single' && isDropped);
  const showQueueState = mode === 'multi' && queuedFiles.length > 0 && !isUploading;

  // Circular progress ring dimensions
  const circleRadius = 52;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (uploadProgress / 100) * circumference;

  return (
    <div className={cn("relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden px-4", className)}>
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Ambient Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[1200px] h-[1200px] rounded-full"
          style={{
            left: '-25%',
            top: '-35%',
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 55%)',
            filter: 'blur(100px)',
          }}
          animate={{
            x: [0, 30, 15, 0],
            y: [0, 20, 10, 0],
            opacity: showUploadingState ? 0.8 : 1,
          }}
          transition={{
            duration: 120,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <motion.div
          className="absolute w-[1000px] h-[1000px] rounded-full"
          style={{
            right: '-20%',
            bottom: '-25%',
            background: 'radial-gradient(circle, hsl(220 50% 55% / 0.04) 0%, transparent 55%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, -20, -10, 0],
            y: [0, -15, -8, 0],
          }}
          transition={{
            duration: 100,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            right: '5%',
            top: '15%',
            background: 'radial-gradient(circle, hsl(260 40% 55% / 0.03) 0%, transparent 50%)',
            filter: 'blur(70px)',
          }}
          animate={{
            x: [0, 15, 0, -15, 0],
            y: [0, -10, 0, 10, 0],
          }}
          transition={{
            duration: 90,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Cinematic Background Ripples - Pulsating effect during upload */}
      <AnimatePresence>
        {showUploadingState && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={`ripple-${i}`}
                className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
                initial={{ 
                  x: '-50%', 
                  y: '-50%',
                  width: 100, 
                  height: 100, 
                  opacity: 0 
                }}
                animate={{ 
                  width: [100, 600, 1000],
                  height: [100, 600, 1000],
                  opacity: isComplete ? [0.25, 0.15, 0] : [0.3, 0.15, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: "easeOut",
                }}
                style={{
                  background: isComplete 
                    ? 'radial-gradient(circle, hsl(142 76% 36% / 0.25) 0%, hsl(142 76% 36% / 0.08) 40%, transparent 70%)'
                    : 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, hsl(var(--primary) / 0.08) 40%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
              />
            ))}
            
            {/* Central pulsating glow */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              animate={{
                width: [300, 400, 300],
                height: [300, 400, 300],
                opacity: isComplete ? [0.4, 0.6, 0.4] : [0.25, 0.4, 0.25],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: isComplete 
                  ? 'radial-gradient(circle, hsl(142 76% 36% / 0.35) 0%, transparent 70%)'
                  : 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
                filter: 'blur(50px)',
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Subtle vignette */}
      <motion.div 
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background))_100%)]"
        animate={{ opacity: showUploadingState ? 0.7 : 0.5 }}
        transition={{ duration: 0.4 }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto">
        
        {/* Hero Upload Card */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: isComplete ? 1.15 : (showUploadingState ? 1.02 : (isDragging ? 1.02 : 1)),
          }}
          transition={{ 
            duration: isComplete ? 0.6 : (showUploadingState ? 0.3 : 0.9), 
            delay: showUploadingState ? 0 : 0.1, 
            ease: appleEasing 
          }}
          style={{ 
            rotateX: showUploadingState ? 0 : rotateX, 
            rotateY: showUploadingState ? 0 : rotateY, 
            transformPerspective: 1200 
          }}
          className="w-full"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Ambient glow behind card */}
          <motion.div
            className="absolute -inset-16 rounded-[60px] pointer-events-none"
            animate={{
              opacity: showUploadingState ? 0.7 : (isDragging ? 0.6 : isHovering ? 0.35 : 0.2),
              scale: showUploadingState ? 1.08 : (isDragging ? 1.05 : isHovering ? 1.02 : 1),
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 65%)',
              filter: 'blur(60px)',
            }}
          />

          {/* Card border highlight */}
          <motion.div 
            className="absolute -inset-[1px] rounded-[28px] overflow-hidden"
            animate={{
              opacity: showUploadingState ? 1 : (isDragging ? 1 : isHovering ? 0.6 : 0.35),
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="absolute inset-0"
              animate={{
                background: showUploadingState || isDragging 
                  ? 'linear-gradient(135deg, hsl(var(--primary) / 0.5) 0%, hsl(var(--primary) / 0.2) 50%, hsl(var(--primary) / 0.5) 100%)'
                  : 'linear-gradient(135deg, hsl(var(--border) / 0.7) 0%, transparent 50%, hsl(var(--border) / 0.7) 100%)'
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Glass Card */}
          <motion.div
            className="relative rounded-[28px] overflow-hidden"
            style={{
              background: 'hsl(var(--card) / 0.65)',
              backdropFilter: 'blur(60px)',
              WebkitBackdropFilter: 'blur(60px)',
            }}
            animate={{
              y: isHovering && !showUploadingState ? -4 : 0,
              boxShadow: showUploadingState || isDragging
                ? '0 60px 120px -30px hsl(var(--primary) / 0.25), 0 40px 80px -20px hsl(var(--foreground) / 0.12), 0 20px 40px -10px hsl(var(--foreground) / 0.08), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)'
                : isHovering 
                  ? '0 50px 100px -25px hsl(var(--foreground) / 0.12), 0 30px 60px -15px hsl(var(--foreground) / 0.08), 0 15px 30px -8px hsl(var(--foreground) / 0.06), inset 0 1px 0 0 hsl(0 0% 100% / 0.1)'
                  : '0 35px 70px -20px hsl(var(--foreground) / 0.08), 0 20px 40px -12px hsl(var(--foreground) / 0.05), 0 10px 20px -6px hsl(var(--foreground) / 0.03), inset 0 1px 0 0 hsl(0 0% 100% / 0.08)',
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="absolute inset-0 rounded-[28px] pointer-events-none border border-border/30" />

            <div className="flex flex-col items-center justify-center py-16 px-8 md:py-20 md:px-12">
              
              {/* Icon / Progress Ring Container */}
              <motion.div
                className="relative mb-10"
                animate={{ 
                  y: showUploadingState ? 0 : (isDragging ? -10 : [0, -4, 0]),
                  scale: (mode === 'single' && isDropped && !isUploading) ? [1, 0.92, 1.05, 1] : (isDragging ? 1.08 : 1),
                }}
                transition={
                  (mode === 'single' && isDropped && !isUploading)
                    ? { duration: 0.35, times: [0, 0.3, 0.6, 1], ease: "easeOut" }
                    : isDragging 
                      ? { type: "spring", stiffness: 350, damping: 25 }
                      : { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <AnimatePresence mode="wait">
                  {showUploadingState ? (
                    <motion.div
                      key="progress-ring"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4, ease: appleEasing }}
                      className="relative flex items-center justify-center"
                      style={{ width: 140, height: 140 }}
                    >
                      {/* Outer glow */}
                      <motion.div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        animate={{
                          opacity: isComplete ? 0.6 : [0.2, 0.4, 0.2],
                          scale: isComplete ? 1.15 : [1, 1.08, 1],
                        }}
                        transition={isComplete 
                          ? { duration: 0.4 }
                          : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }
                        style={{
                          background: `radial-gradient(circle, hsl(var(--primary) / 0.35) 0%, transparent 70%)`,
                          filter: 'blur(20px)',
                        }}
                      />

                      {/* SVG Progress Ring */}
                      <svg
                        width="140"
                        height="140"
                        viewBox="0 0 140 140"
                        className="absolute inset-0 -rotate-90"
                      >
                        <circle
                          cx="70"
                          cy="70"
                          r={circleRadius}
                          fill="none"
                          stroke="hsl(var(--secondary))"
                          strokeWidth={strokeWidth}
                          className="opacity-50"
                        />
                        <motion.circle
                          cx="70"
                          cy="70"
                          r={circleRadius}
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth={strokeWidth}
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ 
                            strokeDashoffset: isComplete ? 0 : strokeDashoffset,
                            stroke: isComplete ? 'hsl(142 76% 36%)' : 'hsl(var(--primary))'
                          }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={{
                            filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.4))',
                          }}
                        />
                      </svg>

                      {/* Center content */}
                      <AnimatePresence mode="wait">
                        {isComplete ? (
                          <motion.div
                            key="checkmark"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.3, ease: appleEasing }}
                            className="flex items-center justify-center"
                          >
                            <motion.div
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                              className="w-14 h-14 rounded-full bg-[hsl(142_76%_36%)] flex items-center justify-center shadow-lg"
                              style={{ boxShadow: '0 0 30px hsl(142 76% 36% / 0.5)' }}
                            >
                              <Check className="w-7 h-7 text-white" strokeWidth={3} />
                            </motion.div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="percentage"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                          >
                            <span className="text-3xl font-semibold text-foreground tabular-nums">
                              {Math.round(uploadProgress)}%
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload-icon"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4, ease: appleEasing }}
                    >
                      {/* Outer pulsing halo */}
                      <motion.div
                        className="absolute -inset-8 rounded-full pointer-events-none"
                        animate={{
                          opacity: [0.15, 0.25, 0.15],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
                          filter: 'blur(25px)',
                        }}
                      />
                      
                      {/* Inner glow */}
                      <motion.div
                        className="absolute -inset-4 rounded-full pointer-events-none"
                        animate={{
                          opacity: isDragging ? 0.7 : [0.2, 0.35, 0.2],
                          scale: isDragging ? 1.3 : 1,
                        }}
                        transition={isDragging 
                          ? { duration: 0.3 }
                          : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }
                        style={{
                          background: 'hsl(var(--primary) / 0.45)',
                          filter: 'blur(18px)',
                        }}
                      />
                      
                      {/* Icon container */}
                      <motion.div
                        className={`relative rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isDragging 
                            ? 'bg-primary shadow-xl shadow-primary/40' 
                            : 'bg-secondary border border-border/50'
                        }`}
                        style={{ width: 72, height: 72 }}
                        animate={{ scale: isDragging ? 1.05 : 1 }}
                      >
                        <Icon className={`w-7 h-7 transition-colors duration-300 ${
                          isDragging ? 'text-primary-foreground' : 'text-muted-foreground'
                        }`} />
                      </motion.div>

                      {/* Pulse rings on drag */}
                      <AnimatePresence>
                        {isDragging && (
                          <>
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="absolute inset-0 rounded-2xl border-2 border-primary/50"
                                initial={{ opacity: 0.6, scale: 1 }}
                                animate={{ opacity: 0, scale: 1.6 + i * 0.25 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                  duration: 1.8,
                                  repeat: Infinity,
                                  delay: i * 0.35,
                                  ease: "easeOut",
                                }}
                              />
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Text Content */}
              <AnimatePresence mode="wait">
                {showUploadingState ? (
                  <motion.div
                    key="uploading-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: appleEasing }}
                    className="text-center mb-6"
                  >
                    <p className="text-muted-foreground text-sm">
                      {isComplete ? 'Upload complete' : 'Uploading securely'}
                    </p>
                  </motion.div>
                ) : showQueueState ? (
                  <motion.div
                    key="queue-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: appleEasing }}
                    className="w-full flex flex-col"
                  >
                    {/* Title and Count */}
                    <div className="text-center mb-6">
                      <h1 
                        className="text-[1.65rem] md:text-[2rem] font-semibold text-foreground mb-4 tracking-[-0.02em]"
                        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                      >
                        {readyTitle}
                      </h1>
                      <p className="text-muted-foreground/80 text-[0.95rem] max-w-sm mx-auto leading-relaxed">
                        {queuedFiles.length} {queuedFiles.length === 1 ? 'file' : 'files'} selected
                      </p>
                    </div>

                    {/* File List with glassmorphic scrollbar */}
                    <div className="space-y-2 mb-6 max-h-48 overflow-y-auto glassmorphic-scrollbar pr-2">
                      {queuedFiles.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/30"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromQueue(file.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Drag & drop helper */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center text-xs text-muted-foreground/60 mb-4"
                    >
                      Drag & drop supported
                    </motion.p>

                    {/* Validation message */}
                    {queuedFiles.length < minFiles && minFilesMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-sm text-muted-foreground/60 mb-4"
                      >
                        {minFilesMessage}
                      </motion.p>
                    )}

                    {/* Action Buttons - centered */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center justify-center gap-4">
                        {(!maxFiles || queuedFiles.length < maxFiles) && (
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add more files
                          </Button>
                        )}
                        <Button
                          onClick={handleStartUpload}
                          disabled={queuedFiles.length < minFiles}
                          className="gap-2 disabled:opacity-50"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Start ({queuedFiles.length} {queuedFiles.length === 1 ? 'file' : 'files'})
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="initial-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: appleEasing }}
                    className="text-center"
                  >
                    <motion.div
                      className="mb-10"
                      animate={{ y: isDragging ? -6 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      <h1 
                        className="text-[1.65rem] md:text-[2rem] font-semibold text-foreground mb-4 tracking-[-0.02em]"
                        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                      >
                        {isDragging ? 'Release to upload' : title}
                      </h1>
                      <p className="text-muted-foreground/80 text-[0.95rem] max-w-sm mx-auto leading-relaxed">
                        {subtitle}
                      </p>
                      {hint && (
                        <p className="text-primary/70 text-xs mt-3 font-medium">
                          {hint}
                        </p>
                      )}
                    </motion.div>

                    {/* Action Button */}
                    <motion.div
                      className="flex flex-col sm:flex-row items-center justify-center gap-3"
                      animate={{ 
                        opacity: isDragging ? 0.4 : 1,
                        scale: isDragging ? 0.98 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative h-12 px-7 rounded-xl font-medium text-sm overflow-hidden"
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div 
                          className="absolute -inset-2 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
                            filter: 'blur(12px)',
                          }}
                        />
                        
                        <motion.div 
                          className="absolute inset-0 bg-primary rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/30"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-b from-white/12 to-transparent rounded-xl" />
                        
                        <span className="relative flex items-center gap-2 text-primary-foreground font-medium">
                          <Upload className="w-4 h-4" />
                          {mode === 'multi' || acceptMultiple ? 'Choose Files' : 'Choose File'}
                        </span>
                      </motion.button>
                    </motion.div>

                    {/* Drag hint */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-5 text-xs text-muted-foreground/40"
                    >
                      Drag & drop supported
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hidden input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple={mode === 'multi' || acceptMultiple}
                className="hidden"
                onChange={handleFileSelect}
                accept={accept}
              />

              {/* Supported Formats Toggle - only show when not uploading */}
              {!showUploadingState && !showQueueState && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 w-full"
                >
                  <button
                    onClick={() => setShowFormats(!showFormats)}
                    className="flex items-center justify-center gap-2 mx-auto text-sm text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-lg px-3 py-1.5"
                  >
                    <span>{showFormats ? 'Hide' : 'Show'} supported formats</span>
                    <motion.div
                      animate={{ rotate: showFormats ? 180 : 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {showFormats && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap justify-center gap-2 mt-4 px-4">
                          {supportedFormats.map((format) => (
                            <span
                              key={format}
                              className="px-3 py-1.5 text-xs font-medium bg-secondary/60 text-muted-foreground/70 rounded-lg border border-border/30"
                            >
                              {format}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Compliance Row - only show when not uploading */}
      {!showUploadingState && !showQueueState && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4"
        >
          <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground/40">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
              <span>256-bit encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
              <span>GDPR compliant</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
