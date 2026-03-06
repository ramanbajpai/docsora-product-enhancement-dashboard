import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Copy, Download, FileText, Calendar, Lock, LockOpen, Users,
  Clock, Eye, EyeOff, CheckCircle2, AlertTriangle, Send, Trash2, 
  Plus, RefreshCw, Link2, Shield, Pencil, Check, LockKeyhole, Mail
} from "lucide-react";
import { TrackItem, MainTab, TrackItemRecipient } from "@/pages/Track";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, formatDistanceToNow, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface RecipientPasswordConfig {
  type: "global" | "custom";
  password?: string;
}

interface TrackDetailPanelProps {
  item: TrackItem;
  onClose: () => void;
  mainTab: MainTab;
  onUpdate?: (updatedItem: TrackItem) => void;
}

export function TrackDetailPanel({ item, onClose, mainTab, onUpdate }: TrackDetailPanelProps) {
  const [hasPassword, setHasPassword] = useState(item.hasPassword);
  const [activeTab, setActiveTab] = useState<"details" | "activity" | "audit">("details");
  const [transferTitle, setTransferTitle] = useState(item.name.replace(/\.[^/.]+$/, ""));
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(item.expiresAt);
  const [transferStatus, setTransferStatus] = useState(item.status);
  const [isExpiryPopoverOpen, setIsExpiryPopoverOpen] = useState(false);
  
  // Local recipients state to allow adding new recipients
  const [localRecipients, setLocalRecipients] = useState(item.recipients);
  
  const [recipientPasswords, setRecipientPasswords] = useState<Record<string, RecipientPasswordConfig>>(
    () => item.recipients.reduce((acc, r) => {
      // Set Sarah as having a custom password for demo purposes
      if (r.email === "sarah@acme.com") {
        return { ...acc, [r.email]: { type: "custom", password: "SecurePass2025!" } };
      }
      return { ...acc, [r.email]: { type: "global" } };
    }, {})
  );
  const [editingPasswordFor, setEditingPasswordFor] = useState<string | null>(null);
  const [customPasswordInput, setCustomPasswordInput] = useState("");
  const [recipientToRemove, setRecipientToRemove] = useState<{ name: string; email: string } | null>(null);
  const [passwordModalMode, setPasswordModalMode] = useState<"menu" | "change">("menu");
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteTransferDialog, setShowDeleteTransferDialog] = useState(false);
  
  // Add recipient modal state
  const [showAddRecipientModal, setShowAddRecipientModal] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState("");
  const [newRecipientName, setNewRecipientName] = useState("");
  const [newRecipientPassword, setNewRecipientPassword] = useState("");
  const [showNewRecipientPassword, setShowNewRecipientPassword] = useState(false);
  const [setRecipientPassword, setSetRecipientPassword] = useState(false);
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const [addRecipientError, setAddRecipientError] = useState("");

  const shareUrl = `https://docsora.com/t/${item.id}`;

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Get recipients who haven't downloaded yet (based on downloadedAt, not status)
  // Recipients without downloadedAt are considered "not downloaded"
  const notDownloadedRecipients = localRecipients.filter(r => !r.downloadedAt);
  const hasNotDownloadedRecipients = notDownloadedRecipients.length > 0;
  const isExpired = transferStatus === "expired";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard");
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    toast.success("Transfer title updated");
    // Log to activity
  };

  const handleResendToUnopened = () => {
    if (notDownloadedRecipients.length === 0) {
      toast.info("All recipients have already downloaded the file");
      return;
    }
    toast.success(`Resent to ${notDownloadedRecipients.length} recipient${notDownloadedRecipients.length > 1 ? "s" : ""}`);
    // Log to activity
  };

  const resetAddRecipientForm = () => {
    setNewRecipientEmail("");
    setNewRecipientName("");
    setNewRecipientPassword("");
    setShowNewRecipientPassword(false);
    setSetRecipientPassword(false);
    setNotifyByEmail(true);
    setAddRecipientError("");
  };

  const handleAddRecipient = async () => {
    // Validate email
    if (!isValidEmail(newRecipientEmail)) {
      setAddRecipientError("Please enter a valid email address");
      return;
    }

    // Check for duplicate
    if (localRecipients.some(r => r.email.toLowerCase() === newRecipientEmail.toLowerCase())) {
      setAddRecipientError("Recipient already added");
      return;
    }

    setIsAddingRecipient(true);
    setAddRecipientError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newRecipient = {
        name: newRecipientName || newRecipientEmail.split("@")[0],
        email: newRecipientEmail,
        status: "pending" as const,
      };

      // Optimistic update
      setLocalRecipients(prev => [...prev, newRecipient]);

      // Set password if provided
      if (setRecipientPassword && newRecipientPassword.trim()) {
        setRecipientPasswords(prev => ({
          ...prev,
          [newRecipientEmail]: { type: "custom", password: newRecipientPassword }
        }));
      } else {
        setRecipientPasswords(prev => ({
          ...prev,
          [newRecipientEmail]: { type: "global" }
        }));
      }

      toast.success(`${newRecipient.name} added to transfer${notifyByEmail ? " and notified" : ""}`);
      resetAddRecipientForm();
      setShowAddRecipientModal(false);
    } catch (error) {
      toast.error("Couldn't add recipient. Try again.");
    } finally {
      setIsAddingRecipient(false);
    }
  };

  const handleExtendExpiry = (date: Date | undefined) => {
    if (date) {
      setExpiryDate(date);
      setIsExpiryPopoverOpen(false);
      
      const newStatus = "active" as const;
      setTransferStatus(newStatus);
      
      // Update parent state so the list reflects the change
      if (onUpdate) {
        const updatedItem: TrackItem = {
          ...item,
          expiresAt: date,
          status: newStatus,
          // Also update recipient statuses from expired back to their previous state
          recipients: localRecipients.map(r => ({
            ...r,
            status: r.status === "expired" ? (r.downloadedAt ? "signed" : r.openedAt ? "viewed" : "pending") : r.status
          })) as TrackItemRecipient[]
        };
        onUpdate(updatedItem);
      }
      
      // Reactivate if was expired
      if (isExpired) {
        toast.success(`Transfer reactivated until ${format(date, "MMM d, yyyy")}`);
      } else {
        toast.success(`Expiration extended to ${format(date, "MMM d, yyyy")}`);
      }
    }
  };

  const handleSetCustomPassword = (email: string) => {
    const config = recipientPasswords[email];
    const existingPassword = config?.type === "custom" ? config.password : "";
    const passwordToSave = customPasswordInput || existingPassword;
    
    if (passwordToSave.trim()) {
      setRecipientPasswords(prev => ({
        ...prev,
        [email]: { type: "custom", password: passwordToSave }
      }));
      toast.success("Password saved");
      setEditingPasswordFor(null);
      setCustomPasswordInput("");
      setPasswordModalMode("menu");
      setShowPassword(false);
    }
  };

  const handleRemovePassword = (email: string) => {
    setRecipientPasswords(prev => ({
      ...prev,
      [email]: { type: "global" }
    }));
    toast.success("Password removed");
    setEditingPasswordFor(null);
    setPasswordModalMode("menu");
  };

  const closePasswordModal = () => {
    setEditingPasswordFor(null);
    setCustomPasswordInput("");
    setPasswordModalMode("menu");
    setShowPassword(false);
  };

  const timeline = [
    { action: "Document sent", time: item.sentAt, icon: <Send className="w-3.5 h-3.5" /> },
    ...(item.viewCount > 0 ? [{ action: "First viewed", time: new Date(item.sentAt.getTime() + 2 * 60 * 60 * 1000), icon: <Eye className="w-3.5 h-3.5" /> }] : []),
    ...(item.downloadCount > 0 ? [{ action: "Downloaded", time: item.lastActivity, icon: <Download className="w-3.5 h-3.5" /> }] : []),
    ...(item.status === "signed" || item.status === "completed" ? [{ action: "Signed", time: item.lastActivity, icon: <CheckCircle2 className="w-3.5 h-3.5" /> }] : []),
  ];

  return (
    <div className="h-[calc(100vh-200px)] sticky top-8 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-4">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">
              {mainTab === "transfer" ? "Transfer" : "Signature"}
            </div>
            
            {/* Editable Transfer Title */}
            {isEditingTitle ? (
              <div className="relative mb-2 max-w-[320px]">
                <Input
                  value={transferTitle}
                  onChange={(e) => setTransferTitle(e.target.value)}
                  className="px-3 py-2 text-sm font-semibold pr-16 rounded-lg bg-muted/50 border-border/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSave();
                    if (e.key === "Escape") {
                      setTransferTitle(item.name.replace(/\.[^/.]+$/, ""));
                      setIsEditingTitle(false);
                    }
                  }}
                />
                <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-5 w-5 hover:bg-muted hover:text-muted-foreground" 
                    onClick={() => {
                      setTransferTitle(item.name.replace(/\.[^/.]+$/, ""));
                      setIsEditingTitle(false);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-5 w-5 hover:bg-muted hover:text-muted-foreground" 
                    onClick={handleTitleSave}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {transferTitle}
                </h2>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            {/* Document name - read-only and secondary */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="w-3 h-3" />
              <span className="truncate">{item.name}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 hover:bg-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{item.size}</span>
          <span>•</span>
          <span>Sent {format(item.sentAt, "MMM d, yyyy 'at' h:mm a")}</span>
        </div>

        {/* Expired State Banner */}
        {isExpired ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-destructive mb-1">Transfer expired</h4>
                <p className="text-xs text-destructive/80 mb-3">
                  To reactivate this transfer, extend the expiry date. Once extended, the status will change to Active and recipients will regain access.
                </p>
                <Popover open={isExpiryPopoverOpen} onOpenChange={setIsExpiryPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      size="sm" 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      Extend expiry
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-medium">Extend expiration</p>
                      <p className="text-xs text-muted-foreground">
                        Current: {expiryDate ? format(expiryDate, "MMM d, yyyy") : "Never expires"}
                      </p>
                    </div>
                    <CalendarComponent
                      mode="single"
                      selected={expiryDate}
                      onSelect={handleExtendExpiry}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      classNames={{
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-muted/50 text-foreground ring-1 ring-muted-foreground/30",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted hover:text-foreground rounded-md transition-colors",
                        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-outside)]:bg-primary/50 [&:has([aria-selected])]:bg-primary/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      }}
                    />
                    <div className="p-3 border-t border-border flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-muted hover:text-foreground"
                        onClick={() => handleExtendExpiry(addDays(new Date(), 1))}
                      >
                        +1 day
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-muted hover:text-foreground"
                        onClick={() => handleExtendExpiry(addDays(new Date(), 7))}
                      >
                        +7 days
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-muted hover:text-foreground"
                        onClick={() => handleExtendExpiry(addDays(new Date(), 30))}
                      >
                        +30 days
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </motion.div>
        ) : expiryDate && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>Active until {format(expiryDate, "MMM d, yyyy")}</span>
          </div>
        )}
      </div>

      {/* Panel Tabs */}
      <div className="flex border-b border-border/50 px-6">
        {(["details", "activity", "audit"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative py-3 px-4 text-sm capitalize transition-colors ${
              activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="panelTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ duration: 0.2 }}
              />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Share Link */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Share Link
                </label>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm truncate ${
                    isExpired ? "text-muted-foreground" : "text-foreground"
                  }`}>
                    {shareUrl}
                  </div>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={handleCopyLink}
                          disabled={isExpired}
                          className={isExpired ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-popover text-popover-foreground border-border text-xs">
                      {isExpired ? "Link inactive — extend expiry to copy" : "Copy link"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" disabled={isExpired}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-popover text-popover-foreground border-border text-xs">
                        {isExpired ? "Link inactive until reactivated" : "Download QR code"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {isExpired && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Link inactive until reactivated
                  </p>
                )}
              </div>

              {/* Recipients */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Recipients ({localRecipients.length})
                  </label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs gap-1 hover:bg-muted hover:text-foreground"
                    onClick={() => setShowAddRecipientModal(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {localRecipients.map((recipient, i) => {
                    const passwordConfig = recipientPasswords[recipient.email] || { type: "global" };
                    const hasDownloaded = !!recipient.downloadedAt;
                    const recipientHasPassword = passwordConfig.type === "custom";
                    const canResend = !hasDownloaded;
                    
                    // Status icon based on recipient state (using downloadedAt and openedAt)
                    const getStatusIcon = () => {
                      if (recipient.downloadedAt) {
                        return { icon: <Download className="w-3.5 h-3.5" />, tooltip: "Downloaded" };
                      }
                      if (recipient.openedAt) {
                        return { icon: <Eye className="w-3.5 h-3.5" />, tooltip: "Viewed" };
                      }
                      return { icon: <Clock className="w-3.5 h-3.5" />, tooltip: "Waiting" };
                    };
                    
                    const statusInfo = getStatusIcon();
                    
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {recipient.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{recipient.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{recipient.email}</p>
                        </div>
                        
                        {/* Inline Action Icons */}
                        <TooltipProvider delayDuration={0}>
                          <div className="flex items-center gap-1">
                            {/* Password Icon */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => {
                                    setEditingPasswordFor(recipient.email);
                                    // Skip menu for recipients without password - go straight to input
                                    if (passwordConfig.type !== "custom") {
                                      setPasswordModalMode("change");
                                    }
                                  }}
                                  className={cn(
                                    "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                                    "text-muted-foreground hover:text-primary hover:bg-muted"
                                  )}
                                >
                                  {passwordConfig.type === "custom" ? (
                                    <Lock className="w-3.5 h-3.5" />
                                  ) : (
                                    <LockOpen className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="bg-popover text-popover-foreground border-border text-xs"
                              >
                                {passwordConfig.type === "custom" 
                                  ? "Password protected – click to manage" 
                                  : "Add password for this recipient"}
                              </TooltipContent>
                            </Tooltip>
                            
                            {/* Status Icon */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "w-7 h-7 flex items-center justify-center rounded-md",
                                    "text-muted-foreground"
                                  )}
                                >
                                  {statusInfo.icon}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="bg-popover text-popover-foreground border-border text-xs"
                              >
                                {statusInfo.tooltip}
                              </TooltipContent>
                            </Tooltip>
                            
                            {/* Resend Icon */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => {
                                    if (canResend) {
                                      toast.success(`Resent to ${recipient.name}`);
                                    }
                                  }}
                                  disabled={!canResend}
                                  className={cn(
                                    "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                                    canResend 
                                      ? "text-muted-foreground hover:text-primary hover:bg-muted" 
                                      : "text-muted-foreground/40 cursor-not-allowed"
                                  )}
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="bg-popover text-popover-foreground border-border text-xs"
                              >
                                {canResend ? "Resend to this recipient" : "Already downloaded"}
                              </TooltipContent>
                            </Tooltip>
                            
                            {/* Remove Icon */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setRecipientToRemove({ name: recipient.name, email: recipient.email })}
                                  className={cn(
                                    "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                                    "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  )}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="bg-popover text-popover-foreground border-border text-xs"
                              >
                                Remove recipient
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Settings */}
              <div className="space-y-4">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                  Settings
                </label>

                {/* Expiry */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Expiration</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {expiryDate ? format(expiryDate, "MMM d, yyyy") : "Never"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Summary Line */}
              <div className="px-3 py-2.5 rounded-lg bg-muted/40 border border-border/40">
                <p className="text-sm text-foreground">
                  <span className="font-medium">
                    {localRecipients.filter(r => r.downloadedAt).length}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}of {localRecipients.length} recipient{localRecipients.length !== 1 ? "s" : ""} downloaded this file
                  </span>
                </p>
              </div>

              {/* Per-Recipient Activity */}
              <div className="space-y-3">
                {localRecipients.map((recipient, i) => {
                  const passwordConfig = recipientPasswords[recipient.email] || { type: "global" };
                  const hasDownloaded = !!recipient.downloadedAt;
                  const hasViewed = !!recipient.openedAt;
                  const isProtected = passwordConfig.type === "custom";
                  
                  // Build timeline for this recipient
                  const recipientTimeline = [
                    { action: "Sent", time: item.sentAt, icon: <Send className="w-3 h-3" /> },
                  ];
                  
                  if (hasViewed && recipient.openedAt) {
                    recipientTimeline.push({
                      action: "First viewed",
                      time: recipient.openedAt,
                      icon: <Eye className="w-3 h-3" />
                    });
                  }
                  
                  if (hasDownloaded && recipient.downloadedAt) {
                    recipientTimeline.push({
                      action: "Downloaded",
                      time: recipient.downloadedAt,
                      icon: <Download className="w-3 h-3" />
                    });
                  }
                  
                  // Get status display
                  const getStatusDisplay = () => {
                    if (hasDownloaded) {
                      return { label: "Downloaded", icon: <Download className="w-3 h-3" />, color: "text-emerald-500" };
                    }
                    if (hasViewed) {
                      return { label: "Viewed", icon: <Eye className="w-3 h-3" />, color: "text-blue-500" };
                    }
                    return { label: "Waiting", icon: <Clock className="w-3 h-3" />, color: "text-muted-foreground" };
                  };
                  
                  const statusDisplay = getStatusDisplay();
                  
                  return (
                    <div
                      key={i}
                      className="rounded-lg border border-border/40 bg-card/50 overflow-hidden"
                    >
                      {/* Recipient Header */}
                      <div className="flex items-center gap-3 p-3 border-b border-border/30">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {recipient.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{recipient.name}</p>
                            {isProtected && (
                              <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{recipient.email}</p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                          hasDownloaded ? "bg-emerald-500/10" : hasViewed ? "bg-blue-500/10" : "bg-muted/50"
                        )}>
                          <span className={statusDisplay.color}>{statusDisplay.icon}</span>
                          <span className={statusDisplay.color}>{statusDisplay.label}</span>
                        </div>
                      </div>
                      
                      {/* Recipient Timeline */}
                      <div className="p-3">
                        <div className="relative pl-4">
                          <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-border/60" />
                          <div className="space-y-2.5">
                            {recipientTimeline.map((event, j) => (
                              <div key={j} className="flex items-center gap-2.5 relative">
                                <div className="w-3 h-3 rounded-full bg-muted flex items-center justify-center shrink-0 z-10 -ml-[7px]">
                                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-muted-foreground">{event.icon}</span>
                                  <span className="text-xs text-foreground">{event.action}</span>
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {format(event.time, "MMM d, h:mm a")}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "audit" && (
            <motion.div
              key="audit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Compliance Audit Trail</span>
              </div>
              
              {/* Audit Info */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Transfer ID</p>
                  <p className="text-sm font-mono text-foreground">{item.id}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Lifecycle Events</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-foreground">{format(item.sentAt, "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last activity</span>
                      <span className="text-foreground">{format(item.lastActivity, "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recipients</span>
                      <span className="text-foreground">{localRecipients.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Downloads</span>
                      <span className="text-foreground">{localRecipients.filter(r => r.downloadedAt).length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Security</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Password protected</span>
                      <span className="text-foreground">{item.hasPassword ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expiration</span>
                      <span className="text-foreground">{expiryDate ? format(expiryDate, "MMM d, yyyy") : "Never"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Export Section */}
              <div className="pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-3">
                  Export includes timestamps, IP addresses, device metadata, and all transfer events.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2"
                  onClick={() => toast.success("Audit log exported as PDF")}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export as PDF
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions - only show on Details tab */}
      {activeTab === "details" && (
        <div className="p-4 border-t border-border/50 bg-muted/20">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {/* Primary: Resend transfer */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex-1">
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="gap-1.5 w-full"
                        onClick={handleResendToUnopened}
                        disabled={isExpired || !hasNotDownloadedRecipients}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Resend transfer
                        {!isExpired && hasNotDownloadedRecipients && (
                          <Badge variant="secondary" className="ml-1 h-5 text-[10px] bg-muted text-muted-foreground">
                            {notDownloadedRecipients.length}
                          </Badge>
                        )}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-popover text-popover-foreground border-border text-xs max-w-[200px]"
                  >
                    {isExpired 
                      ? "Extend expiry to reactivate this transfer"
                      : hasNotDownloadedRecipients 
                        ? "Only recipients who haven't downloaded the file will be notified"
                        : "All recipients have downloaded this transfer"
                    }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Secondary: Extend - only show when NOT expired */}
              {!isExpired && (
                <Popover open={isExpiryPopoverOpen} onOpenChange={setIsExpiryPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Extend
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-medium">Extend expiration</p>
                      <p className="text-xs text-muted-foreground">
                        Current: {expiryDate ? format(expiryDate, "MMM d, yyyy") : "Never expires"}
                      </p>
                    </div>
                    <CalendarComponent
                      mode="single"
                      selected={expiryDate}
                      onSelect={handleExtendExpiry}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      classNames={{
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-muted/50 text-foreground ring-1 ring-muted-foreground/30",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted hover:text-foreground rounded-md transition-colors",
                        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-outside)]:bg-primary/50 [&:has([aria-selected])]:bg-primary/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      }}
                    />
                    <div className="p-3 border-t border-border flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-muted hover:text-foreground"
                        onClick={() => handleExtendExpiry(addDays(new Date(), 1))}
                      >
                        +1 day
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-muted hover:text-foreground"
                        onClick={() => handleExtendExpiry(addDays(new Date(), 7))}
                      >
                        +7 days
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-muted hover:text-foreground"
                        onClick={() => handleExtendExpiry(addDays(new Date(), 30))}
                      >
                        +30 days
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              
              {/* Destructive: Delete */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                      onClick={() => setShowDeleteTransferDialog(true)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-popover text-popover-foreground border-border text-xs"
                  >
                    Delete transfer
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Helper text for expired state */}
            {isExpired && (
              <p className="text-xs text-muted-foreground text-center">
                Extend expiry to reactivate this transfer.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Password Management Modal */}
      <Dialog open={!!editingPasswordFor} onOpenChange={(open) => !open && closePasswordModal()}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Manage recipient password</DialogTitle>
            <DialogDescription>
              {editingPasswordFor && (() => {
                const recipient = item.recipients.find(r => r.email === editingPasswordFor);
                const config = recipientPasswords[editingPasswordFor];
                const isProtected = config?.type === "custom";
                return isProtected 
                  ? `This recipient is password protected. You can change or remove the password.`
                  : `Add a password to protect access for ${recipient?.name || "this recipient"}.`;
              })()}
            </DialogDescription>
          </DialogHeader>
          
          {passwordModalMode === "menu" && editingPasswordFor && (() => {
            const config = recipientPasswords[editingPasswordFor];
            const isProtected = config?.type === "custom";
            
            return (
              <div className="space-y-2 py-2">
                <button
                  onClick={() => setPasswordModalMode("change")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors hover:bg-muted"
                >
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span>{isProtected ? "Change password" : "Set password"}</span>
                </button>
                {isProtected && (
                  <button
                    onClick={() => handleRemovePassword(editingPasswordFor)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors hover:bg-muted text-destructive"
                  >
                    <LockOpen className="w-4 h-4" />
                    <span>Remove password</span>
                  </button>
                )}
              </div>
            );
          })()}
          
          {passwordModalMode === "change" && editingPasswordFor && (() => {
            const config = recipientPasswords[editingPasswordFor];
            const existingPassword = config?.type === "custom" ? config.password : "";
            
            return (
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {existingPassword ? "Current password" : "New password"}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={customPasswordInput || existingPassword}
                      onChange={(e) => setCustomPasswordInput(e.target.value)}
                      className="pr-10"
                      autoFocus
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
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setPasswordModalMode("menu");
                      setShowPassword(false);
                      setCustomPasswordInput("");
                    }}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => handleSetCustomPassword(editingPasswordFor)}
                    disabled={!(customPasswordInput || existingPassword).trim()}
                  >
                    Save password
                  </Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Remove Recipient Confirmation Dialog */}
      <AlertDialog open={!!recipientToRemove} onOpenChange={(open) => !open && setRecipientToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove recipient?</AlertDialogTitle>
            <AlertDialogDescription>
              {recipientToRemove?.name} ({recipientToRemove?.email}) will no longer have access to this transfer. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setLocalRecipients(prev => prev.filter(r => r.email !== recipientToRemove?.email));
                toast.success(`${recipientToRemove?.name} removed from transfer`);
                setRecipientToRemove(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Transfer Confirmation Dialog */}
      <AlertDialog open={showDeleteTransferDialog} onOpenChange={setShowDeleteTransferDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transfer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently disable the transfer link for all recipients.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success("Transfer deleted");
                setShowDeleteTransferDialog(false);
                onClose();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Recipient Modal */}
      <Dialog 
        open={showAddRecipientModal} 
        onOpenChange={(open) => {
          if (!open) {
            resetAddRecipientForm();
          }
          setShowAddRecipientModal(open);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add recipient</DialogTitle>
            <DialogDescription>
              Add a new recipient to this transfer. They will receive access to download the file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Email field */}
            <div>
              <label className="text-sm font-medium mb-2 block">Email address</label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={newRecipientEmail}
                onChange={(e) => {
                  setNewRecipientEmail(e.target.value);
                  setAddRecipientError("");
                }}
                className={addRecipientError ? "border-destructive" : ""}
                autoFocus
              />
              {addRecipientError && (
                <p className="text-xs text-destructive mt-1">{addRecipientError}</p>
              )}
            </div>
            
            {/* Message field */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Message <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                placeholder="Add a personal message for the recipient..."
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
            
            {/* Password toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Set password for this recipient</label>
                <Switch
                  checked={setRecipientPassword}
                  onCheckedChange={setSetRecipientPassword}
                />
              </div>
              
              {setRecipientPassword && (
                <div className="relative">
                  <Input
                    type={showNewRecipientPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={newRecipientPassword}
                    onChange={(e) => setNewRecipientPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewRecipientPassword(!showNewRecipientPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewRecipientPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
            
            {/* Email notification info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>User will be notified by email</span>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                resetAddRecipientForm();
                setShowAddRecipientModal(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddRecipient}
              disabled={!newRecipientEmail.trim() || !isValidEmail(newRecipientEmail) || isAddingRecipient}
            >
              {isAddingRecipient ? "Adding..." : "Add recipient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
