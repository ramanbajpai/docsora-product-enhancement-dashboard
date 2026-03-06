import { Eye, Edit3, MessageSquare, Highlighter, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CollaborationMode, UserRole, getModeForRole } from "./types";

interface CollaborationModeSelectorProps {
  currentMode: CollaborationMode;
  userRole: UserRole;
  onModeChange: (mode: CollaborationMode) => void;
}

const modeConfig: Record<CollaborationMode, { 
  icon: typeof Eye; 
  label: string; 
  description: string;
  activeClass: string;
}> = {
  view: { 
    icon: Eye, 
    label: "View", 
    description: "Read-only viewing",
    activeClass: "bg-white/10 text-white"
  },
  edit: { 
    icon: Edit3, 
    label: "Edit", 
    description: "Direct text editing",
    activeClass: "bg-primary text-primary-foreground"
  },
  comment: { 
    icon: MessageSquare, 
    label: "Comment", 
    description: "Select text to add comments",
    activeClass: "bg-blue-500/20 text-blue-400"
  },
  annotate: { 
    icon: Highlighter, 
    label: "Annotate", 
    description: "Add highlights, shapes & marks",
    activeClass: "bg-amber-500/20 text-amber-400"
  },
  suggest: { 
    icon: GitBranch, 
    label: "Suggest", 
    description: "Propose edits for review",
    activeClass: "bg-purple-500/20 text-purple-400"
  },
};

export const CollaborationModeSelector = ({
  currentMode,
  userRole,
  onModeChange,
}: CollaborationModeSelectorProps) => {
  const allowedModes = getModeForRole(userRole);

  return (
    <div className="flex items-center bg-white/5 rounded-md p-0.5">
      {(Object.keys(modeConfig) as CollaborationMode[]).map((mode) => {
        const config = modeConfig[mode];
        const Icon = config.icon;
        const isAllowed = allowedModes.includes(mode);
        const isActive = currentMode === mode;

        return (
          <Tooltip key={mode}>
            <TooltipTrigger asChild>
              <button
                onClick={() => isAllowed && onModeChange(mode)}
                disabled={!isAllowed}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all",
                  isActive && config.activeClass,
                  !isActive && isAllowed && "text-white/50 hover:text-white/70 hover:bg-white/5",
                  !isAllowed && "opacity-30 cursor-not-allowed"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="text-xs">
                <p className="font-medium">{config.label}</p>
                <p className="text-muted-foreground">
                  {isAllowed ? config.description : `Requires ${mode === "edit" || mode === "suggest" || mode === "annotate" ? "editor" : "viewer"} access`}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
