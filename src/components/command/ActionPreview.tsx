import { useState } from "react";
import { motion } from "framer-motion";
import { 
  PenTool, Eye, Send, Minimize2, FileText, Search, 
  Sparkles, Bell, HelpCircle, ArrowRight, ChevronDown,
  User, Clock, AlertCircle, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DetectedIntent, IntentType } from "@/hooks/useIntentDetection";

interface ActionPreviewProps {
  intent: DetectedIntent;
  documentName?: string;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

const INTENT_ICONS: Record<IntentType, React.ElementType> = {
  sign: PenTool,
  review: Eye,
  transfer: Send,
  compress: Minimize2,
  convert: FileText,
  search: Search,
  insight: Sparkles,
  remind: Bell,
  unknown: HelpCircle,
};

const INTENT_COLORS: Record<IntentType, string> = {
  sign: "text-primary",
  review: "text-amber-500",
  transfer: "text-emerald-500",
  compress: "text-purple-500",
  convert: "text-blue-500",
  search: "text-muted-foreground",
  insight: "text-primary",
  remind: "text-orange-500",
  unknown: "text-muted-foreground",
};

// Mock data for action previews
const MOCK_PREVIEW_DATA = {
  sign: {
    workflow: "Sequential Signing",
    recipients: ["John Smith", "HR Department"],
    signingOrder: ["HR Department", "John Smith"],
    deadline: "Jan 18, 2026",
    reminderRules: "Auto-remind after 48 hours of inactivity",
    aiInsight: "Based on similar documents, expect completion in 2-3 days",
  },
  review: {
    workflow: "Internal Review",
    recipients: ["Legal Team", "Finance"],
    deadline: "Jan 17, 2026",
    aiInsight: "Legal reviews typically take 1-2 business days",
  },
  remind: {
    pendingSigners: ["TechCorp Legal"],
    daysSinceLastActivity: 3,
    aiInsight: "This signer usually responds within 24 hours of a reminder",
  },
  transfer: {
    securityLevel: "End-to-end encrypted",
    expiresIn: "7 days",
    downloadLimit: "Unlimited",
  },
};

export function ActionPreview({
  intent,
  documentName = "Untitled Document",
  onConfirm,
  onEdit,
  onCancel,
}: ActionPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = INTENT_ICONS[intent.type];
  const iconColor = INTENT_COLORS[intent.type];
  
  const previewData = MOCK_PREVIEW_DATA[intent.type as keyof typeof MOCK_PREVIEW_DATA];
  const recipients = intent.extractedEntities.recipients?.length 
    ? intent.extractedEntities.recipients 
    : (previewData as any)?.recipients || [];
  
  const signingOrder = intent.extractedEntities.signingOrder?.length
    ? intent.extractedEntities.signingOrder
    : (previewData as any)?.signingOrder;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-surface-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-background", iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{intent.action}</h3>
            <p className="text-xs text-muted-foreground">{intent.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {Math.round(intent.confidence * 100)}% match
          </Badge>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )} />
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 py-4 space-y-4"
        >
          {/* Document */}
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Document</p>
              <p className="text-sm text-foreground">{documentName}</p>
            </div>
          </div>

          {/* Recipients */}
          {recipients.length > 0 && (
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recipients</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {recipients.map((recipient, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {recipient}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Signing Order */}
          {signingOrder && signingOrder.length > 0 && (
            <div className="flex items-start gap-3">
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Signing Order</p>
                <div className="flex items-center gap-2 mt-1">
                  {signingOrder.map((signer, i) => (
                    <div key={i} className="flex items-center">
                      <Badge variant="outline" className="text-xs">
                        {i + 1}. {signer}
                      </Badge>
                      {i < signingOrder.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-muted-foreground mx-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Deadline */}
          {((previewData as any)?.deadline || intent.extractedEntities.deadline) && (
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deadline</p>
                <p className="text-sm text-foreground">
                  {intent.extractedEntities.deadline || (previewData as any)?.deadline}
                </p>
              </div>
            </div>
          )}

          {/* Reminder rules */}
          {(previewData as any)?.reminderRules && (
            <div className="flex items-start gap-3">
              <Bell className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reminder Rules</p>
                <p className="text-sm text-foreground">{(previewData as any).reminderRules}</p>
              </div>
            </div>
          )}

          {/* AI Insight */}
          {(previewData as any)?.aiInsight && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Sparkles className="w-4 h-4 text-primary/70 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {(previewData as any).aiInsight}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-muted-foreground"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              size="sm"
              onClick={onConfirm}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Confirm
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
