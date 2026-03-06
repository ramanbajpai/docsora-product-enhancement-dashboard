import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Upload, FolderUp, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransferUploadZoneProps {
  onFilesAdded: (files: File[]) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function TransferUploadZone({ onFilesAdded }: TransferUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingFiles, setFloatingFiles] = useState<{ id: number; name: string; x: number; y: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Generate ambient particles
  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
    }));
    setParticles(newParticles);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left - rect.width / 2) / 20);
      mouseY.set((e.clientY - rect.top - rect.height / 2) / 20);
    }
  }, [mouseX, mouseY]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);

    // Create floating file previews
    if (e.dataTransfer.items && floatingFiles.length === 0) {
      const files: { id: number; name: string; x: number; y: number }[] = [];
      for (let i = 0; i < Math.min(e.dataTransfer.items.length, 5); i++) {
        files.push({
          id: i,
          name: e.dataTransfer.items[i].type || 'File',
          x: 50 + (Math.random() - 0.5) * 30,
          y: 40 + (Math.random() - 0.5) * 20,
        });
      }
      if (files.length > 0) setFloatingFiles(files);
    }
  }, [floatingFiles.length]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setFloatingFiles([]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setFloatingFiles([]);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      onFilesAdded(droppedFiles);
    }
  }, [onFilesAdded]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length > 0) {
      onFilesAdded(selectedFiles);
    }
  }, [onFilesAdded]);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            x: springX,
            y: springY,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        
        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-primary/20"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Drop Zone */}
      <motion.div
        className={`relative z-10 w-full max-w-3xl mx-auto transition-all duration-700 ${
          isDragging ? 'scale-[1.02]' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Magnetic Border Effect */}
        <div className="absolute -inset-px rounded-3xl overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: isDragging
                ? [
                    'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--primary) / 0.3), hsl(var(--primary)))',
                    'conic-gradient(from 360deg, hsl(var(--primary)), hsl(var(--primary) / 0.3), hsl(var(--primary)))',
                  ]
                : 'linear-gradient(135deg, hsl(var(--border)), hsl(var(--primary) / 0.2), hsl(var(--border)))',
            }}
            transition={{
              duration: isDragging ? 2 : 0,
              repeat: isDragging ? Infinity : 0,
              ease: "linear",
            }}
          />
        </div>

        {/* Glass Container */}
        <motion.div
          className="relative rounded-3xl backdrop-blur-xl bg-background/80 border border-border/50"
          animate={{
            boxShadow: isDragging
              ? '0 0 100px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.2)'
              : '0 25px 50px -12px hsl(var(--foreground) / 0.1)',
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center justify-center py-24 px-12">
            {/* Floating File Previews */}
            <AnimatePresence>
              {isDragging && floatingFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ scale: 0, opacity: 0, y: 50 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    y: 0,
                    x: (index - floatingFiles.length / 2) * 20,
                  }}
                  exit={{ scale: 0, opacity: 0, y: -50 }}
                  className="absolute top-1/3 w-16 h-20 rounded-xl bg-primary/10 border border-primary/30 backdrop-blur-sm flex items-center justify-center"
                  style={{ zIndex: 10 + index }}
                >
                  <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Main Icon */}
            <motion.div
              className="relative mb-8"
              animate={{ 
                y: isDragging ? -20 : 0,
                scale: isDragging ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Glow Ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: isDragging
                    ? '0 0 60px 30px hsl(var(--primary) / 0.3)'
                    : '0 0 30px 15px hsl(var(--primary) / 0.1)',
                }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Icon Container */}
              <motion.div
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isDragging
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/80 text-muted-foreground'
                }`}
                animate={{
                  rotate: isDragging ? [0, 5, -5, 0] : 0,
                }}
                transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
              >
                <Upload className="w-10 h-10" />
              </motion.div>

              {/* Orbiting Dots */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: isDragging ? [0, Math.cos(i * 2.1 + Date.now() / 500) * 50] : 0,
                    y: isDragging ? [0, Math.sin(i * 2.1 + Date.now() / 500) * 50] : 0,
                    opacity: isDragging ? [0, 1, 0] : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </motion.div>

            {/* Text */}
            <motion.div
              className="text-center mb-10"
              animate={{ y: isDragging ? -10 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h1 className="text-3xl font-semibold text-foreground mb-3 tracking-tight">
                {isDragging ? 'Release to upload' : 'Drop files to send them securely'}
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Large files, folders, or entire projects.
                <br />
                <span className="text-sm opacity-70">Up to 100GB · Enterprise encrypted</span>
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex items-center gap-4"
              animate={{ 
                opacity: isDragging ? 0.5 : 1,
                scale: isDragging ? 0.95 : 1,
              }}
            >
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="lg"
                className="h-14 px-8 text-base font-medium rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Files
              </Button>
              <Button
                variant="outline"
                onClick={() => folderInputRef.current?.click()}
                size="lg"
                className="h-14 px-8 text-base font-medium rounded-2xl backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all"
              >
                <FolderUp className="w-5 h-5 mr-2" />
                Upload Folder
              </Button>
            </motion.div>

            {/* Hidden inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
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
          </div>
        </motion.div>
      </motion.div>

      {/* Trust Signals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span>End-to-end encrypted</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span>No data used for training</span>
        <div className="h-4 w-px bg-border" />
        <span>SOC 2 · ISO 27001</span>
      </motion.div>
    </div>
  );
}
