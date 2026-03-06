import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, Download,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  CheckCircle2, FileText, ThumbsUp, ThumbsDown, Clock, User, AlertTriangle, XCircle, History, Shield, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Rejection reason categories
const REJECTION_CATEGORIES = [
  { value: "documentation", label: "Missing supporting documentation" },
  { value: "incorrect", label: "Incorrect or inconsistent information" },
  { value: "compliance", label: "Policy or compliance issue" },
  { value: "other", label: "Other (requires explanation)" },
];

export default function ApproveReceived() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(3);
  const [zoom, setZoom] = useState(100);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveConfirmChecked, setApproveConfirmChecked] = useState(false);
  const [rejectCategory, setRejectCategory] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectConfirmChecked, setRejectConfirmChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successType, setSuccessType] = useState<"approve" | "reject" | null>(null);
  
  // Mock document data
  const documentName = location.state?.documentName || "Budget Approval Q1 2026.pdf";
  const senderName = location.state?.senderName || "Finance Team";
  const approvalDeadline = location.state?.deadline || null;
  
  // Handle back navigation
  const handleBack = () => {
    navigate("/track", { 
      state: { 
        activeTab: "sign",
        subTab: "received",
        preserveScroll: true 
      }
    });
  };
  
  // Reset approve modal state
  const resetApproveModal = () => {
    setApproveConfirmChecked(false);
    setShowApproveModal(false);
  };
  
  // Reset reject modal state
  const resetRejectModal = () => {
    setRejectCategory("");
    setRejectReason("");
    setRejectConfirmChecked(false);
    setShowRejectModal(false);
  };
  
  // Handle approve
  const handleApprove = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    resetApproveModal();
    setSuccessType("approve");
  };
  
  // Handle reject
  const handleReject = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    resetRejectModal();
    setSuccessType("reject");
  };
  
  // Check if reject form is valid
  const isRejectFormValid = rejectCategory && rejectReason.trim() && rejectConfirmChecked;
  
  // Success screen - Approve
  if (successType === "approve") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md w-full text-center"
        >
          {/* Animated Completion Checkmark */}
          <motion.div
            className="relative mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Outer glow pulse */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 0 0 hsl(var(--primary) / 0.2)",
                  "0 0 0 20px hsl(var(--primary) / 0)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: 2,
                ease: "easeOut",
              }}
              style={{ width: 72, height: 72, left: "50%", marginLeft: -36, top: 0 }}
            />

            <svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              {/* Background circle */}
              <motion.circle
                cx="36"
                cy="36"
                r="34"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                fill="hsl(var(--primary) / 0.08)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
              {/* Checkmark */}
              <motion.path
                d="M24 36L32 44L48 28"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: { delay: 0.3, duration: 0.5, ease: "easeOut" },
                  opacity: { delay: 0.3, duration: 0.1 },
                }}
                style={{
                  filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))",
                }}
              />
            </svg>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="text-xl font-semibold text-foreground tracking-tight mb-3"
          >
            Approval recorded
          </motion.h1>

          {/* Explanation Copy - Clear hierarchy */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.4 }}
            className="mb-8"
          >
            <p className="text-sm text-muted-foreground mb-1.5">
              Your approval has been securely recorded and added to this document.
            </p>
            <p className="text-xs text-muted-foreground/60">
              The document will continue through its workflow. Once all required parties have completed their actions, the final document will be sent by email.
            </p>
          </motion.div>

          {/* Document card with audit trail */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.4 }}
            className="w-full bg-muted/30 border border-border/50 rounded-xl p-4 mb-8"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-background border border-border/50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">
                  {documentName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Approved just now</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Status: <span className="text-foreground/70">Workflow in progress</span>
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/70">
                  <Shield className="w-3 h-3" />
                  <span>Audit trail active</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* What would you like to do next? */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.4 }}
            className="mb-6"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              What would you like to do next?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/track')}
                className="flex-1 h-11"
              >
                <Eye className="w-4 h-4 mr-2" />
                Track document
              </Button>
              <Button
                onClick={() => navigate('/track')}
                variant="outline"
                className="flex-1 h-11"
              >
                <History className="w-4 h-4 mr-2" />
                View document history
              </Button>
            </div>
          </motion.div>

          {/* Close Button - Tertiary style */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="mb-8"
          >
            <button
              onClick={handleBack}
              className="w-full text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors py-2"
            >
              Close
            </button>
          </motion.div>

          {/* Security Reassurance */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.4 }}
            className="text-[11px] text-muted-foreground/40 mb-6"
          >
            Encrypted • Audit trail recorded • Legally binding under e-signature law
          </motion.p>

          {/* Platform Discovery */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.4 }}
          >
            <p className="text-xs text-muted-foreground/50 mb-2">
              Docsora helps manage the entire document lifecycle — from signing and approvals to tracking and storage.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              See what else you can do
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }
  
  // Success screen - Reject
  if (successType === "reject") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md w-full text-center"
        >
          {/* Softened Rejection Icon */}
          <motion.div
            className="relative mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              {/* Background circle - softened red */}
              <motion.circle
                cx="36"
                cy="36"
                r="34"
                stroke="hsl(0 48% 52%)"
                strokeWidth="2"
                fill="hsl(0 48% 52% / 0.08)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
              {/* X mark */}
              <motion.path
                d="M28 28L44 44M44 28L28 44"
                stroke="hsl(0 48% 52%)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: { delay: 0.3, duration: 0.5, ease: "easeOut" },
                  opacity: { delay: 0.3, duration: 0.1 },
                }}
              />
            </svg>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="text-xl font-semibold text-foreground tracking-tight mb-3"
          >
            Document declined
          </motion.h1>

          {/* Explanation Copy - Clear hierarchy */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.4 }}
            className="mb-8"
          >
            <p className="text-sm text-muted-foreground mb-1.5">
              Your decision has been securely recorded and added to the audit trail.
            </p>
            <p className="text-xs text-muted-foreground/60">
              The sender has been notified with your rejection reason. The document will not proceed unless updated and resent.
            </p>
          </motion.div>

          {/* Document card with audit trail */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.4 }}
            className="w-full bg-muted/30 border border-border/50 rounded-xl p-4 mb-8"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-background border border-border/50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">
                  {documentName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Rejected just now</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Status: <span className="text-foreground/70">Rejected</span>
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/70">
                  <Shield className="w-3 h-3" />
                  <span>Audit trail active</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* What would you like to do next? */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.4 }}
            className="mb-6"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              What would you like to do next?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/track')}
                className="flex-1 h-11"
              >
                <History className="w-4 h-4 mr-2" />
                View document history
              </Button>
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 h-11"
              >
                Return to dashboard
              </Button>
            </div>
          </motion.div>

          {/* Close Button - Tertiary style */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="mb-8"
          >
            <button
              onClick={handleBack}
              className="w-full text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors py-2"
            >
              Close
            </button>
          </motion.div>

          {/* Security Reassurance */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.4 }}
            className="text-[11px] text-muted-foreground/40 mb-6"
          >
            Encrypted • Audit trail recorded • Decision logged
          </motion.p>

          {/* Platform Discovery */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.4 }}
          >
            <p className="text-xs text-muted-foreground/50 mb-2">
              Docsora helps manage the entire document lifecycle — from signing and approvals to tracking and storage.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              See what else you can do
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* ========== HEADER ========== */}
      <header className="flex-shrink-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          {/* Center: Title + Document info */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h1 className="text-sm font-medium text-foreground">Review & Approve</h1>
            <p className="text-xs text-muted-foreground">
              {documentName} • From {senderName}
            </p>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowRejectModal(true)}
              className="gap-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5"
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="hidden sm:inline">Decline</span>
            </Button>
            <Button 
              size="sm"
              onClick={() => setShowApproveModal(true)}
              className="gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              Approve
            </Button>
          </div>
        </div>
      </header>
      
      {/* ========== MAIN LAYOUT ========== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========== LEFT SIDEBAR ========== */}
        <aside className="w-72 flex-shrink-0 border-r border-border bg-background hidden lg:flex lg:flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-5">
              {/* Document info */}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Document</h3>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{documentName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{totalPages} pages</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sender */}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Sender</h3>
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">{senderName}</span>
                </div>
              </div>
              
              {/* Your role */}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Your role</h3>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-lg">
                  <ThumbsUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Approver</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 px-1">
                  Review and approve or reject this document. No signature required.
                </p>
              </div>
              
              {/* Status */}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Status</h3>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Pending approval</span>
                </div>
              </div>
              
              {/* Deadline (if set) */}
              {approvalDeadline && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Deadline</h3>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {format(new Date(approvalDeadline), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
        
        {/* PDF Viewer - Center */}
        <main className="flex-1 flex flex-col overflow-hidden bg-muted/30">
          {/* Info banner */}
          <div className="flex-shrink-0 p-4 sm:p-6 pb-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5">
                <ThumbsUp className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  You're reviewing a document sent by {senderName}. Approving or rejecting will be permanently recorded.
                </p>
              </div>
            </div>
          </div>
          
          {/* Scrollable document area */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">
            <div 
              className="max-w-4xl mx-auto"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            >
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                <div className="relative aspect-[8.5/11] min-h-[700px] p-8 sm:p-12">
                  {/* Mock document content - read-only */}
                  <div className="space-y-4 text-sm text-muted-foreground/70 select-none pointer-events-none">
                    <div className="h-8 w-48 bg-muted/50 rounded mb-8" />
                    <div className="h-4 w-full bg-muted/30 rounded" />
                    <div className="h-4 w-11/12 bg-muted/30 rounded" />
                    <div className="h-4 w-full bg-muted/30 rounded" />
                    <div className="h-4 w-9/12 bg-muted/30 rounded" />
                    <div className="h-4 w-full bg-muted/30 rounded" />
                    <div className="h-4 w-10/12 bg-muted/30 rounded" />
                    <div className="h-20 w-full" />
                    <div className="h-4 w-full bg-muted/30 rounded" />
                    <div className="h-4 w-8/12 bg-muted/30 rounded" />
                    <div className="h-4 w-full bg-muted/30 rounded" />
                    <div className="h-4 w-11/12 bg-muted/30 rounded" />
                    <div className="h-20 w-full" />
                    <div className="h-4 w-full bg-muted/30 rounded" />
                    <div className="h-4 w-7/12 bg-muted/30 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* ========== FIXED BOTTOM CONTROLS ========== */}
          <div className="flex-shrink-0 px-4 sm:px-6 pb-4 pt-2 bg-muted/30">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between bg-background rounded-xl border border-border/50 px-3 py-2 shadow-sm">
                {/* LEFT: Empty space for balance */}
                <div className="flex items-center gap-0.5 min-w-[88px]" />
                
                {/* CENTER: Page Navigation */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums min-w-[80px] text-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* RIGHT: Zoom Controls */}
                <div className="flex items-center gap-0.5 min-w-[88px] justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    disabled={zoom <= 50}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums w-12 text-center">{zoom}%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setZoom(Math.min(150, zoom + 25))}
                    disabled={zoom >= 150}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* ========== APPROVE CONFIRMATION MODAL ========== */}
      <Dialog open={showApproveModal} onOpenChange={(open) => !open && resetApproveModal()}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Confirm approval</DialogTitle>
            <DialogDescription>
              This action is final and will be permanently recorded in the audit trail.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Document info */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{documentName}</p>
                <p className="text-xs text-muted-foreground">From {senderName}</p>
              </div>
            </div>
            
            {/* Confirmation checkbox */}
            <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <Checkbox
                id="approve-confirm"
                checked={approveConfirmChecked}
                onCheckedChange={(checked) => setApproveConfirmChecked(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="approve-confirm" className="text-sm text-foreground cursor-pointer leading-relaxed">
                By approving, you confirm that you have reviewed this document and formally authorize it to proceed.
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={resetApproveModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={!approveConfirmChecked || isSubmitting} 
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4" />
                  Approve document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* ========== REJECT MODAL ========== */}
      <Dialog open={showRejectModal} onOpenChange={(open) => !open && resetRejectModal()}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Decline document</DialogTitle>
            <DialogDescription>
              Provide a reason for declining. The sender will be notified.
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-5 pb-2 space-y-5">
            {/* Document info */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{documentName}</p>
                <p className="text-xs text-muted-foreground">From {senderName}</p>
              </div>
            </div>
            
            {/* Category dropdown */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Decline reason <span className="text-destructive">*</span>
              </label>
              <Select value={rejectCategory} onValueChange={setRejectCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Explanation textarea */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Explanation <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Explain why you're declining this document..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[120px] py-3 px-3"
              />
            </div>
            
            {/* Confirmation checkbox - neutral styling with more top spacing */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="reject-confirm"
                checked={rejectConfirmChecked}
                onCheckedChange={(checked) => setRejectConfirmChecked(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="reject-confirm" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                I confirm that declining is final and will be recorded in the audit trail.
              </label>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={resetRejectModal}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!isRejectFormValid || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Declining...
                </>
              ) : (
                <>
                  <ThumbsDown className="w-4 h-4" />
                  Decline document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
