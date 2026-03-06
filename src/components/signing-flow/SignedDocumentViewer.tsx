import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  FileText, Clock, Shield, Users, Eye,
  Calendar, Fingerprint, ChevronDown, Maximize2, CheckCircle2, Loader2,
  AlertCircle, Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Types
interface SignatureField {
  id: string;
  recipientId: string;
  type: "signature" | "initials" | "date" | "text";
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  signedAt?: string;
  value?: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: "signer" | "approver" | "cc" | "viewer";
  status: "completed" | "pending" | "declined" | "viewed";
  signedAt?: string;
  viewedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  signatureFields?: SignatureField[];
  order?: number;
}

interface AuditEntry {
  id: string;
  action: string;
  timestamp: string;
  actor: string;
  details?: string;
  ip?: string;
}

interface SignedDocument {
  id: string;
  name: string;
  status: "completed" | "partially_completed" | "declined" | "in_progress";
  signingMode: "sequential" | "parallel";
  sentAt: string;
  completedAt?: string;
  sender: {
    name: string;
    email: string;
  };
  recipients: Recipient[];
  auditTrail: AuditEntry[];
  pageCount: number;
  signatureFields: SignatureField[];
}

interface SignedDocumentViewerProps {
  document?: SignedDocument;
  onClose?: () => void;
  allowDownload?: boolean;
  allowShare?: boolean;
  showWatermark?: boolean;
}

// Mock data for demo - showing IN-PROGRESS state (1 of 5 signed)
const mockDocument: SignedDocument = {
  id: "doc-1",
  name: "Enterprise Software License Agreement",
  status: "in_progress",
  signingMode: "sequential",
  sentAt: "2026-01-15T10:30:00Z",
  sender: {
    name: "Legal Team",
    email: "legal@acme.com",
  },
  recipients: [
    {
      id: "r1",
      name: "Sarah Chen",
      email: "sarah.chen@techcorp.com",
      role: "signer",
      status: "completed",
      signedAt: "2026-01-16T09:15:00Z",
      viewedAt: "2026-01-16T09:10:00Z",
      order: 1,
      signatureFields: [
        { id: "sf1", recipientId: "r1", type: "signature", page: 1, x: 120, y: 580, width: 200, height: 60, signedAt: "2026-01-16T09:15:00Z" },
        { id: "sf2", recipientId: "r1", type: "date", page: 1, x: 350, y: 595, width: 120, height: 30, signedAt: "2026-01-16T09:15:00Z", value: "01/16/2026" },
      ],
    },
    {
      id: "r2",
      name: "Michael Torres",
      email: "m.torres@techcorp.com",
      role: "signer",
      status: "viewed",
      viewedAt: "2026-01-17T11:30:00Z",
      order: 2,
      signatureFields: [
        { id: "sf3", recipientId: "r2", type: "signature", page: 2, x: 120, y: 520, width: 200, height: 60 },
        { id: "sf4", recipientId: "r2", type: "initials", page: 1, x: 480, y: 300, width: 60, height: 40 },
      ],
    },
    {
      id: "r3",
      name: "Jennifer Walsh",
      email: "j.walsh@acme.com",
      role: "approver",
      status: "pending",
      order: 3,
      signatureFields: [
        { id: "sf5", recipientId: "r3", type: "signature", page: 3, x: 120, y: 480, width: 200, height: 60 },
      ],
    },
    {
      id: "r4",
      name: "Robert Kim",
      email: "r.kim@techcorp.com",
      role: "signer",
      status: "pending",
      order: 4,
      signatureFields: [
        { id: "sf6", recipientId: "r4", type: "signature", page: 3, x: 120, y: 580, width: 200, height: 60 },
      ],
    },
    {
      id: "r5",
      name: "You",
      email: "viewer@company.com",
      role: "viewer",
      status: "viewed",
      viewedAt: "2026-01-19T10:00:00Z",
    },
  ],
  auditTrail: [
    { id: "a1", action: "Document sent", timestamp: "2026-01-15T10:30:00Z", actor: "Legal Team", details: "Sent to 5 recipients" },
    { id: "a2", action: "Viewed", timestamp: "2026-01-16T09:10:00Z", actor: "Sarah Chen", ip: "192.168.1.xxx" },
    { id: "a3", action: "Signed", timestamp: "2026-01-16T09:15:00Z", actor: "Sarah Chen", details: "Signature applied on page 1" },
    { id: "a4", action: "Viewed", timestamp: "2026-01-17T11:30:00Z", actor: "Michael Torres", ip: "192.168.2.xxx" },
    { id: "a5", action: "Viewed", timestamp: "2026-01-19T10:00:00Z", actor: "You (Viewer)", ip: "192.168.3.xxx" },
  ],
  pageCount: 4,
  signatureFields: [],
};

// Helper functions
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getRoleLabel = (role: Recipient["role"]) => {
  switch (role) {
    case "signer": return "Signer";
    case "approver": return "Approver";
    case "cc": return "CC";
    case "viewer": return "Viewer";
    default: return role;
  }
};

const getStatusLabel = (recipient: Recipient) => {
  if (recipient.signedAt) return "Signed";
  if (recipient.status === "pending") return "Pending";
  if (recipient.viewedAt) return "Viewed";
  return "Pending";
};

export const SignedDocumentViewer = ({
  document = mockDocument,
  onClose,
  allowDownload = false,
  showWatermark = true,
}: SignedDocumentViewerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnState = (location.state as { returnState?: { activeTab: string; subTab: string } })?.returnState;
  
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredSignature, setHoveredSignature] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    participants: true,
    details: false,
    audit: false,
  });

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (returnState) {
      navigate("/track", { state: returnState });
    } else {
      navigate(-1);
    }
  };

  const toggleFullscreen = () => {
    if (!window.document.fullscreenElement) {
      window.document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      window.document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const scrollToSignature = (recipientId: string, page?: number) => {
    const recipient = document.recipients.find(r => r.id === recipientId);
    if (page) {
      setCurrentPage(page);
    } else if (recipient?.signatureFields?.length) {
      const firstField = recipient.signatureFields[0];
      setCurrentPage(firstField.page);
    }
  };

  // Calculate signing status
  const signersAndApprovers = document.recipients.filter(r => r.role === "signer" || r.role === "approver");
  const signedCount = signersAndApprovers.filter(r => r.signedAt).length;
  const totalRequired = signersAndApprovers.length;
  const isFullySigned = signedCount === totalRequired && totalRequired > 0;
  const isInProgress = !isFullySigned && document.status !== "declined";

  // Get the last activity date
  const lastActivityDate = document.auditTrail
    .map(a => new Date(a.timestamp))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  // Get first viewed date
  const firstViewedEntry = document.auditTrail.find(a => a.action === "Viewed");

  // Status display
  const getStatusDisplay = () => {
    if (isFullySigned) {
      return {
        label: "Fully signed",
        sublabel: "All required signatures completed",
        icon: <CheckCircle2 className="w-4 h-4 text-[#1255DA]" />,
        color: "text-[#1255DA]",
        bgColor: "bg-[#1255DA]/10",
      };
    }
    return {
      label: "Waiting for others",
      sublabel: `${signedCount} of ${totalRequired} required signatures completed`,
      icon: <Clock className="w-4 h-4 text-amber-500/80" />,
      color: "text-amber-500/80",
      bgColor: "bg-amber-500/10",
    };
  };

  const statusDisplay = getStatusDisplay();

  // Get recipient by ID
  const getRecipientById = (id: string) => document.recipients.find(r => r.id === id);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      {/* Header - Document title centered with status, Back left, View Only right */}
      <header className="shrink-0 bg-zinc-900/80 border-b border-white/[0.06]">
        <div className="h-14 flex items-center px-4">
          {/* Left: Back button */}
          <div className="flex-1 flex items-center">
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white/90 hover:bg-white/[0.04] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          {/* Center: Document title + status */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="text-sm font-medium text-white/90 truncate max-w-md text-center">
              {document.name}
            </h1>
            <p className={cn("text-xs mt-0.5", statusDisplay.color)}>
              {statusDisplay.label}
            </p>
          </div>

          {/* Right: View Only badge + controls */}
          <div className="flex-1 flex items-center justify-end gap-2">
            {allowDownload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-xs">Download</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Enabled by sender</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Badge
              variant="outline"
              className="text-[10px] h-6 border-white/[0.1] bg-white/[0.03] text-white/50 gap-1.5"
            >
              <Eye className="w-3 h-3" />
              View Only
            </Badge>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Document Progress Panel */}
        <aside className="w-80 shrink-0 bg-zinc-900/40 border-r border-white/[0.06] flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-5">
              {/* Status Summary Section */}
              <div className="space-y-3">
                <h2 className="text-xs font-medium text-white/50 uppercase tracking-wider">
                  Document Progress
                </h2>
                
                {/* Status card */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    statusDisplay.bgColor
                  )}>
                    {statusDisplay.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", isFullySigned ? "text-white/80" : "text-white/70")}>
                      {statusDisplay.label}
                    </p>
                    <p className="text-xs text-white/40">
                      {statusDisplay.sublabel}
                    </p>
                  </div>
                </div>

                {/* Signing method info */}
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Users className="w-3.5 h-3.5" />
                  <span>{document.signingMode === "sequential" ? "Sequential signing" : "Parallel signing"}</span>
                </div>
              </div>

              <Separator className="bg-white/[0.06]" />

              {/* Participants Section */}
              <Collapsible
                open={expandedSections.participants}
                onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, participants: open }))}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between py-1 text-xs font-medium text-white/50 uppercase tracking-wider">
                    <span>Participants</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSections.participants && "rotate-180")} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-1 pt-3">
                    {document.recipients.map((recipient) => {
                      const hasSignatureFields = recipient.signatureFields && recipient.signatureFields.length > 0;
                      const status = getStatusLabel(recipient);
                      const isSigned = status === "Signed";
                      const isPending = status === "Pending";
                      const isViewed = status === "Viewed";

                      return (
                        <button
                          key={recipient.id}
                          onClick={() => hasSignatureFields && scrollToSignature(recipient.id)}
                          className={cn(
                            "w-full p-3 rounded-lg text-left transition-all",
                            hasSignatureFields
                              ? "hover:bg-white/[0.04] cursor-pointer"
                              : "cursor-default"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Order indicator for sequential */}
                            {document.signingMode === "sequential" && recipient.order && (
                              <div className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5",
                                isSigned 
                                  ? "bg-emerald-500/15 text-emerald-500" 
                                  : "bg-white/[0.06] text-white/40"
                              )}>
                                {isSigned ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  recipient.order
                                )}
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-medium text-white/80 truncate">
                                  {recipient.name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[9px] h-4 px-1.5 border-white/[0.08] text-white/35 bg-transparent shrink-0"
                                >
                                  {getRoleLabel(recipient.role)}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2 text-xs">
                                <span className={cn(
                                  "font-medium",
                                  isSigned && "text-emerald-500",
                                  isPending && "text-amber-500/70",
                                  isViewed && "text-white/50"
                                )}>
                                  {status}
                                </span>
                                {recipient.signedAt && (
                                  <>
                                    <span className="text-white/20">·</span>
                                    <span className="text-white/40">{formatDateTime(recipient.signedAt)}</span>
                                  </>
                                )}
                                {!recipient.signedAt && recipient.viewedAt && (
                                  <>
                                    <span className="text-white/20">·</span>
                                    <span className="text-white/40">{formatDateTime(recipient.viewedAt)}</span>
                                  </>
                                )}
                              </div>

                              {hasSignatureFields && (
                                <div className={cn(
                                  "mt-1.5 text-[10px]",
                                  isSigned ? "text-emerald-500/70" : "text-white/30"
                                )}>
                                  <span>
                                    {isSigned 
                                      ? `View signature on page ${recipient.signatureFields![0].page}`
                                      : `Signature required on page ${recipient.signatureFields![0].page}`
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator className="bg-white/[0.06]" />

              {/* Document Details - Collapsed by default */}
              <Collapsible
                open={expandedSections.details}
                onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, details: open }))}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between py-1 text-xs font-medium text-white/50 uppercase tracking-wider">
                    <span>Document Details</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSections.details && "rotate-180")} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2.5 text-xs pt-3">
                    <div className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-white/40">File name</p>
                        <p className="text-white/70 break-words">{document.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-white/40">Date sent</p>
                        <p className="text-white/70">{formatDate(document.sentAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Users className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-white/40">Signing method</p>
                        <p className="text-white/70">{document.signingMode === "sequential" ? "Sequential" : "Parallel"}</p>
                      </div>
                    </div>

                    {lastActivityDate && (
                      <div className="flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-white/40">Last activity</p>
                          <p className="text-white/70">{formatDateTime(lastActivityDate.toISOString())}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator className="bg-white/[0.06]" />

              {/* Audit & Trust Section - Collapsed by default */}
              <Collapsible
                open={expandedSections.audit}
                onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, audit: open }))}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between py-1 text-xs font-medium text-white/50 uppercase tracking-wider">
                    <span>Audit Summary</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSections.audit && "rotate-180")} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 pt-3">
                    {/* Verification indicator */}
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <Shield className="w-3.5 h-3.5 text-[#1255DA]/70" />
                      <span className="text-xs text-white/50">Audit trail active</span>
                    </div>

                    {/* Key audit info */}
                    <div className="space-y-2 text-xs">
                      {firstViewedEntry && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/40">First viewed</span>
                          <span className="text-white/60">{formatDateTime(firstViewedEntry.timestamp)}</span>
                        </div>
                      )}
                      {lastActivityDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/40">Last action</span>
                          <span className="text-white/60">{formatDateTime(lastActivityDate.toISOString())}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-white/40">Hash verified</span>
                        <span className="text-white/60 font-mono text-[10px]">SHA-256</span>
                      </div>
                    </div>

                    {/* Recent audit entries */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Recent activity</p>
                      {document.auditTrail.slice(-4).reverse().map((entry) => (
                        <div key={entry.id} className="flex items-start gap-2 text-xs">
                          <div className="w-1 h-1 rounded-full bg-white/20 mt-2 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white/60">{entry.action}</p>
                            <p className="text-white/30 truncate text-[10px]">
                              {entry.actor} · {formatDateTime(entry.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
        </aside>

        {/* Document Canvas - Strictly read-only */}
        <main className="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden">
          {/* Zoom & page controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-sm rounded-lg border border-white/[0.08] p-1.5 shadow-xl">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setZoom(prev => Math.max(prev - 25, 50))}
                  className="p-1.5 hover:bg-white/[0.08] rounded transition-colors text-white/60 hover:text-white/80"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Zoom out</TooltipContent>
            </Tooltip>

            <span className="text-xs font-medium text-white/50 w-12 text-center">{zoom}%</span>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setZoom(prev => Math.min(prev + 25, 200))}
                  className="p-1.5 hover:bg-white/[0.08] rounded transition-colors text-white/60 hover:text-white/80"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Zoom in</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-5 bg-white/[0.08]" />

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 hover:bg-white/[0.08] rounded transition-colors text-white/60 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Previous page</TooltipContent>
            </Tooltip>

            <span className="text-xs font-medium text-white/50 w-16 text-center">
              {currentPage} / {document.pageCount}
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, document.pageCount))}
                  disabled={currentPage >= document.pageCount}
                  className="p-1.5 hover:bg-white/[0.08] rounded transition-colors text-white/60 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Next page</TooltipContent>
            </Tooltip>
          </div>

          {/* Document display */}
          <ScrollArea className="flex-1">
            <div className="flex justify-center py-8 px-4 min-h-full">
              <motion.div
                className="relative bg-white rounded-sm shadow-2xl select-none"
                style={{
                  width: `${(595 * zoom) / 100}px`,
                  minHeight: `${(842 * zoom) / 100}px`,
                  transform: `scale(1)`,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Dynamic watermark based on document state */}
                {showWatermark && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                    <div className={cn(
                      "text-lg font-medium rotate-[-30deg] whitespace-nowrap",
                      isFullySigned 
                        ? "text-[#1255DA]/10" 
                        : "text-amber-500/10"
                    )}>
                      {isFullySigned 
                        ? "Final — fully executed" 
                        : "Draft — awaiting signatures"
                      }
                    </div>
                  </div>
                )}

                {/* Mock document content */}
                <div className="p-12 text-zinc-900 select-none pointer-events-none" style={{ fontSize: `${12 * zoom / 100}px` }}>
                  <h1 className="text-2xl font-bold mb-4" style={{ fontSize: `${24 * zoom / 100}px` }}>
                    Enterprise Software License Agreement
                  </h1>
                  <p className="mb-4 text-zinc-600 leading-relaxed">
                    This Enterprise Software License Agreement ("Agreement") is entered into as of the date last signed below,
                    by and between TechCorp Inc. ("Licensee") and Acme Software Solutions ("Licensor").
                  </p>
                  <h2 className="text-lg font-semibold mb-2 mt-6" style={{ fontSize: `${16 * zoom / 100}px` }}>
                    1. Grant of License
                  </h2>
                  <p className="text-zinc-600 leading-relaxed mb-4">
                    Subject to the terms and conditions of this Agreement, Licensor hereby grants to Licensee a non-exclusive,
                    non-transferable license to use the Software for the Licensee's internal business purposes.
                  </p>
                  <h2 className="text-lg font-semibold mb-2 mt-6" style={{ fontSize: `${16 * zoom / 100}px` }}>
                    2. Term and Termination
                  </h2>
                  <p className="text-zinc-600 leading-relaxed mb-4">
                    This Agreement shall commence on the Effective Date and continue for a period of twelve (12) months,
                    unless earlier terminated in accordance with this section.
                  </p>
                </div>

                {/* Signature fields overlay - view only, non-interactive */}
                {document.recipients.map((recipient) =>
                  recipient.signatureFields
                    ?.filter(field => field.page === currentPage)
                    .map((field) => {
                      const isSigned = !!field.signedAt;
                      
                      return (
                        <motion.div
                          key={field.id}
                          className={cn(
                            "absolute rounded transition-all cursor-default",
                            isSigned 
                              ? "bg-zinc-100/60 border border-zinc-300/60"
                              : "bg-amber-50/40 border border-amber-300/40 border-dashed",
                            hoveredSignature === field.id && isSigned && "ring-1 ring-[#1255DA]/40 bg-[#1255DA]/5"
                          )}
                          style={{
                            left: `${(field.x * zoom) / 100}px`,
                            top: `${(field.y * zoom) / 100}px`,
                            width: `${(field.width * zoom) / 100}px`,
                            height: `${(field.height * zoom) / 100}px`,
                          }}
                          onMouseEnter={() => setHoveredSignature(field.id)}
                          onMouseLeave={() => setHoveredSignature(null)}
                        >
                          {/* Signed signature content */}
                          {field.type === "signature" && isSigned && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className="text-zinc-700 font-signature select-none"
                                style={{ fontSize: `${20 * zoom / 100}px` }}
                              >
                                {recipient.name}
                              </span>
                            </div>
                          )}

                          {/* Pending signature placeholder */}
                          {field.type === "signature" && !isSigned && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                              <AlertCircle className="w-3 h-3 text-amber-500/60 mb-0.5" style={{ width: `${12 * zoom / 100}px`, height: `${12 * zoom / 100}px` }} />
                              <span
                                className="text-amber-600/70 text-center select-none leading-tight"
                                style={{ fontSize: `${8 * zoom / 100}px` }}
                              >
                                Awaiting signature from {recipient.name}
                              </span>
                            </div>
                          )}

                          {field.type === "initials" && field.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className="text-zinc-700 font-signature select-none"
                                style={{ fontSize: `${16 * zoom / 100}px` }}
                              >
                                {field.value}
                              </span>
                            </div>
                          )}

                          {/* Pending initials placeholder */}
                          {field.type === "initials" && !isSigned && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className="text-amber-600/60 select-none"
                                style={{ fontSize: `${8 * zoom / 100}px` }}
                              >
                                Initials
                              </span>
                            </div>
                          )}

                          {field.type === "date" && field.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className="text-zinc-700 text-xs select-none"
                                style={{ fontSize: `${11 * zoom / 100}px` }}
                              >
                                {field.value}
                              </span>
                            </div>
                          )}

                          {/* Hover tooltip for signed fields */}
                          <AnimatePresence>
                            {hoveredSignature === field.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute -top-20 left-1/2 -translate-x-1/2 z-50"
                              >
                                <div className="bg-zinc-900 rounded-lg shadow-xl border border-white/[0.08] p-3 text-left whitespace-nowrap">
                                  <p className="text-sm font-medium text-white/90">{recipient.name}</p>
                                  <p className="text-xs text-white/40">{getRoleLabel(recipient.role)}</p>
                                  {isSigned ? (
                                    <p className="text-xs text-[#1255DA] mt-1">
                                      Signed — {formatDateTime(field.signedAt!)}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-amber-500/80 mt-1">
                                      Awaiting signature
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })
                )}
              </motion.div>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

export default SignedDocumentViewer;
