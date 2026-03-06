import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Folder, Play, Image } from "lucide-react";
import { StorageFile } from "@/pages/Storage";
import { cn } from "@/lib/utils";

interface FilePreviewModalProps {
  file: StorageFile | null;
  isOpen: boolean;
  onClose: () => void;
  onRename?: (file: StorageFile) => void;
  onMove?: (file: StorageFile) => void;
  onDelete?: (file: StorageFile) => void;
  onDownload?: (file: StorageFile) => void;
}

const getFileTypeColor = (type: StorageFile['type']) => {
  switch (type) {
    case "pdf": return "text-red-500 bg-red-500/10";
    case "docx": return "text-blue-500 bg-blue-500/10";
    case "xlsx": return "text-emerald-500 bg-emerald-500/10";
    case "mp4": return "text-amber-500 bg-amber-500/10";
    case "jpg":
    case "png": return "text-purple-500 bg-purple-500/10";
    case "folder": return "text-amber-500 bg-amber-500/10";
    default: return "text-muted-foreground bg-muted";
  }
};

const FilePreviewModal = ({ 
  file, 
  isOpen, 
  onClose,
}: FilePreviewModalProps) => {
  if (!isOpen || !file) return null;

  const isFolder = file.type === "folder";
  const isVideo = file.type === "mp4";
  const isImage = ["jpg", "png"].includes(file.type);
  const isPDF = file.type === "pdf";
  const colorClasses = getFileTypeColor(file.type);

  // Generate fake page thumbnails for PDFs
  const pageCount = isPDF ? Math.floor(Math.random() * 8) + 3 : 0;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/90 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 rounded-lg bg-surface-2/50 hover:bg-surface-2 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* File name */}
            <div className="text-center mb-4">
              <h2 className="text-lg font-medium text-foreground">{file.name}</h2>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden rounded-xl bg-surface-2/30 border border-border/30">
              {/* PDF Preview - Scrollable one page at a time */}
              {isPDF && (
                <div className="h-full overflow-y-auto snap-y snap-mandatory glassmorphic-scrollbar">
                  <div className="flex flex-col items-center gap-6 py-6 px-4">
                    {pages.map((page) => (
                      <motion.div
                        key={page}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: page * 0.05 }}
                        className="w-full max-w-2xl snap-center shrink-0"
                      >
                        <div className="aspect-[8.5/11] bg-white rounded-lg shadow-lg border border-border/20 flex items-center justify-center relative overflow-hidden">
                          <div className="text-center p-8">
                            <FileText className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                            <p className="text-muted-foreground/50 text-sm">Page {page} of {pageCount}</p>
                          </div>
                          {/* Page number indicator */}
                          <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-muted/50 text-xs text-muted-foreground">
                            {page}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Preview */}
              {isVideo && (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="relative w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                      >
                        <Play className="w-7 h-7 text-white ml-1" />
                      </motion.div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="h-1 bg-white/20 rounded-full">
                        <div className="h-full w-0 bg-primary rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {isImage && (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="relative w-full max-w-2xl aspect-video bg-surface-2 rounded-lg overflow-hidden flex items-center justify-center">
                    <Image className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                </div>
              )}

              {/* Folder */}
              {isFolder && (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <Folder className="w-20 h-20 text-amber-500/40 mx-auto mb-4" />
                    <p className="text-muted-foreground">Double-click to open folder</p>
                  </div>
                </div>
              )}

              {/* Other file types */}
              {!isPDF && !isVideo && !isImage && !isFolder && (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4", colorClasses)}>
                      <span className="text-lg font-bold uppercase">{file.type}</span>
                    </div>
                    <p className="text-muted-foreground">Preview not available</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FilePreviewModal;
