import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Upload, Shield, ChevronDown, Check } from "lucide-react";
import TrustFooter from "@/components/shared/TrustFooter";

interface SignUploadProps {
  onFileUpload: (file: File) => void;
}

const supportedFormats = ['PDF', 'DOCX', 'DOC'];

// Apple-style easing
const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SignUpload = ({ onFileUpload }: SignUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showFormats, setShowFormats] = useState(false);
  const [isDropped, setIsDropped] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFileRef = useRef<File | null>(null);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

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

  const startUploadAnimation = useCallback((file: File) => {
    pendingFileRef.current = file;
    setIsDropped(true);
    
    // Brief pause then start upload
    setTimeout(() => {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload with Apple-style timing
      const totalDuration = 2500;
      const progressInterval = 50;
      let elapsed = 0;
      
      progressIntervalRef.current = setInterval(() => {
        elapsed += progressInterval;
        const normalizedTime = Math.min(elapsed / totalDuration, 1);
        const easedProgress = 1 - Math.pow(1 - normalizedTime, 3);
        const currentProgress = Math.min(easedProgress * 100, 99);
        
        setUploadProgress(currentProgress);
        
        if (elapsed >= totalDuration) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
      }, progressInterval);
      
      // Complete upload
      setTimeout(() => {
        setUploadProgress(100);
        setIsComplete(true);
        
        // Transition to next step after completion animation
        setTimeout(() => {
          if (pendingFileRef.current) {
            onFileUpload(pendingFileRef.current);
          }
        }, 600);
      }, totalDuration);
    }, 150);
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading && !isDropped) setIsDragging(true);
  }, [isUploading, isDropped]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isUploading || isDropped) return;
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) return;
      
      startUploadAnimation(file);
    }
  }, [isUploading, isDropped, startUploadAnimation]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading || isDropped) return;
    
    const file = e.target.files?.[0];
    if (file) {
      startUploadAnimation(file);
    }
  }, [isUploading, isDropped, startUploadAnimation]);

  // Determine current visual state
  const showUploadingState = isUploading || isDropped;

  // Circular progress ring dimensions
  const circleRadius = 52;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (uploadProgress / 100) * circumference;

  return (
    <div className="relative h-full flex flex-col items-center justify-center overflow-hidden px-4">
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
            {/* Primary pulsating ripples */}
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

      {/* Subtle vignette - intensifies during upload */}
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
          {/* Ambient glow behind card - intensifies on drop */}
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

          {/* Card border highlight - glows blue on drop */}
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

          {/* Highlight ring animation on drop */}
          <AnimatePresence>
            {isDropped && !isUploading && (
              <motion.div
                className="absolute -inset-[2px] rounded-[29px] pointer-events-none"
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{ opacity: 0, scale: 1.02 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  border: '2px solid hsl(var(--primary) / 0.6)',
                  boxShadow: '0 0 20px hsl(var(--primary) / 0.4)',
                }}
              />
            )}
          </AnimatePresence>

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
              boxShadow: showUploadingState
                ? '0 60px 120px -30px hsl(var(--primary) / 0.25), 0 40px 80px -20px hsl(var(--foreground) / 0.12), 0 20px 40px -10px hsl(var(--foreground) / 0.08), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)'
                : isDragging
                  ? '0 60px 120px -30px hsl(var(--primary) / 0.25), 0 40px 80px -20px hsl(var(--foreground) / 0.12), 0 20px 40px -10px hsl(var(--foreground) / 0.08), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)'
                  : isHovering 
                    ? '0 50px 100px -25px hsl(var(--foreground) / 0.12), 0 30px 60px -15px hsl(var(--foreground) / 0.08), 0 15px 30px -8px hsl(var(--foreground) / 0.06), inset 0 1px 0 0 hsl(0 0% 100% / 0.1)'
                    : '0 35px 70px -20px hsl(var(--foreground) / 0.08), 0 20px 40px -12px hsl(var(--foreground) / 0.05), 0 10px 20px -6px hsl(var(--foreground) / 0.03), inset 0 1px 0 0 hsl(0 0% 100% / 0.08)',
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Inner subtle highlight */}
            <div className="absolute inset-0 rounded-[28px] pointer-events-none border border-border/30" />

            <div className="flex flex-col items-center justify-center py-16 px-8 md:py-20 md:px-12">
              
              {/* Circular Progress / Icon Container */}
              <motion.div
                className="relative mb-10"
                animate={{ 
                  y: showUploadingState ? 0 : (isDragging ? -10 : [0, -4, 0]),
                  scale: isDropped && !isUploading ? [1, 0.92, 1.05, 1] : (isDragging ? 1.08 : 1),
                }}
                transition={
                  isDropped && !isUploading 
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
                        {/* Background track */}
                        <circle
                          cx="70"
                          cy="70"
                          r={circleRadius}
                          fill="none"
                          stroke="hsl(var(--secondary))"
                          strokeWidth={strokeWidth}
                          className="opacity-50"
                        />
                        {/* Progress arc */}
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

                      {/* Center content - percentage or checkmark */}
                      <AnimatePresence mode="wait">
                        {isComplete ? (
                          <motion.div
                            key="checkmark"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.3, ease: appleEasing }}
                            className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full"
                            style={{ background: 'hsl(142 76% 36%)' }}
                          >
                            <Check className="w-8 h-8 text-white" strokeWidth={3} />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="percentage"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative z-10 flex flex-col items-center justify-center"
                          >
                            <span 
                              className="text-3xl font-semibold text-foreground tabular-nums tracking-tight"
                              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                            >
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
                      exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                      transition={{ duration: 0.3, ease: appleEasing }}
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
                        animate={{
                          scale: isDragging ? 1.05 : 1,
                        }}
                      >
                        <Upload className={`w-7 h-7 transition-colors duration-300 ${
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

              {/* Primary Message - Crossfades between states */}
              <motion.div
                className="text-center mb-10 relative"
                animate={{ y: isDragging && !showUploadingState ? -6 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <AnimatePresence mode="wait">
                  {showUploadingState ? (
                    <motion.div
                      key="uploading-text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: appleEasing }}
                      className="flex flex-col items-center"
                    >
                      <motion.h1 
                        className="text-[1.65rem] md:text-[2rem] font-semibold text-foreground mb-3 tracking-[-0.02em]"
                        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                        animate={{ 
                          color: isComplete ? 'hsl(142 76% 36%)' : 'hsl(var(--foreground))'
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {isComplete ? 'Document ready' : 'Preparing document'}
                      </motion.h1>
                      
                      {!isComplete && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center gap-2 text-muted-foreground/60 text-sm"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Secure processing</span>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default-text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: appleEasing }}
                    >
                      <h1 
                        className="text-[1.65rem] md:text-[2rem] font-semibold text-foreground mb-4 tracking-[-0.02em]"
                        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                      >
                        {isDragging ? 'Release to upload' : 'Sign with confidence'}
                      </h1>
                      <p className="text-muted-foreground/80 text-[0.95rem] max-w-sm mx-auto leading-relaxed">
                        Legally binding electronic signatures — fast, secure, and compliant.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Action Buttons - Fade out during upload */}
              <motion.div
                className="flex flex-col sm:flex-row items-center gap-3"
                animate={{ 
                  opacity: showUploadingState ? 0 : (isDragging ? 0.4 : 1),
                  scale: showUploadingState ? 0.95 : (isDragging ? 0.98 : 1),
                  y: showUploadingState ? 10 : 0,
                  pointerEvents: showUploadingState ? 'none' : 'auto',
                }}
                transition={{ duration: 0.3, ease: appleEasing }}
              >
                {/* Primary Button */}
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-12 px-7 rounded-xl font-medium text-sm overflow-hidden"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={showUploadingState}
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
                    Choose File
                  </span>
                </motion.button>

              </motion.div>

              {/* Drag & drop hint - Hides during upload */}
              <AnimatePresence>
                {!showUploadingState && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-5 text-xs text-muted-foreground/40"
                  >
                    Drag & drop supported
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Hidden inputs */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx"
                disabled={showUploadingState}
              />

              {/* Supported Formats Toggle - Hides during upload */}
              <AnimatePresence>
                {!showUploadingState && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 w-full"
                  >
                    <button
                      onClick={() => setShowFormats(!showFormats)}
                      className="flex items-center justify-center gap-2 mx-auto text-sm text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-lg px-3 py-1.5"
                    >
                      <span>{showFormats ? 'Hide' : 'View'} supported formats</span>
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
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap justify-center gap-2 pt-5">
                            {supportedFormats.map((format, i) => (
                              <motion.span
                                key={format}
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: i * 0.025 }}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary/70 text-muted-foreground/80 border border-border/40"
                              >
                                {format}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Trust Footer - Below the card, hidden during upload */}
        <AnimatePresence>
          {!showUploadingState && <TrustFooter variant="sign" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignUpload;
