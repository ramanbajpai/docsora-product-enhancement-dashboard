import { motion } from "framer-motion";
import { MoreHorizontal, Sparkles, FileText, Folder, Eye, Download, Pencil, FolderInput, Copy, Wand2, Trash2 } from "lucide-react";
import { StorageFile } from "@/pages/Storage";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecentFilesGridProps {
  files: StorageFile[];
  onFileClick: (file: StorageFile) => void;
  onAIInsight: (file: StorageFile) => void;
  onPreview?: (file: StorageFile) => void;
  onUseTool?: (file: StorageFile) => void;
}

const getFileIcon = (type: StorageFile['type']) => {
  switch (type) {
    case "pdf":
      return (
        <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
          <span className="text-xs font-bold text-red-500">PDF</span>
        </div>
      );
    case "docx":
      return (
        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <span className="text-xs font-bold text-blue-500">DOCX</span>
        </div>
      );
    case "mp4":
      return (
        <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <span className="text-xs font-bold text-amber-500">MP4</span>
        </div>
      );
    case "folder":
      return (
        <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Folder className="w-6 h-6 text-amber-500" />
        </div>
      );
    default:
      return (
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
      );
  }
};

const RecentFilesGrid = ({ files, onFileClick, onAIInsight, onPreview, onUseTool }: RecentFilesGridProps) => {
  const handleDoubleClick = (file: StorageFile) => {
    onPreview?.(file);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Recent Files & Folders</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group glass-card rounded-xl overflow-hidden cursor-pointer"
            onClick={() => onFileClick(file)}
            onDoubleClick={() => handleDoubleClick(file)}
          >
            {/* Preview area */}
            <div className="h-32 bg-surface-2 relative flex items-center justify-center overflow-hidden">
              {file.thumbnail ? (
                <img 
                  src={file.thumbnail} 
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              {/* AI Insight button */}
              {file.type !== "folder" && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAIInsight(file);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.button>
              )}

            </div>

            {/* File info */}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground truncate flex-1">
                  {file.name}
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded hover:bg-surface-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={() => onPreview?.(file)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="w-4 h-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FolderInput className="w-4 h-4 mr-2" />
                      Move
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onAIInsight(file)}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Insights
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUseTool?.(file)}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Use a tool...
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentFilesGrid;
