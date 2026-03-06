import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, X, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolLayout } from "../shared/ToolLayout";

interface MergeEditorProps {
  files: File[];
  onProcess: () => void;
  onAddFiles?: () => void;
  onFilesChange?: (files: File[]) => void;
}

export function MergeEditor({ files, onProcess, onAddFiles, onFilesChange }: MergeEditorProps) {
  const [fileOrder, setFileOrder] = useState<File[]>(files);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setFileOrder(files);
  }, [files]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...fileOrder];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    setFileOrder(newOrder);
    onFilesChange?.(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemoveFile = (index: number) => {
    setFileOrder((prev) => {
      const next = prev.filter((_, i) => i !== index);
      onFilesChange?.(next);
      return next;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Simulate page count based on file size
  const estimatePageCount = (bytes: number) => {
    return Math.max(1, Math.floor(bytes / 50000));
  };

  // Calculate totals for Pro signal
  const totalSize = fileOrder.reduce((acc, file) => acc + file.size, 0);
  const totalPages = fileOrder.reduce((acc, file) => acc + estimatePageCount(file.size), 0);
  const showProHint = fileOrder.length > 5 || totalSize > 50 * 1024 * 1024; // 5+ files or 50MB+

  const canMerge = fileOrder.length >= 2;

  return (
    <ToolLayout
      title="Merge Documents"
      description="Combine multiple files into a single document — in the order shown below."
      fileCount={fileOrder.length}
      footer={
        <div className="flex flex-col gap-4">
          {/* Pro hint - non-blocking */}
          {showProHint && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-primary/70 text-center"
            >
              Merging large files is faster with Pro.
            </motion.p>
          )}

          {/* Main CTA row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">
                {fileOrder.length} {fileOrder.length === 1 ? 'file' : 'files'} → 1 merged document ({totalPages} pages)
              </p>
            </div>
            <Button
              onClick={onProcess}
              disabled={!canMerge}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 disabled:opacity-50"
            >
              Merge documents
            </Button>
          </div>

          {/* Guidance - only show when can merge */}
          {canMerge && (
            <p className="text-xs text-muted-foreground/60 text-center">
              For page-level reordering, use Organize after merging.
            </p>
          )}
        </div>
      }
    >
      <div className="p-6">
        {/* Order indicator */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground">
            Top to bottom = merge order
          </p>
          {onAddFiles && canMerge && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddFiles}
              className="text-xs text-muted-foreground hover:text-foreground hover:bg-secondary gap-1.5 h-7"
            >
              <Plus className="w-3.5 h-3.5" />
              Add more files
            </Button>
          )}
        </div>

        {/* File list */}
        <div className="space-y-2">
          <AnimatePresence>
            {fileOrder.map((file, index) => {
              const pageCount = estimatePageCount(file.size);
              const isDragging = draggedIndex === index;
              
              return (
                <motion.div
                  key={file.name + index}
                  layout
                  layoutId={file.name + index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: isDragging ? 1.02 : 1,
                    boxShadow: isDragging 
                      ? '0 10px 40px -10px hsl(var(--primary) / 0.3)' 
                      : '0 0 0 0 transparent',
                    zIndex: isDragging ? 10 : 1
                  }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.8
                  }}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative flex items-center gap-4 p-4 rounded-xl border transition-colors cursor-grab active:cursor-grabbing ${
                    isDragging 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-border'
                  }`}
                >
                  {/* Drag handle and order number */}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <GripVertical className={`w-5 h-5 transition-colors ${isDragging ? 'text-primary' : ''}`} />
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      isDragging ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}>
                      {index + 1}
                    </span>
                  </div>

                  {/* File icon */}
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} · {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                    </p>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 transition-colors"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Inline upload CTA and validation when < 2 files */}
        {!canMerge && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 mt-4"
          >
            <p className="text-sm text-warning text-center">
              Upload at least 2 documents to merge.
            </p>
            {onAddFiles && (
              <Button
                variant="secondary"
                onClick={onAddFiles}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add another document
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
