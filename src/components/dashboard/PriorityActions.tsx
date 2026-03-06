import { motion, AnimatePresence } from "framer-motion";
import { 
  PenTool, 
  CheckCircle2, 
  FileText,
  ArrowRight,
  Sparkles,
  Send,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "signer" | "approver" | "sender" | "cc";
type UrgencyLevel = "critical" | "high" | "medium";

interface PriorityAction {
  id: string;
  title: string;
  reason: string;
  role: UserRole;
  urgency: UrgencyLevel;
  cta: string;
  ctaAction: "sign" | "review" | "resend" | "view";
  dueDate?: string;
  aiInsight?: string;
}

const mockPriorityActions: PriorityAction[] = [
  {
    id: "1",
    title: "Master Services Agreement - TechCorp",
    reason: "Signature required · Due today",
    role: "signer",
    urgency: "critical",
    cta: "Sign",
    ctaAction: "sign",
    dueDate: "Today",
    aiInsight: "Typically completed within 48 hours",
  },
  {
    id: "2",
    title: "Q4 Budget Proposal",
    reason: "Approval pending · Expires in 2 days",
    role: "approver",
    urgency: "high",
    cta: "Review",
    ctaAction: "review",
    dueDate: "2 days",
  },
  {
    id: "3",
    title: "NDA - Partner Inc",
    reason: "Recipient declined · Revision recommended",
    role: "sender",
    urgency: "critical",
    cta: "Resend",
    ctaAction: "resend",
    aiInsight: "May require revision before approval",
  },
  {
    id: "4",
    title: "Employment Contract - J. Smith",
    reason: "No activity for 5 days",
    role: "sender",
    urgency: "medium",
    cta: "View",
    ctaAction: "view",
  },
];

// Neutral role badges - no color coding
const roleConfig: Record<UserRole, { label: string }> = {
  signer: { label: "Signer" },
  approver: { label: "Approver" },
  sender: { label: "Sender" },
  cc: { label: "CC" },
};

// All CTAs use primary blue - no red/yellow buttons
const ctaConfig: Record<string, { icon: typeof PenTool }> = {
  sign: { icon: PenTool },
  review: { icon: Eye },
  resend: { icon: Send },
  view: { icon: ArrowRight },
};

export function PriorityActions() {
  const sortedActions = [...mockPriorityActions].sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  if (sortedActions.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card-elevated p-6 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground">All clear</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No priority actions right now
        </p>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Your Priority Actions
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {sortedActions.length} item{sortedActions.length !== 1 ? 's' : ''} requiring your attention
        </p>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sortedActions.map((action, index) => {
            const role = roleConfig[action.role];
            const cta = ctaConfig[action.ctaAction];
            const CtaIcon = cta.icon;
            const isCritical = action.urgency === "critical";

            return (
              <motion.div
                key={action.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className={cn(
                  "glass-card p-4 cursor-pointer group relative",
                  "hover:shadow-sm transition-all duration-200"
                )}
              >
                {/* Subtle left accent - primary blue at 30% opacity */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/30 rounded-l-lg" />

                <div className="flex items-start gap-3 pl-2">
                  {/* Document icon - neutral */}
                  <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {/* Title - semibold for critical, medium for others */}
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className={cn(
                            "text-foreground group-hover:text-primary transition-colors truncate",
                            isCritical ? "font-semibold" : "font-medium"
                          )}>
                            {action.title}
                          </h3>
                          {/* Neutral role badge */}
                          <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full bg-muted text-muted-foreground">
                            {role.label}
                          </span>
                        </div>

                        {/* Reason - neutral, factual */}
                        <p className="text-sm text-muted-foreground">
                          {action.reason}
                        </p>

                        {/* AI Insight - smaller, muted, assistive */}
                        {action.aiInsight && (
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                            <Sparkles className="w-3 h-3 shrink-0 opacity-50" />
                            <span>{action.aiInsight}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA Button - always primary blue */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {action.cta}
                        <CtaIcon className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
