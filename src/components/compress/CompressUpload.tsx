import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Upload, ChevronDown, X, Plus, FileText, ArrowRight } from "lucide-react";
import { FileData } from "@/pages/Compress";
import { Button } from "@/components/ui/button";
import TrustFooter from "@/components/shared/TrustFooter";

interface QueuedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface CompressUploadProps {
  onFileSelect: (file: FileData) => void;
  onStartCompress?: (files: FileData[]) => void;
}

const supportedFormats = ['PDF', 'DOCX', 'DOC', 'PPTX', 'PPT', 'XLSX', 'XLS', 'JPG', 'PNG', 'TIFF', 'BMP', 'GIF'];

// Apple-style easing
const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const CompressUpload = ({ onFileSelect, onStartCompress }: CompressUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showFormats, setShowFormats] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Derived states
  const hasQueuedFiles = queuedFiles.length > 0;

  // Mouse tracking for card tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [3, -3]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-3, 3]), { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  }, [mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Add files to queue (don't auto-start)
  const addFilesToQueue = useCallback((files: File[]) => {
    const newQueuedFiles: QueuedFile[] = files.map(file => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file
    }));
    setQueuedFiles(prev => [...prev, ...newQueuedFiles]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFilesToQueue(droppedFiles);
    }
  }, [addFilesToQueue]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length > 0) {
      addFilesToQueue(selectedFiles);
    }
    // Reset input
    e.target.value = '';
  }, [addFilesToQueue]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setQueuedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleStartCompress = useCallback(() => {
    if (queuedFiles.length === 0) return;
    
    // Convert to FileData array
    const filesData: FileData[] = queuedFiles.map(qf => ({
      name: qf.name,
      size: qf.size,
      type: qf.type,
    }));
    
    // Proceed immediately
    if (onStartCompress) {
      onStartCompress(filesData);
    } else {
      onFileSelect(filesData[0]);
    }
  }, [queuedFiles, onStartCompress, onFileSelect]);

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

      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background))_100%)] opacity-50" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto">

        {/* Hero Upload Card */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: isDragging ? 1.02 : 1,
          }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            rotateX, 
            rotateY, 
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
              opacity: isDragging ? 0.6 : isHovering ? 0.35 : 0.2,
              scale: isDragging ? 1.05 : isHovering ? 1.02 : 1,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 65%)',
              filter: 'blur(60px)',
            }}
          />

          {/* Card border highlight */}
          <motion.div 
            className="absolute -inset-[1px] rounded-[28px] overflow-hidden"
            animate={{
              opacity: isDragging ? 1 : isHovering ? 0.6 : 0.35,
            }}
            transition={{ duration: 0.4 }}
          >
            <div className={`absolute inset-0 ${
              isDragging 
                ? 'bg-gradient-to-br from-primary/50 via-primary/20 to-primary/50' 
                : 'bg-gradient-to-br from-border/70 via-transparent to-border/70'
            }`} />
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
              y: isHovering ? -4 : 0,
              boxShadow: isDragging
                ? '0 60px 120px -30px hsl(var(--primary) / 0.25), 0 40px 80px -20px hsl(var(--foreground) / 0.12), 0 20px 40px -10px hsl(var(--foreground) / 0.08), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)'
                : isHovering 
                  ? '0 50px 100px -25px hsl(var(--foreground) / 0.12), 0 30px 60px -15px hsl(var(--foreground) / 0.08), 0 15px 30px -8px hsl(var(--foreground) / 0.06), inset 0 1px 0 0 hsl(0 0% 100% / 0.1)'
                  : '0 35px 70px -20px hsl(var(--foreground) / 0.08), 0 20px 40px -12px hsl(var(--foreground) / 0.05), 0 10px 20px -6px hsl(var(--foreground) / 0.03), inset 0 1px 0 0 hsl(0 0% 100% / 0.08)',
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="absolute inset-0 rounded-[28px] pointer-events-none border border-border/30" />

            <div className="flex flex-col items-center justify-center py-16 px-8 md:py-20 md:px-12">
              
              {/* Floating Upload Icon */}
              <motion.div
                className="relative mb-10"
                animate={{ 
                  y: isDragging ? -10 : [0, -4, 0],
                  scale: isDragging ? 1.08 : 1,
                }}
                transition={isDragging 
                  ? { type: "spring", stiffness: 350, damping: 25 }
                  : { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }
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

              {/* Primary Message */}
              <motion.div
                className="text-center mb-10"
                animate={{ y: isDragging ? -6 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <AnimatePresence mode="wait">
                  {hasQueuedFiles ? (
                    <motion.div
                      key="queued-text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: appleEasing }}
                    >
                      <h1 
                        className="text-[1.65rem] md:text-[2rem] font-semibold text-foreground mb-4 tracking-[-0.02em]"
                        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                      >
                        Ready to compress
                      </h1>
                      <p className="text-muted-foreground/80 text-[0.95rem] max-w-sm mx-auto leading-relaxed">
                        {queuedFiles.length} {queuedFiles.length === 1 ? 'file' : 'files'} selected
                      </p>
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
                        {isDragging ? 'Release to upload' : 'Compress without compromise'}
                      </h1>
                      <p className="text-muted-foreground/80 text-[0.95rem] max-w-sm mx-auto leading-relaxed">
                        Reduce file size while preserving quality — fast, secure, and precise.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Queued Files List - Shows when files are queued */}
              <AnimatePresence mode="wait">
                {hasQueuedFiles && (
                  <motion.div
                    key="queued-files"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: appleEasing }}
                    className="w-full flex flex-col mb-6"
                  >
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
                            onClick={() => handleRemoveFile(file.id)}
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

                    {/* Action Buttons - centered */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => addMoreInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add more files
                      </Button>
                      <Button
                        onClick={handleStartCompress}
                        className="gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Start ({queuedFiles.length} {queuedFiles.length === 1 ? 'file' : 'files'})
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons - Only show when no queued files */}
              <AnimatePresence>
                {!hasQueuedFiles && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3"
                    transition={{ duration: 0.3, ease: appleEasing }}
                  >
                    {/* Primary Button */}
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
                        Choose Files
                      </span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Drag & drop hint - Hides when files queued */}
              <AnimatePresence>
                {!hasQueuedFiles && (
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
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.tiff,.bmp,.gif"
              />
              <input
                ref={addMoreInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.tiff,.bmp,.gif"
              />

              {/* Supported Formats Toggle - Hides when files queued */}
              <AnimatePresence>
                {!hasQueuedFiles && (
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


        {/* Trust Footer - Below the card, hidden when files queued */}
        <AnimatePresence>
          {!hasQueuedFiles && <TrustFooter variant="compress" />}
        </AnimatePresence>
      </div>
    </div>
  );
};
