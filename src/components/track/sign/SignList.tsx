import { motion } from "framer-motion";
import { 
  FileText, Lock, Eye, Clock, CheckCircle2, XCircle, 
  AlertCircle, Users, ArrowRight, Ban
} from "lucide-react";
import { SignItem, signStatusConfig, SignStatus } from "./types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";

interface SignListProps {
  items: SignItem[];
  selectedItem: SignItem | null;
  onSelectItem: (item: SignItem) => void;
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

export function SignList({ items, selectedItem, onSelectItem }: SignListProps) {
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
          No signing activity yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Sign requests you send or receive will appear here.
        </p>
      </motion.div>
    );
  }

  // Group items by status for visual clarity
  const actionRequired = items.filter(i => i.status === "action_required");
  const waitingForOthers = items.filter(i => i.status === "in_progress");
  const completed = items.filter(i => i.status === "completed");
  const terminal = items.filter(i => i.status === "declined" || i.status === "expired" || i.status === "cancelled");

  const renderSection = (sectionItems: SignItem[], title?: string) => {
    if (sectionItems.length === 0) return null;
    return (
      <div className="space-y-2">
        {sectionItems.map((item, index) => (
          <SignListItem
            key={item.id}
            item={item}
            isSelected={selectedItem?.id === item.id}
            onClick={() => onSelectItem(item)}
            index={index}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {renderSection(actionRequired)}
      {renderSection(waitingForOthers)}
      {renderSection(completed)}
      {renderSection(terminal)}
    </div>
  );
}

function SignListItem({
  item,
  isSelected,
  onClick,
  index,
}: {
  item: SignItem;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) {
  const status = signStatusConfig[item.status];
  const expiryDays = item.expiresAt ? differenceInDays(item.expiresAt, new Date()) : null;
  const isExpiringSoon = expiryDays !== null && expiryDays <= 3 && expiryDays > 0 && 
    (item.status === "action_required" || item.status === "in_progress");
  
  // Calculate signing progress for waiting_for_others
  const signedCount = item.recipients.filter(r => r.status === "signed").length;
  const totalRecipients = item.recipients.length;

  // Find who is blocking (first non-signed recipient)
  const blocker = item.recipients.find(r => r.status !== "signed");

  // Determine if user is a recipient (has sender field)
  const isReceivedDocument = !!item.sender;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      onClick={onClick}
      className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5"
          : "bg-card/50 border-border/50 hover:bg-card hover:border-border hover:shadow-md"
      }`}
    >

      <div className="flex items-center gap-4">
        {/* File Icon */}
        <div className={`shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center ${
          item.status === "action_required" 
            ? "bg-amber-500/10 border-amber-500/30" 
            : "bg-muted/30 border-border/30"
        }`}>
          <FileText className={`w-5 h-5 ${
            item.status === "action_required" ? "text-amber-400" : "text-red-400"
          }`} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground truncate">{item.name}</span>
            {item.hasPassword && (
              <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{item.size}</span>
            <span>•</span>
            {isReceivedDocument ? (
              <span>From {item.sender?.name}</span>
            ) : (
              <span>{formatDistanceToNow(item.sentAt, { addSuffix: true })}</span>
            )}
            {item.status === "in_progress" && blocker && (
              <>
                <span>•</span>
                <span className="text-amber-400">Waiting on {blocker.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <Badge 
          variant="outline" 
          className={`${status.bg} ${status.color} border shrink-0 gap-1.5 font-medium`}
        >
          {statusIcons[item.status]}
          {status.label}
        </Badge>

        {/* Signing Progress (for waiting_for_others with multiple recipients) */}
        {item.status === "in_progress" && totalRecipients > 1 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Users className="w-3.5 h-3.5" />
            <span>{signedCount}/{totalRecipients}</span>
          </div>
        )}

        {/* Recipients/Sender Avatar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center -space-x-2 shrink-0 w-[70px] justify-start">
                {isReceivedDocument && item.sender ? (
                  <Avatar className="w-7 h-7 border-2 border-background">
                    <AvatarFallback className="text-[10px] bg-muted">
                      {item.sender.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <>
                    {item.recipients.slice(0, 2).map((recipient, i) => (
                      <Avatar key={i} className={`w-7 h-7 border-2 border-background ${
                        recipient.status === "declined" ? "ring-1 ring-red-500" : ""
                      }`}>
                        <AvatarFallback className="text-[10px] bg-muted">
                          {recipient.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {item.recipients.length > 2 && (
                      <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] text-muted-foreground">
                        +{item.recipients.length - 2}
                      </div>
                    )}
                  </>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                {isReceivedDocument 
                  ? `From: ${item.sender?.name}`
                  : item.recipients.map(r => r.name).join(", ")
                }
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* View count */}
        {!isReceivedDocument && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Eye className="w-3.5 h-3.5" />
            {item.viewCount}
          </div>
        )}

        {/* Deadline / Status Info */}
        <div className="flex flex-col items-end shrink-0 min-w-[120px]">
          {(item.status === "action_required" || item.status === "in_progress") && item.expiresAt && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{format(item.expiresAt, "MMM d, yyyy")}</span>
              </div>
              {expiryDays !== null && expiryDays > 0 && (
                <span className={`text-xs ${isExpiringSoon ? "text-amber-400 font-medium" : "text-muted-foreground"}`}>
                  {expiryDays} {expiryDays === 1 ? "day" : "days"} left
                </span>
              )}
            </>
          )}
          {item.status === "expired" && item.expiresAt && (
            <span className="text-xs text-muted-foreground">
              Expired {formatDistanceToNow(item.expiresAt, { addSuffix: true })}
            </span>
          )}
          {item.status === "completed" && (
            <span className="text-xs text-[#22C55E]">
              Completed {formatDistanceToNow(item.lastActivity, { addSuffix: true })}
            </span>
          )}
          {item.status === "declined" && (
            <span className="text-xs text-[#EF4444]">
              Declined {formatDistanceToNow(item.lastActivity, { addSuffix: true })}
            </span>
          )}
          {item.status === "cancelled" && (
            <span className="text-xs text-[#6B7280]">
              Cancelled {formatDistanceToNow(item.lastActivity, { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Quick action for action_required */}
        {item.status === "action_required" && (
          <Button
            size="sm"
            className="shrink-0 gap-1 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Review & Sign
            <ArrowRight className="w-3 h-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
