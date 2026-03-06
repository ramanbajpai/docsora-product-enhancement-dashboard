import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Check, Shield, 
  FileText, Image, Film, Music, Archive, File
} from "lucide-react";
import { TransferFile } from "@/pages/Transfer";

interface TransferProgressProps {
  files: TransferFile[];
  totalSize: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return Archive;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function TransferProgress({ files, totalSize }: TransferProgressProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [statusText, setStatusText] = useState('Encrypting...');

  const { overallProgress, uploadedSize, uploadSpeed, timeRemaining, completedCount } = useMemo(() => {
    const uploaded = files.reduce((acc, f) => acc + (f.size * f.progress / 100), 0);
    const completed = files.filter(f => f.status === 'completed').length;
    const progress = files.length > 0 
      ? files.reduce((acc, f) => acc + f.progress, 0) / files.length 
      : 0;
    
    const speed = 5 * 1024 * 1024;
    const remaining = (totalSize - uploaded) / speed;
    
    return {
      overallProgress: progress,
      uploadedSize: uploaded,
      uploadSpeed: speed,
      timeRemaining: remaining,
      completedCount: completed,
    };
  }, [files, totalSize]);

  // Generate particles based on progress
  useEffect(() => {
    const numParticles = Math.floor(30 + overallProgress * 0.5);
    const newParticles: Particle[] = Array.from({ length: numParticles }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 40,
      y: 50 + (Math.random() - 0.5) * 40,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 2 + 1,
      angle: Math.random() * Math.PI * 2,
    }));
    setParticles(newParticles);
  }, [Math.floor(overallProgress / 10)]);

  // Update status text
  useEffect(() => {
    if (overallProgress < 20) setStatusText('Encrypting...');
    else if (overallProgress < 50) setStatusText('Sending securely...');
    else if (overallProgress < 80) setStatusText('Almost there...');
    else setStatusText('Finalizing...');
  }, [overallProgress]);

  return (
    <div className="flex flex-col items-center justify-center py-8 min-h-[70vh]">
      {/* Main Orb Visualization */}
      <div className="relative w-80 h-80 mb-12">
        {/* Outer Glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 60px 20px hsl(var(--primary) / 0.2)',
              '0 0 80px 30px hsl(var(--primary) / 0.3)',
              '0 0 60px 20px hsl(var(--primary) / 0.2)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Particle Field */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="0.5"
            className="opacity-30"
          />

          {/* Progress Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${overallProgress * 2.83} 283`}
            transform="rotate(-90 50 50)"
            initial={{ strokeDasharray: '0 283' }}
            animate={{ strokeDasharray: `${overallProgress * 2.83} 283` }}
            transition={{ duration: 0.5 }}
          />

          {/* Animated Particles */}
          {particles.map((particle, i) => (
            <motion.circle
              key={particle.id}
              r={particle.size / 10}
              fill="hsl(var(--primary))"
              initial={{ cx: particle.x, cy: particle.y, opacity: 0 }}
              animate={{
                cx: [
                  particle.x,
                  50 + Math.cos(particle.angle) * (20 + overallProgress * 0.2),
                  particle.x,
                ],
                cy: [
                  particle.y,
                  50 + Math.sin(particle.angle) * (20 + overallProgress * 0.2),
                  particle.y,
                ],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: particle.speed + 1,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}

          {/* Central Flow Lines */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.line
              key={angle}
              x1="50"
              y1="50"
              x2={50 + Math.cos((angle * Math.PI) / 180) * 35}
              y2={50 + Math.sin((angle * Math.PI) / 180) * 35}
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-5xl font-bold text-foreground tabular-nums"
            key={Math.floor(overallProgress)}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {Math.floor(overallProgress)}%
          </motion.span>
          <motion.span 
            className="text-sm text-muted-foreground mt-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {statusText}
          </motion.span>
        </div>

        {/* Orbiting File Indicators */}
        {files.slice(0, 4).map((file, index) => {
          const angle = (index / Math.min(files.length, 4)) * Math.PI * 2 - Math.PI / 2;
          const radius = 55;
          const x = 50 + Math.cos(angle + (overallProgress / 100) * Math.PI) * radius;
          const y = 50 + Math.sin(angle + (overallProgress / 100) * Math.PI) * radius;
          const Icon = getFileIcon(file.type);

          return (
            <motion.div
              key={file.id}
              className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-xl backdrop-blur-sm flex items-center justify-center"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                background: file.status === 'completed' 
                  ? 'hsl(var(--accent))' 
                  : 'hsl(var(--secondary))',
              }}
              animate={{
                scale: file.status === 'uploading' ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.5, repeat: file.status === 'uploading' ? Infinity : 0 }}
            >
              {file.status === 'completed' ? (
                <Check className="w-5 h-5 text-accent-foreground" />
              ) : (
                <Icon className="w-5 h-5 text-muted-foreground" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Status Text */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Transferring securely
        </h2>
        <p className="text-muted-foreground">
          {completedCount} of {files.length} files complete
        </p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className="flex items-center justify-center gap-8 p-6 rounded-2xl backdrop-blur-xl bg-card/50 border border-border/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="font-semibold text-foreground">{formatFileSize(uploadSpeed)}/s</span>
          </div>
          <span className="text-xs text-muted-foreground">Speed</span>
        </div>
        
        <div className="h-10 w-px bg-border" />
        
        <div className="text-center">
          <span className="font-semibold text-foreground">
            {formatFileSize(uploadedSize)}
          </span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-muted-foreground">{formatFileSize(totalSize)}</span>
          <p className="text-xs text-muted-foreground">Transferred</p>
        </div>
        
        <div className="h-10 w-px bg-border" />
        
        <div className="text-center">
          <span className="font-semibold text-foreground">
            ~{Math.max(1, Math.ceil(timeRemaining))}s
          </span>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
      </motion.div>

      {/* File Progress List */}
      <motion.div
        className="w-full max-w-md mt-8 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {files.map((file, index) => {
          const Icon = getFileIcon(file.type);
          return (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 overflow-hidden"
            >
              {/* Progress Background */}
              <motion.div
                className="absolute inset-0 bg-primary/5"
                initial={{ width: 0 }}
                animate={{ width: `${file.progress}%` }}
                transition={{ duration: 0.3 }}
              />
              
              <div className="relative flex items-center gap-3 w-full">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  file.status === 'completed' ? 'bg-accent' : 'bg-secondary'
                }`}>
                  {file.status === 'completed' ? (
                    <Check className="w-4 h-4 text-accent-foreground" />
                  ) : (
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>

                <span className={`text-sm font-medium ${
                  file.status === 'completed' ? 'text-accent' : 'text-primary'
                }`}>
                  {file.status === 'completed' ? 'Done' : `${Math.floor(file.progress)}%`}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 mt-8 text-sm text-muted-foreground"
      >
        <Shield className="w-4 h-4 text-primary" />
        <span>End-to-end encrypted · Your files are safe</span>
      </motion.div>
    </div>
  );
}
