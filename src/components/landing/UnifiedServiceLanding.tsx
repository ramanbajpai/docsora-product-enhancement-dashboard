import { useState, useCallback, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FolderUp, Shield, CheckCircle2, Lock, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmbientBackground } from "./AmbientBackground";

interface UnifiedServiceLandingProps {
  serviceName: string;
  headline: string;
  subheadline: string;
  supportedFormats?: string[];
  onFilesAdded?: (files: File[]) => void;
  showFolderUpload?: boolean;
  inputMode?: 'file' | 'text' | 'custom';
  customInput?: ReactNode;
  primaryAction?: string;
  secondaryAction?: string;
  maxFileSize?: string;
}

export function UnifiedServiceLanding({
  serviceName,
  headline,
  subheadline,
  supportedFormats = [],
  onFilesAdded,
  showFolderUpload = false,
  inputMode = 'file',
  customInput,
  primaryAction = "Upload Files",
  secondaryAction = "Upload Folder",
  maxFileSize = "100GB",
}: UnifiedServiceLandingProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showFormats, setShowFormats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (inputMode === 'file') {
      setIsDragging(true);
    }
  }, [inputMode]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (inputMode === 'file' && onFilesAdded) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        onFilesAdded(droppedFiles);
      }
    }
  }, [inputMode, onFilesAdded]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length > 0 && onFilesAdded) {
      onFilesAdded(selectedFiles);
    }
  }, [onFilesAdded]);

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Ambient Background */}
      <AmbientBackground isDragging={isDragging} />

      {/* Service Title with Gradient Fade */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center mb-12"
      >
        <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight select-none">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground/90 to-foreground/0">
            {serviceName}
          </span>
        </h1>
      </motion.div>

      {/* Main Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 w-full max-w-2xl transition-all duration-500 ${
          isDragging ? 'scale-[1.02]' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Animated Border */}
        <div className="absolute -inset-[1px] rounded-3xl overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: isDragging
                ? [
                    'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--primary) / 0.2), hsl(var(--primary)))',
                    'conic-gradient(from 360deg, hsl(var(--primary)), hsl(var(--primary) / 0.2), hsl(var(--primary)))',
                  ]
                : 'linear-gradient(135deg, hsl(var(--border) / 0.5), hsl(var(--primary) / 0.15), hsl(var(--border) / 0.5))',
            }}
            transition={{
              duration: isDragging ? 3 : 0,
              repeat: isDragging ? Infinity : 0,
              ease: "linear",
            }}
          />
        </div>

        {/* Glass Card */}
        <motion.div
          className="relative rounded-3xl backdrop-blur-2xl bg-card/60 border border-border/30"
          animate={{
            boxShadow: isDragging
              ? '0 0 80px hsl(var(--primary) / 0.2), 0 40px 80px -20px hsl(var(--foreground) / 0.1)'
              : '0 40px 80px -20px hsl(var(--foreground) / 0.08), 0 0 0 1px hsl(var(--border) / 0.1)',
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center justify-center py-16 px-8 md:py-20 md:px-12">
            {/* Icon */}
            <motion.div
              className="relative mb-8"
              animate={{ 
                y: isDragging ? -12 : 0,
                scale: isDragging ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Glow */}
              <motion.div
                className="absolute -inset-4 rounded-full blur-2xl"
                animate={{
                  backgroundColor: isDragging
                    ? 'hsl(var(--primary) / 0.3)'
                    : 'hsl(var(--primary) / 0.1)',
                }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Icon Circle */}
              <motion.div
                className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isDragging
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/80 text-muted-foreground'
                }`}
              >
                <Upload className="w-8 h-8" />
              </motion.div>

              {/* Pulse Rings */}
              {isDragging && (
                <>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-2xl border-2 border-primary"
                      initial={{ opacity: 0.6, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.5 + i * 0.2 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              )}
            </motion.div>

            {/* Text */}
            <motion.div
              className="text-center mb-10"
              animate={{ y: isDragging ? -8 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3 tracking-tight">
                {isDragging ? 'Release to upload' : headline}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
                {subheadline}
                <br />
                <span className="text-sm opacity-70">Up to {maxFileSize} · Enterprise encrypted</span>
              </p>
            </motion.div>

            {/* Input Area */}
            {inputMode === 'file' && (
              <motion.div
                className="flex flex-col sm:flex-row items-center gap-3"
                animate={{ 
                  opacity: isDragging ? 0.5 : 1,
                  scale: isDragging ? 0.98 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="h-12 px-6 text-base font-medium rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {primaryAction}
                </Button>
                {showFolderUpload && (
                  <Button
                    variant="outline"
                    onClick={() => folderInputRef.current?.click()}
                    size="lg"
                    className="h-12 px-6 text-base font-medium rounded-xl backdrop-blur-sm bg-background/30 hover:bg-background/50 border-border/50 transition-all duration-300"
                  >
                    <FolderUp className="w-4 h-4 mr-2" />
                    {secondaryAction}
                  </Button>
                )}
              </motion.div>
            )}

            {inputMode === 'custom' && customInput}

            {/* Hidden inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            {showFolderUpload && (
              <input
                ref={folderInputRef}
                type="file"
                // @ts-ignore
                webkitdirectory=""
                directory=""
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            )}

            {/* Supported Formats Toggle */}
            {supportedFormats.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 w-full"
              >
                <button
                  onClick={() => setShowFormats(!showFormats)}
                  className="flex items-center justify-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  <span>{showFormats ? 'Hide' : 'View'} supported formats</span>
                  <motion.div
                    animate={{ rotate: showFormats ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
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
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap justify-center gap-2 pt-4">
                        {supportedFormats.map((format) => (
                          <span
                            key={format}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-secondary/60 text-muted-foreground"
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

      {/* Trust Signals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-12 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span>SOC 2</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-border/50" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <span>ISO 27001</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-border/50" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <span>GDPR</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-border/50" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <span>256-bit encryption</span>
        </div>
      </motion.div>
    </div>
  );
}
