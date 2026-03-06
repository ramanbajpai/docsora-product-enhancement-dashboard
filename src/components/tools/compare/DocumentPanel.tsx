import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Difference } from "./types";

interface DocumentPanelProps {
  label: string;
  fileName: string;
  variant: 'a' | 'b';
  differences: Difference[];
  currentDiffId: string | null;
  scrollPosition: number;
  onScroll: (position: number) => void;
  onDiffSelect: (diff: Difference) => void;
}

export function DocumentPanel({
  label,
  fileName,
  variant,
  differences,
  currentDiffId,
  scrollPosition,
  onScroll,
  onDiffSelect,
}: DocumentPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Sync scroll position from external source
  useEffect(() => {
    if (scrollRef.current && !isScrolling.current) {
      scrollRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  const handleScroll = () => {
    if (scrollRef.current && !isScrolling.current) {
      isScrolling.current = true;
      onScroll(scrollRef.current.scrollTop);
      setTimeout(() => { isScrolling.current = false; }, 50);
    }
  };

  // Scroll to current difference
  useEffect(() => {
    if (currentDiffId && scrollRef.current) {
      const element = scrollRef.current.querySelector(`[data-diff-id="${currentDiffId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentDiffId]);

  // Softened, thin accent indicators - Apple style
  const baseHighlight = variant === 'a' 
    ? 'border-l-2 border-l-primary/40' 
    : 'border-l-2 border-l-destructive/40';
  
  const activeHighlight = variant === 'a' 
    ? 'border-l-2 border-l-primary/70 bg-primary/[0.04]' 
    : 'border-l-2 border-l-destructive/70 bg-destructive/[0.04]';

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Minimal Panel Header */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border/15">
        <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-medium ${
          variant === 'a' 
            ? 'bg-primary/8 text-primary' 
            : 'bg-destructive/8 text-destructive'
        }`}>
          {label}
        </div>
        <span className="text-sm text-muted-foreground truncate">{fileName}</span>
      </div>

      {/* Document Content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-5 space-y-4 glassmorphic-scrollbar"
      >
        {/* Simulated document pages with highlighted differences */}
        {[1, 2, 3].map((page) => (
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: page * 0.03 }}
            className="bg-card rounded-lg border border-border/15 p-6"
          >
            <div className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-4">Page {page}</div>
            
            {/* Simulated content lines with differences */}
            <div className="space-y-3">
              {[...Array(10)].map((_, lineIndex) => {
                const diff = differences.find(d => d.page === page && Math.floor(d.position.y / 30) === lineIndex);
                const isCurrentDiff = diff?.id === currentDiffId;
                
                if (diff) {
                  const text = variant === 'a' ? diff.textA : diff.textB;
                  if (!text) return null;
                  
                  return (
                    <motion.div
                      key={lineIndex}
                      data-diff-id={diff.id}
                      onClick={() => onDiffSelect(diff)}
                      className={`pl-3 py-2 rounded-r cursor-pointer transition-all duration-150 ${
                        isCurrentDiff ? activeHighlight : baseHighlight
                      }`}
                    >
                      <div className="text-sm text-foreground/85 leading-relaxed">{text}</div>
                    </motion.div>
                  );
                }
                
                return (
                  <div 
                    key={lineIndex} 
                    className="h-4 bg-muted/10 rounded" 
                    style={{ width: `${55 + (lineIndex * 7) % 40}%` }} 
                  />
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}