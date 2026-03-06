import React from "react";
import { motion } from "framer-motion";
import { 
  FileText, FileSpreadsheet, FileImage, File, Presentation,
  Eye, Download, Clock, AlertTriangle, Lock
} from "lucide-react";
import { TrackItem, MainTab } from "@/pages/Track";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow, differenceInDays } from "date-fns";

interface TrackListProps {
  items: TrackItem[];
  selectedItem: TrackItem | null;
  onSelectItem: (item: TrackItem) => void;
  mainTab: MainTab;
  subTab?: string;
  emptyState?: { title: string; description?: string };
}

const fileIcons: Record<TrackItem["type"], React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-red-400" />,
  docx: <FileText className="w-4 h-4 text-blue-400" />,
  xlsx: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
  pptx: <Presentation className="w-4 h-4 text-orange-400" />,
  image: <FileImage className="w-4 h-4 text-violet-400" />,
  other: <File className="w-4 h-4 text-muted-foreground" />,
};

// Original status config for non-transfer-sent sections
const statusConfig: Record<TrackItem["status"], { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  viewed: { label: "Viewed", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  signed: { label: "Signed", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  expired: { label: "Expired", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  completed: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  voided: { label: "Voided", color: "text-[#991B1B]", bg: "bg-[#991B1B]/10 border-[#991B1B]/25" },
};

// For transfer sent - only Active, Expired, and Voided
const transferSentStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  expired: { label: "Expired", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  voided: { label: "Voided", color: "text-[#991B1B]", bg: "bg-[#991B1B]/10 border-[#991B1B]/25" },
};

export function TrackList({ items, selectedItem, onSelectItem, mainTab, subTab, emptyState }: TrackListProps) {
  const isTransferSent = mainTab === "transfer" && subTab === "sent";
  const isTransferReceived = mainTab === "transfer" && subTab === "received";

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {emptyState?.title ?? "No items found"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {emptyState?.description ??
            (mainTab === "transfer"
              ? "Start a new transfer to track your documents here."
              : "Send documents for signature to track them here.")}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Sticky Header Row for Transfer views */}
      {(isTransferSent || isTransferReceived) && (
        <div 
          className="sticky top-0 z-10 h-8 px-4 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/20 flex items-center text-[11px] font-medium text-muted-foreground uppercase tracking-wide"
        >
          <span className="flex-1 min-w-0">Document</span>
          <span className="w-[80px] text-center">Status</span>
          <span className="w-[70px] text-center mx-2">{isTransferReceived ? "From" : "Recipients"}</span>
          {isTransferSent && (
            <span className="w-[100px] text-center">Activity</span>
          )}
          <span className="w-[120px] text-right">Expires</span>
        </div>
      )}

      {items.map((item, index) => (
        <TrackListItem
          key={item.id}
          item={item}
          isSelected={selectedItem?.id === item.id}
          onClick={() => onSelectItem(item)}
          index={index}
          isTransferSent={isTransferSent}
          isTransferReceived={isTransferReceived}
        />
      ))}
    </div>
  );
}

function TrackListItem({
  item,
  isSelected,
  onClick,
  index,
  isTransferSent,
  isTransferReceived,
}: {
  item: TrackItem;
  isSelected: boolean;
  onClick: () => void;
  index: number;
  isTransferSent?: boolean;
  isTransferReceived?: boolean;
}) {
  // For transfer sent and received, map all non-expired statuses to "active"
  const isTransferView = isTransferSent || isTransferReceived;
  const displayStatus = isTransferView
    ? (item.status === "expired" ? "expired" : "active")
    : item.status;
  
  const status = isTransferView 
    ? transferSentStatusConfig[displayStatus] || transferSentStatusConfig.active
    : statusConfig[item.status];

  const expiryDays = item.expiresAt ? differenceInDays(item.expiresAt, new Date()) : null;
  const isExpiringSoon = expiryDays !== null && expiryDays <= 3 && expiryDays > 0;
  const notViewedRecently = differenceInDays(new Date(), item.lastActivity) >= 5;
  
  // Calculate time since expiry for expired items - use expiresAt if available, otherwise use lastActivity
  const expiredDaysAgo = item.expiresAt 
    ? differenceInDays(new Date(), item.expiresAt) 
    : differenceInDays(new Date(), item.lastActivity);

  // Get expiry text for transfer views
  const getExpiryText = () => {
    if (displayStatus === "expired") {
      return { text: `${expiredDaysAgo}d ago`, isExpired: true };
    }
    if (expiryDays !== null) {
      return { text: `in ${expiryDays}d`, isExpired: false };
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.12 }}
      onClick={onClick}
      className={`group relative h-14 px-5 rounded-lg cursor-pointer transition-all duration-150 ${
        isSelected
          ? "bg-primary/5 border border-primary/20"
          : "bg-transparent border border-transparent hover:bg-muted/30 hover:border-border/40"
      }`}
    >
      {/* Priority indicator - only for non-transfer views */}
      {!isTransferView && item.priority === "high" && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-7 bg-amber-500 rounded-r-full" />
      )}

      <div className="h-full flex items-center gap-4">
        {/* File Icon */}
        <div className="shrink-0 w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center">
          {fileIcons[item.type]}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground truncate leading-tight">{item.name}</span>
            {item.hasPassword && (
              <Lock className="w-3 h-3 text-muted-foreground/60 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            <span>{item.size}</span>
            <span>•</span>
            <span>{isTransferReceived ? "Received" : "Sent"} {formatDistanceToNow(item.sentAt, { addSuffix: true })}</span>
          </div>
        </div>

        {/* Status */}
        <Badge 
          variant="outline" 
          className={`${status.bg} ${status.color} border shrink-0`}
        >
          {status.label}
        </Badge>

        {/* Recipients - show for transfer sent, sender avatar for transfer received */}
        {isTransferReceived ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center shrink-0 w-[70px] justify-center mx-2">
                  <Avatar className="w-7 h-7 border-2 border-background">
                    <AvatarFallback className="text-[10px] bg-muted">
                      {item.sender?.name.split(" ").map(n => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  From: {item.sender?.name || "Unknown"}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center -space-x-2 shrink-0 ${isTransferSent ? 'w-[70px] justify-start' : ''}`}>
                  {item.recipients.slice(0, isTransferSent ? 2 : 3).map((recipient, i) => (
                    <Avatar key={i} className="w-7 h-7 border-2 border-background">
                      <AvatarFallback className="text-[10px] bg-muted">
                        {recipient.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {item.recipients.length > (isTransferSent ? 2 : 3) && (
                    <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] text-muted-foreground">
                      +{item.recipients.length - (isTransferSent ? 2 : 3)}
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  {item.recipients.map(r => r.name).join(", ")}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Stats - hide for transfer received (no analytics for recipients) */}
        {!isTransferReceived && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {item.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              {item.downloadCount}
            </span>
          </div>
        )}

        {/* Expiry - same style for both transfer sent and received */}
        {isTransferView ? (
          <div className="shrink-0 min-w-[120px] text-right">
            {getExpiryText() && (
              <span className={`text-xs ${getExpiryText()?.isExpired ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                {getExpiryText()?.text}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0 min-w-[120px] justify-end">
            {isExpiringSoon && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1">
                      <Clock className="w-3 h-3" />
                      {expiryDays}d left
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Expires soon</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {notViewedRecently && item.status !== "expired" && item.status !== "completed" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </TooltipTrigger>
                  <TooltipContent>Not viewed in 5+ days</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {item.expiresAt && !isExpiringSoon && item.status !== "expired" && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(item.expiresAt, { addSuffix: true })}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
