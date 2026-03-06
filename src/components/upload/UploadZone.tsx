import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
}

interface UploadZoneProps {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  className?: string;
}

export function UploadZone({
  onFilesSelected,
  accept = ".pdf,.doc,.docx,.txt",
  multiple = true,
  maxSize = 50,
  className,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const simulateUpload = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).substring(7);
      const newFile: UploadedFile = {
        id,
        file,
        progress: 0,
        status: "uploading",
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, progress: 100, status: "processing" } : f
            )
          );

          // Simulate processing
          setTimeout(() => {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, status: "complete" } : f
              )
            );
            resolve();
          }, 1000);
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, progress } : f))
          );
        }
      }, 200);
    });
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const validFiles = Array.from(files).filter((file) => {
        if (file.size > maxSize * 1024 * 1024) {
          console.warn(`File ${file.name} exceeds ${maxSize}MB limit`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        onFilesSelected?.(validFiles);
        await Promise.all(validFiles.map(simulateUpload));
      }
    },
    [maxSize, onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles]
  );

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <motion.label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          scale: isDragOver ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "upload-zone relative flex flex-col items-center justify-center p-12 cursor-pointer",
          isDragOver && "drag-over"
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <motion.div
          animate={{
            y: isDragOver ? -5 : 0,
            rotate: isDragOver ? [0, -3, 3, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
        >
          <Upload className="w-8 h-8 text-primary" />
        </motion.div>

        <h3 className="text-lg font-semibold text-foreground mb-1">
          {isDragOver ? "Drop files here" : "Drop files to upload"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse from your computer
        </p>
        <p className="text-xs text-muted-foreground">
          Supports PDF, DOC, DOCX, TXT • Max {maxSize}MB per file
        </p>
      </motion.label>

      {/* Uploaded Files List */}
      <AnimatePresence mode="popLayout">
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {uploadedFiles.map((uploadedFile) => (
              <FileCard
                key={uploadedFile.id}
                uploadedFile={uploadedFile}
                onRemove={() => removeFile(uploadedFile.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FileCardProps {
  uploadedFile: UploadedFile;
  onRemove: () => void;
}

function FileCard({ uploadedFile, onRemove }: FileCardProps) {
  const { file, progress, status } = uploadedFile;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-4"
    >
      <div className="flex items-start gap-3">
        {/* File Icon with Animation */}
        <motion.div
          animate={status === "uploading" ? { rotate: [0, 2, -2, 0] } : {}}
          transition={{
            duration: 2,
            repeat: status === "uploading" ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
        >
          <FileText className="w-5 h-5 text-primary" />
        </motion.div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>

          {/* Progress */}
          {status === "uploading" && (
            <div className="mt-2">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                Uploading... {Math.round(progress)}%
              </p>
            </div>
          )}

          {status === "processing" && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing...
            </div>
          )}

          {status === "complete" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mt-2 text-xs text-success"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Check className="w-3 h-3" />
              </motion.div>
              Ready
            </motion.div>
          )}
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
