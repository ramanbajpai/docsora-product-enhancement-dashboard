import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Play,
  CheckCircle2,
  Clock,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

type WorkStatus = "needs_action" | "waiting" | "completed";
type UserRole = "signer" | "approver" | "sender" | "reviewer";

interface WorkItem {
  id: string;
  title: string;
  type: string;
  status: WorkStatus;
  role: UserRole;
  progress?: number;
  lastUpdate: string;
  actionLabel?: string;
  waitingOn?: string;
  aiInsight?: string;
}

const mockWorkItems: WorkItem[] = [
  // Needs your action
  {
    id: "1",
    title: "Employee Handbook 2024.docx",
    type: "AI Check",
    status: "needs_action",
    role: "reviewer",
    progress: 75,
    lastUpdate: "3 suggestions to review",
    actionLabel: "Continue review",
  },
  {
    id: "2",
    title: "Vendor Agreement - DataCorp",
    type: "Signature",
    status: "needs_action",
    role: "signer",
    lastUpdate: "Your signature required",
    actionLabel: "Sign now",
  },
  // Waiting on others
  {
    id: "3",
    title: "Partnership Agreement",
    type: "Signature",
    status: "waiting",
    role: "sender",
    progress: 50,
    lastUpdate: "1 of 2 signed",
    waitingOn: "Sarah Chen",
    aiInsight: "Usually responds within 24 hours",
  },
  {
    id: "4",
    title: "Office Lease Amendment",
    type: "Approval",
    status: "waiting",
    role: "sender",
    progress: 33,
    lastUpdate: "1 of 3 approved",
    waitingOn: "Legal Team",
  },
  // Recently completed
  {
    id: "5",
    title: "Q3 Financial Report",
    type: "AI Check",
    status: "completed",
    role: "reviewer",
    lastUpdate: "Completed 2 hours ago",
  },
  {
    id: "6",
    title: "Client NDA - Acme Corp",
    type: "Signature",
    status: "completed",
    role: "sender",
    lastUpdate: "Completed yesterday",
  },
];

const statusGroups: { key: WorkStatus; label: string; icon: typeof Clock }[] = [
  { key: "needs_action", label: "Needs your action", icon: Play },
  { key: "waiting", label: "Waiting on others", icon: Clock },
  { key: "completed", label: "Recently completed", icon: CheckCircle2 },
];

const roleConfig: Record<UserRole, { label: string; color: string }> = {
  signer: { label: "Signer", color: "text-primary" },
  approver: { label: "Approver", color: "text-amber-600 dark:text-amber-400" },
  sender: { label: "Sender", color: "text-muted-foreground" },
  reviewer: { label: "Reviewer", color: "text-primary" },
};

export function ActiveWork() {
  const [expandedGroups, setExpandedGroups] = useState<Record<WorkStatus, boolean>>({
    needs_action: false,
    waiting: false,
    completed: false,
  });

  const groupedItems = statusGroups.map(group => ({
    ...group,
    items: mockWorkItems.filter(item => item.status === group.key),
  }));

  const toggleGroup = (key: WorkStatus) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (mockWorkItems.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Active Work</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track your documents and workflows
        </p>
      </div>

      <div className="space-y-4">
        {groupedItems.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroups[group.key];
          const hasItems = group.items.length > 0;

          return (
            <div key={group.key} className="glass-card overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.key)}
                className={cn(
                  "w-full flex items-center justify-between p-4 text-left",
                  "hover:bg-muted/50 transition-colors",
                  !hasItems && "opacity-50 cursor-default"
                )}
                disabled={!hasItems}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    group.key === "needs_action" ? "bg-primary/10" :
                    group.key === "waiting" ? "bg-amber-500/10" : "bg-success/10"
                  )}>
                    <GroupIcon className={cn(
                      "w-4 h-4",
                      group.key === "needs_action" ? "text-primary" :
                      group.key === "waiting" ? "text-amber-500" : "text-success"
                    )} />
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{group.label}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({group.items.length})
                    </span>
                  </div>
                </div>
                {hasItems && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                )}
              </button>

              {/* Group Items */}
              <AnimatePresence>
                {isExpanded && hasItems && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border"
                  >
                    <div className="divide-y divide-border">
                      {group.items.map((item, index) => (
                        <WorkItemCard 
                          key={item.id} 
                          item={item} 
                          index={index}
                          isCompleted={group.key === "completed"}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}

interface WorkItemCardProps {
  item: WorkItem;
  index: number;
  isCompleted: boolean;
}

function WorkItemCard({ item, index, isCompleted }: WorkItemCardProps) {
  const role = roleConfig[item.role];
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success animation for newly completed items
  const handleComplete = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        "p-4 group cursor-pointer relative",
        "hover:bg-muted/30 transition-colors",
        isCompleted && "opacity-70"
      )}
    >
      {/* Success animation overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-success/10 z-10"
          >
            <CheckCircle2 className="w-8 h-8 text-success" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3">
        {/* Document icon */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          isCompleted ? "bg-success/10" : "bg-surface-2"
        )}>
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <FileText className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* Title and role */}
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {item.title}
                </h4>
                <span className={cn("text-[10px] font-medium", role.color)}>
                  • {role.label}
                </span>
              </div>

              {/* Type and status */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{item.type}</span>
                <span>•</span>
                <span>{item.lastUpdate}</span>
              </div>

              {/* Waiting on info */}
              {item.waitingOn && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <Users className="w-3 h-3" />
                  <span>Waiting on {item.waitingOn}</span>
                </div>
              )}

              {/* Progress bar - animates on state change */}
              {item.progress !== undefined && !isCompleted && (
                <div className="mt-2">
                  <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        item.status === "waiting" ? "bg-amber-500" : "bg-primary"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                </div>
              )}

              {/* AI Insight */}
              {item.aiInsight && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-primary/70">
                  <Sparkles className="w-3 h-3 shrink-0 mt-0.5" />
                  <span className="italic">{item.aiInsight}</span>
                </div>
              )}
            </div>

            {/* Action button */}
            {item.actionLabel && !isCompleted && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {item.actionLabel}
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            )}

            {isCompleted && (
              <span className="shrink-0 text-xs text-success font-medium">
                Complete
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
