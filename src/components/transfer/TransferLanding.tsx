import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Upload, FolderUp, Shield, Lock, Globe, ChevronDown, Check, X, Plus, FileText, ArrowRight, Link2, Mail, Calendar, ArrowLeft, Copy, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TransferSuccess } from "./TransferSuccess";
import { TransferFile, TransferSettings as TransferSettingsType } from "@/pages/Transfer";
import TrustFooter from "@/components/shared/TrustFooter";

interface QueuedFile {
  id: string;
  name: string;
  size: number;
  file: File;
  progress?: number;
  status?: 'waiting' | 'uploading' | 'completed';
}

interface TransferSettings {
  password: string;
  expiryDays: number;
  downloadLimit: number | null;
  viewOnly: boolean;
  recipients: string[];
  subject: string;
  message: string;
  senderEmail?: string;
}

type CardStep = 'upload' | 'queued' | 'delivery' | 'settings' | 'verify' | 'uploading' | 'success';

// Mask email for privacy display
const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}***@${domain}`;
};

// Apple-style easing - typed as tuple for framer-motion
const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export function TransferLanding() {
  const [isDragging, setIsDragging] = useState(false);
  const [showFormats, setShowFormats] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [currentStep, setCurrentStep] = useState<CardStep>('upload');
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<'link' | 'email' | null>(null);
  const [settings, setSettings] = useState<TransferSettings>({
    password: '',
    expiryDays: 7,
    downloadLimit: null,
    viewOnly: false,
    recipients: [],
    subject: '',
    message: '',
    senderEmail: '',
  });
  const [emailInput, setEmailInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transferLink, setTransferLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP Verification state
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Derived states
  const hasQueuedFiles = queuedFiles.length > 0;
  const showUploadingState = currentStep === 'uploading';
  const isComplete = currentStep === 'success';

  // Mouse tracking for card tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [3, -3]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-3, 3]), { stiffness: 300, damping: 30 });

  // Disable tilt during upload or success steps (allow on delivery and settings)
  useEffect(() => {
    if (currentStep !== 'upload' && currentStep !== 'queued' && currentStep !== 'delivery' && currentStep !== 'settings') {
      mouseX.set(0);
      mouseY.set(0);
    }
  }, [currentStep, mouseX, mouseY]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || (currentStep !== 'upload' && currentStep !== 'queued' && currentStep !== 'delivery' && currentStep !== 'settings')) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  }, [mouseX, mouseY, currentStep]);

  const handleMouseEnter = useCallback(() => {
    if (currentStep === 'upload' || currentStep === 'queued' || currentStep === 'delivery' || currentStep === 'settings') setIsHovering(true);
  }, [currentStep]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (currentStep === 'upload' || currentStep === 'queued') setIsDragging(true);
  }, [currentStep]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Add files to queue (don't upload)
  const addFilesToQueue = useCallback((files: File[]) => {
    const newQueuedFiles: QueuedFile[] = files.map(file => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      file,
      progress: 0,
      status: 'waiting' as const,
    }));
    setQueuedFiles(prev => [...prev, ...newQueuedFiles]);
    setCurrentStep('queued');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (currentStep !== 'upload' && currentStep !== 'queued') return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFilesToQueue(droppedFiles);
    }
  }, [currentStep, addFilesToQueue]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentStep !== 'upload' && currentStep !== 'queued') return;
    
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length > 0) {
      addFilesToQueue(selectedFiles);
    }
    e.target.value = '';
  }, [currentStep, addFilesToQueue]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setQueuedFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      if (newFiles.length === 0) {
        setCurrentStep('upload');
      }
      return newFiles;
    });
  }, []);

  // Navigate to delivery selection
  const handleContinueToDelivery = useCallback(() => {
    if (queuedFiles.length === 0) return;
    setCurrentStep('delivery');
  }, [queuedFiles]);

  // Navigate to settings
  const handleContinueToSettings = useCallback(() => {
    if (!selectedDeliveryMethod) return;
    setCurrentStep('settings');
  }, [selectedDeliveryMethod]);

  // Go back to delivery selection
  const handleBackToDelivery = useCallback(() => {
    setCurrentStep('delivery');
  }, []);

  // Email recipient management
  const handleAddEmail = useCallback(() => {
    const email = emailInput.trim();
    if (email && !settings.recipients.includes(email)) {
      setSettings(prev => ({ ...prev, recipients: [...prev.recipients, email] }));
      setEmailInput('');
    }
  }, [emailInput, settings.recipients]);

  const handleRemoveEmail = useCallback((email: string) => {
    setSettings(prev => ({ ...prev, recipients: prev.recipients.filter(e => e !== email) }));
  }, []);

  const handleEmailKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddEmail();
    }
  }, [handleAddEmail]);

  // Track processing phase (after upload completes)
  const [isProcessing, setIsProcessing] = useState(false);

  // OTP verification handlers
  const handleSendVerification = useCallback(() => {
    if (selectedDeliveryMethod === 'email') {
      // Go to verification step
      setCurrentStep('verify');
      setOtpCode(['', '', '', '', '']);
      setOtpError('');
      setOtpAttempts(0);
      setResendCooldown(30);
      // Focus first input after transition
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } else {
      // For link delivery, skip verification
      handleStartActualUpload();
    }
  }, [selectedDeliveryMethod]);

  // Resend cooldown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendCode = useCallback(() => {
    if (resendCooldown > 0) return;
    setOtpCode(['', '', '', '', '']);
    setOtpError('');
    setResendCooldown(30);
    otpInputRefs.current[0]?.focus();
  }, [resendCooldown]);

  const handleOtpChange = useCallback((index: number, value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, '').slice(-1);
    
    setOtpCode(prev => {
      const newCode = [...prev];
      newCode[index] = numericValue;
      return newCode;
    });
    
    setOtpError('');
    
    // Auto-advance to next input
    if (numericValue && index < 4) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  }, [otpCode]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    if (pastedData.length > 0) {
      const newCode = [...otpCode];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setOtpCode(newCode);
      // Focus the next empty input or the last one
      const nextEmptyIndex = newCode.findIndex(c => !c);
      otpInputRefs.current[nextEmptyIndex === -1 ? 4 : nextEmptyIndex]?.focus();
    }
  }, [otpCode]);

  const handleVerifyAndContinue = useCallback(() => {
    const code = otpCode.join('');
    if (code.length !== 5) return;
    
    setIsVerifying(true);
    
    // Simulate verification (in real app, this would be an API call)
    setTimeout(() => {
      // For demo: accept any 5-digit code, or show error for "00000"
      if (code === '00000') {
        setOtpAttempts(prev => prev + 1);
        if (otpAttempts >= 2) {
          setOtpError('Too many attempts. Please resend the code.');
          setOtpCode(['', '', '', '', '']);
        } else {
          setOtpError("That code doesn't look right. Try again.");
        }
        setIsVerifying(false);
      } else {
        // Verification successful - proceed to upload
        setIsVerifying(false);
        handleStartActualUpload();
      }
    }, 1200);
  }, [otpCode, otpAttempts]);

  const handleChangeEmail = useCallback(() => {
    setCurrentStep('settings');
    setOtpCode(['', '', '', '', '']);
    setOtpError('');
  }, []);

  // Start the actual upload (called after verification or for link delivery)
  const handleStartActualUpload = useCallback(() => {
    setCurrentStep('uploading');
    setUploadProgress(0);
    setIsProcessing(false);

    const totalSize = queuedFiles.reduce((acc, f) => acc + f.size, 0);
    const baseDuration = Math.min(Math.max(totalSize / (50 * 1024 * 1024) * 2000, 2000), 4000);
    let elapsed = 0;
    const progressInterval = 50;

    progressIntervalRef.current = setInterval(() => {
      elapsed += progressInterval;
      const normalizedTime = Math.min(elapsed / baseDuration, 1);
      const easedProgress = 1 - Math.pow(1 - normalizedTime, 3);
      const currentProgress = Math.min(easedProgress * 100, 80); // Cap at 80% during upload phase

      setUploadProgress(currentProgress);

      // Update individual file progress
      setQueuedFiles(prev => prev.map((f, i) => {
        const fileProgress = Math.min((currentProgress + (i * 5)) * 1.25, 100);
        return { 
          ...f, 
          progress: fileProgress,
          status: fileProgress >= 100 ? 'completed' : 'uploading'
        };
      }));

      if (elapsed >= baseDuration) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        
        // Transition to processing phase
        setIsProcessing(true);
        setQueuedFiles(prev => prev.map(f => ({ ...f, progress: 100, status: 'completed' as const })));
        
        // Animate progress from 80 to 100 during processing
        let processingElapsed = 0;
        const processingDuration = 1500;
        const processingInterval = setInterval(() => {
          processingElapsed += 50;
          const processingProgress = 80 + (processingElapsed / processingDuration) * 20;
          setUploadProgress(Math.min(processingProgress, 100));
          
          if (processingElapsed >= processingDuration) {
            clearInterval(processingInterval);
            setUploadProgress(100);
            
            // Phase 1: Hold at 100% for 400ms (ring complete, no checkmark yet)
            setTimeout(() => {
              // Phase 2: Show green checkmark
              setUploadComplete(true);
              
              // Phase 3: Hold checkmark visible for 800ms, then transition
              setTimeout(() => {
                setTransferLink('https://docsora.com/d/' + Math.random().toString(36).substring(2, 12));
                setCurrentStep('success');
              }, 800);
            }, 400);
          }
        }, 50);
      }
    }, progressInterval);
  }, [queuedFiles]);

  // Copy link to clipboard
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(transferLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [transferLink]);

  // Start over
  const handleStartOver = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setQueuedFiles([]);
    setCurrentStep('upload');
    setSelectedDeliveryMethod(null);
    setSettings({
      password: '',
      expiryDays: 7,
      downloadLimit: null,
      viewOnly: false,
      recipients: [],
      subject: '',
      message: '',
      senderEmail: '',
    });
    setEmailInput('');
    setUploadProgress(0);
    setTransferLink('');
    setCopied(false);
    setIsProcessing(false);
    setUploadComplete(false);
  }, []);

  const supportedFormats = ['ZIP', 'RAR', '7Z', 'PDF', 'DOC', 'XLS', 'PPT', 'MP4', 'MOV', 'JPG', 'PNG', 'PSD', 'AI'];

  // Circular progress ring dimensions
  const circleRadius = 52;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (uploadProgress / 100) * circumference;

  const totalSize = queuedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className={`relative h-full flex flex-col items-center justify-center overflow-hidden px-4 ${currentStep === 'success' ? 'bg-background' : ''}`}>
      {/* Cinematic Background - Hidden on success */}
      {currentStep !== 'success' && <div className="absolute inset-0 bg-background" />}
      
      {/* Ambient Gradient Orbs - Hidden on success */}
      {currentStep !== 'success' && <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      </div>}

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
                  background: 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, hsl(var(--primary) / 0.08) 40%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
              />
            ))}
            
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              animate={{
                width: [300, 400, 300],
                height: [300, 400, 300],
                opacity: [0.25, 0.4, 0.25],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
                filter: 'blur(50px)',
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Subtle vignette - Hidden on success */}
      {currentStep !== 'success' && (
        <motion.div 
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background))_100%)]"
          animate={{ opacity: showUploadingState ? 0.7 : 0.5 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Main Content Container - Hidden on success */}
      {currentStep !== 'success' && (
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto">
        
        {/* Hero Upload Card */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: 1,
          }}
          transition={{ 
            duration: 0.9, 
            delay: 0.1, 
            ease: appleEasing 
          }}
          style={{ 
            rotateX: showUploadingState || isComplete ? 0 : rotateX, 
            rotateY: showUploadingState || isComplete ? 0 : rotateY, 
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
              
              <AnimatePresence mode="wait">
                {/* STEP 1: Upload State */}
                {currentStep === 'upload' && (
                  <motion.div
                    key="upload-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: appleEasing }}
                    className="w-full flex flex-col items-center"
                  >
                    {/* Icon */}
                    <motion.div
                      className="relative mb-10"
                      animate={{ 
                        y: isDragging ? -12 : 0,
                        scale: isDragging ? 1.1 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      {/* Glow */}
                      <motion.div
                        className="absolute -inset-4 rounded-2xl blur-2xl"
                        animate={{
                          backgroundColor: isDragging
                            ? 'hsl(var(--primary) / 0.3)'
                            : 'hsl(var(--primary) / 0.1)',
                        }}
                        transition={{ duration: 0.5 }}
                      />
                      
                      {/* Icon Square */}
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

                    {/* Title & Subtitle */}
                    <motion.h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3 text-center">
                      Send anything
                    </motion.h2>
                    <motion.p className="text-base text-muted-foreground mb-10 text-center max-w-sm">
                      Files of any size, delivered securely
                    </motion.p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
                        <motion.div className="absolute inset-0 bg-primary rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/30" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/12 to-transparent rounded-xl" />
                        <span className="relative flex items-center gap-2 text-primary-foreground font-medium">
                          <Upload className="w-4 h-4" />
                          Choose Files
                        </span>
                      </motion.button>

                      <motion.button
                        onClick={() => folderInputRef.current?.click()}
                        className="group relative h-12 px-7 rounded-xl font-medium text-sm overflow-hidden"
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div 
                          className="absolute -inset-2 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background: 'radial-gradient(ellipse at center, hsl(var(--foreground) / 0.08) 0%, transparent 70%)',
                            filter: 'blur(10px)',
                          }}
                        />
                        <motion.div className="absolute inset-0 bg-secondary rounded-xl border border-border/60 transition-all duration-300 group-hover:bg-secondary/90 group-hover:border-border/80 group-hover:shadow-md" />
                        <span className="relative flex items-center gap-2 text-foreground/75 group-hover:text-foreground transition-colors duration-200">
                          <FolderUp className="w-4 h-4" />
                          Upload Folder
                        </span>
                      </motion.button>
                    </div>

                    <p className="mt-5 text-xs text-muted-foreground/40">
                      Drag & drop supported
                    </p>

                    {/* Supported Formats */}
                    <div className="mt-8 w-full">
                      <button
                        onClick={() => setShowFormats(!showFormats)}
                        className="flex items-center gap-1.5 mx-auto text-xs text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors duration-200"
                      >
                        <span>All file types supported</span>
                        <motion.div
                          animate={{ rotate: showFormats ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {showFormats && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: appleEasing }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap justify-center gap-1.5 mt-4 max-w-md mx-auto">
                              {supportedFormats.map((format, i) => (
                                <motion.span
                                  key={format}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.02 }}
                                  className="px-2 py-0.5 text-[10px] font-medium text-muted-foreground/60 bg-secondary/40 rounded-md border border-border/30"
                                >
                                  {format}
                                </motion.span>
                              ))}
                              <span className="px-2 py-0.5 text-[10px] font-medium text-muted-foreground/40">+more</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Queued Files (Ready to send) */}
                {currentStep === 'queued' && (
                  <motion.div
                    key="queued-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: appleEasing }}
                    className="w-full flex flex-col items-center"
                  >
                    {/* Hero Icon with Glow */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, ease: appleEasing }}
                      className="relative mb-6"
                    >
                      {/* Outer glow ring */}
                      <motion.div
                        className="absolute inset-[-20px] rounded-full"
                        animate={{
                          opacity: [0.15, 0.25, 0.15],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
                        }}
                      />
                      {/* Middle glow ring */}
                      <motion.div
                        className="absolute inset-[-10px] rounded-full"
                        animate={{
                          opacity: [0.2, 0.35, 0.2],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.3,
                        }}
                        style={{
                          background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
                        }}
                      />
                      {/* Icon container */}
                      <div className="relative w-16 h-16 rounded-2xl bg-secondary/80 border border-border/50 flex items-center justify-center">
                        <Upload className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                    </motion.div>

                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-2 text-center">
                      Ready to send
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6 text-center">
                      {queuedFiles.length} {queuedFiles.length === 1 ? 'file' : 'files'} selected · {formatFileSize(totalSize)}
                    </p>

                    {/* File List */}
                    <div className="w-full space-y-2 mb-6 max-h-48 overflow-y-auto pr-2">
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

                    <p className="text-center text-xs text-muted-foreground/60 mb-4">
                      Drag & drop to add more
                    </p>

                    {/* Action Buttons */}
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
                        onClick={handleContinueToDelivery}
                        className="gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Delivery Method Selection */}
                {currentStep === 'delivery' && (
                  <motion.div
                    key="delivery-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: appleEasing }}
                    className="w-full flex flex-col items-center justify-center"
                  >
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-2 text-center">
                      Choose delivery method
                    </h2>
                    <p className="text-sm text-muted-foreground mb-10 text-center">
                      Select how this file will be delivered.
                    </p>

                    {/* Delivery Method Cards */}
                    <div className="grid grid-cols-2 gap-5 w-full mb-10">
                      {/* Generate Link Card */}
                      <motion.button
                        onClick={() => setSelectedDeliveryMethod('link')}
                        className="relative group text-left"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.25, ease: appleEasing }}
                      >
                        {/* Outer glow when selected */}
                        <AnimatePresence>
                          {selectedDeliveryMethod === 'link' && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute -inset-2 rounded-3xl pointer-events-none"
                              style={{
                                background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
                                filter: 'blur(16px)',
                              }}
                            />
                          )}
                        </AnimatePresence>

                        {/* Card container */}
                        <motion.div
                          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                            selectedDeliveryMethod === 'link'
                              ? 'border-primary bg-primary/[0.08]'
                              : 'border-border/40 bg-secondary/20 hover:border-border/60 hover:bg-secondary/40'
                          }`}
                          animate={{
                            boxShadow: selectedDeliveryMethod === 'link'
                              ? '0 20px 40px -12px hsl(var(--primary) / 0.25), 0 8px 16px -6px hsl(var(--foreground) / 0.08), inset 0 1px 0 0 hsl(var(--primary) / 0.15)'
                              : '0 4px 12px -4px hsl(var(--foreground) / 0.06), inset 0 1px 0 0 hsl(0 0% 100% / 0.05)',
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Inner glow effect when selected */}
                          <AnimatePresence>
                            {selectedDeliveryMethod === 'link' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.12) 0%, transparent 60%)',
                                }}
                              />
                            )}
                          </AnimatePresence>

                          {/* Checkmark in top-right */}
                          <AnimatePresence>
                            {selectedDeliveryMethod === 'link' && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.2, ease: appleEasing }}
                                className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
                              >
                                <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Icon */}
                          <motion.div 
                            className={`relative w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${
                              selectedDeliveryMethod === 'link' 
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                                : 'bg-secondary/80 text-muted-foreground group-hover:bg-secondary group-hover:text-foreground/70'
                            }`}
                            animate={{
                              scale: selectedDeliveryMethod === 'link' ? 1 : 1,
                            }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link2 className="w-6 h-6" strokeWidth={1.75} />
                          </motion.div>
                          
                          <h3 className={`text-lg font-semibold mb-1.5 transition-colors duration-200 ${
                            selectedDeliveryMethod === 'link' ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'
                          }`}>
                            Generate link
                          </h3>
                          <p className={`text-sm transition-colors duration-200 ${
                            selectedDeliveryMethod === 'link' ? 'text-muted-foreground' : 'text-muted-foreground/70 group-hover:text-muted-foreground'
                          }`}>
                            Share anywhere
                          </p>
                        </motion.div>
                      </motion.button>

                      {/* Send via Email Card */}
                      <motion.button
                        onClick={() => setSelectedDeliveryMethod('email')}
                        className="relative group text-left"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.25, ease: appleEasing }}
                      >
                        {/* Outer glow when selected */}
                        <AnimatePresence>
                          {selectedDeliveryMethod === 'email' && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute -inset-2 rounded-3xl pointer-events-none"
                              style={{
                                background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
                                filter: 'blur(16px)',
                              }}
                            />
                          )}
                        </AnimatePresence>

                        {/* Card container */}
                        <motion.div
                          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                            selectedDeliveryMethod === 'email'
                              ? 'border-primary bg-primary/[0.08]'
                              : 'border-border/40 bg-secondary/20 hover:border-border/60 hover:bg-secondary/40'
                          }`}
                          animate={{
                            boxShadow: selectedDeliveryMethod === 'email'
                              ? '0 20px 40px -12px hsl(var(--primary) / 0.25), 0 8px 16px -6px hsl(var(--foreground) / 0.08), inset 0 1px 0 0 hsl(var(--primary) / 0.15)'
                              : '0 4px 12px -4px hsl(var(--foreground) / 0.06), inset 0 1px 0 0 hsl(0 0% 100% / 0.05)',
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Inner glow effect when selected */}
                          <AnimatePresence>
                            {selectedDeliveryMethod === 'email' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.12) 0%, transparent 60%)',
                                }}
                              />
                            )}
                          </AnimatePresence>

                          {/* Checkmark in top-right */}
                          <AnimatePresence>
                            {selectedDeliveryMethod === 'email' && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.2, ease: appleEasing }}
                                className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
                              >
                                <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Icon */}
                          <motion.div 
                            className={`relative w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${
                              selectedDeliveryMethod === 'email' 
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                                : 'bg-secondary/80 text-muted-foreground group-hover:bg-secondary group-hover:text-foreground/70'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Mail className="w-6 h-6" strokeWidth={1.75} />
                          </motion.div>
                          
                          <h3 className={`text-lg font-semibold mb-1.5 transition-colors duration-200 ${
                            selectedDeliveryMethod === 'email' ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'
                          }`}>
                            Send via email
                          </h3>
                          <p className={`text-sm transition-colors duration-200 ${
                            selectedDeliveryMethod === 'email' ? 'text-muted-foreground' : 'text-muted-foreground/70 group-hover:text-muted-foreground'
                          }`}>
                            Deliver directly to recipients
                          </p>
                        </motion.div>
                      </motion.button>
                    </div>

                    {/* Continue Button */}
                    <motion.div 
                      className="flex justify-center"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: selectedDeliveryMethod ? 1 : 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.button
                        onClick={handleContinueToSettings}
                        disabled={!selectedDeliveryMethod}
                        className={`relative h-12 px-8 rounded-xl font-medium text-sm overflow-hidden transition-all duration-300 ${
                          selectedDeliveryMethod 
                            ? 'cursor-pointer' 
                            : 'cursor-not-allowed opacity-50'
                        }`}
                        whileHover={selectedDeliveryMethod ? { y: -2, scale: 1.02 } : {}}
                        whileTap={selectedDeliveryMethod ? { scale: 0.98 } : {}}
                      >
                        {/* Button glow */}
                        {selectedDeliveryMethod && (
                          <motion.div 
                            className="absolute -inset-2 rounded-2xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
                              filter: 'blur(12px)',
                            }}
                          />
                        )}
                        <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                          selectedDeliveryMethod 
                            ? 'bg-primary shadow-lg shadow-primary/30' 
                            : 'bg-muted'
                        }`} />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/12 to-transparent rounded-xl" />
                        <span className={`relative flex items-center gap-2 font-medium ${
                          selectedDeliveryMethod ? 'text-primary-foreground' : 'text-muted-foreground'
                        }`}>
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}

                {/* STEP 4: Settings */}
                {currentStep === 'settings' && (
                  <motion.div
                    key="settings-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: appleEasing }}
                    className="w-full flex flex-col max-h-[calc(100vh-12rem)]"
                  >
                    {/* Fixed Header */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={handleBackToDelivery}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </button>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span>{queuedFiles.length} {queuedFiles.length === 1 ? 'file' : 'files'} · {formatFileSize(totalSize)}</span>
                          <Lock className="w-3 h-3" />
                        </div>
                      </div>

                      <h2 className="text-lg font-semibold text-foreground tracking-tight mb-3 text-center">
                        {selectedDeliveryMethod === 'link' ? 'Link settings' : 'Send via email'}
                      </h2>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto min-h-0 space-y-2.5 pr-1 -mr-1">
                      {/* Email-specific fields */}
                      {selectedDeliveryMethod === 'email' && (
                        <>
                          {/* Your email (sender) */}
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                              Your email <span className="text-destructive">*</span>
                            </label>
                            <Input
                              value={settings.senderEmail || ''}
                              onChange={(e) => setSettings(prev => ({ ...prev, senderEmail: e.target.value }))}
                              placeholder="your@email.com"
                              type="email"
                              className="bg-secondary/50 border-border/50 h-9"
                            />
                          </div>

                          {/* Recipients */}
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                              Recipients <span className="text-destructive">*</span>
                            </label>
                            <AnimatePresence>
                              {settings.recipients.length > 0 && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="flex flex-wrap gap-1.5 mb-1.5"
                                >
                                  {settings.recipients.map((email) => (
                                    <motion.span
                                      key={email}
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0.8, opacity: 0 }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium"
                                    >
                                      {email}
                                      <button
                                        onClick={() => handleRemoveEmail(email)}
                                        className="text-primary/70 hover:text-destructive transition-colors"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </motion.span>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <Input
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              onKeyDown={handleEmailKeyDown}
                              onBlur={handleAddEmail}
                              placeholder="name@example.com"
                              type="email"
                              className="bg-secondary/50 border-border/50 h-9"
                            />
                            <p className="text-[10px] text-muted-foreground mt-0.5">Press Enter to add</p>
                          </div>

                          {/* Subject */}
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Subject <span className="text-destructive">*</span></label>
                            <Input
                              value={settings.subject}
                              onChange={(e) => setSettings(prev => ({ ...prev, subject: e.target.value }))}
                              placeholder="File transfer"
                              type="text"
                              className="bg-secondary/50 border-border/50 h-9"
                            />
                          </div>

                          {/* Message - Compact textarea */}
                          <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1 block">Message (optional)</label>
                            <Textarea
                              value={settings.message}
                              onChange={(e) => setSettings(prev => ({ ...prev, message: e.target.value.slice(0, 500) }))}
                              placeholder="Add a note for the recipient"
                              rows={2}
                              className="bg-secondary/50 border-border/50 resize-none min-h-[56px] focus:ring-1 focus:ring-primary/30 transition-shadow"
                            />
                          </div>

                          {/* Link Expiry - Inline compact */}
                          <div className="flex items-center justify-between py-1">
                            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-primary" />
                              Link expires
                            </label>
                            <select
                              value={settings.expiryDays}
                              onChange={(e) => setSettings(prev => ({ ...prev, expiryDays: parseInt(e.target.value) }))}
                              className="bg-secondary/50 border border-border/50 rounded-lg px-2.5 py-1.5 text-sm text-foreground"
                            >
                              <option value={1}>1 day</option>
                              <option value={3}>3 days</option>
                              <option value={7}>7 days</option>
                              <option value={14}>14 days</option>
                              <option value={30}>30 days</option>
                            </select>
                          </div>
                        </>
                      )}

                      {/* Collapsible Security Section - Password only */}
                      <details className="group">
                        <summary className="flex items-center gap-2 cursor-pointer py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors list-none [&::-webkit-details-marker]:hidden">
                          <Shield className="w-4 h-4 text-primary" />
                          <span>Security</span>
                          <span className="text-xs text-muted-foreground font-normal ml-1">
                            {settings.password ? '· Password protected' : '· No password'}
                          </span>
                          <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180" />
                        </summary>
                        
                        <div className="pt-1.5 space-y-1.5">
                          {/* Password protection */}
                          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/30">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-primary" />
                              <span className="text-sm text-foreground">Password protection</span>
                            </div>
                            <Switch
                              checked={settings.password.length > 0}
                              onCheckedChange={(checked) => {
                                if (!checked) setShowPassword(false);
                                setSettings(prev => ({ ...prev, password: checked ? 'enabled' : '' }));
                              }}
                            />
                          </div>

                          {settings.password && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  value={settings.password === 'enabled' ? '' : settings.password}
                                  onChange={(e) => setSettings(prev => ({ ...prev, password: e.target.value }))}
                                  placeholder="Enter password"
                                  className="bg-secondary/50 border-border/50 h-9 pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </details>
                    </div>

                    {/* Sticky Footer - Always visible */}
                    <div className="flex-shrink-0 pt-3 mt-2 border-t border-border/20 bg-gradient-to-t from-card via-card to-transparent">
                      <motion.button
                        onClick={handleSendVerification}
                        disabled={selectedDeliveryMethod === 'email' && (
                          settings.recipients.length === 0 || 
                          settings.subject.trim().length === 0 ||
                          !settings.senderEmail?.trim()
                        )}
                        whileHover={!(selectedDeliveryMethod === 'email' && (settings.recipients.length === 0 || settings.subject.trim().length === 0 || !settings.senderEmail?.trim())) ? { scale: 1.02 } : {}}
                        whileTap={!(selectedDeliveryMethod === 'email' && (settings.recipients.length === 0 || settings.subject.trim().length === 0 || !settings.senderEmail?.trim())) ? { scale: 0.98 } : {}}
                        className={`w-full relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-b from-primary via-primary to-primary/85 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)] transition-all duration-300 overflow-hidden group ${
                          selectedDeliveryMethod === 'email' && (settings.recipients.length === 0 || settings.subject.trim().length === 0 || !settings.senderEmail?.trim())
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.6)]'
                        }`}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                        />
                        <ArrowRight className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">
                          {selectedDeliveryMethod === 'link' ? 'Generate link' : 'Send transfer'}
                        </span>
                      </motion.button>

                      <p className="text-[11px] text-muted-foreground/60 text-center mt-2 pb-1 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        Encrypted · Expires in {settings.expiryDays} {settings.expiryDays === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4.5: Email Verification */}
                {currentStep === 'verify' && (
                  <motion.div
                    key="verify-step"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: appleEasing }}
                    className="w-full flex flex-col items-center text-center"
                  >
                    {/* Verification Icon */}
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <Mail className="w-8 h-8 text-primary" />
                    </motion.div>

                    <h2 className="text-xl font-semibold text-foreground tracking-tight mb-2">
                      Verify your email
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Enter the 5-digit code sent to{' '}
                      <span className="text-foreground/70 font-medium">
                        {maskEmail(settings.senderEmail || '')}
                      </span>
                    </p>

                    {/* OTP Input */}
                    <div className="flex gap-2.5 mb-4" onPaste={handleOtpPaste}>
                      {otpCode.map((digit, index) => (
                        <motion.input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className={`w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all duration-200 bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                            otpError 
                              ? 'border-destructive/50 text-destructive' 
                              : digit 
                                ? 'border-primary/50 text-foreground' 
                                : 'border-border/50 text-foreground'
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + index * 0.05 }}
                        />
                      ))}
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {otpError && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-destructive mb-3"
                        >
                          {otpError}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Helper Text */}
                    <p className="text-xs text-muted-foreground/70 mb-5">
                      {"Can't find the email? Check your junk or spam folder."}
                    </p>

                    {/* Resend Code */}
                    <button
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0}
                      className={`text-sm font-medium transition-colors mb-6 ${
                        resendCooldown > 0 
                          ? 'text-muted-foreground/50 cursor-not-allowed' 
                          : 'text-primary hover:text-primary/80'
                      }`}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>

                    {/* Verify Button */}
                    <motion.button
                      onClick={handleVerifyAndContinue}
                      disabled={otpCode.some(d => !d) || isVerifying}
                      whileHover={!otpCode.some(d => !d) && !isVerifying ? { scale: 1.02 } : {}}
                      whileTap={!otpCode.some(d => !d) && !isVerifying ? { scale: 0.98 } : {}}
                      className={`w-full relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-b from-primary via-primary to-primary/85 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)] transition-all duration-300 overflow-hidden group ${
                        otpCode.some(d => !d) || isVerifying
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.6)]'
                      }`}
                    >
                      {isVerifying ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Verify & continue</span>
                        </>
                      )}
                    </motion.button>

                    {/* Change Email Link */}
                    <button
                      onClick={handleChangeEmail}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
                    >
                      Change email
                    </button>
                  </motion.div>
                )}

                {/* STEP 5: Uploading & Processing (Single continuous flow) */}
                {currentStep === 'uploading' && (
                  <motion.div
                    key="uploading-step"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: appleEasing }}
                    className="w-full flex flex-col items-center"
                  >
                    {/* Circular Progress Ring / Green Checkmark */}
                    <motion.div
                      className="relative flex items-center justify-center mb-10"
                      style={{ width: 140, height: 140 }}
                    >
                      {/* Outer glow - changes color when complete */}
                      <motion.div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        animate={{
                          opacity: uploadComplete ? 0.6 : uploadProgress >= 100 ? 0.5 : [0.2, 0.4, 0.2],
                          scale: uploadComplete ? 1.2 : uploadProgress >= 100 ? 1.1 : [1, 1.08, 1],
                        }}
                        transition={uploadComplete 
                          ? { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
                          : uploadProgress >= 100
                          ? { duration: 0.4 }
                          : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }
                        style={{
                          background: uploadComplete || uploadProgress >= 100
                            ? 'radial-gradient(circle, hsl(142 76% 36% / 0.4) 0%, transparent 70%)'
                            : 'radial-gradient(circle, hsl(var(--primary) / 0.35) 0%, transparent 70%)',
                          filter: 'blur(20px)',
                        }}
                      />

                      <AnimatePresence mode="wait">
                        {uploadComplete ? (
                          // Green checkmark when complete - smooth morph from ring
                          <motion.div
                            key="checkmark"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                              duration: 0.5, 
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            className="relative flex items-center justify-center"
                            style={{ width: 140, height: 140 }}
                          >
                            {/* Checkmark circle background */}
                            <motion.div
                              className="absolute w-24 h-24 rounded-full"
                              initial={{ scale: 0.6, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                              style={{
                                background: 'linear-gradient(135deg, hsl(142 76% 42%) 0%, hsl(142 76% 36%) 100%)',
                                boxShadow: '0 8px 32px -8px hsl(142 76% 36% / 0.5)',
                              }}
                            />
                            
                            {/* Checkmark SVG */}
                            <motion.svg 
                              className="relative z-10 w-10 h-10 text-white" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              stroke="currentColor" 
                              strokeWidth={3}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <motion.path
                                d="M5 13l4 4L19 7"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ 
                                  pathLength: { delay: 0.2, duration: 0.4, ease: "easeOut" },
                                  opacity: { delay: 0.2, duration: 0.1 }
                                }}
                              />
                            </motion.svg>
                          </motion.div>
                        ) : uploadProgress >= 100 ? (
                          // Progress ring at 100% - holding before checkmark
                          <motion.div 
                            key="progress-complete" 
                            exit={{ scale: 0.9, opacity: 0 }} 
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                          >
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
                              {/* Complete progress arc */}
                              <motion.circle
                                cx="70"
                                cy="70"
                                r={circleRadius}
                                fill="none"
                                stroke="hsl(142 76% 36%)"
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: strokeDashoffset }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                style={{
                                  filter: 'drop-shadow(0 0 8px hsl(142 76% 36% / 0.5))',
                                }}
                              />
                            </svg>

                            {/* Center content - 100% */}
                            <motion.div
                              className="relative z-10 flex flex-col items-center justify-center"
                              style={{ width: 140, height: 140 }}
                            >
                              <motion.span 
                                className="text-3xl font-semibold tabular-nums tracking-tight"
                                initial={{ color: 'hsl(var(--foreground))' }}
                                animate={{ color: 'hsl(142 76% 36%)' }}
                                transition={{ duration: 0.3 }}
                                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                              >
                                100%
                              </motion.span>
                            </motion.div>
                          </motion.div>
                        ) : (
                          // Progress ring during upload
                          <motion.div 
                            key="progress" 
                            exit={{ opacity: 0 }} 
                            transition={{ duration: 0.2 }}
                          >
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
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                style={{
                                  filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.4))',
                                }}
                              />
                            </svg>

                            {/* Center percentage */}
                            <motion.div
                              className="relative z-10 flex flex-col items-center justify-center"
                              style={{ width: 140, height: 140 }}
                            >
                              <span 
                                className="text-3xl font-semibold text-foreground tabular-nums tracking-tight"
                                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                              >
                                {Math.round(uploadProgress)}%
                              </span>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Title & Subtitle - Crossfades between phases */}
                    <AnimatePresence mode="wait">
                      {uploadComplete ? (
                        <motion.div
                          key="complete-text"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: appleEasing }}
                          className="flex flex-col items-center text-center"
                        >
                          <motion.h2 
                            className="text-[1.65rem] md:text-[2rem] font-semibold text-foreground mb-3 tracking-[-0.02em]"
                            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                          >
                            Upload complete
                          </motion.h2>
                        </motion.div>
                      ) : isProcessing ? (
                        <motion.div
                          key="processing-text"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, ease: appleEasing }}
                          className="flex flex-col items-center text-center"
                        >
                          <motion.h2 
                            className="text-[1.65rem] md:text-[2rem] font-semibold text-foreground mb-3 tracking-[-0.02em]"
                            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                          >
                            Preparing document
                          </motion.h2>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="flex items-center gap-2 text-muted-foreground/60 text-sm"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-primary rounded-full"
                            />
                            <span>Optimising and securing your file</span>
                          </motion.div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="uploading-text"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, ease: appleEasing }}
                          className="flex flex-col items-center text-center"
                        >
                          <motion.h2 
                            className="text-[1.65rem] md:text-[2rem] font-semibold text-foreground mb-3 tracking-[-0.02em]"
                            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                          >
                            Uploading securely
                          </motion.h2>
                          <p className="text-sm text-muted-foreground/60">
                            End-to-end encrypted transfer
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hidden inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={currentStep !== 'upload' && currentStep !== 'queued'}
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
                disabled={currentStep !== 'upload' && currentStep !== 'queued'}
              />
              <input
                ref={addMoreInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={currentStep !== 'upload' && currentStep !== 'queued'}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Trust Footer - Below the card */}
        <AnimatePresence>
          {(currentStep === 'upload' || currentStep === 'queued') && (
            <TrustFooter variant="transfer" />
          )}
        </AnimatePresence>
      </div>
    )}

    {/* FULL PAGE SUCCESS - TransferSuccess component */}
    {currentStep === 'success' && (
      <div className="relative z-20 w-full">
        <TransferSuccess
        files={queuedFiles.map(f => ({
          id: f.id,
          file: f.file,
          name: f.name,
          size: f.size,
          type: f.file.type,
          progress: f.progress || 100,
          status: 'completed' as const,
        }))}
        settings={{
          deliveryMethod: selectedDeliveryMethod || 'link',
          recipients: settings.recipients,
          subject: settings.subject,
          message: settings.message,
          password: settings.password,
          expiryDays: settings.expiryDays,
          downloadLimit: settings.downloadLimit,
          viewOnly: settings.viewOnly,
        }}
        transferLink={transferLink}
        transferId={Math.random().toString(36).substring(2, 10)}
        onStartOver={handleStartOver}
      />
      </div>
    )}
    </div>
  );
}
