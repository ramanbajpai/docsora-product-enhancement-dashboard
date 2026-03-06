import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Camera, X, Check, ZoomIn, Shield, 
  Eye, EyeOff, AlertTriangle, Key, Smartphone,
  Monitor, MapPin, LogOut, Users, Building2, CreditCard,
  FileText, Settings, ShieldCheck, Lock, Clock, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Central European (CET)" },
  { value: "Asia/Tokyo", label: "Japan (JST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文" },
];

// Role permissions data
const rolePermissions = [
  { icon: Users, label: "Can manage users", description: "Add, remove, and modify user access" },
  { icon: FileText, label: "Can access audit logs", description: "View all activity and compliance records" },
  { icon: CreditCard, label: "Can manage billing", description: "Update payment methods and view invoices" },
  { icon: Settings, label: "Can manage workspace settings", description: "Configure workspace preferences and integrations" },
];

// Mock session data
const mockSessions = [
  {
    id: "1",
    device: "MacBook Pro",
    deviceType: "desktop" as const,
    location: "San Francisco, CA",
    ip: "192.168.1.***",
    lastActive: "Current session",
    isCurrent: true,
  },
  {
    id: "2",
    device: "iPhone 15 Pro",
    deviceType: "mobile" as const,
    location: "San Francisco, CA",
    ip: "192.168.1.***",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
];

interface CropState {
  x: number;
  y: number;
  zoom: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState("Alex Chen");
  const [email] = useState("alex@company.com");
  const [timezone, setTimezone] = useState("America/New_York");
  const [language, setLanguage] = useState("en");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Email change modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Remove photo confirmation
  const [removePhotoDialogOpen, setRemovePhotoDialogOpen] = useState(false);
  
  // Role permissions modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  
  // Password change modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  
  // Phone number state
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [phoneVerificationStep, setPhoneVerificationStep] = useState<"input" | "verify">("input");
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isPhoneFor2FA, setIsPhoneFor2FA] = useState(false);
  
  // Sessions
  const [sessions] = useState(mockSessions);
  const [logoutAllDialogOpen, setLogoutAllDialogOpen] = useState(false);
  
  // Validation errors
  const [nameError, setNameError] = useState("");
  
  // Track original values to detect changes
  const [originalValues] = useState({
    fullName: "Alex Chen",
    timezone: "America/New_York",
    language: "en",
    avatar: null as string | null,
  });
  
  // Cropping state
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropState, setCropState] = useState<CropState>({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, cropX: 0, cropY: 0 });
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const hasChanges = 
    fullName !== originalValues.fullName ||
    timezone !== originalValues.timezone ||
    language !== originalValues.language ||
    avatar !== originalValues.avatar;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please select an image under 5MB",
        });
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Please select a JPG, PNG, GIF, or WebP image",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImage(reader.result as string);
        setCropState({ x: 0, y: 0, zoom: 1 });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropConfirm = useCallback(() => {
    if (!cropImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      const size = 200;
      canvas.width = size;
      canvas.height = size;
      
      const scale = cropState.zoom;
      const imgSize = Math.min(img.width, img.height);
      const srcSize = imgSize / scale;
      
      const centerX = img.width / 2;
      const centerY = img.height / 2;
      const srcX = centerX - srcSize / 2 - (cropState.x / 100) * srcSize;
      const srcY = centerY - srcSize / 2 - (cropState.y / 100) * srcSize;
      
      ctx.drawImage(
        img,
        srcX, srcY, srcSize, srcSize,
        0, 0, size, size
      );
      
      setAvatar(canvas.toDataURL('image/jpeg', 0.9));
      setCropImage(null);
      toast.success("Photo updated");
    };
    img.src = cropImage;
  }, [cropImage, cropState]);

  const handleCropCancel = useCallback(() => {
    setCropImage(null);
    setCropState({ x: 0, y: 0, zoom: 1 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      cropX: cropState.x,
      cropY: cropState.y,
    };
  }, [cropState]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    const sensitivity = 0.5 / cropState.zoom;
    const newX = dragStartRef.current.cropX + dx * sensitivity;
    const newY = dragStartRef.current.cropY + dy * sensitivity;
    
    const maxOffset = 30 * cropState.zoom;
    setCropState(prev => ({
      ...prev,
      x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, newY)),
    }));
  }, [isDragging, cropState.zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);
  
  const handleRemovePhoto = () => {
    setAvatar(null);
    setRemovePhotoDialogOpen(false);
    toast.success("Photo removed");
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    
    if (value.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
    } else if (value.length > 100) {
      setNameError("Name must be less than 100 characters");
    } else {
      setNameError("");
    }
  };
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleEmailChange = async () => {
    setEmailError("");
    setPasswordError("");
    
    let hasError = false;
    
    if (!currentPassword) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (currentPassword.length < 8) {
      setPasswordError("Invalid password");
      hasError = true;
    }
    
    if (!newEmail) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    } else if (newEmail === email) {
      setEmailError("New email must be different from current email");
      hasError = true;
    }
    
    if (hasError) return;
    
    toast.success("Verification email sent", {
      description: `Please check ${newEmail} to confirm the change`,
    });
    
    setEmailModalOpen(false);
    setCurrentPassword("");
    setNewEmail("");
  };

  const handlePasswordChangeSubmit = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    toast.success("Password changed successfully");
    setPasswordModalOpen(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleToggleTwoFactor = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
      toast.success("Two-factor authentication disabled");
    } else {
      setTwoFactorModalOpen(true);
    }
  };

  const handleEnableTwoFactor = () => {
    setTwoFactorEnabled(true);
    setTwoFactorModalOpen(false);
    toast.success("Two-factor authentication enabled");
  };

  const handleLogoutSession = (sessionId: string) => {
    toast.success("Session logged out");
  };

  const handleLogoutAllSessions = () => {
    setLogoutAllDialogOpen(false);
    toast.success("Logged out of all other sessions");
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const handlePhoneSubmit = () => {
    setPhoneError("");
    const cleanPhone = phoneInput.replace(/\D/g, '');
    
    if (!cleanPhone) {
      setPhoneError("Phone number is required");
      return;
    }
    
    if (!validatePhoneNumber(cleanPhone)) {
      setPhoneError("Please enter a valid phone number (10-15 digits)");
      return;
    }
    
    // Move to verification step
    setPhoneVerificationStep("verify");
    toast.success("Verification code sent", {
      description: `Check your phone at ${phoneCountryCode} ${phoneInput}`,
    });
  };

  const handlePhoneVerify = () => {
    if (phoneVerificationCode.length !== 6) {
      setPhoneError("Please enter the 6-digit code");
      return;
    }
    
    // Verify code (mock)
    setPhoneNumber(`${phoneCountryCode} ${phoneInput}`);
    setPhoneVerified(true);
    setPhoneModalOpen(false);
    setPhoneInput("");
    setPhoneVerificationCode("");
    setPhoneVerificationStep("input");
    toast.success("Phone number verified");
  };

  const handlePhoneModalClose = () => {
    setPhoneModalOpen(false);
    setPhoneInput("");
    setPhoneVerificationCode("");
    setPhoneVerificationStep("input");
    setPhoneError("");
  };

  const handleRemovePhone = () => {
    setPhoneNumber(null);
    setPhoneVerified(false);
    setIsPhoneFor2FA(false);
    toast.success("Phone number removed");
  };

  const handleSave = async () => {
    if (nameError) {
      toast.error("Please fix validation errors");
      return;
    }
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setSaved(true);
    toast.success("Profile updated successfully");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-xl font-semibold text-foreground">Profile</h1>
              <p className="text-sm text-muted-foreground/70 mt-1.5">
                Your identity, security, and preferences
              </p>
            </div>

            {/* Identity Block - Unified Section */}
            <div className="mb-10 p-6 rounded-xl bg-muted/10 border border-border/40">
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="relative group flex-shrink-0">
                  <div 
                    className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center overflow-hidden",
                      "bg-primary/10 border-2 border-primary/20"
                    )}
                  >
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-semibold text-primary">
                        {fullName.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-foreground/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                    <Camera className="w-5 h-5 text-background" />
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/gif,image/webp" 
                      className="hidden" 
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>

                {/* Identity Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-foreground truncate">{fullName}</h2>
                  <p className="text-sm text-muted-foreground/70 truncate mt-0.5">{email}</p>
                  
                  {/* Role Badge */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      <Shield className="w-3 h-3" />
                      Workspace Owner
                    </div>
                    <span className="text-xs text-muted-foreground/50">•</span>
                    <span className="text-xs text-muted-foreground/60">Acme Corporation</span>
                  </div>
                </div>

                {/* Photo Actions */}
                <div className="flex flex-col gap-1.5">
                  <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                    <label className="cursor-pointer">
                      <Camera className="w-3 h-3 mr-1.5" />
                      Upload photo
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/gif,image/webp" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </Button>
                  {avatar && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setRemovePhotoDialogOpen(true)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 text-xs"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* Helper Text */}
              <p className="text-xs text-muted-foreground/50 mt-5 pt-4 border-t border-border/30">
                This information is used in signatures, audit trails, and compliance records.
              </p>
            </div>

            {/* Image Cropper Modal */}
            <AnimatePresence>
              {cropImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-popover rounded-xl p-6 border border-border shadow-xl max-w-sm w-full mx-4"
                  >
                    <div className="flex flex-col items-center gap-5">
                      <p className="text-sm font-medium text-foreground">Adjust photo</p>
                      <p className="text-xs text-muted-foreground/70 -mt-3">
                        Drag to reposition • Use slider to zoom
                      </p>
                      <div 
                        ref={cropContainerRef}
                        className={cn(
                          "relative w-32 h-32 rounded-full overflow-hidden cursor-move",
                          "border-2 transition-colors duration-200",
                          isDragging ? "border-primary" : "border-border/60"
                        )}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        <img 
                          src={cropImage} 
                          alt="Crop preview"
                          className="absolute w-full h-full object-cover select-none pointer-events-none"
                          style={{
                            transform: `scale(${cropState.zoom}) translate(${cropState.x}%, ${cropState.y}%)`,
                            transformOrigin: 'center',
                          }}
                          draggable={false}
                        />
                        <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-white/20" />
                      </div>
                      
                      <div className="flex items-center gap-3 w-full max-w-[200px]">
                        <ZoomIn className="w-4 h-4 text-muted-foreground/60" />
                        <Slider
                          value={[cropState.zoom]}
                          onValueChange={([zoom]) => setCropState(prev => ({ ...prev, zoom }))}
                          min={1}
                          max={3}
                          step={0.1}
                          className="flex-1"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCropCancel}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCropConfirm}
                          className="flex-1"
                        >
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Apply
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full Name */}
            <div className="mb-8">
              <Label htmlFor="fullName" className="text-sm font-medium text-foreground mb-2.5 block">
                Full name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={handleNameChange}
                className={cn(
                  "max-w-md transition-colors",
                  nameError && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {nameError && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {nameError}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-8">
              <Label className="text-sm font-medium text-foreground mb-2.5 block">
                Email address
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  value={email}
                  readOnly
                  className="max-w-md bg-muted/20 text-muted-foreground cursor-not-allowed border-border/30"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEmailModalOpen(true)}
                  className="text-primary hover:text-primary hover:bg-primary/10 h-8"
                >
                  Change email
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/50 mt-2">
                Used for login, notifications, and audit logs
              </p>
            </div>

            {/* Phone Number */}
            <div className="mb-8">
              <Label className="text-sm font-medium text-foreground mb-2.5 block">
                Phone number <span className="text-muted-foreground/50 font-normal">(optional)</span>
              </Label>
              
              {!phoneNumber ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPhoneModalOpen(true)}
                    className="h-9"
                  >
                    <Phone className="w-3.5 h-3.5 mr-2" />
                    Add phone number
                  </Button>
                  <p className="text-xs text-muted-foreground/50 mt-2.5">
                    Used for account recovery, security alerts, and optional two-factor authentication.
                  </p>
                  {!twoFactorEnabled && (
                    <p className="text-xs text-muted-foreground/60 mt-1.5 flex items-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      Add a phone number to enable SMS-based two-factor authentication.
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-muted/20 border border-border/30 max-w-md">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{phoneNumber}</span>
                    {phoneVerified ? (
                      <div className="flex items-center gap-1 text-success">
                        <Check className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">Verified</span>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setPhoneVerificationStep("verify");
                          setPhoneModalOpen(true);
                        }}
                        className="text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-500/10 h-6 px-2 text-xs"
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setPhoneModalOpen(true)}
                    className="text-primary hover:text-primary hover:bg-primary/10 h-8"
                  >
                    Change
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemovePhone}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8"
                  >
                    Remove
                  </Button>
                </div>
              )}
              
              {phoneNumber && phoneVerified && (
                <div className="mt-3 p-2.5 rounded-lg bg-muted/10 border border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-muted-foreground/60" />
                      <span className="text-xs text-muted-foreground/70">
                        Used for security and recovery only. Not visible to other workspace members.
                      </span>
                    </div>
                    {twoFactorEnabled && isPhoneFor2FA && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
                        2FA enabled
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border/30 mb-10" />

            {/* Role & Permissions */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium text-foreground">
                  Role & permissions
                </Label>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
                  Read-only
                </span>
              </div>
              <div className="p-4 rounded-xl bg-muted/10 border border-border/40">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
                      <Shield className="w-3.5 h-3.5" />
                      Workspace Owner
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground/70 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-success" />
                        </div>
                        Can manage users
                      </p>
                      <p className="text-xs text-muted-foreground/70 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-success" />
                        </div>
                        Can access audit logs
                      </p>
                      <p className="text-xs text-muted-foreground/70 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-success" />
                        </div>
                        Can manage billing
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRoleModalOpen(true)}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 text-xs"
                  >
                    View all permissions
                  </Button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/30 mb-10" />

            {/* Security Section */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Security</h2>
              </div>

              {/* Password */}
              <div className="mb-4 p-4 rounded-xl bg-muted/10 border border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center">
                      <Key className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Password</p>
                      <p className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Last changed: 45 days ago
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPasswordModalOpen(true)}
                    className="h-8"
                  >
                    Change password
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="mb-4 p-4 rounded-xl bg-muted/10 border border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">Two-factor authentication</p>
                        {!twoFactorEnabled && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            twoFactorEnabled 
                              ? "bg-success/10 text-success border-success/30" 
                              : "bg-muted text-muted-foreground border-border/50"
                          )}
                        >
                          {twoFactorEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                        {!twoFactorEnabled && (
                          <span className="text-[10px] text-muted-foreground/50">
                            Recommended for Workspace Owners
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={twoFactorEnabled ? "outline" : "default"}
                    size="sm"
                    onClick={handleToggleTwoFactor}
                    className="h-8"
                  >
                    {twoFactorEnabled ? "Manage" : "Enable"}
                  </Button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="p-4 rounded-xl bg-muted/10 border border-border/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center">
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Active sessions</p>
                      <p className="text-xs text-muted-foreground/60">
                        {sessions.length} device{sessions.length !== 1 ? 's' : ''} currently signed in
                      </p>
                    </div>
                  </div>
                  {sessions.filter(s => !s.isCurrent).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogoutAllDialogOpen(true)}
                      className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1.5" />
                      Log out all others
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Current session first, with visual separation */}
                  {sessions.filter(s => s.isCurrent).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      <div className="flex items-center gap-3">
                        {session.deviceType === 'mobile' ? (
                          <Smartphone className="w-4 h-4 text-primary/70" />
                        ) : (
                          <Monitor className="w-4 h-4 text-primary/70" />
                        )}
                        <div>
                          <p className="text-xs font-medium text-foreground flex items-center gap-2">
                            {session.device}
                            <Badge variant="outline" className="text-[9px] px-1 py-0 bg-primary/10 text-primary border-primary/30">
                              This device
                            </Badge>
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {session.location} • {session.lastActive}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Other sessions */}
                  {sessions.filter(s => !s.isCurrent).length > 0 && (
                    <div className="pt-2 mt-2 border-t border-border/30">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-2 px-1">
                        Other sessions
                      </p>
                      <div className="space-y-2">
                        {sessions.filter(s => !s.isCurrent).map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                          >
                            <div className="flex items-center gap-3">
                              {session.deviceType === 'mobile' ? (
                                <Smartphone className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Monitor className="w-4 h-4 text-muted-foreground" />
                              )}
                              <div>
                                <p className="text-xs font-medium text-foreground">
                                  {session.device}
                                </p>
                                <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {session.location} • {session.lastActive}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLogoutSession(session.id)}
                              className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            >
                              Log out
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/30 mb-10" />

            {/* Preferences */}
            <div className="mb-10">
              <h2 className="text-sm font-semibold text-foreground mb-2">Preferences</h2>
              <p className="text-xs text-muted-foreground/50 mb-6">
                Used for timestamps, notifications, and system messages. Safe to change anytime.
              </p>

              {/* Timezone */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-foreground mb-2.5 block">
                  Timezone
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="max-w-md focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2.5 block">
                  Language preference
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="max-w-md focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/30 mb-10" />

            {/* Workspace Context */}
            <div className="mb-10">
              <h2 className="text-sm font-semibold text-foreground mb-4">Workspace</h2>
              <div className="p-4 rounded-xl bg-muted/10 border border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Acme Corporation</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
                          Pro Plan
                        </Badge>
                        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          12 members
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/settings/workspace')}
                    className="h-8 text-xs"
                  >
                    Manage workspace
                  </Button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/30 mb-8" />

            {/* Save Button and Compliance Footer */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] text-muted-foreground/40">
                Last updated: January 5, 2026 at 2:34 PM
              </p>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !hasChanges || !!nameError}
                className={cn(
                  "min-w-[120px] transition-all",
                  (!hasChanges || nameError) && "opacity-40"
                )}
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                    Saving
                  </span>
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    Saved
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>

            {/* Compliance Cue */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/40">
              <Lock className="w-3 h-3" />
              <span>Profile information is used in audit trails and compliance records.</span>
            </div>
          </div>
        </div>
      </TooltipProvider>
      
      {/* Email Change Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Change Email Address
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/70">
              For security, please verify your identity to change your email address.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="current-password" className="text-sm font-medium mb-2 block">
                Current password
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordError("");
                  }}
                  className={cn(
                    "pr-10",
                    passwordError && "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {passwordError}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="new-email" className="text-sm font-medium mb-2 block">
                New email address
              </Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setEmailError("");
                }}
                className={cn(
                  emailError && "border-destructive focus-visible:ring-destructive"
                )}
                placeholder="Enter new email"
              />
              {emailError && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {emailError}
                </p>
              )}
            </div>
            
            <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
              <p className="text-xs text-muted-foreground/70">
                A verification email will be sent to your new address. You'll need to confirm the change before it takes effect.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setEmailModalOpen(false);
                setCurrentPassword("");
                setNewEmail("");
                setEmailError("");
                setPasswordError("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEmailChange}>
              Send verification
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Remove Photo Confirmation */}
      <AlertDialog open={removePhotoDialogOpen} onOpenChange={setRemovePhotoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove profile photo?</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile photo will be removed and replaced with your initials. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemovePhoto} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Permissions Modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Workspace Owner Permissions
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/70">
              Full administrative access to workspace settings and resources.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            {rolePermissions.map((permission, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <permission.icon className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{permission.label}</p>
                  <p className="text-xs text-muted-foreground/60">{permission.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/70">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Current password</Label>
              <div className="relative">
                <Input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">New password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Confirm new password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setPasswordModalOpen(false);
              setOldPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChangeSubmit}>
              Change password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Modal */}
      <Dialog open={twoFactorModalOpen} onOpenChange={setTwoFactorModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Enable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/70">
              Add an extra layer of security to your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-muted/20 rounded-lg p-4 border border-border/30 text-center mb-4">
              <div className="w-32 h-32 mx-auto bg-muted/40 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xs text-muted-foreground">QR Code Placeholder</span>
              </div>
              <p className="text-xs text-muted-foreground/70">
                Scan this code with your authenticator app
              </p>
            </div>
            
            <div className="bg-muted/10 rounded-lg p-3 border border-border/20">
              <p className="text-xs text-muted-foreground/70">
                Use an authenticator app like Google Authenticator, Authy, or 1Password to scan the QR code above.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTwoFactorModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnableTwoFactor}>
              Enable 2FA
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout All Sessions Confirmation */}
      <AlertDialog open={logoutAllDialogOpen} onOpenChange={setLogoutAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of all devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out of all other sessions. You'll remain signed in on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutAllSessions} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Log out all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Phone Number Verification Modal */}
      <Dialog open={phoneModalOpen} onOpenChange={handlePhoneModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              {phoneVerificationStep === "input" ? "Add Phone Number" : "Verify Phone Number"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/70">
              {phoneVerificationStep === "input" 
                ? "Enter your phone number for account recovery and security alerts."
                : "Enter the 6-digit code sent to your phone."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {phoneVerificationStep === "input" ? (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Phone number</Label>
                  <div className="flex gap-2">
                    <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">+1 US</SelectItem>
                        <SelectItem value="+44">+44 UK</SelectItem>
                        <SelectItem value="+61">+61 AU</SelectItem>
                        <SelectItem value="+81">+81 JP</SelectItem>
                        <SelectItem value="+49">+49 DE</SelectItem>
                        <SelectItem value="+33">+33 FR</SelectItem>
                        <SelectItem value="+86">+86 CN</SelectItem>
                        <SelectItem value="+91">+91 IN</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => {
                        setPhoneInput(e.target.value);
                        setPhoneError("");
                      }}
                      placeholder="Enter phone number"
                      className={cn(
                        "flex-1",
                        phoneError && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {phoneError}
                    </p>
                  )}
                </div>
                
                <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
                  <div className="flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground/70">
                      Your phone number is private and will never be shared. It's used only for security, recovery, and critical account alerts.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Verification code</Label>
                  <Input
                    type="text"
                    value={phoneVerificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPhoneVerificationCode(value);
                      setPhoneError("");
                    }}
                    placeholder="Enter 6-digit code"
                    className={cn(
                      "text-center text-lg tracking-widest font-mono",
                      phoneError && "border-destructive focus-visible:ring-destructive"
                    )}
                    maxLength={6}
                  />
                  {phoneError && (
                    <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {phoneError}
                    </p>
                  )}
                </div>
                
                <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
                  <p className="text-xs text-muted-foreground/70">
                    A verification code was sent to <span className="font-medium text-foreground">{phoneCountryCode} {phoneInput}</span>. The code will expire in 10 minutes.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Code resent", {
                      description: `Check your phone at ${phoneCountryCode} ${phoneInput}`,
                    });
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Didn't receive the code? Resend
                </button>
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handlePhoneModalClose}>
              Cancel
            </Button>
            {phoneVerificationStep === "input" ? (
              <Button onClick={handlePhoneSubmit}>
                Send verification code
              </Button>
            ) : (
              <Button onClick={handlePhoneVerify}>
                Verify
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
