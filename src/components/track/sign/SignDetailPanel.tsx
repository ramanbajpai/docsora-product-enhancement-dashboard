import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Copy, Download, FileText, Calendar, Lock, Users,
  Clock, Eye, CheckCircle2, XCircle, Send, Bell,
  Shield, PenTool, Smartphone, Globe, MoreHorizontal,
  RefreshCw, FileDown, Mail
} from "lucide-react";
import { SignItem, SignRecipient, SignActivity, AuditEntry, signStatusConfig, recipientRoleConfig } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, formatDistanceToNow, differenceInHours, differenceInDays } from "date-fns";

interface SignDetailPanelProps {
  item: SignItem;
  onClose: () => void;
  onSign?: () => void;
  onDecline?: () => void;
}

const activityIcons: Record<SignActivity["type"], React.ReactNode> = {
  sent: <Send className="w-3.5 h-3.5" />,
  viewed: <Eye className="w-3.5 h-3.5" />,
  signed: <CheckCircle2 className="w-3.5 h-3.5" />,
  declined: <XCircle className="w-3.5 h-3.5" />,
  reminder_sent: <Bell className="w-3.5 h-3.5" />,
  expired: <Clock className="w-3.5 h-3.5" />,
  deadline_extended: <RefreshCw className="w-3.5 h-3.5" />,
};

const activityColors: Record<SignActivity["type"], string> = {
  sent: "text-blue-400 bg-blue-500/10",
  viewed: "text-violet-400 bg-violet-500/10",
  signed: "text-emerald-400 bg-emerald-500/10",
  declined: "text-red-400 bg-red-500/10",
  reminder_sent: "text-amber-400 bg-amber-500/10",
  expired: "text-muted-foreground bg-muted/50",
  deadline_extended: "text-blue-400 bg-blue-500/10",
};

export function SignDetailPanel({ item, onClose, onSign, onDecline }: SignDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"details" | "activity" | "audit">("details");
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [allowRevise, setAllowRevise] = useState(false);
  const status = signStatusConfig[item.status];

  // Determine user's role
  const isReceivedDocument = !!item.sender;
  const isSender = !isReceivedDocument;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://docsora.com/sign/${item.id}`);
    toast.success("Link copied to clipboard");
  };

  const handleDownload = () => {
    toast.success("Downloading document...");
    // In a real app, this would trigger automatic download
  };

  const handleSendReminder = () => {
    toast.success("Reminder sent to pending signers");
  };

  const handleExtendDeadline = () => {
    toast.success("Opening deadline extension dialog...");
  };

  const handleDeclineConfirm = () => {
    // Record reason and revise preference
    if (onDecline) {
      onDecline();
    }
    toast.success(
      allowRevise 
        ? "Request declined. The sender can revise and resend." 
        : "Request declined."
    );
    setShowDeclineModal(false);
    setDeclineReason("");
    setAllowRevise(false);
  };

  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionMessage, setExtensionMessage] = useState("");

  // Get required fields count for current signer
  const getRequiredFieldsCount = () => {
    // Mock data - in real app this would come from the document
    const fields = {
      signatures: 1,
      initials: 2,
      dates: 1,
    };
    const total = fields.signatures + fields.initials + fields.dates;
    return total;
  };

  // Format due date with human-readable context
  const formatDueDate = (date: Date) => {
    const hoursUntil = differenceInHours(date, new Date());
    const daysUntil = differenceInDays(date, new Date());
    const formattedDate = format(date, "MMM d, yyyy");
    
    if (hoursUntil <= 0) {
      return { text: `Overdue · ${formattedDate}`, isUrgent: true };
    } else if (hoursUntil <= 48) {
      return { text: `Due in ${hoursUntil} hours · ${formattedDate}`, isUrgent: true };
    } else {
      return { text: `Due in ${daysUntil} days · ${formattedDate}`, isUrgent: false };
    }
  };

  const handleRequestExtension = () => {
    toast.success("Extension request sent to the sender");
    setShowExtensionModal(false);
    setExtensionMessage("");
  };

  // Calculate signing progress
  const signedCount = item.recipients.filter(r => r.status === "signed").length;
  const totalRecipients = item.recipients.length;

  // Find blocker
  const blocker = item.recipients.find(r => r.status !== "signed" && r.status !== "declined");

  // Find current user's role
  const currentUserRecipient = item.recipients.find(r => r.isCurrentUser);
  const currentUserRole = currentUserRecipient?.role || "signer";
  const isApprover = currentUserRole === "approver";

  // Get status summary sentence for received documents
  const getStatusSummary = () => {
    if (!isReceivedDocument) return null;
    
    switch (item.status) {
      case "action_required":
        return isApprover ? "Waiting on you to approve" : "Waiting on you to sign";
      case "waiting":
        return "Waiting for others to sign first";
      case "completed":
        return isApprover ? "You approved this document" : "You signed this document";
      case "expired":
        return "This signing request has expired";
      case "voided":
        return "This request was voided by the sender";
      default:
        return null;
    }
  };

  // Get primary CTA based on status
  const getPrimaryCTA = () => {
    switch (item.status) {
      case "action_required":
        return (
          <div className="space-y-3">
            {/* Primary CTA - full width */}
            <Button onClick={onSign} className="w-full gap-2">
              <PenTool className="w-4 h-4" />
              {isApprover ? "Review & Approve" : "Review & Sign"}
            </Button>
            
            {/* Post-action outcome confirmation */}
            <p className="text-xs text-muted-foreground/50 text-center">
              Once signed, the document will be shared with all parties.
            </p>
            
            {/* Secondary actions row */}
            <div className="flex items-center justify-center gap-4 pt-1">
              {/* Decline - ghost/text button, low emphasis */}
              <button
                onClick={() => setShowDeclineModal(true)}
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                Decline
              </button>
              
              {/* Request deadline extension - only if due date exists */}
              {item.expiresAt && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <button
                    onClick={() => setShowExtensionModal(true)}
                    className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    Request deadline extension
                  </button>
                </>
              )}
            </div>
          </div>
        );
      case "completed":
        return (
          <Button onClick={handleDownload} className="w-full gap-2">
            <FileDown className="w-4 h-4" />
            Download signed document
          </Button>
        );
      case "expired":
        if (isSender) {
          return (
            <Button onClick={handleExtendDeadline} variant="outline" className="w-full gap-2">
              <RefreshCw className="w-4 h-4" />
              Resend for signature
            </Button>
          );
        }
        return null;
      case "in_progress":
        if (isSender) {
          return (
            <Button onClick={handleSendReminder} variant="outline" className="w-full gap-2">
              <Bell className="w-4 h-4" />
              Send reminder
            </Button>
          );
        }
        return null;
      default:
        return null;
    }
  };

  const children = (
    <div className="h-[calc(100vh-200px)] sticky top-8 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden flex flex-col">
      {/* Header - Simplified for signer view */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-semibold text-foreground truncate mb-1">
              {item.name.replace(/\.[^/.]+$/, "")}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <FileText className="w-3 h-3" />
              <span className="truncate">{item.name}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 hover:bg-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Received document: Signer-centric context */}
        {isReceivedDocument ? (
          <div className="space-y-3">
            {/* Status badge - softer styling */}
            {item.status === "action_required" ? (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium">
                {status.label}
              </Badge>
            ) : null}
            
            {/* Signer-specific helper line */}
            {item.status === "action_required" && (
              <p className="text-sm text-foreground">
                Your signature is required to complete this document.
              </p>
            )}
            
            {/* Other status summaries */}
            {item.status !== "action_required" && getStatusSummary() && (
              <p className="text-sm text-foreground">{getStatusSummary()}</p>
            )}
            
            {/* Required fields count - signer-centric copy */}
            {item.status === "action_required" && (
              <p className="text-xs text-muted-foreground">
                You have {getRequiredFieldsCount()} required field{getRequiredFieldsCount() > 1 ? 's' : ''} to complete.
              </p>
            )}
            
            {/* Due date with human-readable context */}
            {(item.status === "action_required" || item.status === "waiting") && item.expiresAt && (
              <p className={`text-xs ${formatDueDate(item.expiresAt).isUrgent 
                ? "text-amber-600 dark:text-amber-400" 
                : "text-muted-foreground/60"}`}
              >
                {formatDueDate(item.expiresAt).text}
              </p>
            )}
            
            {/* Show progress only for 3+ participants */}
            {totalRecipients >= 3 && (item.status === "action_required" || item.status === "waiting" || item.status === "in_progress") && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                  <span>Signing progress</span>
                  <span>{signedCount} of {totalRecipients}</span>
                </div>
                <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-foreground/30 rounded-full transition-all"
                    style={{ width: `${(signedCount / totalRecipients) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Sender view: Keep status badge and description */
          <>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className={`${status.bg} ${status.color} border font-medium`}>
                {item.status === "in_progress" && <Clock className="w-3 h-3 mr-1" />}
                {item.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {item.status === "declined" && <XCircle className="w-3 h-3 mr-1" />}
                {item.status === "expired" && <Clock className="w-3 h-3 mr-1" />}
                {status.label}
              </Badge>
              {item.status === "in_progress" && totalRecipients > 1 && (
                <span className="text-xs text-muted-foreground/60">
                  {signedCount}/{totalRecipients} signed
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground/70 mb-3">{status.description}</p>
            
            {/* Deadline for sender */}
            {(item.status === "in_progress") && item.expiresAt && (
              <p className="text-xs text-muted-foreground/60">
                Deadline: {format(item.expiresAt, "MMM d, yyyy")}
              </p>
            )}
          </>
        )}

        {/* Declined banner - keep for both */}
        {item.status === "declined" && item.declinedBy && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg bg-muted/50 border border-border"
          >
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground mb-1">Signing declined</h4>
                <p className="text-xs text-muted-foreground">
                  Declined by {item.declinedBy.name} on {format(item.declinedBy.declinedAt, "MMM d, yyyy")}
                </p>
                {item.declinedBy.reason && (
                  <p className="text-xs text-muted-foreground/70 mt-1 italic">
                    "{item.declinedBy.reason}"
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Expired banner for recipients - simplified */}
        {item.status === "expired" && isReceivedDocument && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50"
          >
            <p className="text-xs text-muted-foreground">
              Contact the sender to request a new signing link.
            </p>
          </motion.div>
        )}

        {/* Blocker info for sender - neutral styling */}
        {item.status === "in_progress" && blocker && isSender && (
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground">
              Waiting on {blocker.name} to sign
            </p>
          </div>
        )}

        {/* Primary CTA */}
        <div className="mt-5">
          {getPrimaryCTA()}
        </div>
      </div>

      {/* Panel Tabs */}
      <div className="flex border-b border-border/50 px-6">
        {(["details", "activity", "audit"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-3 text-sm capitalize transition-colors ${
              activeTab === tab
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="signDetailTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
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
              {/* Recipients section - role-aware for received documents */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Recipients
                </h3>
                
                {/* Helper caption for received documents */}
                {isReceivedDocument && (item.status === "action_required" || item.status === "waiting") && (
                  <p className="text-xs text-muted-foreground/60 mb-3">
                    This document will be completed once all required participants finish their actions.
                  </p>
                )}
                
                <div className="space-y-1">
                  {/* Current user first - visually highlighted */}
                  {currentUserRecipient && (
                    <div className={`rounded-lg ${item.status === "action_required" ? "bg-primary/5 border border-primary/10" : ""} -mx-1 px-1`}>
                      <ParticipantRow 
                        participant={{
                          name: "You",
                          email: currentUserRecipient.email,
                          role: currentUserRecipient.role,
                          status: currentUserRecipient.status,
                          isCurrentUser: true,
                          signedAt: currentUserRecipient.signedAt,
                          viewedAt: currentUserRecipient.viewedAt,
                        }}
                        showActionRequired={item.status === "action_required"}
                        isHighlighted={true}
                      />
                    </div>
                  )}
                  
                  {/* Other recipients */}
                  {item.recipients
                    .filter(r => !r.isCurrentUser)
                    .map((recipient, i) => (
                      <ParticipantRow 
                        key={i} 
                        participant={{
                          name: recipient.name,
                          email: recipient.email,
                          role: recipient.role,
                          status: recipient.status,
                          signedAt: recipient.signedAt,
                          viewedAt: recipient.viewedAt,
                        }}
                      />
                    ))}
                  
                  {/* Sender - visually de-emphasised */}
                  {isReceivedDocument && item.sender && (
                    <div className="bg-muted/30 rounded-lg -mx-1 px-1">
                      <ParticipantRow 
                        participant={{
                          name: item.sender.name,
                          email: item.sender.email,
                          role: "sender" as any,
                          status: "signed",
                        }}
                        senderEmail={item.sender.email}
                        isDeemphasized={true}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Concise document summary */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Details</h4>
                {item.signingMode === "sequential" && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground/70">Signing order</span>
                    <span className="text-foreground/80">Sequential</span>
                  </div>
                )}
                {item.expiresAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground/70">Due date</span>
                    <span className="text-foreground/80">{format(item.expiresAt, "MMM d, yyyy")}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground/70">Document size</span>
                  <span className="text-foreground/80">{item.size}</span>
                </div>
                {item.hasPassword && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground/70">Password protected</span>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              <Separator className="opacity-50" />

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-9" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                  Copy link
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-9" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-sm font-medium text-foreground mb-4">Activity Timeline</h3>
              <div className="space-y-1">
                {item.activities
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((activity, index) => (
                    <ActivityRow key={activity.id} activity={activity} isLast={index === item.activities.length - 1} />
                  ))}
              </div>
            </motion.div>
          )}

          {activeTab === "audit" && (
            <motion.div
              key="audit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">Audit Log</h3>
                </div>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className="w-3 h-3" />
                  Export Audit Log
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Immutable record of all document actions for compliance.
              </p>
              <div className="space-y-3">
                {item.auditLog
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((entry) => (
                    <AuditRow key={entry.id} entry={entry} />
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <>
      {children}
      
      {/* Decline Confirmation Modal */}
      <Dialog open={showDeclineModal} onOpenChange={setShowDeclineModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Decline signing request</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this signing request?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="decline-reason" className="text-sm text-muted-foreground">
                Reason (optional)
              </Label>
              <Textarea
                id="decline-reason"
                placeholder="Add a note for the sender (optional)"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="allow-revise"
                checked={allowRevise}
                onCheckedChange={(checked) => setAllowRevise(checked === true)}
              />
              <Label 
                htmlFor="allow-revise" 
                className="text-sm text-muted-foreground leading-snug cursor-pointer"
              >
                Allow sender to revise and resend
              </Label>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeclineModal(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleDeclineConfirm}>
              Confirm decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extension Request Modal */}
      <Dialog open={showExtensionModal} onOpenChange={setShowExtensionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request deadline extension</DialogTitle>
            <DialogDescription>
              Send a request to the sender to extend the signing deadline.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="extension-message" className="text-sm text-muted-foreground">
                Message (optional)
              </Label>
              <Textarea
                id="extension-message"
                placeholder="Add a note explaining why you need more time..."
                value={extensionMessage}
                onChange={(e) => setExtensionMessage(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowExtensionModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestExtension}>
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// New participant row with role-first design
interface ParticipantProps {
  participant: {
    name: string;
    email: string;
    role: "signer" | "approver" | "viewer" | "cc" | "sender";
    status: "pending" | "viewed" | "signed" | "declined";
    isCurrentUser?: boolean;
    signedAt?: Date;
    viewedAt?: Date;
  };
  showActionRequired?: boolean;
  senderEmail?: string;
  isHighlighted?: boolean;
  isDeemphasized?: boolean;
}

function ParticipantRow({ participant, showActionRequired, senderEmail, isHighlighted, isDeemphasized }: ParticipantProps) {
  // Get role label
  const getRoleLabel = () => {
    if (participant.role === "sender") return "Sender";
    const config = recipientRoleConfig[participant.role as keyof typeof recipientRoleConfig];
    return config?.label || participant.role;
  };

  // Build the role suffix for current user
  const getRoleSuffix = () => {
    if (participant.isCurrentUser) {
      return `(${getRoleLabel()})`;
    }
    return getRoleLabel();
  };

  return (
    <div className="py-2.5">
      <div className="flex items-center gap-3">
        <Avatar className={`w-8 h-8 ${isDeemphasized ? "opacity-60" : ""}`}>
          <AvatarFallback className={`text-xs ${isHighlighted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {participant.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className={`text-sm truncate ${isDeemphasized ? "text-muted-foreground" : "text-foreground"}`}>
            <span className={isHighlighted ? "font-semibold" : "font-medium"}>{participant.name}</span>
            <span className="text-muted-foreground/60"> {getRoleSuffix()}</span>
          </div>
          {/* Sender email context */}
          {participant.role === "sender" && senderEmail && (
            <div className="text-xs text-muted-foreground/50 mt-0.5">
              Sent by {senderEmail}
            </div>
          )}
          {/* Viewed as subtle metadata, not a badge */}
          {participant.viewedAt && participant.status !== "signed" && participant.role !== "sender" && (
            <div className="text-xs text-muted-foreground/50 mt-0.5">
              Viewed {formatDistanceToNow(participant.viewedAt, { addSuffix: true })}
            </div>
          )}
          {participant.signedAt && (
            <div className="text-xs text-muted-foreground/50 mt-0.5">
              Signed {format(participant.signedAt, "MMM d")}
            </div>
          )}
        </div>
        {/* Only show checkmark for signed status - no other badges */}
        {participant.status === "signed" && (
          <CheckCircle2 className={`w-4 h-4 ${isDeemphasized ? "text-muted-foreground/30" : "text-muted-foreground/40"}`} />
        )}
      </div>
    </div>
  );
}

// Keep legacy RecipientRow for backward compatibility if needed elsewhere
function RecipientRow({ recipient }: { recipient: SignRecipient }) {
  return (
    <ParticipantRow 
      participant={{
        name: recipient.name,
        email: recipient.email,
        role: recipient.role,
        status: recipient.status,
        isCurrentUser: recipient.isCurrentUser,
        signedAt: recipient.signedAt,
        viewedAt: recipient.viewedAt,
      }}
    />
  );
}

function ActivityRow({ activity, isLast }: { activity: SignActivity; isLast: boolean }) {
  const color = activityColors[activity.type];
  const icon = activityIcons[activity.type];

  const getActivityLabel = () => {
    switch (activity.type) {
      case "sent": return "Sent document for signature";
      case "viewed": return "Viewed the document";
      case "signed": return "Signed the document";
      case "declined": return "Declined to sign";
      case "reminder_sent": return "Reminder sent";
      case "expired": return "Document expired";
      case "deadline_extended": return "Deadline extended";
      default: return activity.type;
    }
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {!isLast && <div className="w-px h-full bg-border/50 my-1" />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-medium text-foreground">{activity.actor}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {getActivityLabel()}
        </p>
        {activity.details && (
          <p className="text-xs text-muted-foreground/80 mt-1 italic">
            {activity.details}
          </p>
        )}
      </div>
    </div>
  );
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  return (
    <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{entry.action}</span>
        <span className="text-xs text-muted-foreground">
          {format(entry.timestamp, "MMM d, yyyy h:mm a")}
        </span>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="w-3 h-3" />
          <span>{entry.actor} ({entry.actorEmail})</span>
        </div>
        {entry.ipAddress !== "-" && (
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3" />
            <span>IP: {entry.ipAddress}</span>
          </div>
        )}
        {entry.device !== "-" && entry.device !== "System" && (
          <div className="flex items-center gap-2">
            <Smartphone className="w-3 h-3" />
            <span>{entry.device}</span>
          </div>
        )}
        {entry.signatureMetadata && (
          <div className="flex items-center gap-2 text-emerald-400">
            <PenTool className="w-3 h-3" />
            <span>
              {entry.signatureMetadata.signatureType === "draw" && "Hand-drawn signature"}
              {entry.signatureMetadata.signatureType === "type" && "Typed signature"}
              {entry.signatureMetadata.signatureType === "upload" && "Uploaded signature"}
              {entry.signatureMetadata.certificateId && ` • ${entry.signatureMetadata.certificateId}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
