import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SuggestionHighlight } from "./SuggestionHighlight";
import type { AICheckResultData, DocumentSuggestion } from "@/pages/AICheck";

interface AICheckResultsProps {
  data: AICheckResultData;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onAcceptAllSafe: () => void;
  onProceed: () => void;
}

const typeConfig = {
  grammar: { 
    label: "Grammar", 
    description: "Sentence structure and syntax",
    color: "text-rose-600 dark:text-rose-400", 
    bgSoft: "bg-rose-50 dark:bg-rose-950/30",
    borderSoft: "border-rose-100 dark:border-rose-900/30",
    dot: "bg-rose-500",
    highlight: "bg-rose-100/60 dark:bg-rose-900/40 border-b border-rose-300 dark:border-rose-700"
  },
  spelling: { 
    label: "Spelling", 
    description: "Typos and misspellings",
    color: "text-amber-600 dark:text-amber-400", 
    bgSoft: "bg-amber-50 dark:bg-amber-950/30",
    borderSoft: "border-amber-100 dark:border-amber-900/30",
    dot: "bg-amber-500",
    highlight: "bg-amber-100/60 dark:bg-amber-900/40 border-b border-amber-300 dark:border-amber-700"
  },
  clarity: { 
    label: "Clarity", 
    description: "Readability improvements",
    color: "text-sky-600 dark:text-sky-400", 
    bgSoft: "bg-sky-50 dark:bg-sky-950/30",
    borderSoft: "border-sky-100 dark:border-sky-900/30",
    dot: "bg-sky-500",
    highlight: "bg-sky-100/60 dark:bg-sky-900/40 border-b border-sky-300 dark:border-sky-700"
  },
  style: { 
    label: "Style", 
    description: "Tone and consistency",
    color: "text-violet-600 dark:text-violet-400", 
    bgSoft: "bg-violet-50 dark:bg-violet-950/30",
    borderSoft: "border-violet-100 dark:border-violet-900/30",
    dot: "bg-violet-500",
    highlight: "bg-violet-100/60 dark:bg-violet-900/40 border-b border-violet-300 dark:border-violet-700"
  },
};

const confidenceConfig = {
  high: { label: "High confidence", color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  medium: { label: "Medium confidence", color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  low: { label: "Low confidence", color: "text-muted-foreground", dot: "bg-muted-foreground" },
};

export function AICheckResults({ data, onAccept, onReject, onAcceptAllSafe, onProceed }: AICheckResultsProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["grammar"]);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);

  const activeSuggestions = data.suggestions.filter(s => !s.accepted);
  const acceptedCount = data.suggestions.filter(s => s.accepted).length;
  
  const groupedSuggestions = activeSuggestions.reduce((acc, s) => {
    if (!acc[s.type]) acc[s.type] = [];
    acc[s.type].push(s);
    return acc;
  }, {} as Record<string, DocumentSuggestion[]>);

  const safeChangesCount = activeSuggestions.filter(s => s.severity === "high" || s.severity === "medium").length;

  const toggleCategory = (type: string) => {
    setExpandedCategories(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="h-full flex">
      {/* Document Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Header */}
        <div className="px-8 py-5 border-b border-border/50">
          <div className="flex items-center gap-4 ml-11">
            <h2 className="text-lg font-medium text-foreground tracking-tight">Language Refinement</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground font-medium">
              Step 1 of 2
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/70 mt-1 leading-tight truncate ml-11">
            We've reviewed your document for spelling, grammar, clarity, and style. Review the suggestions below or apply them all at once.
          </p>
        </div>

        {/* Document Content */}
        <ScrollArea className="flex-1">
          <div className="p-8">
            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-8">
                <DocumentWithHighlights 
                  text={data.documentText}
                  suggestions={data.suggestions}
                  hoveredId={hoveredSuggestion}
                  onHover={setHoveredSuggestion}
                  onAccept={onAccept}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Insights Panel */}
      <div className="w-[400px] h-full border-l border-border/50 bg-muted/20 flex flex-col">
        {/* Score Header */}
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center gap-5">
            <ScoreRing score={data.score} />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Document Quality</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeSuggestions.length} suggestions • {acceptedCount} accepted
              </p>
            </div>
          </div>
        </div>

        {/* Category Summary - Scannable Grid */}
        <div className="px-6 py-4 border-b border-border/40">
          <div className="grid grid-cols-4 gap-2">
            {(["grammar", "spelling", "clarity", "style"] as const).map((type) => {
              const config = typeConfig[type];
              const count = groupedSuggestions[type]?.length || 0;
              return (
                <button
                  key={type}
                  onClick={() => count > 0 && toggleCategory(type)}
                  disabled={count === 0}
                  className={cn(
                    "flex flex-col items-center py-3 px-2 rounded-lg transition-all",
                    count > 0 ? "hover:bg-muted/60 cursor-pointer" : "opacity-50 cursor-default"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full mb-2", config.dot, count === 0 && "opacity-40")} />
                  <span className="text-lg font-semibold text-foreground">{count}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary CTA - Accept Safe Changes */}
        <AnimatePresence mode="wait">
          {safeChangesCount > 0 && (
            <motion.div
              key="safe-changes"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-b border-border/40"
            >
              <div className="px-6 py-4">
                <motion.button
                  onClick={onAcceptAllSafe}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className={cn(
                    "w-full h-12 rounded-xl font-medium text-sm",
                    "flex items-center justify-center gap-2.5",
                    "bg-primary/15 backdrop-blur-md",
                    "border border-primary/30",
                    "text-primary",
                    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_12px_-4px_hsl(var(--primary)/0.25)]",
                    "hover:bg-primary/20 hover:border-primary/40 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_16px_-4px_hsl(var(--primary)/0.35)]",
                    "active:bg-primary/25",
                    "transition-all duration-200 ease-out"
                  )}
                >
                  <Check className="w-4 h-4 opacity-80" strokeWidth={2.5} />
                  Apply All Suggestions
                </motion.button>
                <p className="text-[11px] text-muted-foreground/60 text-left mt-3 leading-[1.45] w-full">
                  Includes improvements across spelling, grammar, clarity, and style. You can also review or apply changes individually below.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions List */}
        <ScrollArea className="flex-1">
          <div className="p-4 min-h-[300px] relative">
            <AnimatePresence mode="wait">
              {activeSuggestions.length > 0 ? (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {(["grammar", "spelling", "clarity", "style"] as const).map((type) => {
                    const items = groupedSuggestions[type];
                    if (!items?.length) return null;
                    
                    const config = typeConfig[type];
                    const isExpanded = expandedCategories.includes(type);
                    
                    return (
                      <div key={type} className="rounded-xl overflow-hidden bg-background/60 border border-border/30">
                        {/* Category Header */}
                        <button
                          onClick={() => toggleCategory(type)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("w-2.5 h-2.5 rounded-full", config.dot)} />
                            <div className="text-left">
                              <span className="text-sm font-medium text-foreground">{config.label}</span>
                              <span className="text-xs text-muted-foreground ml-2">({items.length})</span>
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          </motion.div>
                        </button>

                        {/* Suggestions */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 space-y-2">
                                {items.map((suggestion) => (
                                  <SuggestionCard
                                    key={suggestion.id}
                                    suggestion={suggestion}
                                    onAccept={() => onAccept(suggestion.id)}
                                    onReject={() => onReject(suggestion.id)}
                                    onHover={(hovering) => setHoveredSuggestion(hovering ? suggestion.id : null)}
                                    isHovered={hoveredSuggestion === suggestion.id}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                      className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-[0_0_16px_hsl(var(--accent)/0.3)]"
                    >
                      <Check className="w-7 h-7 text-accent" />
                    </motion.div>
                    <p className="text-sm font-medium text-foreground">All suggestions reviewed</p>
                    <p className="text-xs text-muted-foreground mt-1">Continue to enhancement options</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-5 border-t border-border/40 space-y-3">
          <Button 
            onClick={onProceed}
            className="w-full h-12 gap-2 btn-primary-premium"
          >
            Continue to Paraphrasing
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function getScoreColors(score: number) {
  if (score >= 90) {
    // Premium green-blue gradient
    return {
      stroke: "url(#scoreGradientPremium)",
      glow: "hsl(165 80% 45% / 0.5)",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/10",
      border: "border-emerald-500/30 dark:border-emerald-400/30",
      text: "text-emerald-600 dark:text-emerald-400"
    };
  } else if (score >= 80) {
    // Confident blue
    return {
      stroke: "hsl(210 90% 55%)",
      glow: "hsl(210 90% 55% / 0.5)",
      bg: "bg-blue-500/10 dark:bg-blue-500/10",
      border: "border-blue-500/30 dark:border-blue-400/30",
      text: "text-blue-600 dark:text-blue-400"
    };
  } else if (score >= 60) {
    // Neutral blue
    return {
      stroke: "hsl(210 50% 60%)",
      glow: "hsl(210 50% 60% / 0.4)",
      bg: "bg-slate-500/10 dark:bg-slate-500/10",
      border: "border-slate-400/30 dark:border-slate-500/30",
      text: "text-slate-600 dark:text-slate-400"
    };
  } else {
    // Muted red/amber
    return {
      stroke: "hsl(25 80% 55%)",
      glow: "hsl(25 80% 55% / 0.5)",
      bg: "bg-amber-500/10 dark:bg-amber-500/10",
      border: "border-amber-500/30 dark:border-amber-400/30",
      text: "text-amber-600 dark:text-amber-400"
    };
  }
}

function ScoreRing({ score }: { score: number }) {
  const colors = getScoreColors(score);
  const circumference = 2 * Math.PI * 42; // ~264
  
  return (
    <div className={cn(
      "relative w-16 h-16 rounded-full backdrop-blur-sm border",
      colors.bg,
      colors.border
    )}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="scoreGradientPremium" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(165 80% 45%)" />
            <stop offset="100%" stopColor="hsl(195 85% 50%)" />
          </linearGradient>
        </defs>
        
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="5"
          opacity="0.3"
        />
        
        {/* Animated progress ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={colors.stroke}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: circumference - (circumference * score) / 100,
          }}
          transition={{ 
            duration: 1.2, 
            ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth feel
            delay: 0.3 
          }}
          style={{
            filter: `drop-shadow(0 0 8px ${colors.glow})`,
          }}
        />
        
        {/* Subtle pulse glow overlay */}
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={colors.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference, opacity: 0 }}
          animate={{ 
            strokeDashoffset: circumference - (circumference * score) / 100,
            opacity: [0, 0.6, 0.3]
          }}
          transition={{ 
            strokeDashoffset: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 },
            opacity: { duration: 2, ease: "easeOut", delay: 0.8 }
          }}
          style={{
            filter: `drop-shadow(0 0 12px ${colors.glow})`,
          }}
        />
      </svg>
      
      {/* Score number with fade-in */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
      >
        <span className={cn("text-xl font-semibold", colors.text)}>{score}</span>
      </motion.div>
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: DocumentSuggestion;
  onAccept: () => void;
  onReject: () => void;
  onHover: (hovering: boolean) => void;
  isHovered: boolean;
}

function SuggestionCard({ suggestion, onAccept, onReject, onHover, isHovered }: SuggestionCardProps) {
  const config = typeConfig[suggestion.type];

  return (
    <motion.div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        "p-3.5 rounded-lg border transition-all duration-200",
        isHovered 
          ? "border-primary/30 bg-primary/5 shadow-sm" 
          : "border-border/40 bg-muted/20",
      )}
      layout
    >
      {/* What changed */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className={cn("text-sm line-through opacity-60", config.color)}>
            {suggestion.original}
          </span>
          <span className="text-xs text-muted-foreground">→</span>
          <span className="text-sm font-medium text-foreground">
            {suggestion.suggested}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 ml-3">
          <button
            onClick={onAccept}
            className="p-1.5 rounded-md hover:bg-success/10 text-success transition-colors"
            title="Accept"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onReject}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface DocumentWithHighlightsProps {
  text: string;
  suggestions: DocumentSuggestion[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onAccept: (id: string) => void;
}

function DocumentWithHighlights({ text, suggestions, hoveredId, onHover, onAccept }: DocumentWithHighlightsProps) {
  const lines = text.split('\n');
  
  // Get active grammar/spelling suggestions for auto-highlighting
  const activeHighlightSuggestions = suggestions.filter(s => 
    !s.accepted && (s.type === "grammar" || s.type === "spelling")
  );
  
  // Helper to find all suggestions that match within a line
  const findMatchingSuggestions = (line: string): DocumentSuggestion[] => {
    return activeHighlightSuggestions.filter(s => line.includes(s.original));
  };
  
  // Render line with highlights
  const renderLineWithHighlights = (line: string, lineKey: number) => {
    const matchingSuggestions = findMatchingSuggestions(line);
    
    if (matchingSuggestions.length === 0) {
      return line.replace(/^#+\s*/, '');
    }
    
    // Sort by position in line to handle multiple highlights correctly
    const sortedSuggestions = [...matchingSuggestions].sort((a, b) => {
      return line.indexOf(a.original) - line.indexOf(b.original);
    });
    
    // Build segments with highlights
    const segments: React.ReactNode[] = [];
    let remainingText = line.replace(/^#+\s*/, '');
    let segmentKey = 0;
    
    for (const suggestion of sortedSuggestions) {
      const index = remainingText.indexOf(suggestion.original);
      if (index === -1) continue;
      
      // Add text before the highlight
      if (index > 0) {
        segments.push(
          <span key={`text-${lineKey}-${segmentKey++}`}>
            {remainingText.substring(0, index)}
          </span>
        );
      }
      
      // Add the highlight
      segments.push(
        <SuggestionHighlight
          key={`highlight-${suggestion.id}`}
          suggestion={suggestion}
          isHovered={hoveredId === suggestion.id}
          onHover={(hovering) => onHover(hovering ? suggestion.id : null)}
          onAccept={() => onAccept(suggestion.id)}
        >
          {suggestion.original}
        </SuggestionHighlight>
      );
      
      // Update remaining text
      remainingText = remainingText.substring(index + suggestion.original.length);
    }
    
    // Add any remaining text
    if (remainingText) {
      segments.push(
        <span key={`text-${lineKey}-${segmentKey++}`}>
          {remainingText}
        </span>
      );
    }
    
    return segments;
  };
  
  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      {lines.map((line, i) => {
        const isHeading = line.startsWith('#') || /^\d+\./.test(line.trim());

        if (!line.trim()) {
          return <div key={i} className="h-4" />;
        }

        const content = renderLineWithHighlights(line, i);

        if (isHeading) {
          return (
            <h3 key={i} className="text-base font-semibold text-foreground mt-6 mb-3 first:mt-0">
              {content}
            </h3>
          );
        }
        
        return (
          <p key={i} className="text-sm leading-7 text-foreground/85 mb-4">
            {content}
          </p>
        );
      })}
    </article>
  );
}
