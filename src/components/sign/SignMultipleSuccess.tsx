import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  FileText,
  Zap,
  ArrowRight,
  ChevronDown,
  Grid3X3,
  HardDrive,
  Languages,
  RefreshCw,
  FolderArchive,
  RotateCw,
  SplitSquareHorizontal,
  Trash2,
  GitCompare,
  Shield,
  FileOutput,
  Layers,
  Droplets,
  Edit3,
  Database,
  WrenchIcon,
  Minimize2,
  User,
  UserCheck,
  Eye,
  Mail,
  Check,
  Clock,
  Lock,
  FileCheck
} from "lucide-react";
import TrackIcon from "@/components/icons/TrackIcon";
import { cn } from "@/lib/utils";
import { Recipient } from "./SignMultipleRecipients";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SignRequestDetailsModal } from "./SignRequestDetailsModal";

interface SignMultipleSuccessProps {
  file: File;
  recipients: Recipient[];
  enforceOrder: boolean;
  onReset: () => void;
}

const continueActions = [
  { icon: HardDrive, label: "Storage", path: "/storage" },
  { icon: Languages, label: "Translate", path: "/translate" },
  { icon: RefreshCw, label: "Convert", path: "/convert" },
  { icon: Send, label: "Transfer", path: "/transfer" },
  { icon: Minimize2, label: "Compress", path: "/compress" },
  { icon: FolderArchive, label: "Track", path: "/track" },
];

const toolsSubmenu = [
  { icon: RotateCw, label: "Rotate" },
  { icon: SplitSquareHorizontal, label: "Split" },
  { icon: FileText, label: "Merge" },
  { icon: Trash2, label: "Delete" },
  { icon: GitCompare, label: "Compare" },
  { icon: Shield, label: "Protect" },
  { icon: FileOutput, label: "Extract" },
  { icon: Layers, label: "PDF to One Page" },
  { icon: Droplets, label: "Watermark" },
  { icon: Grid3X3, label: "Organize" },
  { icon: Database, label: "Metadata" },
  { icon: WrenchIcon, label: "Repair" },
  { icon: Edit3, label: "Edit PDF" },
];

function CompletionAnimation() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative w-20 h-20 mx-auto"
    >
      {/* Glow pulse */}
      <motion.div
        className="absolute inset-[-10px] rounded-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0, 0.4, 0.15],
          scale: [0.8, 1.1, 1],
        }}
        transition={{ 
          duration: 1.2,
          times: [0, 0.4, 1],
          ease: "easeOut"
        }}
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.2), transparent 65%)",
          filter: "blur(12px)",
        }}
      />

      <svg className="w-full h-full" viewBox="0 0 80 80">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="hsl(var(--primary) / 0.08)"
          strokeWidth="2.5"
        />
        
        {/* Progress ring */}
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="hsl(var(--primary) / 0.5)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          style={{
            rotate: -90,
            transformOrigin: "center",
            filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.3))",
          }}
        />
        
        {/* Checkmark */}
        <motion.path
          d="M26 42 L36 52 L56 32"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ 
            pathLength: { delay: 0.5, duration: 0.35, ease: "easeOut" },
            opacity: { delay: 0.5, duration: 0.1 }
          }}
          style={{
            filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))",
          }}
        />
      </svg>
    </motion.div>
  );
}

function getRoleIcon(role: string) {
  switch (role) {
    case "signer":
      return User;
    case "approver":
      return UserCheck;
    case "viewer":
      return Eye;
    case "cc":
      return Mail;
    default:
      return User;
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "signer":
      return "Signer";
    case "approver":
      return "Approver";
    case "viewer":
      return "Viewer";
    case "cc":
      return "CC";
    default:
      return role;
  }
}

function getStatusInfo(recipient: Recipient, enforceOrder: boolean, recipients: Recipient[]) {
  // Sender who has signed
  if (recipient.isSender && recipient.role === "signer") {
    return { label: "Completed", color: "text-green-600 dark:text-green-400", icon: Check };
  }
  
  // Approvers
  if (recipient.role === "approver") {
    return { label: "Awaiting approval", color: "text-amber-600 dark:text-amber-400", icon: Clock };
  }
  
  // Signers
  if (recipient.role === "signer") {
    // If sequential and there are approvers, signers wait for approvals
    const hasApprovers = recipients.some(r => r.role === "approver");
    if (enforceOrder && hasApprovers) {
      return { label: "Awaiting approval", color: "text-muted-foreground", icon: Clock };
    }
    return { label: "Awaiting signature", color: "text-primary", icon: Clock };
  }
  
  // Viewers and CC - they just receive notification
  return { label: "Will be notified", color: "text-muted-foreground", icon: Mail };
}

function SigningSummaryCard({ recipients, enforceOrder }: { recipients: Recipient[]; enforceOrder: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Sort recipients - if enforceOrder, keep original order; otherwise group by role
  const sortedRecipients = [...recipients].sort((a, b) => {
    if (!enforceOrder) {
      // Group by role: approvers, signers, viewers, cc
      const roleOrder = { approver: 0, signer: 1, viewer: 2, cc: 3 };
      return (roleOrder[a.role as keyof typeof roleOrder] || 4) - (roleOrder[b.role as keyof typeof roleOrder] || 4);
    }
    return 0; // Keep original order for sequential signing
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.4 }}
      className="mb-6"
    >
      <div className={cn(
        "rounded-xl border border-border/40",
        "bg-card/50 backdrop-blur-sm",
        "overflow-hidden"
      )}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 border-b border-border/30 bg-muted/20 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Signing Summary
          </h3>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>
        
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="divide-y divide-border/20">
                {sortedRecipients.map((recipient, index) => {
                  const RoleIcon = getRoleIcon(recipient.role);
                  const statusInfo = getStatusInfo(recipient, enforceOrder, recipients);
                  const StatusIcon = statusInfo.icon;
                  const orderNumber = index + 1;
                  
                  return (
                    <motion.div
                      key={recipient.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Order number for sequential */}
                        {enforceOrder && (
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                            "bg-muted/60 text-[10px] font-medium text-muted-foreground"
                          )}>
                            {orderNumber}
                          </div>
                        )}
                        
                        {/* Role icon */}
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                          "bg-muted/40"
                        )}>
                          <RoleIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        
                        {/* Name and role */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {recipient.fullName}
                            {recipient.isSender && (
                              <span className="ml-1.5 text-[10px] text-muted-foreground">(you)</span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground/70">
                            {getRoleLabel(recipient.role)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className={cn("flex items-center gap-1.5 shrink-0", statusInfo.color)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">{statusInfo.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ContextualExplanation({ recipients, enforceOrder }: { recipients: Recipient[]; enforceOrder: boolean }) {
  const hasApprovers = recipients.some(r => r.role === "approver");
  const signerCount = recipients.filter(r => r.role === "signer").length;
  
  let message = "";
  
  if (enforceOrder) {
    if (hasApprovers) {
      message = "Approvers will review first. Signers will be notified once approvals are complete.";
    } else {
      message = "Signers will be notified in order. Each will sign after the previous completes.";
    }
  } else {
    if (hasApprovers) {
      message = "Approvers will review first. Once approved, all signers can sign in parallel.";
    } else {
      message = `All ${signerCount > 1 ? 'signers have' : 'signers have'} been notified and can sign in parallel.`;
    }
  }
  
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.85, duration: 0.4 }}
      className="text-xs text-muted-foreground/70 text-center mb-6 max-w-sm mx-auto"
    >
      {message}
    </motion.p>
  );
}

function ConfirmationIndicators() {
  const indicators = [
    { icon: Mail, label: "Emails sent to recipients" },
    { icon: FileCheck, label: "Audit trail enabled" },
    { icon: Lock, label: "Document locked after signing" },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.4 }}
      className="flex items-center justify-center gap-4 flex-wrap mb-8"
    >
      {indicators.map((indicator, index) => (
        <motion.div
          key={indicator.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.15 + index * 0.08, duration: 0.3 }}
          className="flex items-center gap-1.5"
        >
          <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-[11px] text-muted-foreground/70">{indicator.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}


function ContinueWorkflowSection() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8, duration: 0.4 }}
      className="mb-6"
      ref={containerRef}
    >
      <h3 className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-3 text-center">
        Take this document to another service
      </h3>
      
      <div className={cn(
        "flex flex-wrap items-center justify-center gap-1 p-2 rounded-xl",
        "bg-muted/8 backdrop-blur-sm",
        "border border-border/30",
        toolsOpen && "rounded-b-none border-b-0"
      )}>
        {continueActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9 + index * 0.04 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(action.path)}
            className={cn(
              "group flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg",
              "text-muted-foreground/60 hover:text-foreground",
              "hover:bg-background/60",
              "transition-all duration-200",
              "hover:shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.15)]"
            )}
          >
            <div className="w-7 h-7 rounded-lg bg-muted/40 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:shadow-[0_0_12px_-2px_hsl(var(--primary)/0.3)]">
              <action.icon className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[9px] font-medium">{action.label}</span>
          </motion.button>
        ))}
        
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9 + continueActions.length * 0.04 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setToolsOpen(!toolsOpen)}
          className={cn(
            "group flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg",
            "text-muted-foreground/60 hover:text-foreground",
            "hover:bg-background/60",
            "transition-all duration-200",
            "hover:shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.15)]",
            toolsOpen && "bg-background/60 text-foreground"
          )}
        >
          <div className={cn(
            "w-7 h-7 rounded-lg bg-muted/40 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:shadow-[0_0_12px_-2px_hsl(var(--primary)/0.3)]",
            toolsOpen && "bg-primary/10 shadow-[0_0_12px_-2px_hsl(var(--primary)/0.3)]"
          )}>
            <Grid3X3 className={cn("w-3.5 h-3.5 group-hover:text-primary transition-colors", toolsOpen && "text-primary")} />
          </div>
          <div className="flex items-center gap-0.5">
            <span className="text-[9px] font-medium">All tools</span>
            <ChevronDown className={cn("w-2.5 h-2.5 transition-transform duration-200", toolsOpen && "rotate-180")} />
          </div>
        </motion.button>
      </div>
      
      <AnimatePresence>
        {toolsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className={cn(
              "p-3 rounded-b-xl",
              "bg-background/80 backdrop-blur-xl",
              "border border-t-0 border-border/30",
              "max-h-[200px] overflow-y-auto",
              "[&::-webkit-scrollbar]:w-1.5",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:bg-border/40 [&::-webkit-scrollbar-thumb]:rounded-full",
              "[&::-webkit-scrollbar-thumb:hover]:bg-border/60"
            )}>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                {toolsSubmenu.map((tool, index) => (
                  <motion.button
                    key={tool.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => setToolsOpen(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg",
                      "text-muted-foreground/60 hover:text-foreground",
                      "hover:bg-muted/40",
                      "transition-all duration-150"
                    )}
                  >
                    <div className="w-6 h-6 rounded-md bg-muted/30 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-150 group-hover:shadow-[0_0_8px_-2px_hsl(var(--primary)/0.25)]">
                      <tool.icon className="w-3 h-3 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-[8px] font-medium text-center leading-tight">{tool.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const SignMultipleSuccess = ({ file, recipients, enforceOrder, onReset }: SignMultipleSuccessProps) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const signers = recipients.filter(r => r.role === "signer");
  const approvers = recipients.filter(r => r.role === "approver");

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4">
      {/* Completion Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6"
      >
        <CompletionAnimation />
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="text-xl font-semibold text-foreground tracking-tight mt-5 mb-2"
        >
          Document sent for signatures
        </motion.h1>
        
        {/* Recipients summary */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-sm text-muted-foreground"
        >
          {approvers.length > 0 && (
            <>
              <span className="text-foreground font-medium">{approvers.length} {approvers.length === 1 ? 'approver' : 'approvers'}</span>
              <span className="mx-2 text-muted-foreground/30">•</span>
            </>
          )}
          <span className="text-foreground font-medium">{signers.length} {signers.length === 1 ? 'signer' : 'signers'}</span>
          <span className="mx-2 text-muted-foreground/30">•</span>
          <span className="text-primary font-medium">In progress</span>
        </motion.p>
      </motion.div>

      {/* Contextual Explanation */}
      <ContextualExplanation recipients={recipients} enforceOrder={enforceOrder} />

      {/* Signing Summary Card */}
      <SigningSummaryCard recipients={recipients} enforceOrder={enforceOrder} />

      {/* Confirmation Indicators */}
      <ConfirmationIndicators />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.25, duration: 0.4 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-3">
          <motion.button
            onClick={() => navigate("/track")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative inline-flex items-center justify-center gap-3",
              "px-10 py-3.5 rounded-2xl",
              "text-sm font-semibold text-primary-foreground",
              "bg-gradient-to-b from-primary via-primary to-primary/85",
              "shadow-[0_6px_32px_-6px_hsl(var(--primary)/0.5),0_2px_8px_-2px_hsl(var(--primary)/0.3)]",
              "transition-all duration-300",
              "hover:shadow-[0_10px_40px_-6px_hsl(var(--primary)/0.6),0_4px_16px_-4px_hsl(var(--primary)/0.4)]",
              "overflow-hidden group"
            )}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
            />
            <TrackIcon className="w-5 h-5 relative z-10 invert dark:invert-0" />
            <span className="relative z-10">Track Progress</span>
          </motion.button>

          <motion.button
            onClick={() => setShowDetails(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "inline-flex items-center justify-center gap-2.5",
              "px-10 py-3.5 rounded-2xl",
              "text-sm font-semibold text-foreground",
              "bg-muted/50 hover:bg-muted/80",
              "border border-border/50 hover:border-border",
              "transition-all duration-300",
              "shadow-sm hover:shadow-md"
            )}
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </motion.button>
        </div>
        
        <p className="text-[10px] text-muted-foreground/40 mt-3 truncate max-w-[220px] mx-auto">
          {file.name}
        </p>
      </motion.div>

      {/* Details Modal */}
      <SignRequestDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        file={file}
        recipients={recipients}
        enforceOrder={enforceOrder}
      />


      {/* Sign Another */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        className="text-center mb-8"
      >
        <button
          onClick={onReset}
          className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          Sign another document
        </button>
      </motion.div>

      {/* Upgrade to Pro Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.4 }}
        className="mb-8"
      >
        <div className="relative rounded-2xl overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.02) 50%, hsl(var(--primary) / 0.06) 100%)",
                "linear-gradient(225deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.08) 50%, hsl(var(--primary) / 0.02) 100%)",
                "linear-gradient(315deg, hsl(var(--primary) / 0.02) 0%, hsl(var(--primary) / 0.06) 50%, hsl(var(--primary) / 0.08) 100%)",
                "linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.02) 50%, hsl(var(--primary) / 0.06) 100%)",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          <div 
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.1), transparent)",
            }}
          />
          
          <div className="absolute inset-0 rounded-2xl border border-primary/15" />
          
          <div className="relative px-6 py-5 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 hsl(var(--primary) / 0)",
                      "0 0 20px 2px hsl(var(--primary) / 0.15)",
                      "0 0 0 0 hsl(var(--primary) / 0)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Zap className="w-5 h-5 text-primary" />
                </motion.div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground whitespace-nowrap">
                    Unlock Pro — unlimited signatures & templates
                  </h3>
                  <p className="text-xs text-muted-foreground/70 mt-0.5 whitespace-nowrap">
                    Custom branding • Bulk sending • Priority support
                  </p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl",
                  "text-sm font-semibold text-primary",
                  "bg-primary/8 hover:bg-primary/12",
                  "border border-primary/20 hover:border-primary/35",
                  "shadow-[0_2px_16px_-4px_hsl(var(--primary)/0.25)]",
                  "hover:shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.35)]",
                  "transition-all duration-250",
                  "overflow-hidden group shrink-0"
                )}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"
                />
                <span className="relative z-10">Learn More</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Continue Workflow Section */}
      <ContinueWorkflowSection />
    </div>
  );
};

export default SignMultipleSuccess;
