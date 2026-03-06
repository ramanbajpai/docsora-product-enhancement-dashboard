import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DocumentSuggestion } from "@/pages/AICheck";

// Configuration for highlight styles per type
export const highlightStyles = {
  grammar: {
    label: "Grammar",
    // Docsora blue tint
    bgDefault: "bg-primary/10 dark:bg-primary/15",
    underline: "decoration-primary/50 dark:decoration-primary/60",
    bgHover: "bg-primary/20 dark:bg-primary/25",
    tooltipAccent: "bg-primary/10 dark:bg-primary/20 text-primary border-primary/20",
    badgeColor: "bg-primary/15 text-primary border-primary/25",
  },
  spelling: {
    label: "Spelling",
    // Docsora red/orange tint
    bgDefault: "bg-amber-500/10 dark:bg-amber-500/15",
    underline: "decoration-amber-500/50 dark:decoration-amber-500/60",
    bgHover: "bg-amber-500/20 dark:bg-amber-500/25",
    tooltipAccent: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
  },
  clarity: {
    label: "Clarity",
    bgDefault: "bg-sky-500/10 dark:bg-sky-500/15",
    underline: "decoration-sky-500/50 dark:decoration-sky-500/60",
    bgHover: "bg-sky-500/20 dark:bg-sky-500/25",
    tooltipAccent: "bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/20",
    badgeColor: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25",
  },
  style: {
    label: "Style",
    bgDefault: "bg-violet-500/10 dark:bg-violet-500/15",
    underline: "decoration-violet-500/50 dark:decoration-violet-500/60",
    bgHover: "bg-violet-500/20 dark:bg-violet-500/25",
    tooltipAccent: "bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/20",
    badgeColor: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25",
  },
};

const confidenceLabels = {
  high: { label: "High", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25" },
  medium: { label: "Medium", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25" },
  low: { label: "Low", color: "bg-muted text-muted-foreground border-border" },
};

interface SuggestionTooltipProps {
  suggestion: DocumentSuggestion;
  isVisible: boolean;
  triggerRef: React.RefObject<HTMLElement>;
}

export function SuggestionTooltip({ suggestion, isVisible, triggerRef }: SuggestionTooltipProps) {
  const [position, setPosition] = useState<{ top: boolean }>({ top: false });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Check if tooltip would go off bottom of viewport
      const spaceBelow = window.innerHeight - rect.bottom;
      setPosition({ top: spaceBelow < 160 });
    }
  }, [isVisible, triggerRef]);

  const styles = highlightStyles[suggestion.type];
  const confidence = confidenceLabels[suggestion.severity];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: position.top ? 8 : -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position.top ? 8 : -8, scale: 0.96 }}
          transition={{ 
            duration: 0.15, 
            ease: [0.23, 1, 0.32, 1]
          }}
          className={cn(
            "absolute z-50 w-64",
            "left-1/2 -translate-x-1/2",
            position.top ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          {/* Premium glass tooltip */}
          <div className={cn(
            "rounded-xl overflow-hidden",
            "bg-popover/95 backdrop-blur-xl",
            "border border-border/60",
            "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.05)_inset]",
            "dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]"
          )}>
            {/* Header with category badge */}
            <div className={cn(
              "px-3 py-2",
              "border-b border-border/40"
            )}>
              <span className={cn(
                "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                styles.badgeColor
              )}>
                {styles.label}
              </span>
            </div>

            {/* Suggestion content */}
            <div className="px-3 py-2.5">
              <p className="text-sm font-medium text-foreground leading-snug">
                {suggestion.suggested}
              </p>
            </div>

            {/* Subtle arrow indicator */}
            <div className={cn(
              "absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45",
              "bg-popover/95 border-border/60",
              position.top 
                ? "bottom-0 translate-y-1/2 border-r border-b" 
                : "top-0 -translate-y-1/2 border-l border-t"
            )} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SuggestionHighlightProps {
  suggestion: DocumentSuggestion;
  children: React.ReactNode;
  isHovered: boolean;
  onHover: (hovering: boolean) => void;
  onAccept: () => void;
}

export function SuggestionHighlight({ 
  suggestion, 
  children, 
  isHovered, 
  onHover, 
  onAccept 
}: SuggestionHighlightProps) {
  const highlightRef = useRef<HTMLSpanElement>(null);

  const styles = highlightStyles[suggestion.type];
  const isGrammarOrSpelling = suggestion.type === "grammar" || suggestion.type === "spelling";

  // Use parent-controlled hover state only - no local state to prevent stacking
  const handleMouseEnter = () => {
    onHover(true);
  };

  const handleMouseLeave = () => {
    onHover(false);
  };

  return (
    <span className="relative inline">
      <span
        ref={highlightRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onAccept}
        className={cn(
          "relative inline cursor-pointer transition-all duration-150",
          "rounded-[2px] px-[1px] -mx-[1px]",
          // Underline style
          "underline decoration-[1.5px] underline-offset-2",
          styles.underline,
          // Background - always visible for grammar/spelling
          isGrammarOrSpelling && styles.bgDefault,
          // Hover enhancement
          isHovered && styles.bgHover
        )}
      >
        {children}
      </span>
      
      {/* Tooltip - only show for grammar/spelling, controlled by parent */}
      {isGrammarOrSpelling && (
        <SuggestionTooltip
          suggestion={suggestion}
          isVisible={isHovered}
          triggerRef={highlightRef as React.RefObject<HTMLElement>}
        />
      )}
    </span>
  );
}
