import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Plus, X, FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolLayout } from "../shared/ToolLayout";
import { cn } from "@/lib/utils";

interface SplitEditorProps {
  files: File[];
  onProcess: () => void;
}

interface PageRange {
  id: string;
  start: string;
  end: string;
}

export function SplitEditor({ files, onProcess }: SplitEditorProps) {
  const [ranges, setRanges] = useState<PageRange[]>([{ id: "1", start: "", end: "" }]);
  const totalPages = 12; // Mock

  const pages = useMemo(() => 
    Array.from({ length: totalPages }, (_, i) => ({ id: i + 1 })),
    [totalPages]
  );

  // Calculate which pages are in which range (for color coding)
  const pageRangeMap = useMemo(() => {
    const map = new Map<number, number>(); // page -> range index
    ranges.forEach((range, rangeIndex) => {
      const start = parseInt(range.start);
      const end = parseInt(range.end);
      if (start > 0 && end >= start && end <= totalPages) {
        for (let i = start; i <= end; i++) {
          if (!map.has(i)) {
            map.set(i, rangeIndex);
          }
        }
      }
    });
    return map;
  }, [ranges, totalPages]);

  // Calculate valid ranges for output summary
  const validRanges = useMemo(() => {
    return ranges.filter(range => {
      const start = parseInt(range.start);
      const end = parseInt(range.end);
      return start > 0 && end >= start && end <= totalPages;
    });
  }, [ranges, totalPages]);

  // Check if configuration is valid
  const isValidConfiguration = validRanges.length > 0;

  // Get output summary for footer
  const getOutputSummary = () => {
    if (validRanges.length === 0) {
      return "Define at least one page range to split.";
    }
    const rangeDescriptions = validRanges.map(r => `${r.start}–${r.end}`).join(", ");
    return `Output: ${validRanges.length} document${validRanges.length > 1 ? 's' : ''} (Pages ${rangeDescriptions})`;
  };

  const addRange = () => {
    setRanges([...ranges, { id: Date.now().toString(), start: "", end: "" }]);
  };

  const removeRange = (id: string) => {
    if (ranges.length > 1) {
      setRanges(ranges.filter(r => r.id !== id));
    }
  };

  const updateRange = (id: string, field: "start" | "end", value: string) => {
    setRanges(ranges.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  // Range colors for visual distinction
  const rangeColors = [
    "bg-primary/10 border-primary text-primary",
    "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400",
    "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400",
    "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400",
    "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400",
  ];

  return (
    <ToolLayout
      title="Split Document"
      description="Define page ranges. Each range will be exported as a separate document."
      fileCount={files.length}
      footer={
        <div className="flex flex-col gap-3">
          {/* CTA row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">
                {isValidConfiguration 
                  ? `1 file → ${validRanges.length} document${validRanges.length !== 1 ? 's' : ''}`
                  : "Define page ranges or split all pages"
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onProcess}
                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border transition-colors"
              >
                <FileStack className="w-4 h-4 mr-2" />
                Split all pages
              </Button>
              <Button
                onClick={onProcess}
                disabled={!isValidConfiguration}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 disabled:opacity-50"
              >
                <Scissors className="w-4 h-4 mr-2" />
                Split document
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Page Count Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/30 border border-border/30">
            <span className="text-xs text-muted-foreground">Document:</span>
            <span className="text-sm font-semibold text-foreground">{totalPages} pages</span>
          </div>
        </div>

        {/* Range Inputs */}
        <div className="space-y-3">
          <AnimatePresence>
            {ranges.map((range, index) => {
              const colorClass = rangeColors[index % rangeColors.length];
              const isValid = parseInt(range.start) > 0 && parseInt(range.end) >= parseInt(range.start) && parseInt(range.end) <= totalPages;
              
              return (
                <motion.div
                  key={range.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                    isValid 
                      ? colorClass.split(' ').slice(0, 2).join(' ')
                      : "bg-secondary/30 border-border/50"
                  )}
                >
                  {/* Range indicator */}
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                    isValid 
                      ? colorClass.split(' ').slice(0, 1).join(' ') + " " + colorClass.split(' ').slice(2).join(' ')
                      : "bg-secondary text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Pages</label>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={range.start}
                      onChange={(e) => updateRange(range.id, "start", e.target.value)}
                      className="w-16 h-9 rounded-md border border-border bg-background px-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">to</label>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={range.end}
                      onChange={(e) => updateRange(range.id, "end", e.target.value)}
                      className="w-16 h-9 rounded-md border border-border bg-background px-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder={String(totalPages)}
                    />
                  </div>

                  {/* Page count for this range */}
                  {isValid && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({parseInt(range.end) - parseInt(range.start) + 1} {parseInt(range.end) - parseInt(range.start) + 1 === 1 ? 'page' : 'pages'})
                    </span>
                  )}

                  {ranges.length > 1 && (
                    <button
                      onClick={() => removeRange(range.id)}
                      className="ml-auto p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Add Range Button */}
        <Button
          variant="outline"
          onClick={addRange}
          className="w-full border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add another range
        </Button>

        {/* Page Grid Preview */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-3 text-center">Page preview</p>
          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2">
            {pages.map((page, index) => {
              const rangeIndex = pageRangeMap.get(page.id);
              const isInRange = rangeIndex !== undefined;
              const colorClass = isInRange ? rangeColors[rangeIndex % rangeColors.length] : "";

              // Find if this page is the start of a range (for split indicator)
              const isRangeStart = ranges.some(range => {
                const start = parseInt(range.start);
                const end = parseInt(range.end);
                return start > 0 && end >= start && end <= totalPages && page.id === start && start > 1;
              });

              return (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className="relative"
                >
                  {isRangeStart && (
                    <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-primary z-10">
                      <Scissors className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-primary rotate-90" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "w-full aspect-[3/4] rounded-md border-2 transition-all flex items-center justify-center",
                      isInRange
                        ? colorClass
                        : "border-border/40 bg-muted/30 text-muted-foreground/50"
                    )}
                  >
                    <span className="text-xs font-medium">
                      {page.id}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Output summary badge */}
        {isValidConfiguration && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/30">
              <Scissors className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{getOutputSummary()}</span>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
