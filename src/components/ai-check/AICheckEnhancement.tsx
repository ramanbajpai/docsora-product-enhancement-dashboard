import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronLeft, Sparkles, Shield, Download, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AICheckResultData, TonePreset, EnhancementSuggestion } from "@/pages/AICheck";

interface AICheckEnhancementProps {
  data: AICheckResultData;
  selectedTone: TonePreset;
  onToneChange: (tone: TonePreset) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

const tonePresets: { id: TonePreset; label: string; description: string }[] = [
  { id: "simple", label: "Simple", description: "Clear, plain language" },
  { id: "executive", label: "Executive", description: "Decisive, outcome-driven" },
  { id: "legal", label: "Legal", description: "Formal, precise, unambiguous" },
  { id: "marketing", label: "Marketing", description: "Persuasive, engaging" },
];

export function AICheckEnhancement({ 
  data, 
  selectedTone, 
  onToneChange, 
  onAccept, 
  onReject, 
  onComplete,
  onBack 
}: AICheckEnhancementProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [hoveredEnhancement, setHoveredEnhancement] = useState<string | null>(null);

  const activeEnhancements = data.enhancements.filter(e => !e.accepted);
  const acceptedCount = data.enhancements.filter(e => e.accepted).length;

  return (
    <div className="h-full flex">
      {/* Editor Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Header */}
        <div className="px-8 py-5 border-b border-border/50">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-1 rounded hover:bg-muted transition-colors -ml-1 mr-1"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-lg font-medium text-foreground tracking-tight">Sentence Enhancement</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground font-medium">
              Step 2 of 2
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/70 mt-1 leading-tight truncate ml-11">
            Refine selected sentences based on your chosen tone preset. Review and apply enhancements individually.
          </p>
        </div>

        {/* Document */}
        <ScrollArea className="flex-1">
          <div className="p-8">
            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-8">
                <EnhancedDocument 
                  text={data.documentText}
                  enhancements={data.enhancements}
                  hoveredId={hoveredEnhancement}
                  showPreview={showPreview}
                  onHover={setHoveredEnhancement}
                  onAccept={onAccept}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Enhancement Panel */}
      <div className="w-[380px] h-full border-l border-border bg-surface-1 flex flex-col">
        {/* Tone Selection */}
        <div className="p-5 border-b border-border">
          <div className="mb-4">
            <span className="text-sm font-medium text-foreground">Tone Preset</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tonePresets.map((tone) => (
              <button
                key={tone.id}
                onClick={() => onToneChange(tone.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all duration-200",
                  selectedTone === tone.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  selectedTone === tone.id ? "text-primary" : "text-foreground"
                )}>
                  {tone.label}
                </span>
                <p className="text-[9px] text-muted-foreground mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  {tone.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Progress with Glassmorphic Accent */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Enhancements</span>
            <span className="text-foreground font-medium">
              {acceptedCount}/{data.enhancements.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-border/30 backdrop-blur-sm overflow-hidden border border-border/20 relative">
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, hsl(150 99% 42%) 0%, hsl(150 99% 38%) 50%, hsl(150 99% 42%) 100%)',
                boxShadow: '0 0 16px hsl(150 99% 42% / 0.7), 0 0 32px hsl(150 99% 42% / 0.5), 0 0 48px hsl(150 99% 42% / 0.3), inset 0 1px 1px hsl(0 0% 100% / 0.25)'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(acceptedCount / data.enhancements.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            >
              {/* Inner glow highlight */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.3) 0%, transparent 50%, hsl(0 0% 0% / 0.1) 100%)'
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Enhancement List */}
        <ScrollArea className="flex-1">
          <div className="p-4 min-h-[280px] relative">
            <AnimatePresence mode="wait">
              {activeEnhancements.length > 0 ? (
                <motion.div
                  key="enhancements"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {activeEnhancements.map((enhancement, index) => (
                    <EnhancementCard
                      key={enhancement.id}
                      enhancement={enhancement}
                      index={index}
                      onAccept={() => onAccept(enhancement.id)}
                      onReject={() => onReject(enhancement.id)}
                      onHover={(hovering) => setHoveredEnhancement(hovering ? enhancement.id : null)}
                      isHovered={hoveredEnhancement === enhancement.id}
                    />
                  ))}
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
                      className="w-12 h-12 rounded-full bg-success/10 border border-success/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 shadow-[0_0_12px_hsl(var(--success)/0.3)]"
                    >
                      <Check className="w-6 h-6 text-success" />
                    </motion.div>
                    <p className="text-sm font-medium text-foreground">All enhancements applied</p>
                    <p className="text-xs text-muted-foreground mt-1">Your document is ready.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Action Footer */}
        <div className="p-4 border-t border-border mt-auto">
          <Button 
            onClick={onComplete}
            className="w-full btn-primary-premium gap-2"
          >
            <Download className="w-4 h-4" />
            Complete & Download
          </Button>
        </div>
      </div>
    </div>
  );
}

interface EnhancementCardProps {
  enhancement: EnhancementSuggestion;
  index: number;
  onAccept: () => void;
  onReject: () => void;
  onHover: (hovering: boolean) => void;
  isHovered: boolean;
}

function EnhancementCard({ enhancement, index, onAccept, onReject, onHover, isHovered }: EnhancementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        "p-4 rounded-lg border transition-all duration-200",
        isHovered ? "border-primary/50 bg-primary/5" : "border-border",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted-foreground">
          Line {enhancement.lineNumber}
        </span>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAccept}
            className="p-1.5 rounded-md hover:bg-success/10 text-success transition-colors"
          >
            <Check className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReject}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Original */}
      <div className="mb-3">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
          Original
        </span>
        <p className="text-sm text-muted-foreground line-through">
          {enhancement.original}
        </p>
      </div>

      {/* Enhanced */}
      <div className="mb-3">
        <span className="text-[10px] uppercase tracking-wider text-success mb-1 block">
          Enhanced
        </span>
        <p className="text-sm text-foreground">
          {enhancement.enhanced}
        </p>
      </div>
    </motion.div>
  );
}

interface EnhancedDocumentProps {
  text: string;
  enhancements: EnhancementSuggestion[];
  hoveredId: string | null;
  showPreview: boolean;
  onHover: (id: string | null) => void;
  onAccept: (id: string) => void;
}

function EnhancedDocument({ text, enhancements, hoveredId, showPreview, onHover, onAccept }: EnhancedDocumentProps) {
  const lines = text.split('\n');
  
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const lineNumber = i + 1;
        const isHeading = line.startsWith('#') || /^\d+\./.test(line.trim());
        
        // Check for enhancement on this line
        const enhancement = enhancements.find(e => e.lineNumber === lineNumber && !e.accepted);
        const acceptedEnhancement = enhancements.find(e => e.lineNumber === lineNumber && e.accepted);
        const isHovered = enhancement && hoveredId === enhancement.id;

        // Show accepted enhancement text (green text becomes normal)
        if (acceptedEnhancement) {
          return (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "text-sm leading-relaxed",
                isHeading ? "font-semibold text-foreground" : "text-foreground/90"
              )}
            >
              {acceptedEnhancement.enhanced}
            </motion.p>
          );
        }

        // Show active enhancement with original strikethrough + enhanced in green
        // Use enhancement.original and enhancement.enhanced directly for exact 1:1 mapping
        if (enhancement) {
          return (
            <motion.div
              key={i}
              className={cn(
                "relative rounded px-1 -mx-1 transition-colors",
                isHovered && "bg-primary/5"
              )}
              onMouseEnter={() => onHover(enhancement.id)}
              onMouseLeave={() => onHover(null)}
            >
              {/* Original from enhancement object - exact match with card */}
              <p className={cn(
                "text-sm leading-relaxed text-muted-foreground/60 line-through",
                isHeading ? "font-semibold" : ""
              )}>
                {enhancement.original}
              </p>
              {/* Enhanced from enhancement object - exact match with card */}
              <motion.p
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "text-sm leading-relaxed text-success cursor-pointer mt-0.5",
                  isHeading ? "font-semibold" : ""
                )}
                onClick={() => onAccept(enhancement.id)}
              >
                {enhancement.enhanced}
              </motion.p>
            </motion.div>
          );
        }

        // Normal line without enhancement
        return (
          <p key={i} className={cn(
            "text-sm leading-relaxed",
            isHeading ? "font-semibold text-foreground" : "text-foreground/90"
          )}>
            {line || <br />}
          </p>
        );
      })}
    </div>
  );
}