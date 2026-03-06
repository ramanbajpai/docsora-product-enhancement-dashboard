import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Shield, 
  Clock, 
  X,
  Lock,
  FileArchive,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  File,
  ChevronRight,
  Eye,
  Zap,
  ShieldCheck,
  BarChart3,
  KeyRound,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/useTheme";

// Import logos
import docsoraLogoDark from "@/assets/docsora-logo-dark.png";
import docsoraLogoLight from "@/assets/docsora-logo-light.png";

interface TransferFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface RecipientPasswordProtectedViewProps {
  onClose: () => void;
}

// Mock transfer data
const mockTransfer = {
  sender: {
    name: "Alex Chen",
    email: "alex.chen@company.com",
    avatarColor: "from-blue-500 to-indigo-600",
  },
  message: "Please review the attached files for our upcoming presentation.",
  expiresIn: 6,
  password: "docsora123", // Mock password for demo
  files: [
    { id: "1", name: "Q4_Financial_Report.pdf", size: 2456000, type: "application/pdf" },
    { id: "2", name: "Presentation_Deck.pptx", size: 8900000, type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
    { id: "3", name: "Supporting_Data.xlsx", size: 1200000, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    { id: "4", name: "Brand_Assets.zip", size: 45000000, type: "application/zip" },
    { id: "5", name: "Contract_Draft.pdf", size: 890000, type: "application/pdf" },
    { id: "6", name: "Meeting_Notes.docx", size: 156000, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    { id: "7", name: "Product_Photos.zip", size: 128000000, type: "application/zip" },
    { id: "8", name: "Analytics_Report.xlsx", size: 2340000, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  ] as TransferFile[],
};

type ViewState = "password" | "unlocked";
type DownloadState = "idle" | "collapsing" | "preparing" | "downloading" | "complete";

// File type categorization
const getFileCategory = (type: string): string => {
  if (type.includes("pdf")) return "pdf";
  if (type.includes("image")) return "image";
  if (type.includes("zip") || type.includes("archive")) return "archive";
  if (type.includes("spreadsheet") || type.includes("excel")) return "spreadsheet";
  if (type.includes("presentation") || type.includes("powerpoint")) return "presentation";
  if (type.includes("word") || type.includes("document")) return "document";
  return "other";
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  image: ImageIcon,
  archive: FileArchive,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  document: FileText,
  other: File,
};

const categoryColors: Record<string, string> = {
  pdf: "text-red-400",
  image: "text-emerald-400",
  archive: "text-amber-400",
  spreadsheet: "text-green-400",
  presentation: "text-orange-400",
  document: "text-blue-400",
  other: "text-muted-foreground",
};

export function RecipientPasswordProtectedView({ onClose }: RecipientPasswordProtectedViewProps) {
  const { theme } = useTheme();
  const [viewState, setViewState] = useState<ViewState>("password");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [showContentsModal, setShowContentsModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const logo = theme === "dark" ? docsoraLogoDark : docsoraLogoLight;

  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring animation for cursor glow
  const glowX = useSpring(mouseX, { stiffness: 60, damping: 30, mass: 1.2 });
  const glowY = useSpring(mouseY, { stiffness: 60, damping: 30, mass: 1.2 });

  // Card transforms for parallax
  const rotateX = useTransform(mouseY, [-300, 300], [1.5, -1.5]);
  const rotateY = useTransform(mouseX, [-400, 400], [-1.5, 1.5]);
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const totalSize = mockTransfer.files.reduce((acc, file) => acc + file.size, 0);
  const fileCount = mockTransfer.files.length;

  // Group files by category
  const filesByCategory = mockTransfer.files.reduce((acc, file) => {
    const category = getFileCategory(file.type);
    if (!acc[category]) acc[category] = [];
    acc[category].push(file);
    return acc;
  }, {} as Record<string, TransferFile[]>);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const handlePasswordSubmit = () => {
    if (!password.trim()) return;
    
    setIsVerifying(true);
    setPasswordError(false);
    
    // Simulate verification - accept any password for demo
    setTimeout(() => {
      setViewState("unlocked");
      setIsVerifying(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePasswordSubmit();
    }
  };

  const handleDownload = () => {
    setDownloadState("collapsing");
    
    setTimeout(() => {
      setDownloadState("preparing");
      setDownloadProgress(0);
    }, 600);

    setTimeout(() => {
      setDownloadState("downloading");
    }, 1400);
  };

  // Simulate download progress
  useEffect(() => {
    if (downloadState !== "downloading") return;

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        const increment = Math.random() * 8 + 2;
        const newProgress = Math.min(prev + increment, 100);
        setDownloadSpeed(Math.random() * 15 + 8);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadState("complete");
          }, 300);
        }
        
        return newProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [downloadState]);

  const handleDownloadAgain = () => {
    setDownloadState("idle");
    setDownloadProgress(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dark editorial background with slow ambient drift */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background overflow-hidden">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Ambient gradients */}
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[180px]"
          animate={{
            x: [0, 60, 0, -60, 0],
            y: [0, -40, 0, 40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            top: '-10%',
            left: '15%',
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 70%)',
          }}
        />
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[150px]"
          animate={{
            x: [0, -50, 0, 50, 0],
            y: [0, 50, 0, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          style={{
            bottom: '-5%',
            right: '10%',
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.03) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Cursor-following glow */}
      <motion.div
        className="absolute pointer-events-none w-[700px] h-[700px] rounded-full"
        style={{
          x: glowX,
          y: glowY,
          left: '50%',
          top: '50%',
          marginLeft: '-350px',
          marginTop: '-350px',
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.045) 0%, hsl(var(--primary) / 0.02) 40%, transparent 70%)',
          filter: 'blur(2px)',
        }}
      />
      <motion.div
        className="absolute pointer-events-none w-[400px] h-[400px] rounded-full opacity-60"
        style={{
          x: useSpring(mouseX, { stiffness: 40, damping: 35, mass: 1.5 }),
          y: useSpring(mouseY, { stiffness: 40, damping: 35, mass: 1.5 }),
          left: '50%',
          top: '50%',
          marginLeft: '-200px',
          marginTop: '-200px',
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.03) 0%, transparent 60%)',
        }}
      />

      {/* Header */}
      <header className="relative z-10 py-6 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img src={logo} alt="Docsora" className="h-7" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
              <Shield className="w-4 h-4 text-primary/60" />
              <span>Secure file transfer</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground/60 hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-180px)] px-6">
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            transformPerspective: 1200,
          }}
          className="w-full max-w-xl"
        >
          <AnimatePresence mode="wait">
            {/* Password Gate */}
            {viewState === "password" && (
              <motion.div
                key="password-gate"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-3xl overflow-hidden"
              >
                {/* Outer glow ring */}
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-border/60 via-border/20 to-border/40" />
                
                {/* Main card body */}
                <div className="relative bg-card/85 backdrop-blur-lg rounded-3xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.03),inset_0_-1px_0_0_rgba(0,0,0,0.1)]">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.03] via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
                  
                  <div className="relative p-8">
                    {/* Lock Icon */}
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Lock className="w-7 h-7 text-primary" />
                      </motion.div>
                    </motion.div>

                    {/* Title */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.25 }}
                      className="text-center mb-6"
                    >
                      <h2 className="text-xl font-semibold text-foreground mb-1.5">
                        Password protected transfer
                      </h2>
                      <p className="text-sm text-muted-foreground/70">
                        Enter the password to access these files
                      </p>
                    </motion.div>

                    {/* Sender Info - Compact */}
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/10 mb-6"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mockTransfer.sender.avatarColor} flex items-center justify-center shadow-md`}>
                        <span className="text-sm font-semibold text-white">
                          {mockTransfer.sender.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {mockTransfer.sender.name}
                        </p>
                        <p className="text-xs text-muted-foreground/60 truncate">
                          {mockTransfer.sender.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{fileCount} files</span>
                      </div>
                    </motion.div>

                    {/* Password Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 }}
                      className="space-y-3 mb-5"
                    >
                      <motion.div 
                        className="relative"
                        animate={passwordError ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      >
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                          type="password"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                          }}
                          onKeyPress={handleKeyPress}
                          className={`h-12 pl-11 pr-4 bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-200 ${
                            passwordError ? 'border-amber-500/40 focus:border-amber-500/40' : ''
                          }`}
                          autoFocus
                        />
                      </motion.div>
                      
                      {/* Helper text */}
                      <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground/60 text-center font-medium">
                          The password was sent to you in a separate email by the sender.
                        </p>
                        <p className="text-[10px] text-muted-foreground/40 text-center">
                          If you received this link another way, please contact the sender to request the password.
                        </p>
                      </div>
                      
                      {passwordError && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-center gap-2 text-xs text-amber-400/80"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>That password doesn't match. Please try again.</span>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Access Button with breathing glow */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      className="relative"
                    >
                      {/* Ambient breathing glow */}
                      <motion.div
                        className="absolute -inset-1 rounded-xl bg-primary/20 blur-lg"
                        animate={{ 
                          opacity: [0.3, 0.5, 0.3],
                          scale: [0.98, 1.01, 0.98]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      
                      <motion.button
                        onClick={handlePasswordSubmit}
                        disabled={!password.trim() || isVerifying}
                        whileHover={{ scale: 1.015, boxShadow: "0 8px 32px -8px hsl(var(--primary) / 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="relative w-full h-12 bg-primary text-primary-foreground font-medium rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/25 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        {isVerifying ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          />
                        ) : (
                          <>
                            <Lock className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">Access files securely</span>
                          </>
                        )}
                      </motion.button>
                    </motion.div>

                    {/* Trust reinforcement */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-4"
                    >
                      <p className="text-[10px] text-center text-muted-foreground/40">
                        Your password is never stored or shared.
                      </p>
                    </motion.div>

                    {/* Brand positioning */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-6 pt-4 border-t border-border/10"
                    >
                      <p className="text-[10px] text-center text-muted-foreground/30">
                        Docsora — professional-grade secure file transfers.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Unlocked View - File Details & Download */}
            {viewState === "unlocked" && (
              <motion.div
                key="unlocked-view"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-3xl overflow-hidden"
              >
                {/* Outer glow ring */}
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-border/60 via-border/20 to-border/40" />
                
                {/* Main card body */}
                <div className="relative bg-card/85 backdrop-blur-lg rounded-3xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.03),inset_0_-1px_0_0_rgba(0,0,0,0.1)]">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.03] via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
                
                  <div className="relative p-8">
                    {/* Sender Identity */}
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mockTransfer.sender.avatarColor} flex items-center justify-center shadow-lg shadow-primary/20`}
                      >
                        <span className="text-xl font-semibold text-white">
                          {mockTransfer.sender.name.charAt(0)}
                        </span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                      >
                        <h2 className="text-lg font-semibold text-foreground tracking-tight">
                          {mockTransfer.sender.name}
                        </h2>
                        <p className="text-sm text-muted-foreground/70">
                          {mockTransfer.sender.email}
                        </p>
                      </motion.div>
                    </div>

                    {/* Sender Message */}
                    {mockTransfer.message && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="bg-muted/20 rounded-xl p-4 mb-6 border border-border/10"
                      >
                        <p className="text-sm text-muted-foreground/80 leading-relaxed italic">
                          "{mockTransfer.message}"
                        </p>
                      </motion.div>
                    )}

                    {/* File Summary */}
                    <AnimatePresence mode="wait">
                      {(downloadState === "idle" || downloadState === "complete") && (
                        <motion.div
                          key="file-summary"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <motion.div 
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.35 }}
                            className="flex items-center justify-between mb-4"
                          >
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-foreground tracking-tight">
                                {fileCount.toLocaleString()} files
                              </p>
                              <span className="text-muted-foreground/60">·</span>
                              <p className="text-muted-foreground/70">
                                {formatFileSize(totalSize)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {Object.entries(filesByCategory).slice(0, 5).map(([category, files], index) => {
                                const Icon = categoryIcons[category] || File;
                                const colorClass = categoryColors[category] || "text-muted-foreground";
                                return (
                                  <motion.div
                                    key={category}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                                    className={`w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center ${colorClass} opacity-80`}
                                    title={`${files.length} ${category} file(s)`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>

                          {/* View contents link */}
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.45 }}
                            onClick={() => setShowContentsModal(true)}
                            className="flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-foreground transition-colors group mb-6"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View contents</span>
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          </motion.button>

                          {/* Meta info */}
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.5 }}
                            className="flex items-center gap-4 text-sm text-muted-foreground/50 mb-8"
                          >
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Expires in {mockTransfer.expiresIn} days</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-500/70">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Password protected</span>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Collapsing state */}
                      {downloadState === "collapsing" && (
                        <motion.div
                          key="collapsing"
                          initial={{ opacity: 1, scale: 1, y: 0 }}
                          animate={{ opacity: 0, scale: 0.5, y: 30 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="flex items-center justify-center py-8"
                        >
                          <div className="flex gap-1">
                            {Object.entries(filesByCategory).slice(0, 4).map(([category], i) => {
                              const Icon = categoryIcons[category] || File;
                              return (
                                <motion.div
                                  key={category}
                                  initial={{ x: (i - 1.5) * 30 }}
                                  animate={{ x: 0, opacity: 0 }}
                                  transition={{ delay: i * 0.08, duration: 0.3 }}
                                  className="w-10 h-10 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground"
                                >
                                  <Icon className="w-5 h-5" />
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}

                      {/* Progress state */}
                      {(downloadState === "preparing" || downloadState === "downloading") && (
                        <motion.div
                          key="progress"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4 }}
                          className="py-8"
                        >
                          <div className="flex flex-col items-center">
                            <div className="relative w-32 h-32 mb-6">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="56"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="7"
                                  className="text-muted/15"
                                />
                                <motion.circle
                                  cx="64"
                                  cy="64"
                                  r="56"
                                  fill="none"
                                  stroke="url(#progressGradientProtected)"
                                  strokeWidth="7"
                                  strokeLinecap="round"
                                  strokeDasharray={351.86}
                                  strokeDashoffset={351.86 - (351.86 * downloadProgress) / 100}
                                  initial={{ strokeDashoffset: 351.86 }}
                                  animate={{ strokeDashoffset: 351.86 - (351.86 * downloadProgress) / 100 }}
                                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                />
                                <defs>
                                  <linearGradient id="progressGradientProtected" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                                    <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-semibold text-foreground tabular-nums">
                                  {Math.round(downloadProgress)}%
                                </span>
                              </div>
                            </div>

                            <div className="text-center space-y-1.5">
                              <p className="text-sm font-medium text-foreground">
                                {downloadState === "preparing" ? "Preparing download" : "Downloading files securely"}
                              </p>
                              {downloadState === "downloading" && (
                                <p className="text-xs text-muted-foreground/60">
                                  ~{Math.max(1, Math.round((100 - downloadProgress) / (downloadSpeed * 0.8)))} seconds remaining · {downloadSpeed.toFixed(1)} MB/s
                                </p>
                              )}
                              {downloadState === "preparing" && (
                                <p className="text-xs text-muted-foreground/60">
                                  Decrypting protected files
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Download Button / Complete State */}
                    <AnimatePresence mode="wait">
                      {downloadState === "idle" && (
                        <motion.div
                          key="download-btn"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, delay: 0.55 }}
                        >
                          <motion.button
                            onClick={handleDownload}
                            whileHover={{ scale: 1.015, boxShadow: "0 8px 32px -8px hsl(var(--primary) / 0.35)" }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="relative w-full h-14 bg-primary text-primary-foreground font-medium rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/25 overflow-hidden group"
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                            <Download className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">Download files</span>
                          </motion.button>
                        </motion.div>
                      )}

                      {downloadState === "complete" && (
                        <motion.div
                          key="complete"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="text-center"
                        >
                          {/* Success Animation */}
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="relative w-12 h-12 mx-auto mb-3"
                          >
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0] }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="absolute inset-0 rounded-full bg-emerald-500/20"
                            />
                            <div className="absolute inset-0 rounded-full bg-emerald-500/10 flex items-center justify-center">
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                              </motion.div>
                            </div>
                          </motion.div>

                          <motion.h3 
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="text-base font-semibold text-foreground mb-0.5"
                          >
                            Download complete
                          </motion.h3>
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="text-xs text-muted-foreground/70 mb-3"
                          >
                            {fileCount} {fileCount === 1 ? 'file' : 'files'} saved securely
                          </motion.p>

                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                          >
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={handleDownloadAgain} 
                              className="h-8 gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground hover:bg-transparent"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download again
                            </Button>
                          </motion.div>

                          {/* Premium Conversion Module */}
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
                            className="mt-6 pt-5 border-t border-border/15"
                          >
                            {/* USP Strip */}
                            <div className="flex items-center justify-center gap-4 mb-5">
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                                <Zap className="w-3 h-3 text-primary/70" />
                                <span>Faster transfers</span>
                              </div>
                              <div className="w-px h-3 bg-border/30" />
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                                <ShieldCheck className="w-3 h-3 text-primary/70" />
                                <span>Enterprise security</span>
                              </div>
                              <div className="w-px h-3 bg-border/30" />
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                                <BarChart3 className="w-3 h-3 text-primary/70" />
                                <span>Full control</span>
                              </div>
                            </div>

                            {/* Premium CTA with glow */}
                            <motion.div 
                              className="relative group"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              {/* Ambient pulse glow */}
                              <motion.div
                                className="absolute -inset-1 rounded-xl bg-primary/20 blur-lg opacity-60"
                                animate={{ 
                                  opacity: [0.4, 0.7, 0.4],
                                  scale: [0.98, 1.02, 0.98]
                                }}
                                transition={{ 
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                              {/* Hover bloom layer */}
                              <motion.div
                                className="absolute -inset-2 rounded-xl bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              />
                              
                              <Button 
                                className="relative w-full h-11 text-sm font-medium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 overflow-hidden"
                                onClick={() => window.open('/', '_blank')}
                              >
                                {/* Subtle shimmer on hover */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                                />
                                <span className="relative z-10">Send files the Docsora way</span>
                              </Button>
                            </motion.div>

                            <p className="text-[10px] text-center text-muted-foreground/40 mt-3">
                              Built for professionals who value speed and security
                            </p>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security badge below card - only show when not complete and unlocked */}
          {downloadState !== "complete" && viewState === "unlocked" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground/50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Files encrypted in transit</span>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground/30">
            © Docsora
          </p>
        </div>
      </footer>

      {/* Contents Modal */}
      <Dialog open={showContentsModal} onOpenChange={setShowContentsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transfer contents</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-1">
              {mockTransfer.files.map((file) => {
                const category = getFileCategory(file.type);
                const Icon = categoryIcons[category] || File;
                const colorClass = categoryColors[category] || "text-muted-foreground";
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
