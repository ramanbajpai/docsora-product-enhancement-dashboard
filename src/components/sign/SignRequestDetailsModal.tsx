import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Download, Shield, Clock, Check, Mail, User, UserCheck, Eye, Info, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Recipient } from "./SignMultipleRecipients";
import { toast } from "sonner";
import { useMemo } from "react";

interface SignRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File;
  recipients: Recipient[];
  enforceOrder: boolean;
  senderName?: string;
  senderEmail?: string;
}

function generateRequestId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getRoleIcon(role: string) {
  switch (role) {
    case "signer": return User;
    case "approver": return UserCheck;
    case "viewer": return Eye;
    case "cc": return Mail;
    default: return User;
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "signer": return "Signee";
    case "approver": return "Approver";
    case "viewer": return "Viewer";
    case "cc": return "CC";
    default: return role;
  }
}

function getStatusBadge(recipient: Recipient) {
  if (recipient.isSender && recipient.role === "signer") {
    return { label: "Completed", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" };
  }
  return { label: "Pending", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
}

function getActivityText(recipient: Recipient) {
  if (recipient.isSender && recipient.role === "signer") {
    return `${recipient.fullName} has signed.`;
  }
  return `${recipient.fullName} has not yet signed.`;
}

export function SignRequestDetailsModal({
  isOpen,
  onClose,
  file,
  recipients,
  enforceOrder,
  senderName = "You",
  senderEmail = "you@email.com",
}: SignRequestDetailsModalProps) {
  const requestId = useMemo(() => generateRequestId(), []);
  const now = new Date();
  const expirationDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) +
    " (UTC)";

  const formatShortDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  const fileSize = file.size > 0
    ? `${(file.size / 1024).toFixed(2)} KB`
    : "—";

  const handleCopyId = () => {
    navigator.clipboard.writeText(requestId);
    toast.success("Request ID copied");
  };

  const signers = recipients.filter(r => r.role === "signer" || r.role === "approver");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                "relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl",
                "bg-background border border-border/50",
                "shadow-[0_25px_65px_-15px_rgba(0,0,0,0.25)]",
                "[&::-webkit-scrollbar]:w-1.5",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-border/40 [&::-webkit-scrollbar-thumb]:rounded-full"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/30 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Signature Request Overview</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-6">
                {/* Document Name & Request ID */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">{file.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                    <span className="font-mono truncate max-w-[280px]">Request ID: {requestId}</span>
                    <button onClick={handleCopyId} className="hover:text-foreground transition-colors">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <InfoField label="Sender" value={senderName} subValue={senderEmail} />
                  <InfoField
                    label="Status"
                    custom={
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        Sent
                      </span>
                    }
                    subCustom={
                      <a href="/track" className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1">
                        <Info className="w-3 h-3" />
                        For status update visit Track
                      </a>
                    }
                  />
                  <InfoField label="Created on" value={formatDate(now)} />
                  <InfoField label="Expiration Date" value={formatShortDate(expirationDate)} />
                  <InfoField label="Completed on" value="Not completed yet" muted />
                  <InfoField label="Recipients" value={`${recipients.length}`} />
                  <InfoField label="Document" value={file.name} subValue={`Size: ${fileSize}`} />
                  <InfoField
                    label="Audit Log"
                    custom={
                      <button className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors group">
                        <span>Download audit report</span>
                        <div className="w-7 h-7 rounded-lg border border-border/50 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    }
                  />
                </div>

                {/* Signers Section */}
                <div className="pt-2">
                  <div className="rounded-xl border border-border/40 bg-muted/10 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-border/30">
                      <h3 className="text-sm font-semibold text-foreground">Signers</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Individuals required to sign this document</p>
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 px-5 py-2.5 border-b border-border/20 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      <span>Recipient</span>
                      <span>Status</span>
                      <span>Activity</span>
                    </div>

                    {/* Rows */}
                    {signers.map((recipient, index) => {
                      const RoleIcon = getRoleIcon(recipient.role);
                      const status = getStatusBadge(recipient);
                      return (
                        <div
                          key={recipient.id}
                          className={cn(
                            "grid grid-cols-[1fr_auto_1fr] gap-4 px-5 py-3.5 items-center",
                            index < signers.length - 1 && "border-b border-border/15"
                          )}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{recipient.fullName}</p>
                            <p className="text-xs text-muted-foreground truncate">{recipient.email}</p>
                            <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                              {getRoleLabel(recipient.role)}
                            </span>
                          </div>

                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border",
                            status.className
                          )}>
                            {status.label}
                          </span>

                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{recipient.fullName}</span>{" "}
                            {recipient.isSender && recipient.role === "signer" ? "has signed." : "has not yet signed."}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Security Footer */}
                <div className="flex items-center justify-center gap-4 pt-2 pb-1">
                  {[
                    { icon: Shield, label: "Encrypted" },
                    { icon: Clock, label: "Audit trail active" },
                    { icon: Check, label: "Legally binding" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
                      <item.icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoField({
  label,
  value,
  subValue,
  muted,
  custom,
  subCustom,
}: {
  label: string;
  value?: string;
  subValue?: string;
  muted?: boolean;
  custom?: React.ReactNode;
  subCustom?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {custom ? custom : (
        <p className={cn("text-sm", muted ? "text-muted-foreground" : "text-foreground")}>{value}</p>
      )}
      {subValue && <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>}
      {subCustom}
    </div>
  );
}
