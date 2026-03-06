import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Download, FileText, Calendar, Lock, LockOpen,
  Clock, Eye, EyeOff, CheckCircle2, XCircle, Send, Bell,
  Shield, PenTool, AlertCircle, FileDown, ChevronRight,
  RefreshCw, Edit3, Files, Users, Layers, MoreHorizontal,
  Key, Mail, Info, UserX, RotateCcw, UserMinus, Ban,
  CalendarPlus, Award, FileCheck, ArrowRight, Check
} from "lucide-react";
import { SignItem, SignRecipient, SignActivity, AuditEntry, signStatusConfig, SigningMode, recipientRoleConfig, RecipientRole } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format, formatDistanceToNow, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface SignDetailPanelRedesignProps {
  item: SignItem;
  onClose: () => void;
  onSign?: () => void;
  onDecline?: () => void;
}

const activityIcons: Record<SignActivity["type"] | "voided" | "completed" | "declined_terminal", React.ReactNode> = {
  sent: <Send className="w-3 h-3" />,
  viewed: <Eye className="w-3 h-3" />,
  signed: <CheckCircle2 className="w-3 h-3" />,
  declined: <XCircle className="w-3 h-3" />,
  reminder_sent: <Bell className="w-3 h-3" />,
  expired: <Clock className="w-3 h-3" />,
  deadline_extended: <Clock className="w-3 h-3" />,
  voided: <Ban className="w-3 h-3" />,
  completed: <Shield className="w-3 h-3" />,
  declined_terminal: <XCircle className="w-3 h-3" />,
};

const activityColors: Record<SignActivity["type"] | "voided" | "completed" | "declined_terminal", string> = {
  sent: "text-blue-500 bg-blue-500/10",
  viewed: "text-muted-foreground bg-muted/50",
  signed: "text-emerald-500 bg-emerald-500/10",
  declined: "text-red-500 bg-red-500/10",
  reminder_sent: "text-amber-500 bg-amber-500/10",
  expired: "text-orange-500 bg-orange-500/10",
  deadline_extended: "text-blue-500 bg-blue-500/10",
  voided: "text-red-800 dark:text-red-400 bg-red-900/10",
  completed: "text-emerald-500 bg-emerald-500/10",
  declined_terminal: "text-red-500 bg-red-500/10",
};

// Activity descriptions in plain language
const activityDescriptions: Record<SignActivity["type"] | "completed" | "voided" | "declined_terminal", string> = {
  sent: "Sent for signature",
  viewed: "Viewed the document",
  signed: "Signed the document",
  declined: "Declined to sign",
  reminder_sent: "Reminder sent",
  expired: "Signing deadline expired",
  deadline_extended: "Deadline extended",
  completed: "Document completed",
  voided: "Workflow voided",
  declined_terminal: "Declined to sign",
};

// Tooltip descriptions for signing modes
const signingModeTooltips: Record<SigningMode, string> = {
  parallel: "All recipients can sign at the same time.",
  sequential: "Recipients sign one after another in order."
};

// Tooltip descriptions for recipient statuses (exact copy per requirements)
const recipientStatusTooltips: Record<string, string> = {
  viewed: "The recipient has opened the document but has not taken action.",
  signed: "The recipient has completed their required action.",
  pending: "This recipient hasn't opened the document yet.",
  declined: "This recipient declined to sign.",
  waiting: "This recipient will be notified once earlier steps are completed.",
  no_action: "This recipient doesn't need to take any action.",
  action_required: "This recipient needs to review and complete their action.",
  expired: "The signing deadline passed before this request was completed.",
  voided: "This workflow was voided. No further action is required.",
  cancelled: "This request was cancelled by the sender.",
  signed_before_voided: "This recipient completed their action before the document was voided.",
  signed_before_declined: "This recipient completed their action before another recipient declined.",
  no_longer_required: "A required signer declined. This workflow has ended and no further action is needed."
};

// Role visual hierarchy - signers > approvers > viewers > cc
const roleOrder: Record<RecipientRole, number> = {
  signer: 0,
  approver: 1,
  viewer: 2,
  cc: 3
};

export function SignDetailPanelRedesign({ item, onClose, onSign, onDecline }: SignDetailPanelRedesignProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"details" | "activity" | "audit">("details");
  const status = signStatusConfig[item.status];

  // Password settings modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState<"menu" | "change">("menu");
  const [passwordModalRecipient, setPasswordModalRecipient] = useState<SignRecipient | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Remove recipient confirmation modal state
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removeConfirmRecipient, setRemoveConfirmRecipient] = useState<SignRecipient | null>(null);

  // Void request confirmation modal state
  const [voidConfirmOpen, setVoidConfirmOpen] = useState(false);

  // Revise & Resend modal state (for declined documents)
  const [reviseModalOpen, setReviseModalOpen] = useState(false);
  const [reviseFile, setReviseFile] = useState<File | null>(null);

  // Extend due date modal state (sender only)
  const [extendDateOpen, setExtendDateOpen] = useState(false);
  const [extendDate, setExtendDate] = useState<Date | undefined>(item.expiresAt ? addDays(item.expiresAt, 7) : addDays(new Date(), 14));
  const [notifyOnExtend, setNotifyOnExtend] = useState(true);
  
  // Extension request modal state (signer/recipient only)
  const [extensionRequestOpen, setExtensionRequestOpen] = useState(false);
  const [extensionRequestMessage, setExtensionRequestMessage] = useState("");
  
  // Mock password state - in real app this would come from the item
  const [recipientPasswords, setRecipientPasswords] = useState<Record<string, string>>(() => {
    // Initialize with mock data - some recipients might have passwords
    const passwords: Record<string, string> = {};
    if (item.hasPassword) {
      // For Investment Agreement - MultiSig demo, set password for Investor B
      const investorB = item.recipients.find(r => r.email === "investor.b@fund.com");
      if (investorB) {
        passwords[investorB.email] = "InvestorB2025!";
      }
      // Also set for first recipient as fallback for other documents
      const firstRecipient = item.recipients[0];
      if (firstRecipient && !passwords[firstRecipient.email]) {
        passwords[firstRecipient.email] = "SecureSign2025!";
      }
    }
    return passwords;
  });

  const isReceivedDocument = !!item.sender;
  const isSender = !isReceivedDocument;
  const isInProgress = item.status === "in_progress" || item.status === "action_required";
  const isTerminal = item.status === "completed" || item.status === "declined" || item.status === "expired" || item.status === "cancelled" || item.status === "voided";
  const isVoided = item.status === "voided";
  const isDeclined = item.status === "declined";
  const isExpired = item.status === "expired";
  const isCompleted = item.status === "completed";


  // Sort recipients by role hierarchy
  const sortedRecipients = [...item.recipients].sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);

  // Calculate signing progress (only count signers/approvers)
  const actionableRecipients = item.recipients.filter(r => 
    r.role === "signer" || r.role === "approver"
  );
  const signedCount = actionableRecipients.filter(r => r.status === "signed").length;
  const totalActionable = actionableRecipients.length;
  const progressPercent = totalActionable > 0 ? (signedCount / totalActionable) * 100 : 0;

  // For sequential: find current step (first non-signed actionable recipient)
  const currentStepIndex = actionableRecipients.findIndex(r => r.status !== "signed" && r.status !== "declined");
  const currentStep = currentStepIndex === -1 ? totalActionable : currentStepIndex + 1;
  const currentSigner = currentStepIndex >= 0 ? actionableRecipients[currentStepIndex] : null;
  const sequentialProgress = totalActionable > 0 ? (signedCount / totalActionable) * 100 : 100;

  // Pending recipients for reminder actions
  const pendingRecipients = item.recipients.filter(r => 
    (r.status === "pending" || r.status === "viewed") && 
    (r.role === "signer" || r.role === "approver")
  );
  const canSendReminders = isSender && isInProgress && pendingRecipients.length > 0;

  // For sequential mode, only the current signer can be reminded
  const remindableRecipient = item.signingMode === "sequential" ? currentSigner : null;

  // Progress text - always show "x of x signed" format for consistency
  const getProgressText = () => {
    return `${signedCount} of ${totalActionable} signed`;
  };

  // Progress microcopy
const getProgressMicrocopy = () => {
    if (item.status === "completed") return "All parties signed. Final document shared with all recipients.";
    if (item.status === "declined") return "Signing stopped — document declined";
    if (item.status === "expired") return "Signing deadline passed";
    if (item.status === "cancelled") return "Request cancelled";
    if (item.status === "voided") return "Request voided — cannot be completed";
    
    if (item.signingMode === "sequential") {
      if (currentSigner) {
        return `Waiting on ${currentSigner.name}`;
      }
      return "All parties signed. Final document shared with all recipients.";
    } else {
      const pendingCount = pendingRecipients.length;
      if (pendingCount === 0) return "All parties signed. Final document shared with all recipients.";
      return `${pendingCount} pending signature${pendingCount > 1 ? "s" : ""}`;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://docsora.com/sign/${item.id}`);
    toast.success("Link copied to clipboard");
  };

  const handleDownload = () => {
    toast.success("Downloading document...");
  };

  const handleDownloadAudit = () => {
    // Show appropriate message based on workflow state
    if (isCompleted) {
      toast.success("Downloading completed audit trail as PDF...");
    } else if (isVoided || isExpired || item.status === "declined") {
      toast.success("Downloading final audit trail as PDF...");
    } else {
      toast.success("Downloading audit trail as PDF (workflow in progress)...");
    }
  };

  const handleSendReminder = (recipientEmail?: string) => {
    if (recipientEmail) {
      toast.success(`Reminder sent to ${recipientEmail}`);
    } else {
      toast.success(`Reminders sent to ${pendingRecipients.length} pending recipients`);
    }
  };

  // Password modal handlers
  const openPasswordModal = (recipient: SignRecipient) => {
    setPasswordModalRecipient(recipient);
    const hasExistingPassword = !!recipientPasswords[recipient.email];
    // If no password exists, go straight to "change" mode
    setPasswordModalMode(hasExistingPassword ? "menu" : "change");
    setPasswordInput(recipientPasswords[recipient.email] || "");
    setShowPassword(false);
    setPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setPasswordModalRecipient(null);
    setPasswordInput("");
    setShowPassword(false);
    setPasswordModalMode("menu");
  };

  const handleSavePassword = () => {
    if (!passwordModalRecipient || !passwordInput.trim()) return;
    
    setRecipientPasswords(prev => ({
      ...prev,
      [passwordModalRecipient.email]: passwordInput
    }));
    toast.success("Password saved", {
      description: `${passwordModalRecipient.name} now requires a password to access.`
    });
    closePasswordModal();
  };

  const handleRemoveRecipientPassword = () => {
    if (!passwordModalRecipient) return;
    
    setRecipientPasswords(prev => {
      const updated = { ...prev };
      delete updated[passwordModalRecipient.email];
      return updated;
    });
    toast.success("Password removed", {
      description: `${passwordModalRecipient.name} can now access without a password.`
    });
    closePasswordModal();
  };

  const handleResendInvite = (recipientEmail: string) => {
    toast.success(`Signing invite resent to ${recipientEmail}`);
  };

  const openRemoveConfirmation = (recipient: SignRecipient) => {
    setRemoveConfirmRecipient(recipient);
    setRemoveConfirmOpen(true);
  };

  const handleConfirmRemoveRecipient = () => {
    if (!removeConfirmRecipient) return;
    toast.success("Recipient removed from signing flow", {
      description: `${removeConfirmRecipient.name} has been removed.`
    });
    setRemoveConfirmOpen(false);
    setRemoveConfirmRecipient(null);
  };

  const handleRestartSigningFlow = () => {
    toast.success("Restarting signing flow...", {
      description: "Previous decline will be cleared."
    });
  };

  // Void request handlers
  const openVoidConfirmation = () => {
    setVoidConfirmOpen(true);
  };

  const handleConfirmVoid = () => {
    toast.success("Signing request voided", {
      description: "The document can no longer be completed. Already signed fields remain visible."
    });
    setVoidConfirmOpen(false);
  };

  // Extend due date handlers (sender)
  const handleExtendDueDate = () => {
    if (!extendDate) return;
    toast.success("Due date extended", {
      description: `New deadline: ${format(extendDate, "MMMM d, yyyy")}${notifyOnExtend ? ". Recipients notified." : ""}`
    });
    setExtendDateOpen(false);
  };

  // Extension request handler (signer/recipient)
  const handleRequestExtension = () => {
    toast.success("Extension request sent to the sender", {
      description: extensionRequestMessage ? "Your message was included." : undefined
    });
    setExtensionRequestOpen(false);
    setExtensionRequestMessage("");
  };

  // Get required fields count for current signer (mock - real app would read from document)
  const getRequiredFieldsCount = () => {
    // Mock data - in real app this would come from the document
    const currentUserRecipient = item.recipients.find(r => r.isCurrentUser);
    const role = currentUserRecipient?.role || "signer";
    // Approvers typically have 1 field, signers have more
    if (role === "approver") return 1;
    return 4; // signature + initials + date fields
  };

  // Format due date with human-readable context and urgency tiers
  const formatDueDateHuman = (date: Date): { text: string; urgency: 'neutral' | 'warning' | 'urgent' | 'expired' } => {
    const now = new Date();
    const hoursUntil = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    const daysUntil = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const formattedDate = format(date, "MMM d, yyyy");
    
    if (hoursUntil <= 0) {
      // Expired
      return { text: `Expired · ${formattedDate}`, urgency: 'expired' };
    } else if (hoursUntil < 24) {
      // <24h → amber + "Urgent"
      return { text: `Urgent · Due in ${hoursUntil}h · ${formattedDate}`, urgency: 'urgent' };
    } else if (hoursUntil <= 48) {
      // <48h → subtle amber
      return { text: `Due in ${Math.ceil(hoursUntil / 24)} day${Math.ceil(hoursUntil / 24) > 1 ? 's' : ''} · ${formattedDate}`, urgency: 'warning' };
    } else {
      // ≥48h → neutral
      return { text: `Due in ${daysUntil} days · ${formattedDate}`, urgency: 'neutral' };
    }
  };

  // Get current user's role and status
  const currentUserRecipient = item.recipients.find(r => r.isCurrentUser);
  const currentUserRole = currentUserRecipient?.role || "signer";
  const isApprover = currentUserRole === "approver";
  const currentUserHasSigned = currentUserRecipient?.status === "signed";
  
  // Signer/Approver who has completed but document is still in progress
  const isSignerCompletedWaitingForOthers = isReceivedDocument && 
    currentUserRecipient && 
    (currentUserRole === "signer" || currentUserRole === "approver") && 
    currentUserHasSigned && 
    !isCompleted && 
    !isTerminal;

  // Download handlers with context awareness
  const handleDownloadOriginal = () => {
    toast.success("Downloading original document...", {
      description: "Unsigned version as uploaded"
    });
  };

  const handleDownloadDraft = () => {
    toast.success("Downloading current state...", {
      description: "Draft with 'In Progress' watermark - not legally final"
    });
  };

  const handleDownloadFinalSigned = () => {
    toast.success("Downloading final signed PDF...", {
      description: "Legally binding document with all signatures"
    });
  };

  const handleDownloadCertificate = () => {
    toast.success("Downloading certificate of completion...", {
      description: "Official signing certificate for your records"
    });
  };

  const handleReviseAndResend = () => {
    setReviseModalOpen(true);
  };

  const handleReviseFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviseFile(file);
    }
  };

  const handleReviseFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.endsWith(".docx"))) {
      setReviseFile(file);
    }
  };

  const handleConfirmReviseAndResend = () => {
    if (!reviseFile) return;

    // IMPORTANT: do not pass the File object through router state (can fail structured cloning)
    const uploaded = reviseFile;

    // Map recipients to the format expected by SignMultipleRecipients
    const RECIPIENT_COLORS = [
      "hsl(221, 83%, 53%)",
      "hsl(142, 71%, 45%)",
      "hsl(280, 67%, 58%)",
      "hsl(24, 95%, 53%)",
      "hsl(340, 82%, 52%)",
      "hsl(173, 80%, 40%)",
    ];

    const prefilledRecipients = item.recipients.map((r, index) => ({
      id: `recipient-${Date.now()}-${index}`,
      fullName: r.name,
      email: r.email,
      role: r.role as "signer" | "approver" | "viewer" | "cc",
      color: RECIPIENT_COLORS[index % RECIPIENT_COLORS.length],
      isSender: false,
      canDelegate: false,
    }));

    // Close modal and navigate to Sign page with pre-populated state
    setReviseModalOpen(false);
    setReviseFile(null);
    onClose();

    // Navigate to /sign (signature setup) with the new document + cloned configuration
    navigate("/sign", {
      state: {
        reviseAndResend: true,
        file: {
          name: uploaded.name,
          type: uploaded.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx",
        },
        prefilledRecipients,
        enforceSigningOrder: item.signingMode === "sequential",
        // Reference only (no lifecycle linking)
        originalRequestId: item.id,
      },
    });
  };

  const handleDownloadOriginalUnsigned = () => {
    toast.success("Downloading original document...", {
      description: "Unsigned version as originally uploaded."
    });
  };

  const handleDownloadDeclinedCopy = () => {
    toast.success("Downloading declined copy...", {
      description: "Original document with decline metadata. Watermark: 'Declined – Not Legally Binding'"
    });
  };

  const handleDownloadVoidRecord = () => {
    toast.success("Downloading void record...", {
      description: "Audit snapshot up to void. Watermark: 'Voided – Workflow Stopped'"
    });
  };

  const handleDownloadExpiredRecord = () => {
    toast.success("Downloading expired record...", {
      description: "Audit snapshot. Watermark: 'Expired – Deadline Passed'"
    });
  };

  // Check if any recipient has interacted (for expired draft availability)
  const hasAnyInteraction = item.recipients.some(r => 
    r.status === "viewed" || r.status === "signed"
  );

  const handleResendForSignature = () => {
    // Map recipients to the format expected by SignMultipleRecipients
    const RECIPIENT_COLORS = [
      "hsl(221, 83%, 53%)",
      "hsl(142, 71%, 45%)",
      "hsl(280, 67%, 58%)",
      "hsl(24, 95%, 53%)",
      "hsl(340, 82%, 52%)",
      "hsl(173, 80%, 40%)",
    ];

    const prefilledRecipients = item.recipients.map((r, index) => ({
      id: `recipient-${Date.now()}-${index}`,
      fullName: r.name,
      email: r.email,
      role: r.role as "signer" | "approver" | "viewer" | "cc",
      color: RECIPIENT_COLORS[index % RECIPIENT_COLORS.length],
      isSender: false,
      canDelegate: false,
    }));

    onClose();

    // Navigate directly to /sign with pre-populated state (matches Declined flow)
    navigate("/sign", {
      state: {
        resendExpired: true,
        file: {
          name: item.name,
          type: item.type,
        },
        prefilledRecipients,
        enforceSigningOrder: item.signingMode === "sequential",
        originalRequestId: item.id,
      },
    });
  };

  // Count quick actions to determine if we should show the label
  const getQuickActionsCount = () => {
    let count = 1; // Download is always available
    if (isSender && !isTerminal) count++; // Void request
    return count;
  };

  const tabs = ["details", "activity", "audit"] as const;

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        "h-[calc(100vh-200px)] sticky top-8 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl overflow-hidden flex flex-col",
        isVoided && "opacity-80"
      )}>
        {/* ========== HEADER SECTION ========== */}
        <div className="p-5 border-b border-border/30">
          {/* Title Row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-base font-semibold text-foreground truncate">
                {item.name.replace(/\.[^/.]+$/, "")}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <FileText className="w-3 h-3" />
                <span>{item.size}</span>
                {item.hasPassword && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <span className="text-border">•</span>
                        <Lock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Protected</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[220px]">
                      <p className="text-xs">This document is password-protected.</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 h-8 w-8 hover:bg-muted">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Status Badge + Due Date */}
          <div className="flex items-center gap-3 mb-4">
            {/* Status badge - context-aware based on role */}
            {(() => {
              const hasAnyDeclined = item.recipients.some(r => r.status === "declined");
              const showDeclinedBadge = isReceivedDocument && hasAnyDeclined && item.status === "action_required";
              
              // CC/Viewer recipients get a neutral "Waiting for others" badge instead of action badges
              const isCCOrViewer = isReceivedDocument && currentUserRecipient && (currentUserRole === "cc" || currentUserRole === "viewer");
              // Signers/Approvers in sequential mode waiting for their turn also get "Waiting for others"
              const isSignerWaitingForTurn = isReceivedDocument && item.status === "waiting" && currentUserRecipient && (currentUserRole === "signer" || currentUserRole === "approver");
              // Signers/Approvers who have completed but doc is still in progress also get "Waiting for others"
              const showWaitingBadge = (isCCOrViewer || isSignerWaitingForTurn || isSignerCompletedWaitingForOthers) && !isTerminal && !isCompleted;
              
              // Determine badge styling and content
              const waitingTooltip = isSignerCompletedWaitingForOthers
                ? "You've completed your part. Waiting for other participants to finish."
                : (isCCOrViewer 
                  ? "You've been copied on this document. No action is required from you."
                  : "You'll be notified when it's your turn to sign.");
              
              const badgeConfig = showWaitingBadge 
                ? {
                    bg: "bg-muted/30 border-muted/40",
                    color: "text-muted-foreground",
                    label: "Waiting for others",
                    icon: <Clock className="w-3 h-3" />,
                    tooltip: waitingTooltip
                  }
                : showDeclinedBadge
                  ? {
                      bg: "bg-red-500/10 border-red-500/30",
                      color: "text-red-500",
                      label: "Declined",
                      icon: <XCircle className="w-3 h-3" />,
                      tooltip: "A recipient has declined this document. Signing is no longer possible."
                    }
                  : {
                      bg: cn(status.bg),
                      color: status.color,
                      label: isVoided ? "VOIDED" : status.label,
                      icon: isVoided ? <Ban className="w-3 h-3" /> 
                            : item.status === "action_required" ? <AlertCircle className="w-3 h-3" />
                            : item.status === "in_progress" ? <Clock className="w-3 h-3" />
                            : item.status === "completed" ? <CheckCircle2 className="w-3 h-3" />
                            : item.status === "declined" ? <XCircle className="w-3 h-3" />
                            : item.status === "expired" ? <Clock className="w-3 h-3" />
                            : item.status === "cancelled" ? <XCircle className="w-3 h-3" />
                            : null,
                      tooltip: isVoided 
                        ? "The sender stopped this signing request. The document cannot be completed."
                        : status.description
                    };
              
              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex cursor-help">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium gap-1.5 text-xs select-none cursor-help border",
                          badgeConfig.bg, badgeConfig.color
                        )}
                      >
                        {badgeConfig.icon}
                        {badgeConfig.label}
                      </Badge>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[220px]">
                    <p className="text-xs">{badgeConfig.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })()}

            {/* Due date - SENDER VIEW (default format) */}
            {item.expiresAt && !isTerminal && isSender && (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Due {format(item.expiresAt, "MMM d, yyyy")}
                </span>
                {/* Extend button - only for sender with non-terminal status */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => setExtendDateOpen(true)}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Extend due date</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            
            {/* Due date - RECEIVER VIEW (human-readable with urgency styling) */}
            {item.expiresAt && !isTerminal && isReceivedDocument && (
              (() => {
                const dueInfo = formatDueDateHuman(item.expiresAt);
                const urgencyStyles = {
                  neutral: "text-muted-foreground",
                  warning: "text-muted-foreground",
                  urgent: "text-muted-foreground font-medium",
                  expired: "text-red-500 dark:text-red-400 font-medium"
                };
                return (
                  <span className={cn(
                    "text-xs flex items-center gap-1.5 ml-auto",
                    urgencyStyles[dueInfo.urgency]
                  )}>
                    <Calendar className="w-3 h-3" />
                    {dueInfo.text}
                  </span>
                );
              })()
            )}
          </div>

          {/* ========== SIGNING MODE + PROGRESS ========== */}
          {/* For voided: show single explanation banner */}
          {isVoided ? (
            <div className="mb-3 p-3 rounded-xl border bg-red-900/10 border-red-800/20">
              <p className="text-sm text-red-700/80 font-medium">
                Voided by {isSender ? "you" : "the sender"} — workflow stopped.
              </p>
              {item.lastActivity && (
                <p className="text-xs text-muted-foreground mt-1">
                  {format(item.lastActivity, "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
            </div>
          ) : isDeclined ? (
            <div className="mb-3 p-3 rounded-xl border bg-red-900/10 border-red-800/20">
              <p className="text-sm text-red-700/80 font-medium">
                Declined by {item.declinedBy?.name || "a recipient"}
              </p>
              {item.declinedBy?.declinedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  {format(item.declinedBy.declinedAt, "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
              <p className="text-xs text-muted-foreground/70 mt-2">
                Workflow stopped. No further actions required.
              </p>
              {/* Show decline reason only to sender */}
              {isSender && item.declinedBy?.reason && (
                <p className="text-xs text-foreground/70 mt-2 italic bg-muted/30 rounded-lg p-2">
                  "{item.declinedBy.reason}"
                </p>
              )}
              {/* For recipients, show muted message */}
              {!isSender && item.declinedBy?.reason && (
                <p className="text-xs text-muted-foreground/50 mt-2 italic">
                  Decline reason visible to the sender.
                </p>
              )}
            </div>
          ) : isExpired ? (
            <div className="mb-3 p-3 rounded-xl border bg-orange-500/10 border-orange-500/20">
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                Signing deadline passed
              </span>
              <p className="text-xs text-muted-foreground mt-2">
                This request expired before all required actions were completed. No further actions can be taken.
              </p>
              {item.expiresAt && (
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  Expired on {format(item.expiresAt, "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
            </div>
          ) : totalActionable > 0 && (
            <div className={cn(
              "mb-4 p-3 rounded-xl border relative overflow-hidden",
              isCompleted 
                ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                : "bg-blue-500/5 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
            )}>
              {/* Premium glow animation for all non-completed statuses */}
              {!isCompleted && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent pointer-events-none"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
              
              {/* Signing Mode Row */}
              <div className="flex items-center justify-between mb-2.5 relative z-10">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help">
                        {item.signingMode === "sequential" ? (
                          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className="text-xs font-medium text-foreground capitalize">
                          {item.signingMode}
                        </span>
                        <Info className="w-3 h-3 text-muted-foreground/50" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="text-xs">{signingModeTooltips[item.signingMode]}</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-muted-foreground/40">•</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground cursor-help">
                        {getProgressText()}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">
                        {signedCount} signed, {totalActionable - signedCount} remaining
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Progress Bar with blue glow */}
              <div className={cn(
                "relative",
                isCompleted && "after:absolute after:inset-0 after:bg-emerald-500/20 after:blur-sm after:rounded-full after:-z-10"
              )}>
                <Progress 
                  value={item.signingMode === "sequential" ? sequentialProgress : progressPercent} 
                  className={cn(
                    "h-1.5 relative z-10 transition-all duration-500",
                    isCompleted 
                      ? "[&>div]:bg-emerald-500 [&>div]:shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "[&>div]:bg-blue-500 [&>div]:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  )}
                />
              </div>
              
              {/* Helper text under progress bar for CC/viewer recipients */}
              {isReceivedDocument && currentUserRecipient && (currentUserRole === "cc" || currentUserRole === "viewer") && !isTerminal && (
                <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">
                  Waiting for others.
                </p>
              )}
            </div>
          )}

          {/* ========== SIGNER-FIRST CTA for action_required (received) - NOT for CC/Viewer ========== */}
          {item.status === "action_required" && isReceivedDocument && currentUserRole !== "cc" && currentUserRole !== "viewer" && (() => {
            // Check if any recipient has declined - blocks signing
            const hasAnyDeclined = item.recipients.some(r => r.status === "declined");
            const declinedRecipient = item.recipients.find(r => r.status === "declined");
            const canSign = !hasAnyDeclined && item.status === "action_required";
            
            return (
              <div className="space-y-4">
                {/* Declined blocker banner - if any recipient declined */}
                {hasAnyDeclined && declinedRecipient && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-400">
                          Document declined
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          This document can't be signed because {declinedRecipient.name} has declined.
                        </p>
                        {declinedRecipient.declineReason && (
                          <p className="text-xs text-foreground/70 mt-2 italic bg-muted/30 rounded-lg p-2">
                            "{declinedRecipient.declineReason}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Signer-specific helper line */}
                {!hasAnyDeclined && (
                  <p className="text-sm text-foreground">
                    {isApprover 
                      ? "Your approval is required to complete this document." 
                      : "Your signature is required to complete this document."}
                  </p>
                )}
                
                {/* Required fields count - concise copy */}
                {!hasAnyDeclined && (
                  <p className="text-xs text-muted-foreground">
                    {getRequiredFieldsCount()} field{getRequiredFieldsCount() > 1 ? 's' : ''} remaining
                  </p>
                )}
                
                {/* Primary CTA - full width, dominant */}
                <Button 
                  onClick={() => {
                    const route = isApprover 
                      ? `/approve/received/${item.id}` 
                      : `/sign/received/${item.id}`;
                    navigate(route, { 
                      state: { 
                        documentName: item.name,
                        senderName: item.sender?.name,
                        dueDate: item.expiresAt,
                        isProtected: item.hasPassword
                      }
                    });
                  }}
                  className="w-full gap-2 h-11"
                  disabled={!canSign}
                >
                  {isApprover ? <Check className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                  {isApprover ? "Review & Approve" : "Review & Sign"}
                </Button>
                
                {/* Disabled state explanation */}
                {!canSign && hasAnyDeclined && (
                  <p className="text-xs text-muted-foreground/60 text-center">
                    Signing is unavailable because a recipient has declined.
                  </p>
                )}
                
                {/* Post-action outcome confirmation - only when signing is available */}
                {canSign && (
                  <p className="text-xs text-muted-foreground/60 text-center">
                    Once {isApprover ? "approved" : "signed"}, the final document will be shared with all parties.
                  </p>
                )}
                
                {/* Secondary actions - explicit visible buttons, not hidden in dropdown */}
                {/* Request deadline extension - only if due date exists and user can sign */}
                {canSign && item.expiresAt && (
                  <div className="flex items-center justify-center pt-2">
                    <button
                      onClick={() => setExtensionRequestOpen(true)}
                      className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      Request deadline extension
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ========== SIGNER WAITING FOR TURN (Sequential) ========== */}
          {item.status === "waiting" && isReceivedDocument && currentUserRecipient && (currentUserRole === "signer" || currentUserRole === "approver") && !isCompleted && !isTerminal && (() => {
            // Find the previous signer's name (the blocking signer)
            const actionableRecipients = item.recipients.filter(r => 
              r.role === "signer" || r.role === "approver"
            );
            const currentUserIndex = actionableRecipients.findIndex(r => r.isCurrentUser);
            const previousSigner = currentUserIndex > 0 ? actionableRecipients[currentUserIndex - 1] : null;
            const previousSignerName = previousSigner?.name?.split(' ')[0] || "the previous signer";
            
            return (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-foreground">
                    Waiting for {previousSignerName} to sign
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You'll be able to sign as soon as they complete their step. We'll notify you by email when it's your turn.
                  </p>
                </div>
                
                {/* Disabled primary CTA with helper text */}
                <div className="space-y-2">
                  <Button 
                    disabled 
                    className="w-full gap-2 h-11 bg-muted/40 text-muted-foreground/60 border border-border/40 cursor-not-allowed hover:bg-muted/40"
                  >
                    {isApprover ? <Check className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                    {isApprover ? "Review & Approve" : "Review & Sign"}
                  </Button>
                  <p className="text-xs text-muted-foreground/60 text-center">
                    Available once the previous signer completes their action
                  </p>
                </div>
              </div>
            );
          })()}

          {/* ========== SIGNER/APPROVER COMPLETED - WAITING FOR OTHERS ========== */}
          {isSignerCompletedWaitingForOthers && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">
                  Waiting for others
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You've completed your part. We'll notify you by email once all remaining participants finish their actions.
                </p>
              </div>
              
              {/* View document button - blue primary style */}
              <Button 
                onClick={() => {
                  navigate("/signed-document-viewer", {
                    state: {
                      document: {
                        id: item.id,
                        name: item.name,
                        type: item.type,
                        size: item.size,
                      },
                      allowDownload: true,
                      allowShare: false,
                      showWatermark: true,
                      returnState: {
                        activeTab: "sign" as const,
                        subTab: isReceivedDocument ? "received" as const : "sent" as const,
                      },
                    }
                  });
                }}
                className="w-full gap-2 h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Eye className="w-4 h-4" />
                View document
              </Button>
            </div>
          )}

          {/* ========== VIEWER WAITING STATE ========== */}
          {isReceivedDocument && currentUserRecipient && currentUserRole === "viewer" && !isCompleted && !isTerminal && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  No action required.
                </p>
                <p className="text-sm text-muted-foreground">
                  Notifications are enabled. View this document for reference. The final signed document will be sent once signing is complete.
                </p>
              </div>
              
              {/* Primary View Document button - blue like Review & Sign */}
              <Button 
                onClick={() => {
                  navigate("/signed-document-viewer", {
                    state: {
                      document: {
                        id: item.id,
                        name: item.name,
                        type: item.type,
                        size: item.size,
                      },
                      allowDownload: true,
                      allowShare: false,
                      showWatermark: true,
                      returnState: {
                        activeTab: "sign" as const,
                        subTab: isReceivedDocument ? "received" as const : "sent" as const,
                      },
                    }
                  });
                }}
                className="w-full gap-2 h-11"
              >
                <Eye className="w-4 h-4" />
                View document
              </Button>
            </div>
          )}

          {/* ========== CC WAITING STATE ========== */}
          {isReceivedDocument && currentUserRecipient && currentUserRole === "cc" && !isCompleted && !isTerminal && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  No action required.
                </p>
                <p className="text-sm text-muted-foreground">
                  Notifications are enabled. You'll receive email updates as participants complete their actions, and the final signed document once signing is complete.
                </p>
              </div>
              
              {/* Disabled download button - locked until completion */}
              <div className="space-y-2">
                <Button 
                  disabled 
                  className="w-full gap-2 h-11 text-sm font-medium bg-muted/50 text-muted-foreground/50 border-border/30 cursor-not-allowed hover:bg-muted/50"
                >
                  <Download className="w-4 h-4" />
                  Download signed document
                </Button>
                <p className="text-xs text-muted-foreground/60 text-center">
                  Available once signing is complete.
                </p>
              </div>
            </div>
          )}

          {/* ========== VOIDED STATE - RECEIVED (Non-sender) ========== */}
          {isVoided && isReceivedDocument && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-sm font-medium text-muted-foreground">
                  This document has been voided
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  The sender stopped this signing request. This workflow has ended and no further actions are required from any participant.
                </p>
              </div>
            </div>
          )}

          {/* Expired state for received documents - no additional box needed, banner above is sufficient */}

          {/* Declined state is handled in the single consolidated card above - no duplicate here */}

          {/* ========== COMPLETED STATE CTAs ========== */}
          {isCompleted && (
            <div className="space-y-3">
              <Button onClick={handleDownloadFinalSigned} className="w-full gap-2 h-11 text-sm font-medium">
                <FileDown className="w-4 h-4" />
                Download Signed PDF
              </Button>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={handleDownloadAudit}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                >
                  Download audit trail
                </button>
                <span className="text-muted-foreground/30">•</span>
                <button 
                  onClick={handleDownloadCertificate}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                >
                  Download certificate of completion
                </button>
              </div>
            </div>
          )}

          {/* ========== DECLINED STATE CTAs (Sender only) ========== */}
          {isDeclined && isSender && (
            <div className="space-y-2 mt-3">
              <Button onClick={handleReviseAndResend} size="sm" className="w-full gap-2 h-9">
                <RefreshCw className="w-3.5 h-3.5" />
                Revise & Resend
              </Button>
              {/* Download dropdown for Declined */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 h-8 text-xs justify-center"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-72 bg-popover border border-border z-50">
                  <DropdownMenuItem onClick={handleDownloadOriginalUnsigned} className="gap-2.5 text-xs cursor-pointer py-2.5">
                    <Download className="w-4 h-4 opacity-70 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">Download original (unsigned)</span>
                      <span className="text-[10px] text-muted-foreground">Original file as uploaded</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadDeclinedCopy} className="gap-2.5 text-xs cursor-pointer py-2.5">
                    <Files className="w-4 h-4 text-red-500 shrink-0" />
                    <div className="flex flex-col">
                      <span>Download declined copy</span>
                      <span className="text-[10px] text-muted-foreground">Original + decline metadata · Watermark applied</span>
                    </div>
                  </DropdownMenuItem>
                  <div className="px-2 py-2 mt-1 mx-1 mb-1 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-[10px] text-red-500 dark:text-red-400 flex items-start gap-1.5">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>Declined copies include a "Declined – Not Legally Binding" watermark.</span>
                    </p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* ========== EXPIRED STATE CTAs ========== */}
          {isExpired && isSender && (
            <div className="space-y-2 mt-3">
              <Button onClick={handleResendForSignature} size="sm" className="w-full gap-2 h-9">
                <RefreshCw className="w-3.5 h-3.5" />
                Resend for Signature
              </Button>
              {/* Download dropdown for Expired */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 h-8 text-xs justify-center"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-72 bg-popover border border-border z-50">
                  <DropdownMenuItem onClick={handleDownloadOriginalUnsigned} className="gap-2.5 text-xs cursor-pointer py-2.5">
                    <Download className="w-4 h-4 opacity-70 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">Download original (unsigned)</span>
                      <span className="text-[10px] text-muted-foreground">Original file as uploaded</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadExpiredRecord} className="gap-2.5 text-xs cursor-pointer py-2.5">
                    <Files className="w-4 h-4 text-orange-500 shrink-0" />
                    <div className="flex flex-col">
                      <span>Download expired record</span>
                      <span className="text-[10px] text-muted-foreground">Audit snapshot · Watermark applied</span>
                    </div>
                  </DropdownMenuItem>
                  <div className="px-2 py-2 mt-1 mx-1 mb-1 rounded bg-orange-500/10 border border-orange-500/20">
                    <p className="text-[10px] text-orange-600 dark:text-orange-400 flex items-start gap-1.5">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>Expired records include an "Expired – Deadline Passed" watermark.</span>
                    </p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                Creates a new signing request using the same document and recipients.
              </p>
            </div>
          )}

          {/* ========== VOIDED STATE CTAs ========== */}
          {isVoided && isSender && (
            <div className="mt-3">
              {/* Download dropdown for Voided - no resend CTAs */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 h-9 text-xs justify-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-72 bg-popover border border-border z-50">
                  <DropdownMenuItem onClick={handleDownloadOriginalUnsigned} className="gap-2.5 text-xs cursor-pointer py-2.5">
                    <Download className="w-4 h-4 opacity-70 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">Download original (unsigned)</span>
                      <span className="text-[10px] text-muted-foreground">Original file as uploaded</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadVoidRecord} className="gap-2.5 text-xs cursor-pointer py-2.5">
                    <Files className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0" />
                    <div className="flex flex-col">
                      <span>Download void record</span>
                      <span className="text-[10px] text-muted-foreground">Audit snapshot up to void · Watermark applied</span>
                    </div>
                  </DropdownMenuItem>
                  <div className="px-2 py-2 mt-1 mx-1 mb-1 rounded bg-red-900/10 border border-red-800/20">
                    <p className="text-[10px] text-red-700 dark:text-red-400 flex items-start gap-1.5">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>Void records include a "Voided – Workflow Stopped" watermark.</span>
                    </p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* ========== TABS ========== */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Navigation - Transfer style with animated underline */}
          <div className="flex border-b border-border/50 px-5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative py-3 px-4 text-sm capitalize transition-colors",
                  activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="signPanelTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ========== SCROLLABLE CONTENT ========== */}
          <div className="flex-1 overflow-y-auto">
            {/* ========== DETAILS TAB ========== */}
            <TabsContent value="details" className="mt-0 h-full">
              <div className={cn("p-5", isTerminal && "py-4")}>
                {/* Recipients Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("text-sm font-medium", isVoided ? "text-muted-foreground" : "text-foreground")}>Recipients</h3>
                    {!isVoided && item.signingMode === "sequential" && totalActionable > 1 && (
                      <span className="text-xs text-muted-foreground/60">
                        (1 → {totalActionable})
                      </span>
                    )}
                  </div>
                  
                  {/* Reminder button - contextual - hidden when voided */}
                  {!isVoided && canSendReminders && (
                    item.signingMode === "sequential" && remindableRecipient ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                        onClick={() => handleSendReminder(remindableRecipient.email)}
                      >
                        <Bell className="w-3 h-3" />
                        Remind current signer
                      </Button>
                    ) : item.signingMode === "parallel" && pendingRecipients.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                        onClick={() => handleSendReminder()}
                      >
                        <Bell className="w-3 h-3" />
                        Remind all pending
                      </Button>
                    )
                  )}
                </div>

                {/* Helper caption for received documents with pending action */}
                {isReceivedDocument && (item.status === "action_required" || item.status === "waiting") && (
                  <p className="text-xs text-muted-foreground/60 mb-3">
                    This document will be completed once all required participants finish their actions.
                  </p>
                )}
                
                {/* Sender info for received docs - red outline when voided, otherwise de-emphasized */}
                {isReceivedDocument && item.sender && (
                  <div className={cn(
                    "mt-3 p-2.5 rounded-lg",
                    isVoided 
                      ? "bg-transparent border border-red-500/50 ring-1 ring-red-500/20"
                      : "bg-muted/10 border border-border/20"
                  )}>
                    <div className="flex items-center gap-2.5">
                      <Avatar className={cn(
                        "w-6 h-6",
                        isVoided ? "ring-2 ring-red-500/50" : "opacity-50"
                      )}>
                        <AvatarFallback className={cn(
                          "text-[9px]",
                          isVoided 
                            ? "bg-red-500/20 text-red-500"
                            : "bg-muted/50 text-muted-foreground/60"
                        )}>
                          {item.sender.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "text-xs truncate",
                          isVoided ? "text-foreground" : "text-muted-foreground/70"
                        )}>{item.sender.name}</div>
                        <div className="text-[10px] text-muted-foreground/50 truncate">{item.sender.email}</div>
                      </div>
                      {isVoided ? (
                        <Badge 
                          variant="outline" 
                          className="text-[10px] font-medium border bg-transparent border-red-500/60 text-red-500"
                        >
                          Voided
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50">
                          Sender
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Recipients List - sorted by role hierarchy */}
                <div className="space-y-2">
                  {sortedRecipients.map((recipient, i) => {
                    const actionableIndex = actionableRecipients.findIndex(r => r.email === recipient.email);
                    const isActionable = actionableIndex !== -1;
                    
                    return (
                      <RecipientRow 
                        key={recipient.email} 
                        recipient={recipient}
                        orderIndex={actionableIndex >= 0 ? actionableIndex : -1}
                        signingMode={item.signingMode}
                        isCurrentSigner={item.signingMode === "sequential" && isActionable && actionableIndex === currentStepIndex && !isTerminal}
                        isWaitingForTurn={item.signingMode === "sequential" && isActionable && actionableIndex > currentStepIndex && recipient.status !== "signed" && recipient.status !== "declined" && !isTerminal}
                        canSendReminder={
                          !isVoided &&
                          canSendReminders && 
                          isActionable &&
                          (recipient.status === "pending" || recipient.status === "viewed") &&
                          (item.signingMode === "parallel" || actionableIndex === currentStepIndex)
                        }
                        isSender={isSender}
                        hasPassword={item.hasPassword}
                        recipientHasPassword={!!recipientPasswords[recipient.email]}
                        isTerminal={isTerminal}
                        itemStatus={item.status}
                        isVoided={isVoided}
                        isDocumentCompleted={isCompleted}
                        onSendReminder={() => handleSendReminder(recipient.email)}
                        onOpenPasswordSettings={() => openPasswordModal(recipient)}
                        onResendInvite={() => handleResendInvite(recipient.email)}
                        onRemoveRecipient={() => openRemoveConfirmation(recipient)}
                        onRestartFlow={handleRestartSigningFlow}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="px-5">
                <Separator className="bg-border/30" />
              </div>

              {/* ========== QUICK ACTIONS - Only show for In Progress ========== */}
              {isInProgress && isSender && (
                <div className="p-5 pt-4">
                  {getQuickActionsCount() > 1 && (
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
                  )}
                  
                  {/* Download with Context-Aware Submenu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-9 text-xs text-muted-foreground hover:text-foreground gap-1.5 bg-muted/30 justify-center"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-64 bg-popover border border-border z-50">
                      <DropdownMenuItem onClick={handleDownloadOriginal} className="gap-2.5 text-xs cursor-pointer">
                        <FileText className="w-4 h-4 opacity-70" />
                        <div className="flex flex-col">
                          <span className="font-medium">Download original (unsigned)</span>
                          <span className="text-[10px] text-muted-foreground">Exact file as uploaded</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownloadDraft} className="gap-2.5 text-xs cursor-pointer">
                        <Files className="w-4 h-4 text-amber-500" />
                        <div className="flex flex-col">
                          <span>Download draft (with signatures so far)</span>
                          <span className="text-[10px] text-muted-foreground">Includes "In Progress" watermark</span>
                        </div>
                      </DropdownMenuItem>
                      <div className="px-2 py-1.5 mt-1 mx-1 rounded bg-amber-500/10 border border-amber-500/20">
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                          Draft downloads are not legally final and include a watermark.
                        </p>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Void Request Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={openVoidConfirmation}
                        className="w-full h-9 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 bg-muted/30 justify-center mt-2"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Void request
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[220px]">
                      <p className="text-xs">Stops the signing process. The document can no longer be completed.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-0 h-full">
              <ActivityTabContent 
                activities={item.activities}
                isCompleted={item.status === "completed"}
                isVoided={item.status === "voided"}
                isDeclined={item.status === "declined"}
                isExpired={item.status === "expired"}
                declinedBy={item.declinedBy}
                lastActivity={item.lastActivity}
                expiresAt={item.expiresAt}
                sentAt={item.sentAt}
                isSender={isSender}
                senderName={isSender ? "You" : "Sender"}
              />
            </TabsContent>

            {/* ========== AUDIT TAB ========== */}
            <TabsContent value="audit" className="mt-0 h-full">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">Audit Log</h3>
                    {/* Status indicator badge */}
                    {isCompleted ? (
                      <Badge variant="outline" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                        Completed
                      </Badge>
                    ) : isVoided ? (
                      <Badge variant="outline" className="text-[10px] h-5 bg-red-500/10 text-red-500 border-red-500/30">
                        Voided
                      </Badge>
                    ) : item.status === "declined" ? (
                      <Badge variant="outline" className="text-[10px] h-5 bg-red-500/10 text-red-500 border-red-500/30">
                        Declined
                      </Badge>
                    ) : isExpired ? (
                      <Badge variant="outline" className="text-[10px] h-5 bg-orange-500/10 text-orange-500 border-orange-500/30">
                        Expired
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] h-5 bg-blue-500/10 text-blue-500 border-blue-500/30">
                        In Progress
                      </Badge>
                    )}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs gap-1.5"
                        onClick={handleDownloadAudit}
                      >
                        <Download className="w-3 h-3" />
                        Download audit trail
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[220px]">
                      <p className="text-xs">
                        {isCompleted 
                          ? "Export completed audit trail as PDF for legal/compliance records"
                          : isVoided || item.status === "declined" || isExpired
                            ? "Export final audit trail as PDF for legal/compliance records"
                            : "Export current audit trail as PDF. Note: Workflow is still in progress."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Status-aware description */}
                <p className="text-xs text-muted-foreground mb-4">
                  {isCompleted 
                    ? "Complete immutable record of all document events. Timestamps in UTC."
                    : isVoided || item.status === "declined" || isExpired
                      ? "Final immutable record of all document events. Timestamps in UTC."
                      : "Workflow in progress — this audit reflects events recorded up to the time of download. Timestamps in UTC."}
                </p>

                {item.auditLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No audit entries yet
                  </p>
                ) : (
                  <div className="space-y-0 border border-border/30 rounded-xl overflow-hidden">
                    {item.auditLog
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .map((entry, index) => (
                        <AuditRow 
                          key={entry.id} 
                          entry={entry} 
                          isLast={index === item.auditLog.length - 1}
                        />
                      ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* ========== PASSWORD SETTINGS MODAL ========== */}
        <Dialog open={passwordModalOpen} onOpenChange={(open) => !open && closePasswordModal()}>
          <DialogContent className="sm:max-w-[360px]">
            <DialogHeader>
              <DialogTitle>Password settings</DialogTitle>
              <DialogDescription>
                {passwordModalRecipient && (() => {
                  const hasExistingPassword = !!recipientPasswords[passwordModalRecipient.email];
                  return hasExistingPassword 
                    ? `Manage password protection for ${passwordModalRecipient.name}.`
                    : `Add password protection for ${passwordModalRecipient.name}.`;
                })()}
              </DialogDescription>
            </DialogHeader>
            
            {/* Menu mode - show options when password exists */}
            {passwordModalMode === "menu" && passwordModalRecipient && (() => {
              const hasExistingPassword = !!recipientPasswords[passwordModalRecipient.email];
              
              if (!hasExistingPassword) return null;
              
              return (
                <div className="space-y-2 py-2">
                  {/* View current password */}
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                      Current password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={recipientPasswords[passwordModalRecipient.email] || ""}
                        readOnly
                        className="pr-10 bg-muted/20"
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
                  
                  {/* Action buttons */}
                  <button
                    onClick={() => {
                      setPasswordModalMode("change");
                      setPasswordInput(recipientPasswords[passwordModalRecipient.email] || "");
                      setShowPassword(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors hover:bg-muted"
                  >
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span>Change password</span>
                  </button>
                  <button
                    onClick={handleRemoveRecipientPassword}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors hover:bg-muted text-red-400"
                  >
                    <LockOpen className="w-4 h-4" />
                    <span>Remove password</span>
                  </button>
                </div>
              );
            })()}
            
            {/* Change/Set password mode */}
            {passwordModalMode === "change" && passwordModalRecipient && (() => {
              const hasExistingPassword = !!recipientPasswords[passwordModalRecipient.email];
              
              return (
                <div className="space-y-4 py-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {hasExistingPassword ? "New password" : "Password"}
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
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
                    <p className="text-xs text-muted-foreground mt-2">
                      This password will be required to access the signing link.
                    </p>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    {hasExistingPassword && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setPasswordModalMode("menu");
                          setShowPassword(false);
                          setPasswordInput("");
                        }}
                      >
                        Back
                      </Button>
                    )}
                    <Button 
                      onClick={handleSavePassword}
                      disabled={!passwordInput.trim()}
                    >
                      {hasExistingPassword ? "Update password" : "Set password"}
                    </Button>
                  </DialogFooter>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Remove Recipient Confirmation Modal */}
        <Dialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <UserMinus className="w-5 h-5" />
                Remove from signing flow
              </DialogTitle>
              <DialogDescription className="pt-2 text-sm leading-relaxed">
                {removeConfirmRecipient && (
                  <>
                    <span className="font-medium text-foreground">{removeConfirmRecipient.name}</span> will be removed from this signing flow. They will no longer receive notifications or be able to sign this document.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="py-3 px-4 bg-destructive/5 rounded-lg border border-destructive/20 mt-2">
              <p className="text-xs text-destructive/80 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>This action cannot be undone. If you need this recipient to sign later, you'll need to create a new signing request.</span>
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setRemoveConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmRemoveRecipient}
              >
                Remove recipient
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Void Request Confirmation Modal */}
        <Dialog open={voidConfirmOpen} onOpenChange={setVoidConfirmOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Ban className="w-5 h-5" />
                Void signing request
              </DialogTitle>
              <DialogDescription className="pt-2 text-sm leading-relaxed">
                This will permanently stop the signing process. <span className="font-medium text-foreground">{item.name}</span> can no longer be completed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="py-3 px-4 bg-muted/30 rounded-lg border border-border/30">
                <h4 className="text-xs font-medium text-foreground mb-2">What happens when you void:</h4>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground/60">•</span>
                    Recipients can no longer sign or access the document
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground/60">•</span>
                    Already collected signatures remain visible but are void
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground/60">•</span>
                    You can start a new signing request with the same document
                  </li>
                </ul>
              </div>
              <div className="py-3 px-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <p className="text-xs text-destructive/80 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>This action cannot be undone.</span>
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setVoidConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmVoid}
              >
                Void request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revise & Resend Modal */}
        <Dialog open={reviseModalOpen} onOpenChange={(open) => { if (!open) { setReviseModalOpen(false); setReviseFile(null); }}}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Revise & Resend
              </DialogTitle>
              <DialogDescription className="pt-1">
                Upload a revised document to start a new signing request with the same recipients.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              {/* Original request info */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Original document • {item.recipients.length} recipient{item.recipients.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload zone */}
              <div 
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
                  reviseFile 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                )}
                onClick={() => document.getElementById("revise-file-input")?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleReviseFileDrop}
              >
                <input 
                  type="file" 
                  id="revise-file-input" 
                  className="hidden" 
                  accept=".pdf,.docx"
                  onChange={handleReviseFileSelect}
                />
                {reviseFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileCheck className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{reviseFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(reviseFile.size / 1024 / 1024).toFixed(2)} MB • Click to change
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Files className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-foreground font-medium">Drop revised document here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse • PDF, DOCX</p>
                  </>
                )}
              </div>

              {/* What happens next */}
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <h4 className="text-xs font-medium text-blue-500 mb-2">What happens next:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500/60">1.</span>
                    You'll place signature fields on the new document
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500/60">2.</span>
                    Recipients will receive a fresh signing request
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500/60">3.</span>
                    The declined request remains archived for reference
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => {
                  setReviseModalOpen(false);
                  setReviseFile(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmReviseAndResend}
                disabled={!reviseFile}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Continue to signature setup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Extend Due Date Modal */}
        <Dialog open={extendDateOpen} onOpenChange={setExtendDateOpen}>
          <DialogContent className="sm:max-w-[380px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-primary" />
                Extend due date
              </DialogTitle>
              <DialogDescription className="pt-1">
                Select a new deadline for this signing request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Current deadline info */}
              {item.expiresAt && (
                <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-muted-foreground">Current deadline</span>
                  <span className="font-medium">{format(item.expiresAt, "MMM d, yyyy")}</span>
                </div>
              )}
              
              {/* Date Picker */}
              <div className="flex justify-center">
                <CalendarComponent
                  mode="single"
                  selected={extendDate}
                  onSelect={setExtendDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border pointer-events-auto"
                />
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                All recipients will be notified of the updated deadline. Pending recipients will be asked to take action, while signed recipients will receive an informational update.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setExtendDateOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleExtendDueDate}
                disabled={!extendDate}
              >
                Extend deadline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========== EXTENSION REQUEST MODAL (Signer/Recipient only) ========== */}
        <Dialog open={extensionRequestOpen} onOpenChange={setExtensionRequestOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Request deadline extension
              </DialogTitle>
              <DialogDescription className="pt-1">
                Send a request to the sender to extend the signing deadline.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Current deadline info */}
              {item.expiresAt && (
                <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-muted-foreground">Current deadline</span>
                  <span className="font-medium">{format(item.expiresAt, "MMM d, yyyy")}</span>
                </div>
              )}
              
              {/* Optional message */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Message to sender <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <Textarea
                  placeholder="Briefly explain why you need more time..."
                  value={extensionRequestMessage}
                  onChange={(e) => setExtensionRequestMessage(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                The sender will receive your request and decide whether to extend the deadline.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => {
                  setExtensionRequestOpen(false);
                  setExtensionRequestMessage("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleRequestExtension}>
                Send request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


      </div>
    </TooltipProvider>
  );
}

// ========== RECIPIENT ROW COMPONENT ==========
interface RecipientRowProps {
  recipient: SignRecipient;
  orderIndex: number;
  signingMode: SigningMode;
  isCurrentSigner: boolean;
  isWaitingForTurn: boolean;
  canSendReminder: boolean;
  isSender: boolean;
  hasPassword: boolean;
  recipientHasPassword: boolean;
  isTerminal: boolean;
  itemStatus: SignItem["status"];
  isVoided: boolean;
  onSendReminder: () => void;
  onOpenPasswordSettings: () => void;
  onResendInvite: () => void;
  onRemoveRecipient: () => void;
  onRestartFlow: () => void;
  isDocumentCompleted: boolean;
}

// Disabled reason tooltips
const getRemoveDisabledReason = (recipient: SignRecipient): string | null => {
  if (recipient.status === "signed") {
    return "This recipient has already signed and cannot be removed.";
  }
  return null;
};

function RecipientRow({ 
  recipient,
  orderIndex,
  signingMode,
  isCurrentSigner,
  isWaitingForTurn,
  canSendReminder,
  isSender,
  hasPassword,
  recipientHasPassword,
  isTerminal,
  itemStatus,
  isVoided,
  onSendReminder,
  onOpenPasswordSettings,
  onResendInvite,
  onRemoveRecipient,
  onRestartFlow,
  isDocumentCompleted
}: RecipientRowProps) {
  const roleConfig = recipientRoleConfig[recipient.role];
  const isActionable = roleConfig.requiresAction;
  const isNonSigner = !isActionable;
  const isExpired = itemStatus === "expired";
  const isClosedTerminal = isVoided || isExpired || itemStatus === "declined"; // Voided, expired, and declined are read-only

  // Role-aware label helpers
  const isApproverRole = recipient.role === "approver";
  const completedLabel = isApproverRole ? "Approved" : "Signed";
  const declinedLabel = "Declined";

  // Check if the document is declined (terminal state)
  const isDocDeclined = itemStatus === "declined";

  // Status display logic
  const getStatusConfig = () => {
    // For voided status: special handling
    if (isVoided) {
      if (recipient.status === "signed") {
        // Signed before voided - keep signed but with context
        return { 
          label: `${completedLabel} (voided)`, 
          color: "text-muted-foreground", 
          bg: "bg-muted/30 border-muted/30",
          tooltipKey: "signed_before_voided"
        };
      }
      // All other statuses show as "Voided" when document is voided
      return { 
        label: "Voided", 
        color: "text-muted-foreground/60", 
        bg: "bg-muted/20 border-muted/30",
        tooltipKey: "voided"
      };
    }

    // For declined status: special handling (terminal state)
    if (isDocDeclined) {
      if (recipient.status === "signed") {
        // Signed before decline - keep signed but with context
        return { 
          label: `${completedLabel} (declined)`, 
          color: "text-muted-foreground", 
          bg: "bg-muted/30 border-muted/30",
          tooltipKey: "signed_before_declined"
        };
      }
      if (recipient.status === "declined") {
        // The person who declined
        return { 
          label: declinedLabel, 
          color: "text-red-500/70", 
          bg: "bg-red-500/8 border-red-500/20",
          tooltipKey: "declined"
        };
      }
      // All other statuses (pending, waiting, viewed) show as "No longer required"
      return { 
        label: "No longer required", 
        color: "text-muted-foreground/60", 
        bg: "bg-muted/20 border-muted/30",
        tooltipKey: "no_longer_required"
      };
    }

    // For expired status: show final state at time of closure
    if (isExpired) {
      if (recipient.status === "signed") {
        // Keep Signed/Approved for those who completed
        return { 
          label: completedLabel, 
          color: "text-emerald-600/70 dark:text-emerald-400/70", 
          bg: "bg-emerald-500/8 border-emerald-500/20",
          tooltipKey: "signed"
        };
      }
      // All other statuses (pending, viewed, waiting) show as "Not completed"
      return { 
        label: "Not completed", 
        color: "text-muted-foreground/60", 
        bg: "bg-muted/20 border-muted/30",
        tooltipKey: "expired"
      };
    }

    // Non-actionable roles (CC, viewer) - always show "No action required" in grey
    if (isNonSigner) {
      return { 
        label: "No action required", 
        color: "text-muted-foreground/60", 
        bg: "bg-muted/20 border-muted/30",
        tooltipKey: "no_action"
      };
    }

    // Waiting for turn in sequential signing - show "Waiting for others" for everyone waiting
    if (isWaitingForTurn) {
      return { 
        label: "Waiting for others", 
        color: "text-muted-foreground/70", 
        bg: "bg-muted/30 border-border/30",
        tooltipKey: "waiting"
      };
    }

    // Current signer in sequential (not signed/declined) - show "Pending" with amber styling
    // The "Action Required" badge is shown separately next to their name
    if (isCurrentSigner && recipient.status !== "signed" && recipient.status !== "declined") {
      return { 
        label: "Pending", 
        color: "text-amber-600 dark:text-amber-400", 
        bg: "bg-transparent border-amber-500/60",
        tooltipKey: "action_required"
      };
    }

    // Signer/Approver who has signed - always show "Signed/Approved" as their individual status
    // The document-level header shows the overall state (Waiting for others, In Progress, etc.)
    // But each recipient's status pill should reflect their personal action

    // Standard status mapping - role-aware labels
    // For signers/approvers: viewed shows as Pending (only Pending, Signed/Approved, Declined/Rejected)
    // Pending uses amber styling for visibility
    const statusConfigs: Record<SignRecipient["status"], { label: string; color: string; bg: string; tooltipKey: string }> = {
      pending: { label: "Pending", color: "text-amber-600 dark:text-amber-400", bg: "bg-transparent border-amber-500/60", tooltipKey: "pending" },
      viewed: { label: "Pending", color: "text-amber-600 dark:text-amber-400", bg: "bg-transparent border-amber-500/60", tooltipKey: "pending" },
      signed: { label: completedLabel, color: "text-emerald-600/80 dark:text-emerald-400/80", bg: "bg-emerald-500/8 border-emerald-500/25", tooltipKey: "signed" },
      declined: { label: declinedLabel, color: "text-red-500/70", bg: "bg-red-500/8 border-red-500/20", tooltipKey: "declined" },
    };

    return statusConfigs[recipient.status];
  };

  const config = getStatusConfig();
  
  // Timestamp info - role-aware labels (no "Viewed" for actionable roles)
  let timestamp: Date | undefined;
  let timestampLabel = "";
  if (recipient.status === "signed" && recipient.signedAt) {
    timestamp = recipient.signedAt;
    timestampLabel = completedLabel;
  } else if (recipient.status === "declined" && recipient.declinedAt) {
    timestamp = recipient.declinedAt;
    timestampLabel = declinedLabel;
  }
  // Note: "viewed" status no longer shows timestamp text for signers/approvers

  // Show three-dot menu only when relevant - NEVER show for voided or expired
  const showMenu = !isClosedTerminal && isSender && !isTerminal && isActionable && recipient.status !== "signed";
  const showDeclinedMenu = !isClosedTerminal && isSender && recipient.status === "declined";

  // Is "You" the current user?
  const isYou = recipient.isCurrentUser;

  // Highlight anyone whose status pill is "Pending" (e.g. current signer in sequential, any unsigned in parallel)
  const isPendingHighlight = !isClosedTerminal && isActionable && config.label === "Pending";
  
  // Highlight the person who declined - red border similar to pending amber style
  const isDeclinedHighlight = recipient.status === "declined";
  
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl",
      // Declined recipient - red highlight (highest priority for the person who declined)
      isDeclinedHighlight
        ? "bg-transparent border border-red-500/50 ring-1 ring-red-500/20 transition-all"
        // Voided or Expired: greyed out, no hover, cursor default
        : isClosedTerminal 
          ? "bg-muted/10 opacity-60 cursor-default"
          // Current user ("You") with action required OR any pending - amber styling for consistency
          : (isYou && itemStatus === "action_required") || (isPendingHighlight && !isTerminal)
            ? "bg-amber-500/5 border border-amber-500/20 ring-1 ring-amber-500/10 transition-all"
            // Current user in other states - still slightly emphasized
            : isYou
              ? "bg-muted/30 border border-border/40 transition-all"
              // Non-signers (viewers, CC) - de-emphasized
              : isNonSigner
                ? "bg-muted/5 opacity-70 transition-all"
                // Other recipients - subtle styling, lower contrast
                : "bg-muted/10 hover:bg-muted/15 transition-all opacity-75"
    )}>
      {/* Order number for sequential (actionable only) */}
      {signingMode === "sequential" && orderIndex >= 0 && (
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
          recipient.status === "signed" 
            ? "bg-emerald-500/20 text-emerald-500"
            : isPendingHighlight && !isTerminal
              ? "bg-amber-500/20 text-amber-500"
              : "bg-muted/50 text-muted-foreground"
        )}>
          {orderIndex + 1}
        </div>
      )}

      <Avatar className={cn(
        "w-9 h-9", 
        (isNonSigner || isClosedTerminal) && "opacity-60",
        (isPendingHighlight || (isYou && itemStatus === "action_required")) && !isTerminal && "ring-2 ring-amber-500/50",
        isDeclinedHighlight && "ring-2 ring-red-500/50"
      )}>
        <AvatarFallback className={cn(
          "text-xs",
          isClosedTerminal
            ? "bg-muted text-muted-foreground"
            : isDeclinedHighlight
              ? "bg-red-500/20 text-red-500"
              : (isPendingHighlight || (isYou && itemStatus === "action_required")) && !isTerminal
                ? "bg-amber-500/20 text-amber-500"
                : recipient.status === "signed"
                  ? "bg-emerald-500/20 text-emerald-500"
                  : "bg-muted text-muted-foreground"
        )}>
          {recipient.name.split(" ").map(n => n[0]).join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {/* Show "You (Role)" for current user, otherwise just name */}
          <span className={cn(
            "text-sm truncate",
            isYou 
              ? "font-semibold text-foreground" 
              : (isNonSigner || isClosedTerminal) 
                ? "text-muted-foreground/70 font-normal" 
                : "text-muted-foreground font-medium"
          )}>
            {isYou ? `You (${roleConfig.label})` : recipient.name}
          </span>
          {(recipientHasPassword || (isYou && hasPassword)) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Password protected</p>
              </TooltipContent>
            </Tooltip>
          )}
          {/* Show action required badge only for current user with pending action */}
          {isYou && itemStatus === "action_required" && (
            <Badge 
              variant="outline" 
              className="text-[10px] h-5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 font-medium"
            >
              Action Required
            </Badge>
          )}
          {/* Role badge - only for non-current users */}
          {!isYou && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] h-5 border-transparent",
                isNonSigner ? "bg-muted/20 text-muted-foreground/50" : "bg-muted/30 text-muted-foreground/60"
              )}
            >
              {roleConfig.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">{recipient.email}</span>
          {timestamp && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-xs text-muted-foreground">
                {timestampLabel} {formatDistanceToNow(timestamp, { addSuffix: true })}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Status pill with tooltip */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-help">
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px] font-medium border whitespace-nowrap", config.bg, config.color)}
                >
                  {config.label}
                </Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[220px] bg-popover border border-border shadow-lg">
              <p className="text-xs">{recipientStatusTooltips[config.tooltipKey]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Three-dot menu - contextual actions only */}
        {showMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border border-border z-50">
              {/* Primary Actions */}
              <DropdownMenuItem 
                onClick={onResendInvite} 
                className="gap-2.5 text-xs text-primary focus:text-primary cursor-pointer"
              >
                <Mail className="w-4 h-4 opacity-70" />
                Resend signing invite
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Security Actions */}
              <DropdownMenuItem 
                onClick={onOpenPasswordSettings} 
                className="gap-2.5 text-xs cursor-pointer"
              >
                <Key className="w-4 h-4 opacity-70" />
                Manage access password
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Destructive Actions */}
              {(() => {
                const removeDisabledReason = getRemoveDisabledReason(recipient);
                const isRemoveDisabled = !!removeDisabledReason;
                
                if (isRemoveDisabled) {
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <DropdownMenuItem 
                            disabled 
                            className="gap-2.5 text-xs text-muted-foreground/50 cursor-not-allowed"
                          >
                            <UserMinus className="w-4 h-4 opacity-50" />
                            Remove from signing flow
                          </DropdownMenuItem>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[220px]">
                        <p className="text-xs">{removeDisabledReason}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                
                return (
                  <DropdownMenuItem 
                    onClick={onRemoveRecipient} 
                    className="gap-2.5 text-xs text-destructive focus:text-destructive cursor-pointer"
                  >
                    <UserMinus className="w-4 h-4 opacity-70" />
                    Remove from signing flow
                  </DropdownMenuItem>
                );
              })()}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Declined recipient menu */}
        {showDeclinedMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-popover border border-border z-50">
              <DropdownMenuItem onClick={onRestartFlow} className="gap-2 text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                Restart signing flow
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// ========== ACTIVITY TAB CONTENT COMPONENT ==========
function ActivityTabContent({ 
  activities, 
  isCompleted,
  isVoided,
  isDeclined,
  isExpired,
  declinedBy,
  lastActivity,
  expiresAt,
  sentAt,
  isSender,
  senderName = "You"
}: { 
  activities: SignActivity[]; 
  isCompleted: boolean;
  isVoided: boolean;
  isDeclined: boolean;
  isExpired: boolean;
  declinedBy?: { name: string; email: string; reason?: string; declinedAt: Date };
  lastActivity: Date;
  expiresAt?: Date;
  sentAt: Date;
  isSender: boolean;
  senderName?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const COLLAPSE_THRESHOLD = 6;
  
  // Build display activities
  // - For sender flows (Track → Sign → Sent), always start with "You" sending the doc
  // - Never show recipient names as the actor in the Activity tab
  // - Add system events for terminal states (Completed/Voided/Declined) as the final entry with actor attribution
  const displayActivities: SignActivity[] = activities.map((a) => ({ ...a }));

  if (isSender) {
    // Normalize actor attribution for Sent flows
    for (const a of displayActivities) {
      // Remove per-recipient attribution in Sent view (no names like "HR Manager")
      if (a.type === "viewed" || a.type === "signed" || a.type === "declined") {
        a.actor = "Recipient";
        a.actorEmail = "";
        a.details = undefined;
      }

      // Ensure sender attribution reads as "You" for the sent event
      if (a.type === "sent") {
        a.actor = "You";
        a.actorEmail = "you@company.com";
      }
    }

    // Ensure a sent event exists (so the timeline always starts with it)
    const hasSentEvent = displayActivities.some((a) => a.type === "sent");
    if (!hasSentEvent) {
      displayActivities.push({
        id: "system-sent",
        type: "sent" as SignActivity["type"],
        actor: "You",
        actorEmail: "you@company.com",
        timestamp: sentAt,
        details: undefined,
      });
    }
  }

  // Terminal system events should be the final timeline entry WITH ACTOR ATTRIBUTION
  if (isDeclined && declinedBy) {
    // Add the declined terminal event with explicit recipient attribution
    displayActivities.push({
      id: "system-declined",
      type: "declined_terminal" as SignActivity["type"],
      actor: `Declined by ${declinedBy.name}`,
      actorEmail: declinedBy.email,
      timestamp: declinedBy.declinedAt,
      details: declinedBy.reason,
    });
  }

  if (isVoided) {
    // Add voided event with explicit sender attribution
    displayActivities.push({
      id: "system-voided",
      type: "voided" as SignActivity["type"],
      actor: `Voided by ${senderName}`,
      actorEmail: "system@docsora.com",
      timestamp: lastActivity,
      details: undefined,
    });
  }

  if (isExpired) {
    displayActivities.push({
      id: "system-expired",
      type: "expired" as SignActivity["type"],
      actor: "System",
      actorEmail: "system@docsora.com",
      timestamp: expiresAt || lastActivity,
      details: "Signing deadline passed",
    });
  }

  if (isCompleted) {
    displayActivities.push({
      id: "system-completed",
      type: "completed" as SignActivity["type"],
      actor: "System",
      actorEmail: "system@docsora.com",
      timestamp: lastActivity,
      details: undefined,
    });
  }

  // Reverse chronological order: newest → oldest (latest at the top)
  const sortedActivities = displayActivities.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );
  const totalCount = sortedActivities.length;
  const shouldCollapse = totalCount > COLLAPSE_THRESHOLD;

  // When collapsed, show the most recent events + the first event (sent) at the bottom
  const visibleActivities = !shouldCollapse || isExpanded
    ? sortedActivities
    : [
        ...sortedActivities.slice(0, COLLAPSE_THRESHOLD - 1),
        sortedActivities[sortedActivities.length - 1],
      ];

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">Activity Timeline</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {totalCount} events
        </span>
      </div>

      {totalCount === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No activity yet
        </p>
      ) : (
        <div className="space-y-1">
          {visibleActivities.map((activity, index) => (
            <ActivityRow 
              key={activity.id} 
              activity={activity} 
              isLast={index === visibleActivities.length - 1}
              isSystemCompleted={activity.id === "system-completed"}
              isSystemVoided={activity.id === "system-voided"}
              isSystemDeclined={activity.id === "system-declined"}
              isSystemExpired={activity.id === "system-expired"}
            />
          ))}
          
          {/* Collapse/Expand toggle */}
          {shouldCollapse && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronRight className="w-3 h-3 -rotate-90" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronRight className="w-3 h-3 rotate-90" />
                  Show {totalCount - COLLAPSE_THRESHOLD} more events
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ========== ACTIVITY ROW COMPONENT ==========
function ActivityRow({ 
  activity, 
  isLast,
  isSystemCompleted = false,
  isSystemVoided = false,
  isSystemDeclined = false,
  isSystemExpired = false
}: { 
  activity: SignActivity; 
  isLast: boolean;
  isSystemCompleted?: boolean;
  isSystemVoided?: boolean;
  isSystemDeclined?: boolean;
  isSystemExpired?: boolean;
}) {
  const activityType = isSystemCompleted 
    ? "completed" 
    : isSystemVoided 
      ? "voided" 
      : isSystemDeclined 
        ? "declined_terminal" 
        : isSystemExpired
          ? "expired"
          : activity.type;
  const isTerminalEvent = isSystemCompleted || isSystemVoided || isSystemDeclined || isSystemExpired;
  
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center",
          activityColors[activityType]
        )}>
          {activityIcons[activityType]}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border/30 my-1" />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-sm font-medium",
                isSystemCompleted && "text-emerald-500",
                (isSystemVoided || isSystemDeclined) && "text-red-500 dark:text-red-400",
                isSystemExpired && "text-orange-500",
                !isTerminalEvent && "text-foreground"
              )}>
                {activity.actor}
              </span>
              <span className="text-xs text-muted-foreground">—</span>
              <span className={cn(
                "text-xs",
                isSystemCompleted && "text-emerald-500/80",
                (isSystemVoided || isSystemDeclined) && "text-red-500/80 dark:text-red-400/80",
                isSystemExpired && "text-orange-500/80",
                !isTerminalEvent && "text-muted-foreground"
              )}>
                {activityDescriptions[activityType]}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              {format(activity.timestamp, "MMM d, yyyy 'at' h:mm a")} ({Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')})
            </p>
          </div>
        </div>
        {activity.details && (
          <p className="text-xs text-foreground/60 mt-1.5 italic bg-muted/30 rounded-lg px-2 py-1.5">
            "{activity.details}"
          </p>
        )}
      </div>
    </div>
  );
}

// ========== AUDIT ROW COMPONENT ==========
function AuditRow({ entry, isLast }: { entry: AuditEntry; isLast: boolean }) {
  return (
    <div className={cn(
      "p-3 bg-muted/10",
      !isLast && "border-b border-border/30"
    )}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-xs font-medium text-foreground">{entry.action}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[10px] text-muted-foreground font-mono cursor-help shrink-0">
              {format(entry.timestamp, "MMM d, HH:mm:ss")} UTC
            </span>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs font-mono">{format(entry.timestamp, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{entry.actor}</span>
        <span className="text-muted-foreground/30">|</span>
        <span>{entry.device}</span>
        {entry.ipAddress && entry.ipAddress !== "-" && (
          <>
            <span className="text-muted-foreground/30">|</span>
            <span className="font-mono text-[10px]">IP: {entry.ipAddress}</span>
          </>
        )}
      </div>
      {entry.signatureMetadata && (
        <div className="mt-2 pt-2 border-t border-border/20 flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
            {entry.signatureMetadata.signatureType === "draw" && "Hand-drawn signature"}
            {entry.signatureMetadata.signatureType === "type" && "Typed signature"}
            {entry.signatureMetadata.signatureType === "upload" && "Uploaded signature"}
          </Badge>
          {entry.signatureMetadata.certificateId && (
            <span className="text-[10px] text-muted-foreground font-mono">
              Cert: {entry.signatureMetadata.certificateId}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
