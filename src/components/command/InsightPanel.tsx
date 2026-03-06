import { motion } from "framer-motion";
import { Sparkles, X, Clock, User, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CommandDocument } from "@/hooks/useCommandSearch";

interface InsightPanelProps {
  document: CommandDocument;
  onClose: () => void;
}

export function InsightPanel({ document, onClose }: InsightPanelProps) {
  // Mock insights based on document
  const insights = [
    document.aiInsight && {
      type: "status",
      icon: Clock,
      title: "Status Analysis",
      content: document.aiInsight,
    },
    document.signers?.some(s => s.status === "pending" && (s.daysIdle || 0) >= 3) && {
      type: "blocker",
      icon: User,
      title: "Potential Blocker",
      content: `${document.signers?.find(s => s.status === "pending")?.name} has been inactive for ${document.signers?.find(s => s.status === "pending")?.daysIdle} days. Consider sending a gentle reminder.`,
    },
    document.riskLevel === "high" && {
      type: "risk",
      icon: AlertTriangle,
      title: "Risk Assessment",
      content: "This document shows signs of potential delays. Similar documents have a 35% chance of requiring revision.",
    },
    {
      type: "prediction",
      icon: TrendingUp,
      title: "Completion Prediction",
      content: document.status === "pending" 
        ? "Based on historical patterns, this document is likely to be completed within 3-5 business days."
        : "This document has been successfully completed.",
    },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      className="rounded-xl border border-primary/20 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-medium text-foreground">AI Insights</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{document.name}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Insights */}
      <div className="p-4 space-y-3">
        {insights.map((insight, i) => {
          if (!insight) return null;
          const Icon = insight.icon;
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "flex gap-3 p-3 rounded-lg",
                "bg-muted/30 border border-border/50"
              )}
            >
              <div className={cn(
                "flex-shrink-0 p-1.5 rounded-md",
                insight.type === "risk" ? "bg-destructive/10" : "bg-primary/10"
              )}>
                <Icon className={cn(
                  "w-3.5 h-3.5",
                  insight.type === "risk" ? "text-destructive" : "text-primary"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground mb-0.5">
                  {insight.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {insight.content}
                </p>
              </div>
            </motion.div>
          );
        })}

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground/60 text-center pt-2">
          AI predictions are based on historical patterns and may not reflect actual outcomes
        </p>
      </div>
    </motion.div>
  );
}
