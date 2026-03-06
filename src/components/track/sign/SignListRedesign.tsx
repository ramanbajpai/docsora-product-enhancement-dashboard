import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Clock, CheckCircle2, XCircle, AlertCircle, 
  Eye, Download, ArrowRight, ChevronRight, Search, Calendar, Lock, Ban, ChevronDown, User
} from "lucide-react";
import { SignItem, signStatusConfig, SignStatus, RecipientRole, recipientRoleConfig } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { formatDistanceToNow, differenceInDays, format, subDays, startOfDay, endOfDay, isAfter } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { CustomDateRangeDialog } from "@/components/track/CustomDateRangeDialog";

type DatePreset = "all" | "today" | "7days" | "30days" | "90days" | "custom";

export type SignViewTab = "received" | "sent";

interface SignListRedesignProps {
  items: SignItem[];
  selectedItem: SignItem | null;
  onSelectItem: (item: SignItem) => void;
  activeTab: SignViewTab;
}

const statusIcons: Record<SignStatus, React.ReactNode> = {
  action_required: <AlertCircle className="w-3 h-3" />,
  waiting: <Clock className="w-3 h-3" />,
  in_progress: <Clock className="w-3 h-3" />,
  completed: <CheckCircle2 className="w-3 h-3" />,
  approved: <CheckCircle2 className="w-3 h-3" />,
  declined: <XCircle className="w-3 h-3" />,
  expired: <Clock className="w-3 h-3" />,
  cancelled: <XCircle className="w-3 h-3" />,
  voided: <Ban className="w-3 h-3" />,
};

// Sorting logic for Received - role-aware priority
const sortReceived = (items: SignItem[]) => {
  return [...items].sort((a, b) => {
    // Action required first (urgent items)
    const aUrgent = a.status === "action_required";
    const bUrgent = b.status === "action_required";
    if (aUrgent && !bUrgent) return -1;
    if (bUrgent && !aUrgent) return 1;
    
    // Then waiting (sequential, not user's turn)
    if (a.status === "waiting" && b.status !== "waiting" && !bUrgent) return -1;
    if (b.status === "waiting" && a.status !== "waiting" && !aUrgent) return 1;
    
    // Then expiring soon (within 7 days)
    const aDays = a.expiresAt ? differenceInDays(a.expiresAt, new Date()) : 999;
    const bDays = b.expiresAt ? differenceInDays(b.expiresAt, new Date()) : 999;
    if (aDays <= 7 && aDays > 0 && (bDays > 7 || bDays <= 0)) return -1;
    if (bDays <= 7 && bDays > 0 && (aDays > 7 || aDays <= 0)) return 1;
    
    // Then newest
    return b.sentAt.getTime() - a.sentAt.getTime();
  });
};

const sortSent = (items: SignItem[]) => {
  return [...items].sort((a, b) => {
    // In progress first
    if (a.status === "in_progress" && b.status !== "in_progress") return -1;
    if (b.status === "in_progress" && a.status !== "in_progress") return 1;
    
    // Then expiring soon
    const aDays = a.expiresAt ? differenceInDays(a.expiresAt, new Date()) : 999;
    const bDays = b.expiresAt ? differenceInDays(b.expiresAt, new Date()) : 999;
    if (aDays <= 7 && aDays > 0 && (bDays > 7 || bDays <= 0)) return -1;
    if (bDays <= 7 && bDays > 0 && (aDays > 7 || aDays <= 0)) return 1;
    
    // Then newest
    return b.sentAt.getTime() - a.sentAt.getTime();
  });
};

export function SignListRedesign({ items, selectedItem, onSelectItem, activeTab }: SignListRedesignProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SignStatus | "all">("all");
  
  // Date range state - matching Transfer's pattern
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(undefined);

  // Get date range based on preset
  const getDateRangeFromPreset = (preset: DatePreset): { from: Date; to: Date } | null => {
    const now = new Date();
    switch (preset) {
      case "today":
        return { from: startOfDay(now), to: endOfDay(now) };
      case "7days":
        return { from: startOfDay(subDays(now, 7)), to: endOfDay(now) };
      case "30days":
        return { from: startOfDay(subDays(now, 30)), to: endOfDay(now) };
      case "90days":
        return { from: startOfDay(subDays(now, 90)), to: endOfDay(now) };
      case "custom":
        return customRange?.from && customRange?.to
          ? { from: startOfDay(customRange.from), to: endOfDay(customRange.to) }
          : null;
      default:
        return null;
    }
  };

  // Get button label
  const getDateButtonLabel = () => {
    switch (datePreset) {
      case "today":
        return "Today";
      case "7days":
        return "Last 7 days";
      case "30days":
        return "Last 30 days";
      case "90days":
        return "Last 90 days";
      case "custom":
        if (customRange?.from && customRange?.to) {
          return `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d")}`;
        }
        return "Custom range";
      default:
        return "Date";
    }
  };

  const handlePresetSelect = (preset: DatePreset) => {
    if (preset === "custom") {
      setTempRange(customRange);
      setIsCustomRangeOpen(true);
    } else {
      setDatePreset(preset);
      setCustomRange(undefined);
    }
  };

  const handleApplyCustomRange = () => {
    if (tempRange?.from && tempRange?.to && !isAfter(tempRange.from, tempRange.to)) {
      setCustomRange(tempRange);
      setDatePreset("custom");
      setIsCustomRangeOpen(false);
    }
  };

  const handleClearDateFilter = () => {
    setDatePreset("all");
    setCustomRange(undefined);
    setTempRange(undefined);
    setIsCustomRangeOpen(false);
  };

  // Split items by received vs sent
  const receivedItems = items.filter(item => !!item.sender);
  const sentItems = items.filter(item => !item.sender);

  // Get current list based on tab
  const currentItems = activeTab === "received" ? receivedItems : sentItems;

  // Get active date range
  const dateRange = getDateRangeFromPreset(datePreset);

  // Apply filters
  const filteredItems = currentItems.filter(item => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchLower) ||
      item.recipients.some(r => 
        r.email.toLowerCase().includes(searchLower) || 
        r.name.toLowerCase().includes(searchLower)
      ) ||
      item.sender?.name.toLowerCase().includes(searchLower) ||
      item.sender?.email.toLowerCase().includes(searchLower);
    
    // Status filter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    // Date range filter
    const matchesDate = !dateRange || 
      (item.sentAt >= dateRange.from && item.sentAt <= dateRange.to);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort items
  const sortedItems = activeTab === "received" 
    ? sortReceived(filteredItems) 
    : sortSent(filteredItems);

  // Count by status for quick chips
  const statusCounts = currentItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by document, sender, recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/30 border-border/50 h-10"
          />
        </div>

        {/* Status Filter - Context-aware based on tab */}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SignStatus | "all")}>
          <SelectTrigger className="w-[180px] h-10 bg-muted/30 border-border/50">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                All statuses
              </span>
            </SelectItem>
            {activeTab === "received" ? (
              <>
                <SelectItem value="action_required">
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", signStatusConfig.action_required.dotColor)} />
                    {signStatusConfig.action_required.label}
                  </span>
                </SelectItem>
                <SelectItem value="waiting">
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", signStatusConfig.waiting.dotColor)} />
                    Waiting for others
                  </span>
                </SelectItem>
                <SelectItem value="in_progress">
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", signStatusConfig.in_progress.dotColor)} />
                    {signStatusConfig.in_progress.label}
                  </span>
                </SelectItem>
                <SelectItem value="completed">
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", signStatusConfig.completed.dotColor)} />
                    {signStatusConfig.completed.label}
                  </span>
                </SelectItem>
                <SelectItem value="expired">
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", signStatusConfig.expired.dotColor)} />
                    {signStatusConfig.expired.label}
                  </span>
                </SelectItem>
                <SelectItem value="voided">
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", signStatusConfig.voided.dotColor)} />
                    {signStatusConfig.voided.label}
                  </span>
                </SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="in_progress">
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", signStatusConfig.in_progress.dotColor)} />
                    {signStatusConfig.in_progress.label}
                  </span>
                </SelectItem>
                <SelectItem value="completed">
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", signStatusConfig.completed.dotColor)} />
                    {signStatusConfig.completed.label}
                  </span>
                </SelectItem>
                <SelectItem value="declined">
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", signStatusConfig.declined.dotColor)} />
                    {signStatusConfig.declined.label}
                  </span>
                </SelectItem>
                <SelectItem value="voided">
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", signStatusConfig.voided.dotColor)} />
                    {signStatusConfig.voided.label}
                  </span>
                </SelectItem>
                <SelectItem value="expired">
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", signStatusConfig.expired.dotColor)} />
                    {signStatusConfig.expired.label}
                  </span>
                </SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        {/* Date Range Dropdown - matching Transfer style */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className={`gap-2 h-10 bg-muted/30 border-border/50 hover:bg-muted hover:text-foreground ${
                datePreset !== "all" ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <Calendar className="w-4 h-4" />
              {getDateButtonLabel()}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuCheckboxItem
              checked={datePreset === "all"}
              onCheckedChange={() => handlePresetSelect("all")}
            >
              All time
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={datePreset === "today"}
              onCheckedChange={() => handlePresetSelect("today")}
            >
              Today
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={datePreset === "7days"}
              onCheckedChange={() => handlePresetSelect("7days")}
            >
              Last 7 days
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={datePreset === "30days"}
              onCheckedChange={() => handlePresetSelect("30days")}
            >
              Last 30 days
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={datePreset === "90days"}
              onCheckedChange={() => handlePresetSelect("90days")}
            >
              Last 90 days
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={datePreset === "custom"}
              onCheckedChange={() => handlePresetSelect("custom")}
            >
              Custom range...
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CustomDateRangeDialog
          open={isCustomRangeOpen}
          onOpenChange={setIsCustomRangeOpen}
          range={tempRange}
          onRangeChange={setTempRange}
          onApply={handleApplyCustomRange}
          onCancel={() => setTempRange(customRange)}
        />
      </div>

      {/* Quick Status Chips (only show if there are urgent items) - neutral styling */}
      {activeTab === "received" && statusCounts["action_required"] > 0 && statusFilter === "all" && datePreset === "all" && (
        <div className="flex items-center gap-2">
          {statusCounts["action_required"] > 0 && (
            <button
              onClick={() => setStatusFilter("action_required")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-500/40 hover:bg-amber-500/25 transition-colors"
            >
              <AlertCircle className="w-3 h-3" />
              {statusCounts["action_required"]} need your action
            </button>
          )}
        </div>
      )}

      {/* Active Filters - matching Transfer style */}
      <AnimatePresence>
        {(statusFilter !== "all" || datePreset !== "all") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {statusFilter !== "all" && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20"
                onClick={() => setStatusFilter("all")}
              >
                {statusFilter === "waiting" && activeTab === "received" 
                  ? "Waiting for others" 
                  : signStatusConfig[statusFilter].label}
                <span className="ml-1">×</span>
              </Badge>
            )}
            {datePreset !== "all" && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20"
                onClick={handleClearDateFilter}
              >
                {getDateButtonLabel()}
                <span className="ml-1">×</span>
              </Badge>
            )}
            <Button
              variant="link"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => {
                setStatusFilter("all");
                handleClearDateFilter();
              }}
            >
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery || statusFilter !== "all" || dateRange
              ? "No matching documents"
              : activeTab === "received"
                ? "No documents to sign"
                : "No sent sign requests"
            }
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {searchQuery || statusFilter !== "all" || dateRange
              ? "Try adjusting your filters or search query."
              : activeTab === "received"
                ? "Documents you receive for signature will appear here."
                : "Sign requests you send will appear here."
            }
          </p>
        </motion.div>
      )}

      {/* List with sticky header */}
      {sortedItems.length > 0 && (
        <div className="space-y-2">
          {/* Sticky Header Row - aligned columns */}
          <div 
            className="sticky top-0 z-10 h-9 px-5 rounded-lg bg-muted/20 backdrop-blur-sm border border-border/10 grid items-center gap-8 text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider"
            style={{ 
              gridTemplateColumns: activeTab === "sent" 
                ? "1fr 110px 100px 44px 70px 104px" 
                : "1fr 110px 80px 80px 90px 104px"
            }}
          >
            <span>Document</span>
            <span>Status</span>
            {activeTab === "received" ? <span>Role</span> : <span>Recipients</span>}
            {activeTab === "sent" && <span>Views</span>}
            <span>{activeTab === "sent" ? "Due" : "Sender"}</span>
            <span>{activeTab === "received" ? "Due" : "Time"}</span>
            <span className="text-right">Action</span>
          </div>

          {/* List Items */}
          {sortedItems.map((item, index) => (
            <SignListItemClean
              key={item.id}
              item={item}
              isSelected={selectedItem?.id === item.id}
              onClick={() => onSelectItem(item)}
              index={index}
              viewTab={activeTab}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SignListItemClean({
  item,
  isSelected,
  onClick,
  index,
  viewTab,
}: {
  item: SignItem;
  isSelected: boolean;
  onClick: () => void;
  index: number;
  viewTab: SignViewTab;
}) {
  const status = signStatusConfig[item.status];
  const expiryDays = item.expiresAt ? differenceInDays(item.expiresAt, new Date()) : null;
  
  // Calculate signing progress (for Sent tab)
  const signedCount = item.recipients.filter(r => r.status === "signed").length;
  const totalRecipients = item.recipients.length;

  // Calculate time since expiry for expired items
  const expiredDaysAgo = item.expiresAt 
    ? differenceInDays(new Date(), item.expiresAt) 
    : 0;

  // Get current user's role from recipients (for Received tab)
  const currentUserRecipient = item.recipients.find(r => r.isCurrentUser);
  const userRole = currentUserRecipient?.role || "viewer";

  // Get urgency-aware time text for Received view
  const getTimeText = () => {
    if (viewTab === "sent") {
      // Sent view - show due date
      if (!item.expiresAt) return "—";
      if (item.status === "completed" || item.status === "declined" || item.status === "cancelled") return "—";
      
      if (item.status === "expired") {
        return `${expiredDaysAgo}d ago`;
      }
      if (expiryDays !== null && expiryDays >= 0) {
        if (expiryDays === 0) return "Today";
        if (expiryDays === 1) return "in 1d";
        return `in ${expiryDays}d`;
      }
      return "—";
    }
    
    // Received view - urgency-aware labels
    if (item.status === "completed" || item.status === "approved") {
      return "—";
    }
    
    if (item.status === "expired") {
      if (expiredDaysAgo === 0) return "Today";
      if (expiredDaysAgo === 1) return "1d ago";
      return `${expiredDaysAgo}d ago`;
    }
    
    if (item.status === "voided") {
      const daysAgo = differenceInDays(new Date(), item.lastActivity);
      if (daysAgo === 0) return "Today";
      if (daysAgo === 1) return "1d ago";
      return `${daysAgo}d ago`;
    }
    
    if (item.status === "action_required" || item.status === "waiting") {
      if (!item.expiresAt) return "No deadline";
      if (expiryDays === 0) return "Today";
      if (expiryDays === 1) return "in 1d";
      if (expiryDays !== null && expiryDays > 1) return `in ${expiryDays}d`;
    }
    
    return "—";
  };

  // Get recipient-focused status label for Received view
  const getReceivedStatusLabel = () => {
    if (viewTab !== "received") return status.label;
    if (item.status === "waiting") return "Waiting for others";
    return status.label;
  };

  // Get role label for display
  const getRoleLabel = () => {
    const config = recipientRoleConfig[userRole];
    return config?.label || "Recipient";
  };

  // Get recipient-focused tooltip text
  const getTooltipText = () => {
    if (viewTab === "received") {
      switch (item.status) {
        case "action_required": 
          return userRole === "approver" 
            ? "You need to review and approve this document now."
            : "You need to sign this document now.";
        case "waiting": return "Waiting for others to sign. You'll be notified when it's your turn.";
        case "completed": return "This document has been fully completed and finalized.";
        case "approved": return "You have approved this document.";
        case "expired": return "The signing deadline passed before you could act.";
        case "voided": return "The sender voided this request. It can no longer be completed.";
        default: return status.receivedDescription || status.description;
      }
    }
    // Sent tab tooltips
    switch (item.status) {
      case "in_progress": return "The document has been sent and is still awaiting signatures from one or more recipients.";
      case "completed": return "All required recipients have signed and the document is complete.";
      case "declined": return "A recipient declined to sign, so this request is no longer active.";
      case "cancelled": return "You cancelled this signing request before it was completed.";
      case "expired": return "The signing deadline passed before this request was completed.";
      case "voided": return "You stopped this request. The document can no longer be completed.";
      default: return status.description;
    }
  };

  // Get CTA based on role and status
  const getCTA = () => {
    if (viewTab !== "received") {
      return { label: "View", variant: "ghost" as const, icon: <ChevronRight className="w-3.5 h-3.5" /> };
    }
    
    if (item.status === "action_required") {
      if (userRole === "signer") {
        return { label: "Sign", variant: "default" as const, icon: <ArrowRight className="w-3 h-3" /> };
      }
      if (userRole === "approver") {
        return { label: "Review", variant: "default" as const, icon: <ArrowRight className="w-3 h-3" /> };
      }
    }
    
    return { label: "View", variant: "ghost" as const, icon: <ChevronRight className="w-3.5 h-3.5" /> };
  };

  const cta = getCTA();
  const isUrgent = item.status === "action_required";

  // Check if due within 48 hours for time emphasis
  const isDueSoon = expiryDays !== null && expiryDays >= 0 && expiryDays <= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.12 }}
      onClick={onClick}
      className={cn(
        "group relative h-14 px-5 rounded-lg border cursor-pointer transition-all duration-150",
        isSelected
          ? "bg-primary/5 border-primary/20"
          : "bg-transparent border-transparent hover:bg-muted/30 hover:border-border/40"
      )}
    >
      {/* Left indicator for action required only - neutral color */}
      {viewTab === "received" && isUrgent && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-7 bg-foreground/40 rounded-r-full" />
      )}
      
      {/* Grid Layout - consistent columns with better spacing */}
      <div 
        className="h-full grid items-center gap-8"
        style={{ 
          gridTemplateColumns: viewTab === "sent" 
            ? "1fr 110px 100px 44px 70px 104px" 
            : "1fr 110px 80px 80px 90px 104px"
        }}
      >
        
        {/* Col 1: Document */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center">
            <FileText className="w-4.5 h-4.5 text-red-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-foreground truncate leading-tight">
                {item.name.replace(/\.[^/.]+$/, "")}
              </span>
              {item.hasPassword && (
                <Lock className="w-3 h-3 text-muted-foreground/60 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {item.size}
            </p>
          </div>
        </div>

        {/* Col 2: Status with tooltip */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-help">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "gap-1 text-[11px] font-medium whitespace-nowrap px-2 py-0.5 h-5",
                    status.bg, status.color, "border"
                  )}
                >
                  {statusIcons[item.status]}
                  {getReceivedStatusLabel()}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-[240px]">
              {getTooltipText()}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Col 3: Role (Received) OR Recipients (Sent) - muted, not competing */}
        <div className="flex items-center">
          {viewTab === "received" ? (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-[11px] text-muted-foreground/70">
                      {getRoleLabel()}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {recipientRoleConfig[userRole]?.description || "Recipient role"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    {/* Avatar stack - max 2 shown */}
                    <div className="flex -space-x-1">
                      {item.recipients.slice(0, 2).map((r, i) => (
                        <Avatar 
                          key={i} 
                          className={cn(
                            "w-5 h-5 border border-background",
                            r.status === "signed" && "ring-1 ring-emerald-500/40"
                          )}
                        >
                          <AvatarFallback className={cn(
                            "text-[8px]",
                            r.status === "signed" 
                              ? "bg-emerald-500/15 text-emerald-600" 
                              : "bg-muted/60 text-muted-foreground"
                          )}>
                            {r.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {totalRecipients > 2 && (
                        <div className="w-5 h-5 rounded-full bg-muted/60 border border-background flex items-center justify-center text-[8px] text-muted-foreground">
                          +{totalRecipients - 2}
                        </div>
                      )}
                    </div>
                    {/* Progress - primary signal */}
                    <span className="text-xs text-muted-foreground font-medium tabular-nums">
                      {signedCount}/{totalRecipients}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {item.recipients.map(r => (
                    <div key={r.email} className="flex items-center gap-1.5">
                      {r.status === "signed" ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : r.status === "viewed" ? (
                        <Eye className="w-3 h-3 text-blue-400" />
                      ) : (
                        <Clock className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span>{r.name}</span>
                    </div>
                  ))}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Col 4: Views (Sent) OR Sender (Received) - reduced opacity for sender */}
        {viewTab === "sent" ? (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-xs tabular-nums">{item.viewCount || 0}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {item.viewCount || 0} views
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5">
                  <Avatar className="w-5 h-5 opacity-60">
                    <AvatarFallback className="text-[8px] bg-muted/40 text-muted-foreground/70">
                      {item.sender?.name.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] text-muted-foreground/60 truncate max-w-[50px]">
                    {item.sender?.name.split(" ")[0] || "Unknown"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Sent by {item.sender?.name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Col 5: Time/Due - neutral text always, red for expired */}
        <div className="flex items-center">
          <span className={cn(
            "text-[11px] text-muted-foreground/70",
            isDueSoon && isUrgent && "font-medium text-muted-foreground",
            item.status === "expired" && "text-red-500"
          )}>
            {getTimeText()}
          </span>
        </div>

        {/* Col 6: Action - Fixed width, identical styling */}
        <div className="flex items-center justify-end">
          <Button
            variant={cta.variant === "default" ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-[80px] h-8 text-xs font-medium gap-1 justify-center",
              cta.variant !== "default" && "text-muted-foreground hover:text-foreground border-border/50"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {cta.label}
            {cta.icon}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}