import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolLayout } from "../shared/ToolLayout";
import { cn } from "@/lib/utils";

interface DeletePagesEditorProps {
  files: File[];
  onProcess: () => void;
}

export function DeletePagesEditor({ files, onProcess }: DeletePagesEditorProps) {
  const totalPages = 12; // Mock
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const pages = useMemo(() => 
    Array.from({ length: totalPages }, (_, i) => ({ id: i + 1 })),
    [totalPages]
  );

  const togglePage = (pageId: number) => {
    const newSelection = new Set(selectedPages);
    if (newSelection.has(pageId)) {
      newSelection.delete(pageId);
    } else {
      newSelection.add(pageId);
    }
    setSelectedPages(newSelection);
  };


  const clearSelection = () => {
    setSelectedPages(new Set());
  };

  const remainingPages = totalPages - selectedPages.size;
  const canDelete = selectedPages.size > 0 && remainingPages > 0;

  return (
    <ToolLayout
      title="Delete Pages"
      description="Select pages to remove from your document"
      fileCount={files.length}
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedPages.size > 0 ? (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{selectedPages.size} pages</span> will be removed · Final document will contain <span className="font-medium text-foreground">{remainingPages} pages</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select pages to remove from your document
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedPages.size > 0 && (
              <Button
                variant="ghost"
                onClick={clearSelection}
                className="text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
            <Button
              onClick={onProcess}
              disabled={!canDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all px-8"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove selected pages
            </Button>
          </div>
        </div>
      }
    >
      <div className="p-6">
        {/* Page count header */}
        <div className="flex items-center justify-end mb-6">
          <span className="text-xs text-muted-foreground">
            {totalPages} pages total
          </span>
        </div>

        {/* Page Grid - 8 columns on desktop */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
          {pages.map((page, index) => {
            const isSelected = selectedPages.has(page.id);

            return (
              <motion.button
                key={page.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => togglePage(page.id)}
                className={cn(
                  "relative aspect-[3/4] rounded-lg border-2 transition-all bg-card",
                  isSelected
                    ? "border-destructive bg-destructive/5"
                    : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                {/* Page content placeholder */}
                <div className="absolute inset-2 rounded bg-muted/30" />
                
                {/* Checkbox */}
                <div className="absolute top-2 left-2">
                  <Checkbox 
                    checked={isSelected} 
                    className={cn(
                      "pointer-events-none",
                      isSelected && "border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                    )}
                  />
                </div>
                
                {/* Page number */}
                <span className={cn(
                  "absolute bottom-2 left-1/2 -translate-x-1/2 text-xs",
                  isSelected ? "text-destructive font-medium" : "text-muted-foreground"
                )}>
                  {page.id}
                </span>
              </motion.button>
            );
          })}
        </div>

        {remainingPages === 0 && selectedPages.size > 0 && (
          <p className="text-sm text-amber-500 mt-6 text-center">
            Cannot delete all pages. At least one page must remain in the document.
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
