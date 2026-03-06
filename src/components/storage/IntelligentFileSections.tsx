import { motion } from "framer-motion";
import { 
  Clock, PenTool, AlertCircle, Users, 
  ChevronRight, Sparkles, FileText, Folder
} from "lucide-react";
import { StorageFile } from "@/pages/Storage";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IntelligentFileSectionsProps {
  files: StorageFile[];
  onFileClick: (file: StorageFile) => void;
  onAIInsight: (file: StorageFile) => void;
}

interface FileSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  files: StorageFile[];
  emptyMessage: string;
}

const getFileIcon = (type: StorageFile['type'], size: "sm" | "md" = "sm") => {
  const sizeClasses = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const textSize = size === "sm" ? "text-[9px]" : "text-xs";
  
  switch (type) {
    case "pdf":
      return (
        <div className={cn(sizeClasses, "rounded-lg bg-red-500/10 flex items-center justify-center")}>
          <span className={cn(textSize, "font-bold text-red-500")}>PDF</span>
        </div>
      );
    case "docx":
      return (
        <div className={cn(sizeClasses, "rounded-lg bg-blue-500/10 flex items-center justify-center")}>
          <span className={cn(textSize, "font-bold text-blue-500")}>DOCX</span>
        </div>
      );
    case "mp4":
      return (
        <div className={cn(sizeClasses, "rounded-lg bg-amber-500/10 flex items-center justify-center")}>
          <span className={cn(textSize, "font-bold text-amber-500")}>MP4</span>
        </div>
      );
    case "folder":
      return (
        <div className={cn(sizeClasses, "rounded-lg bg-amber-500/10 flex items-center justify-center")}>
          <Folder className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
        </div>
      );
    default:
      return (
        <div className={cn(sizeClasses, "rounded-lg bg-muted flex items-center justify-center")}>
          <FileText className={cn(size === "sm" ? "w-4 h-4" : "w-5 h-5", "text-muted-foreground")} />
        </div>
      );
  }
};

// AI summary snippets for demo
const aiSummaries: Record<string, string> = {
  "1": "Resume for Estelle Darcy, Senior Graphic Designer with 6+ years experience in branding and UI/UX.",
  "2": "Product introduction deck covering Docsora's AI-powered document features and pricing.",
  "3": "Quick start guide for new users covering upload, sign, and share workflows.",
  "6": "Draft marketing copy for upcoming Docsora feature announcement.",
};

const IntelligentFileSections = ({ files, onFileClick, onAIInsight }: IntelligentFileSectionsProps) => {
  // Categorize files into intelligent sections
  const sections: FileSection[] = [
    {
      id: "recently-edited",
      title: "Recent files",
      icon: Clock,
      iconColor: "text-primary",
      files: files.slice(0, 3),
      emptyMessage: "No recently edited files"
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section, sectionIndex) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: sectionIndex * 0.08 }}
          className="space-y-3"
        >
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <section.icon className={cn("w-4 h-4", section.iconColor)} />
              <h3 className="text-sm font-medium text-foreground">{section.title}</h3>
              {section.files.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-surface-2 text-[10px] text-muted-foreground">
                  {section.files.length}
                </span>
              )}
            </div>
            {section.files.length > 0 && (
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                View all
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Files grid */}
          {section.files.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.files.map((file, fileIndex) => (
                <TooltipProvider key={file.id} delayDuration={400}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: fileIndex * 0.05 }}
                        whileHover={{ y: -2 }}
                        onClick={() => onFileClick(file)}
                        className="group flex items-center gap-3 p-3 rounded-xl bg-surface-2/50 hover:bg-surface-2 border border-border/30 hover:border-border/50 cursor-pointer transition-all"
                      >
                        {getFileIcon(file.type)}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground">
                              {file.lastModified}
                            </span>
                          </div>
                        </div>

                        {/* AI badge - only for PDFs */}
                        {file.type === "pdf" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAIInsight(file);
                            }}
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    </TooltipTrigger>
                    
                    {/* AI Summary tooltip */}
                    {aiSummaries[file.id] && (
                      <TooltipContent 
                        side="top" 
                        className="max-w-[280px] p-3 bg-card border border-border/50"
                      >
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-medium text-primary uppercase tracking-wider mb-1">
                              AI Summary
                            </p>
                            <p className="text-xs text-foreground leading-relaxed">
                              {aiSummaries[file.id]}
                            </p>
                          </div>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface-2/30 border border-border/20">
              <p className="text-sm text-muted-foreground text-center">
                {section.emptyMessage}
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default IntelligentFileSections;
