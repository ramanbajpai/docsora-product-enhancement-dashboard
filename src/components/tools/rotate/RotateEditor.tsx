import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, RotateCcw, X, RotateCcwSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ToolLayout } from "../shared/ToolLayout";

interface PageData {
  id: string;
  pageNumber: number;
  rotation: number;
  thumbnail: string;
}

interface RotateEditorProps {
  files: File[];
  onProcess: (pages: PageData[]) => void;
}

export function RotateEditor({ files, onProcess }: RotateEditorProps) {
  // Generate mock pages - in real app would parse PDF
  const initialPages: PageData[] = useMemo(() => 
    Array.from({ length: Math.max(8, Math.floor(Math.random() * 12) + 6) }, (_, i) => ({
      id: `page-${i + 1}`,
      pageNumber: i + 1,
      rotation: 0,
      thumbnail: `/placeholder.svg`,
    })), []
  );

  const [pages, setPages] = useState<PageData[]>(initialPages);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());

  const modifiedCount = pages.filter(p => p.rotation !== 0).length;
  const hasChanges = modifiedCount > 0;
  const hasSelection = selectedPages.size > 0;
  const allSelected = selectedPages.size === pages.length;

  const rotatePage = (pageId: string, direction: 'cw' | 'ccw') => {
    setPages(prev => prev.map(page => {
      if (page.id === pageId) {
        const delta = direction === 'cw' ? 90 : -90;
        return { ...page, rotation: (page.rotation + delta + 360) % 360 };
      }
      return page;
    }));
  };

  const rotateSelected = (direction: 'cw' | 'ccw') => {
    setPages(prev => prev.map(page => {
      if (selectedPages.has(page.id)) {
        const delta = direction === 'cw' ? 90 : -90;
        return { ...page, rotation: (page.rotation + delta + 360) % 360 };
      }
      return page;
    }));
  };

  const resetSelected = () => {
    setPages(prev => prev.map(page => {
      if (selectedPages.has(page.id)) {
        return { ...page, rotation: 0 };
      }
      return page;
    }));
  };

  const togglePageSelection = (pageId: string) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(pages.map(p => p.id)));
    }
  };

  const clearSelection = () => {
    setSelectedPages(new Set());
  };

  const handleProcess = () => {
    if (hasChanges) {
      onProcess(pages);
    }
  };

  return (
    <ToolLayout
      title="Rotate Pages"
      description="Rotate individual pages or select multiple pages to rotate in bulk."
      fileCount={pages.length}
      footer={
        <div className="flex flex-col gap-4">
          {/* Main CTA row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">
                {hasChanges 
                  ? `${modifiedCount} ${modifiedCount === 1 ? 'page' : 'pages'} modified`
                  : "No changes applied yet"
                }
              </p>
            </div>
            <Button
              onClick={handleProcess}
              disabled={!hasChanges}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 disabled:opacity-50"
            >
              Download rotated document
            </Button>
          </div>

        </div>
      }
    >
      <div className="p-6">
        {/* Selection header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
                "transition-all duration-200",
                "hover:bg-secondary/60",
                allSelected ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Checkbox 
                checked={allSelected} 
                onCheckedChange={toggleSelectAll}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              Select all
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Select pages to rotate individually or in bulk.
          </p>
        </div>

        {/* Page Grid - Scrollable content zone */}
        <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {pages.map((page, index) => {
              const isSelected = selectedPages.has(page.id);
              const isModified = page.rotation !== 0;

              return (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.2 }}
                  className="relative group"
                >
                  {/* Page Card */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={cn(
                      "relative aspect-[3/4] rounded-xl overflow-hidden",
                      "border-2 transition-all duration-200",
                      "bg-secondary/30",
                      isSelected
                        ? "border-primary shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)]"
                        : "border-border/50 hover:border-primary/40"
                    )}
                  >
                    {/* Selection Checkbox - Always visible */}
                    <div className="absolute top-2 left-2 z-20">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => togglePageSelection(page.id)}
                        className={cn(
                          "h-5 w-5 rounded-md border-2",
                          "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                          "bg-background/80 backdrop-blur-sm",
                          isSelected ? "" : "border-border/60"
                        )}
                      />
                    </div>

                    {/* Rotation Badge */}
                    <AnimatePresence>
                      {isModified && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={cn(
                            "absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded-md",
                            "bg-primary/90 text-primary-foreground",
                            "text-[10px] font-semibold"
                          )}
                        >
                          {page.rotation}°
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Thumbnail with rotation */}
                    <motion.div
                      className="absolute inset-3 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden"
                      animate={{ rotate: page.rotation }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Mock page content */}
                      <div className="w-full h-full p-2 flex flex-col gap-1.5">
                        <div className="w-3/4 h-1.5 bg-muted-foreground/20 rounded-full" />
                        <div className="w-full h-1.5 bg-muted-foreground/15 rounded-full" />
                        <div className="w-5/6 h-1.5 bg-muted-foreground/15 rounded-full" />
                        <div className="w-2/3 h-1.5 bg-muted-foreground/10 rounded-full" />
                        <div className="flex-1" />
                        <div className="w-full h-6 bg-muted-foreground/10 rounded" />
                      </div>
                    </motion.div>

                    {/* Rotation Controls - Always visible */}
                    <div className="absolute inset-x-0 bottom-0 p-2 flex justify-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          rotatePage(page.id, 'ccw');
                        }}
                        className={cn(
                          "w-8 h-8 rounded-lg",
                          "bg-background/90 backdrop-blur-sm",
                          "border border-border/50",
                          "flex items-center justify-center",
                          "text-muted-foreground hover:text-primary hover:border-primary/50",
                          "shadow-sm transition-colors duration-150"
                        )}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          rotatePage(page.id, 'cw');
                        }}
                        className={cn(
                          "w-8 h-8 rounded-lg",
                          "bg-background/90 backdrop-blur-sm",
                          "border border-border/50",
                          "flex items-center justify-center",
                          "text-muted-foreground hover:text-primary hover:border-primary/50",
                          "shadow-sm transition-colors duration-150"
                        )}
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>

                  {/* Page Label */}
                  <div className="mt-2 text-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      Page {page.pageNumber}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Centered Bulk Action Bar */}
        <AnimatePresence>
          {hasSelection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center mt-6"
            >
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl",
                "bg-secondary/80 backdrop-blur-xl",
                "border border-border/60",
                "shadow-lg"
              )}>
                <span className="text-sm font-medium text-foreground mr-2">
                  {selectedPages.size} selected
                </span>
                
                <div className="w-px h-5 bg-border/50" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => rotateSelected('ccw')}
                  className="gap-1.5 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <RotateCcw className="w-4 h-4" />
                  Rotate Left
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => rotateSelected('cw')}
                  className="gap-1.5 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <RotateCw className="w-4 h-4" />
                  Rotate Right
                </Button>

                <div className="w-px h-5 bg-border/50" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetSelected}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5 h-8"
                >
                  <RotateCcwSquare className="w-4 h-4" />
                  Reset
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSelection}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
}
