import { motion } from "framer-motion";
import { MoreHorizontal, Sparkles, Folder, ChevronLeft, Eye, Download, Pencil, FolderInput, Copy, Wand2, History, Shield, FileText, Trash2 } from "lucide-react";
import { StorageFile } from "@/pages/Storage";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileListViewProps {
  files: StorageFile[];
  viewMode: "grid" | "list";
  onFileClick: (file: StorageFile) => void;
  onAIInsight: (file: StorageFile) => void;
  onPreview?: (file: StorageFile) => void;
  onUseTool?: (file: StorageFile) => void;
}

const getFileIcon = (type: StorageFile['type']) => {
  switch (type) {
    case "pdf":
      return (
        <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-red-500">PDF</span>
        </div>
      );
    case "docx":
      return (
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-blue-500">DOCX</span>
        </div>
      );
    case "xlsx":
      return (
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-emerald-500">XLSX</span>
        </div>
      );
    case "mp4":
      return (
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-amber-500">MP4</span>
        </div>
      );
    case "folder":
      return (
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
          <Folder className="w-5 h-5 text-amber-500" />
        </div>
      );
    default:
      return (
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground">FILE</span>
        </div>
      );
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const FileListView = ({ files, viewMode, onFileClick, onAIInsight, onPreview, onUseTool }: FileListViewProps) => {
  const handleDoubleClick = (file: StorageFile) => {
    onPreview?.(file);
  };

  const handleContextMenu = (e: React.MouseEvent, file: StorageFile) => {
    // Context menu is handled by the dropdown, but we can trigger preview on right-click option
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button className="p-1 rounded hover:bg-surface-2 transition-colors">
          <ChevronLeft className="w-4 h-4 text-primary" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">My Files</h2>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border/50 text-sm font-medium text-muted-foreground">
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Upload Date</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* File rows */}
        <div className="divide-y divide-border/30">
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="group grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-surface-2/50 transition-colors cursor-pointer"
              onClick={() => onFileClick(file)}
              onDoubleClick={() => handleDoubleClick(file)}
            >
              {/* Name */}
              <div className="col-span-6 flex items-center gap-3 min-w-0">
                {getFileIcon(file.type)}
                <span className="text-sm text-foreground truncate">{file.name}</span>
                {file.aiTag && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs shrink-0">
                    {file.aiTag}
                  </span>
                )}
              </div>

              {/* Size */}
              <div className="col-span-2 flex items-center gap-2">
                {file.type !== "folder" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAIInsight(file);
                    }}
                    className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
              </div>

              {/* Upload Date */}
              <div className="col-span-2">
                <span className="text-sm text-muted-foreground">{file.uploadDate}</span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-md hover:bg-surface-2 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
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
                    <DropdownMenuItem>
                      <History className="w-4 h-4 mr-2" />
                      Version history
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="w-4 h-4 mr-2" />
                      Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="w-4 h-4 mr-2" />
                      Audit log
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileListView;
