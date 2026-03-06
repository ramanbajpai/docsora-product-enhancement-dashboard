import { useState, useRef, useCallback } from "react";
import { Upload, Sparkles, Command as CommandIcon, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DroppedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onFilesDrop: (files: File[]) => void;
  droppedFiles: DroppedFile[];
  onRemoveFile: (id: string) => void;
  isProcessing: boolean;
  placeholder?: string;
}

export function CommandInput({
  value,
  onChange,
  onFilesDrop,
  droppedFiles,
  onRemoveFile,
  isProcessing,
  placeholder = "Drop a document or tell Docsora what you want to do..."
}: CommandInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesDrop(files);
    }
  }, [onFilesDrop]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesDrop(files);
    }
    e.target.value = "";
  }, [onFilesDrop]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Dropped files */}
      <AnimatePresence>
        {droppedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {droppedFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-medium text-foreground">{file.name}</span>
                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="p-0.5 rounded hover:bg-primary/20 transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
          "bg-surface-2 border",
          isDragOver 
            ? "border-primary ring-2 ring-primary/20" 
            : "border-border hover:border-primary/30",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        )}
      >
        {/* Left icon area */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
            title="Upload document"
          >
            <Upload className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="w-px h-4 bg-border" />
          <Sparkles className={cn(
            "w-4 h-4 transition-colors",
            isProcessing ? "text-primary animate-pulse" : "text-muted-foreground"
          )} />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/70",
            "text-sm outline-none"
          )}
        />

        {/* Right area */}
        <div className="flex items-center gap-2">
          {value && (
            <button
              onClick={() => onChange("")}
              className="p-1 rounded hover:bg-muted/50 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
            <CommandIcon className="w-3 h-3" />
            <span className="text-[10px] font-medium">K</span>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Drag overlay */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/5 border-2 border-dashed border-primary"
            >
              <div className="flex items-center gap-2 text-primary">
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">Drop document here</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
