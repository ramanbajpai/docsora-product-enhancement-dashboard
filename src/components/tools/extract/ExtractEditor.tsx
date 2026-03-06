import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolLayout } from "../shared/ToolLayout";
import { cn } from "@/lib/utils";

interface ExtractEditorProps {
  files: File[];
  onProcess: () => void;
}

export function ExtractEditor({ files, onProcess }: ExtractEditorProps) {
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


  return (
    <ToolLayout
      title="Extract Pages"
      description="Select pages to extract into a new document"
      fileCount={files.length}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedPages.size > 0 
              ? `Output: New document with ${selectedPages.size} ${selectedPages.size === 1 ? 'page' : 'pages'}`
              : "Select pages to extract"}
          </p>
          <Button
            onClick={onProcess}
            disabled={selectedPages.size === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          >
            <FileOutput className="w-4 h-4 mr-2" />
            Extract pages
          </Button>
        </div>
      }
    >
      <div className="p-6">
        {/* Page count header */}
        <div className="flex items-center justify-end mb-6">
          <span className="text-xs text-muted-foreground">
            {selectedPages.size} of {totalPages} pages selected
          </span>
        </div>

        {/* Page Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
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
                  "relative aspect-[3/4] rounded-lg border-2 transition-all bg-white/90 dark:bg-neutral-800/90",
                  isSelected
                    ? "border-primary shadow-md shadow-primary/20"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                <div className="absolute top-1 left-1">
                  <Checkbox checked={isSelected} className="pointer-events-none" />
                </div>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                  {page.id}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
