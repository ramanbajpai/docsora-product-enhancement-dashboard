import { useState } from "react";
import { 
  Highlighter, UnderlineIcon, Strikethrough, Square, 
  ArrowUpRight, MessageCircle, Palette, X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CollaborationMode, UserRole, canPerformAction } from "./types";

type AnnotationType = "highlight" | "underline" | "strikethrough" | "rectangle" | "arrow" | "callout";

interface AnnotationToolbarProps {
  activeAnnotation: AnnotationType | null;
  activeColor: string;
  onAnnotationChange: (type: AnnotationType | null) => void;
  onColorChange: (color: string) => void;
  userRole: UserRole;
  currentMode: CollaborationMode;
}

const annotationTools: { type: AnnotationType; icon: typeof Highlighter; label: string }[] = [
  { type: "highlight", icon: Highlighter, label: "Highlight" },
  { type: "underline", icon: UnderlineIcon, label: "Underline" },
  { type: "strikethrough", icon: Strikethrough, label: "Strikethrough" },
  { type: "rectangle", icon: Square, label: "Rectangle" },
  { type: "arrow", icon: ArrowUpRight, label: "Arrow" },
  { type: "callout", icon: MessageCircle, label: "Callout bubble" },
];

const colorOptions = [
  { color: "#FBBF24", name: "Yellow" },
  { color: "#34D399", name: "Green" },
  { color: "#60A5FA", name: "Blue" },
  { color: "#F472B6", name: "Pink" },
  { color: "#A78BFA", name: "Purple" },
  { color: "#FB923C", name: "Orange" },
];

export const AnnotationToolbar = ({
  activeAnnotation,
  activeColor,
  onAnnotationChange,
  onColorChange,
  userRole,
  currentMode,
}: AnnotationToolbarProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const canAnnotate = canPerformAction(userRole, currentMode, "annotate");

  return (
    <div className="flex items-center gap-0.5 bg-white/5 rounded-md p-1">
      {annotationTools.map(({ type, icon: Icon, label }) => (
        <Tooltip key={type}>
          <TooltipTrigger asChild>
            <button
              onClick={() => canAnnotate && onAnnotationChange(activeAnnotation === type ? null : type)}
              disabled={!canAnnotate}
              className={cn(
                "p-1.5 rounded transition-colors",
                activeAnnotation === type 
                  ? "bg-white/15 text-white" 
                  : "text-white/50 hover:text-white/70 hover:bg-white/5",
                !canAnnotate && "opacity-30 cursor-not-allowed"
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {canAnnotate ? label : "Switch to Comment, Suggest, or Edit mode"}
          </TooltipContent>
        </Tooltip>
      ))}

      {/* Color picker */}
      <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
        <PopoverTrigger asChild>
          <button
            disabled={!canAnnotate}
            className={cn(
              "p-1.5 rounded transition-colors ml-1",
              "text-white/50 hover:text-white/70 hover:bg-white/5",
              !canAnnotate && "opacity-30 cursor-not-allowed"
            )}
          >
            <div 
              className="w-4 h-4 rounded-sm border border-white/20"
              style={{ backgroundColor: activeColor }}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="end">
          <div className="grid grid-cols-6 gap-1.5">
            {colorOptions.map(({ color, name }) => (
              <Tooltip key={color}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      onColorChange(color);
                      setShowColorPicker(false);
                    }}
                    className={cn(
                      "w-6 h-6 rounded-md transition-transform hover:scale-110",
                      activeColor === color && "ring-2 ring-white ring-offset-2 ring-offset-background"
                    )}
                    style={{ backgroundColor: color }}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom">{name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear annotation tool */}
      {activeAnnotation && (
        <button
          onClick={() => onAnnotationChange(null)}
          className="p-1.5 rounded text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
