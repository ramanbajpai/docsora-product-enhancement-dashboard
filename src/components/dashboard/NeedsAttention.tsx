import { motion } from "framer-motion";
import { 
  ArrowRight, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  PenTool,
  Send,
  Sparkles,
  AlertCircle,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

type AttentionItemType = 
  | "signature_pending" 
  | "signature_request" 
  | "transfer_expiring" 
  | "transfer_download"
  | "action_failed" 
  | "ai_review";

interface AttentionItem {
  id: string;
  title: string;
  description: string;
  type: AttentionItemType;
  urgency: "high" | "medium" | "low";
  time: string;
  actionLabel?: string;
}

const mockAttentionItems: AttentionItem[] = [
  {
    id: "1",
    title: "NDA Agreement - Acme Corp",
    description: "Awaiting signature from John Smith",
    type: "signature_pending",
    urgency: "medium",
    time: "2 hours ago",
    actionLabel: "Send reminder",
  },
  {
    id: "2",
    title: "Contract Review Request",
    description: "Sarah requested your signature",
    type: "signature_request",
    urgency: "high",
    time: "30 minutes ago",
    actionLabel: "Review & Sign",
  },
  {
    id: "3",
    title: "Q4 Financial Report",
    description: "AI Check complete — 3 suggestions to review",
    type: "ai_review",
    urgency: "medium",
    time: "1 hour ago",
    actionLabel: "Review suggestions",
  },
  {
    id: "4",
    title: "Transfer to Partner Inc",
    description: "Link expires in 2 days — not yet downloaded",
    type: "transfer_expiring",
    urgency: "high",
    time: "Yesterday",
    actionLabel: "Resend link",
  },
];

const typeConfig = {
  signature_pending: {
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
    borderAccent: "border-l-warning",
  },
  signature_request: {
    icon: PenTool,
    color: "text-primary",
    bg: "bg-primary/10",
    borderAccent: "border-l-primary",
  },
  transfer_expiring: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    borderAccent: "border-l-destructive",
  },
  transfer_download: {
    icon: Download,
    color: "text-success",
    bg: "bg-success/10",
    borderAccent: "border-l-success",
  },
  action_failed: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    borderAccent: "border-l-destructive",
  },
  ai_review: {
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
    borderAccent: "border-l-primary",
  },
};

const urgencyOrder = { high: 0, medium: 1, low: 2 };

export function NeedsAttention() {
  const sortedItems = [...mockAttentionItems].sort(
    (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
  );

  if (sortedItems.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card-elevated p-6 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-success" />
        </div>
        <h3 className="font-medium text-foreground">All caught up</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No items need your attention right now
        </p>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-hint text-xs text-muted-foreground tracking-wider">
            Action required
          </span>
          <h2 className="text-lg font-semibold text-foreground mt-1">
            Needs Attention
          </h2>
        </div>
        <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
          View all
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="space-y-3">
        {sortedItems.map((item, index) => {
          const config = typeConfig[item.type];
          const TypeIcon = config.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
              className={cn(
                "glass-card p-4 cursor-pointer group border-l-4",
                "hover:shadow-md transition-all duration-200",
                config.borderAccent
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  config.bg
                )}>
                  <TypeIcon className={cn("w-5 h-5", config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </h3>
                        {item.urgency === "high" && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-destructive/10 text-destructive rounded">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">
                        {item.description}
                      </p>
                    </div>
                    
                    {item.actionLabel && (
                      <button className={cn(
                        "shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                        "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                      )}>
                        {item.actionLabel}
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    {item.time}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
