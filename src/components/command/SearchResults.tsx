import { motion } from "framer-motion";
import { 
  AlertCircle, Clock, CheckCircle2, XCircle, 
  FileText, PenTool, Eye, Send, Bell, Sparkles,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SearchResultGroup, CommandDocument } from "@/hooks/useCommandSearch";

interface SearchResultsProps {
  groups: SearchResultGroup[];
  onDocumentAction: (doc: CommandDocument, action: "sign" | "remind" | "view") => void;
  onShowInsight: (doc: CommandDocument) => void;
}

const CATEGORY_CONFIG: Record<string, { 
  icon: React.ElementType; 
  color: string;
  bgColor: string;
}> = {
  needs_action: { 
    icon: AlertCircle, 
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  in_progress: { 
    icon: Clock, 
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  at_risk: { 
    icon: XCircle, 
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  completed: { 
    icon: CheckCircle2, 
    color: "text-success",
    bgColor: "bg-success/10",
  },
};

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  signed: { label: "Signed", variant: "default" },
  declined: { label: "Declined", variant: "destructive" },
  draft: { label: "Draft", variant: "outline" },
  expired: { label: "Expired", variant: "destructive" },
};

function DocumentCard({ 
  doc, 
  onAction,
  onShowInsight,
}: { 
  doc: CommandDocument;
  onAction: (action: "sign" | "remind" | "view") => void;
  onShowInsight: () => void;
}) {
  const blockedBy = doc.signers?.find(s => s.status === "pending" && (s.daysIdle || 0) > 0);
  const statusConfig = STATUS_BADGES[doc.status];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group flex items-center gap-4 p-3 rounded-lg",
        "border border-transparent hover:border-border",
        "hover:bg-muted/30 transition-all duration-150 cursor-pointer"
      )}
    >
      {/* Document icon */}
      <div className="flex-shrink-0 p-2 rounded-lg bg-muted/50">
        <FileText className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground truncate">{doc.name}</h4>
          <Badge 
            variant={statusConfig.variant} 
            className="text-[10px] px-1.5 py-0"
          >
            {statusConfig.label}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3 mt-1">
          {blockedBy && (
            <span className="text-xs text-muted-foreground">
              Waiting on <span className="text-foreground">{blockedBy.name}</span>
              {blockedBy.daysIdle && ` · ${blockedBy.daysIdle}d idle`}
            </span>
          )}
          {!blockedBy && doc.lastActivity && (
            <span className="text-xs text-muted-foreground">
              Last activity: {doc.lastActivity}
            </span>
          )}
        </div>
      </div>

      {/* Actions - visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {doc.aiInsight && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onShowInsight(); }}
            className="h-7 px-2 text-muted-foreground hover:text-primary"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </Button>
        )}
        {doc.status === "pending" && doc.daysIdle >= 2 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onAction("remind"); }}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">Remind</span>
          </Button>
        )}
        {doc.status === "pending" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onAction("sign"); }}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <PenTool className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">Sign</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onAction("view"); }}
          className="h-7 px-2"
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          <span className="text-xs">View</span>
        </Button>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
    </motion.div>
  );
}

export function SearchResults({ groups, onDocumentAction, onShowInsight }: SearchResultsProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="w-8 h-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No documents found</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const config = CATEGORY_CONFIG[group.category];
        const Icon = config.icon;
        
        return (
          <div key={group.category}>
            {/* Group header */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className={cn("p-1 rounded", config.bgColor)}>
                <Icon className={cn("w-3 h-3", config.color)} />
              </div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {group.label}
              </h3>
              <span className="text-xs text-muted-foreground/70">
                ({group.documents.length})
              </span>
            </div>

            {/* Documents */}
            <div className="space-y-1">
              {group.documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onAction={(action) => onDocumentAction(doc, action)}
                  onShowInsight={() => onShowInsight(doc)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
