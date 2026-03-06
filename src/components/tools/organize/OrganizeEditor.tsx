import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolLayout } from "../shared/ToolLayout";
import { cn } from "@/lib/utils";

interface OrganizeEditorProps {
  files: File[];
  onProcess: () => void;
}

interface Page {
  id: number;
  originalPosition: number;
}

export function OrganizeEditor({ files, onProcess }: OrganizeEditorProps) {
  const totalPages = 12; // Mock
  
  const initialPages = useMemo(() => 
    Array.from({ length: totalPages }, (_, i) => ({ id: i + 1, originalPosition: i + 1 })),
    [totalPages]
  );

  const [pages, setPages] = useState<Page[]>(initialPages);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const hasChanges = pages.some((page, index) => page.originalPosition !== index + 1);

  const togglePage = (pageId: number) => {
    const newSelection = new Set(selectedPages);
    if (newSelection.has(pageId)) {
      newSelection.delete(pageId);
    } else {
      newSelection.add(pageId);
    }
    setSelectedPages(newSelection);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newPages = [...pages];
    const [draggedItem] = newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedItem);
    setPages(newPages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const resetOrder = () => {
    setPages(initialPages);
    setSelectedPages(new Set());
  };

  return (
    <ToolLayout
      title="Organize Pages"
      description="Drag pages to reorder them in your document"
      fileCount={files.length}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {hasChanges ? "Page order modified" : "Drag pages to reorder"}
          </p>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Button
                variant="ghost"
                onClick={resetOrder}
                className="text-muted-foreground border border-transparent hover:bg-muted hover:text-foreground hover:border-border transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset order
              </Button>
            )}
            <Button
              onClick={onProcess}
              disabled={!hasChanges}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            >
              Apply page order
            </Button>
          </div>
        </div>
      }
    >
      <div className="p-6">
        {/* Helper hint */}
        <div className="mb-6 text-center">
          <p className="text-sm text-muted-foreground">
            This is the final page order. Drag pages to rearrange.
          </p>
        </div>

        {/* Page Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {pages.map((page, index) => {
            const isMoved = page.originalPosition !== index + 1;
            const finalPosition = index + 1;

            return (
              <motion.div
                key={page.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "relative aspect-[3/4] rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing",
                  "bg-white/90 dark:bg-neutral-800/90",
                  draggedIndex === index
                    ? "border-primary shadow-lg shadow-primary/20 scale-105"
                    : isMoved
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/50 hover:border-primary/30"
                )}
              >
                {/* Drag handle */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2">
                  <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                </div>

                {/* Final position number - prominent */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn(
                    "text-2xl font-semibold",
                    isMoved ? "text-primary" : "text-muted-foreground"
                  )}>
                    {finalPosition}
                  </span>
                </div>

                {/* Original position - subtle secondary label */}
                {isMoved && (
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                    <span className="text-[9px] text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded">
                      was {page.originalPosition}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
