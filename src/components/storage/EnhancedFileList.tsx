import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MoreHorizontal, Sparkles, Folder, FileText,
  Eye, PenTool, Share2, RefreshCw,
  Pencil, FolderInput, Copy, Download, Trash2, Lock,
  Languages, Send, LayoutGrid, Tag,
  Plus, X, ArrowUpRight,
  RotateCw, Scissors, Layers, GitCompare, FileOutput, FileDown, 
  Droplets, ArrowUpDown, Wrench
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StorageFile } from "@/pages/Storage";
import { SemanticResult } from "@/hooks/useSemanticSearch";
import { cn } from "@/lib/utils";
import { AICheckIcon } from "@/components/icons/AICheckIcon";
import CompressIcon from "@/components/icons/CompressIcon";
import TrackIcon from "@/components/icons/TrackIcon";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EnhancedFileListProps {
  files: (StorageFile | SemanticResult)[];
  onFileClick: (file: StorageFile) => void;
  onFileDoubleClick?: (file: StorageFile) => void;
  onAIInsight: (file: StorageFile) => void;
  onAICheck?: (file: StorageFile) => void;

  onPreview?: (file: StorageFile) => void;
  onSign?: (file: StorageFile) => void;
  onShare?: (file: StorageFile) => void;

  onConvert?: (file: StorageFile) => void;
  onCompress?: (file: StorageFile) => void;
  onTrack?: (file: StorageFile) => void;
  onTranslate?: (file: StorageFile) => void;
  onTransfer?: (file: StorageFile) => void;

  onArchive?: (file: StorageFile) => void;
  onRename?: (file: StorageFile) => void;
  onMove?: (file: StorageFile) => void;
  onDuplicate?: (file: StorageFile) => void;
  onDownload?: (file: StorageFile) => void;
  onDelete?: (file: StorageFile) => void;
  onPermissions?: (file: StorageFile) => void;

  onTagsChange?: (file: StorageFile, tags: string[]) => void;
  onTagClick?: (tag: string) => void;
  allTags?: string[];
  draggedFile?: StorageFile | null;
  onDragStart?: (file: StorageFile) => void;
  onDragEnd?: () => void;
  onDropOnFolder?: (file: StorageFile, folder: StorageFile) => void;
}

// AI summary snippets for demo
const aiSummaries: Record<string, string> = {
  "1": "Resume for Estelle Darcy, Senior Graphic Designer with 6+ years experience.",
  "2": "Product introduction deck covering AI-powered document features.",
  "3": "Quick start guide for new users.",
  "6": "Draft marketing copy for feature announcement.",
};

// Service availability by file type
const getAvailableServices = (fileType: StorageFile['type']) => {
  const services = {
    sign: ['pdf'],
    aiCheck: ['pdf', 'docx'],
    compress: ['pdf', 'docx', 'xlsx', 'mp4'],
    convert: ['pdf', 'docx', 'xlsx'],
    translate: ['pdf', 'docx'],
    transfer: ['pdf', 'docx', 'xlsx', 'mp4'],
    track: ['pdf', 'docx'],
  };

  return {
    sign: services.sign.includes(fileType),
    aiCheck: services.aiCheck.includes(fileType),
    compress: services.compress.includes(fileType),
    convert: services.convert.includes(fileType),
    translate: services.translate.includes(fileType),
    transfer: services.transfer.includes(fileType),
    track: services.track.includes(fileType),
  };
};

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
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
      );
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const EnhancedFileList = ({ 
  files, 
  onFileClick, 
  onFileDoubleClick,
  onAIInsight, 
  onAICheck,
  onPreview,
  onSign,
  onShare,
  onConvert,
  onTrack,
  onArchive,
  onRename,
  onMove,
  onDuplicate,
  onDownload,
  onDelete,
  onPermissions,
  onCompress,
  onTranslate,
  onTransfer,
  onTagsChange,
  onTagClick,
  allTags = [],
  draggedFile,
  onDragStart,
  onDragEnd,
  onDropOnFolder
}: EnhancedFileListProps) => {
  const navigate = useNavigate();
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  const [editingTagsFileId, setEditingTagsFileId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState("");
  const [tagManagerFileId, setTagManagerFileId] = useState<string | null>(null);

  // Filter tag suggestions based on input
  const getTagSuggestions = (input: string, currentTags: string[]) => {
    if (!input.trim()) return allTags.filter(t => !currentTags.includes(t)).slice(0, 5);
    return allTags
      .filter(t => t.toLowerCase().includes(input.toLowerCase()) && !currentTags.includes(t))
      .slice(0, 5);
  };

  // Truncate long tag names
  const truncateTag = (tag: string, maxLength = 12) => {
    return tag.length > maxLength ? `${tag.slice(0, maxLength)}…` : tag;
  };

  const handleDragOver = (e: React.DragEvent, file: StorageFile) => {
    if (file.type === "folder" && draggedFile && draggedFile.id !== file.id) {
      e.preventDefault();
      setHoveredFolder(file.id);
    }
  };

  const handleDragLeave = () => {
    setHoveredFolder(null);
  };

  const handleDrop = (e: React.DragEvent, folder: StorageFile) => {
    e.preventDefault();
    if (draggedFile && folder.type === "folder" && draggedFile.id !== folder.id) {
      onDropOnFolder?.(draggedFile, folder);
    }
    setHoveredFolder(null);
  };

  const handleAddTag = (file: StorageFile, tag: string) => {
    if (!tag.trim()) return;
    const currentTags = file.tags || [];
    if (!currentTags.includes(tag.trim())) {
      onTagsChange?.(file, [...currentTags, tag.trim()]);
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (file: StorageFile, tagToRemove: string) => {
    const currentTags = file.tags || [];
    onTagsChange?.(file, currentTags.filter(t => t !== tagToRemove));
  };

  const renderFileActions = (file: StorageFile, isDropdown = false) => {
    const MenuItem = isDropdown ? DropdownMenuItem : ContextMenuItem;
    const MenuSeparator = isDropdown ? DropdownMenuSeparator : ContextMenuSeparator;
    const MenuSub = isDropdown ? DropdownMenuSub : ContextMenuSub;
    const MenuSubTrigger = isDropdown ? DropdownMenuSubTrigger : ContextMenuSubTrigger;
    const MenuSubContent = isDropdown ? DropdownMenuSubContent : ContextMenuSubContent;

    const services = getAvailableServices(file.type);

    return (
      <div className="py-1 min-w-[160px]">
        <MenuItem onClick={() => onPreview?.(file)} className="h-7">
          <Eye className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          Preview
        </MenuItem>
        <MenuItem onClick={() => onDownload?.(file)} className="h-7">
          <Download className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          Download
        </MenuItem>

        <MenuSeparator className="my-1" />
        
        <MenuSub>
          <MenuSubTrigger className="h-7">
            <ArrowUpRight className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <span className="flex-1">Use with</span>
          </MenuSubTrigger>
          <MenuSubContent 
            className="w-32 py-1"
            sideOffset={4}
            alignOffset={-4}
          >
            <MenuItem onClick={() => onAICheck?.(file)} disabled={!services.aiCheck} className={cn("h-7", !services.aiCheck && "opacity-40")}>
              <AICheckIcon className="w-3.5 h-3.5 mr-2" />
              AI Check
            </MenuItem>
            <MenuItem onClick={() => onCompress?.(file)} disabled={!services.compress} className={cn("h-7", !services.compress && "opacity-40")}>
              <CompressIcon className="w-3.5 h-3.5 mr-2" />
              Compress
            </MenuItem>
            <MenuItem onClick={() => onConvert?.(file)} disabled={!services.convert} className={cn("h-7", !services.convert && "opacity-40")}>
              <RefreshCw className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              Convert
            </MenuItem>
            <MenuItem onClick={() => onSign?.(file)} disabled={!services.sign} className={cn("h-7", !services.sign && "opacity-40")}>
              <PenTool className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              Sign
            </MenuItem>
            <MenuItem onClick={() => onTrack?.(file)} disabled={!services.track} className={cn("h-7", !services.track && "opacity-40")}>
              <TrackIcon className="w-3.5 h-3.5 mr-2" />
              Track
            </MenuItem>
            <MenuItem onClick={() => onTranslate?.(file)} disabled={!services.translate} className={cn("h-7", !services.translate && "opacity-40")}>
              <Languages className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              Translate
            </MenuItem>
            <MenuItem onClick={() => onTransfer?.(file)} disabled={!services.transfer} className={cn("h-7", !services.transfer && "opacity-40")}>
              <Send className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              Transfer
            </MenuItem>
          </MenuSubContent>
        </MenuSub>

        <MenuSub>
          <MenuSubTrigger className="h-7">
            <LayoutGrid className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
            <span className="flex-1">Tools</span>
          </MenuSubTrigger>
          <MenuSubContent 
            className="w-36 max-h-[280px] overflow-y-auto py-1"
            sideOffset={4}
            alignOffset={-4}
          >
            <MenuItem onClick={() => navigate?.("/tool/compare", { state: { file: { name: file.name, size: file.size, type: file.type } } })} className="h-7 whitespace-nowrap">
              <GitCompare className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              Compare
            </MenuItem>
            <MenuItem onClick={() => navigate?.("/tool/merge", { state: { file: { name: file.name, size: file.size, type: file.type } } })} className="h-7 whitespace-nowrap">
              <Layers className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              Merge
            </MenuItem>
            <MenuItem onClick={() => navigate?.("/tool/split", { state: { file: { name: file.name, size: file.size, type: file.type } } })} className="h-7 whitespace-nowrap">
              <Scissors className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              Split
            </MenuItem>
            <MenuItem onClick={() => navigate?.("/tool/rotate", { state: { file: { name: file.name, size: file.size, type: file.type } } })} className="h-7 whitespace-nowrap">
              <RotateCw className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              Rotate
            </MenuItem>
            <MenuItem onClick={() => navigate?.("/tool/extract", { state: { file: { name: file.name, size: file.size, type: file.type } } })} className="h-7 whitespace-nowrap">
              <FileOutput className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              Extract
            </MenuItem>
            <MenuItem onClick={() => navigate?.("/tool/protect", { state: { file: { name: file.name, size: file.size, type: file.type } } })} className="h-7 whitespace-nowrap">
              <Lock className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              Protect
            </MenuItem>
            <MenuItem onClick={() => navigate?.("/tool/watermark", { state: { file: { name: file.name, size: file.size, type: file.type } } })} className="h-7 whitespace-nowrap">
              <Droplets className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              Watermark
            </MenuItem>
            <MenuItem onClick={() => navigate?.("/tool/organize", { state: { file: { name: file.name, size: file.size, type: file.type } } })} className="h-7 whitespace-nowrap">
              <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              Organize
            </MenuItem>
            <MenuItem onClick={() => navigate?.("/tool/flatten", { state: { file: { name: file.name, size: file.size, type: file.type } } })} className="h-7 whitespace-nowrap">
              <FileDown className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              One Page
            </MenuItem>
            <MenuItem onClick={() => navigate?.("/tool/metadata", { state: { file: { name: file.name, size: file.size, type: file.type } } })} className="h-7 whitespace-nowrap">
              <FileText className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              Metadata
            </MenuItem>
            <MenuItem onClick={() => navigate?.("/tool/repair", { state: { file: { name: file.name, size: file.size, type: file.type } } })} className="h-7 whitespace-nowrap">
              <Wrench className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              Repair
            </MenuItem>
          </MenuSubContent>
        </MenuSub>

        <MenuSeparator className="my-1" />
        
        <MenuItem onClick={() => onShare?.(file)} className="h-7">
          <Share2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          Share
        </MenuItem>
        <MenuItem onClick={() => onPermissions?.(file)} className="h-7">
          <Lock className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          Permissions
        </MenuItem>

        <MenuSeparator className="my-1" />
        
        <MenuItem onClick={() => onRename?.(file)} className="h-7">
          <Pencil className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          Rename
        </MenuItem>
        <MenuItem onClick={() => onMove?.(file)} className="h-7">
          <FolderInput className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          Move
        </MenuItem>
        <MenuItem onClick={() => onDuplicate?.(file)} className="h-7">
          <Copy className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          Duplicate
        </MenuItem>

        <MenuSeparator className="my-1" />
        
        <MenuItem 
          onClick={() => onDelete?.(file)}
          className="h-7 text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          Delete
        </MenuItem>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">All Files</h2>
        <span className="text-xs text-muted-foreground">{files.length} items</span>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-border/50 text-xs font-medium text-muted-foreground">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Tags</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Modified</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* File rows */}
        <div className="divide-y divide-border/30">
          {files.map((file, index) => (
            <ContextMenu key={file.id}>
              <ContextMenuTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  draggable={file.type !== "folder"}
                  onDragStart={() => onDragStart?.(file)}
                  onDragEnd={onDragEnd}
                  onDragOver={(e) => handleDragOver(e, file)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, file)}
                  className={cn(
                    "group grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-surface-2/50 transition-all cursor-pointer",
                    file.type === "folder" && draggedFile && draggedFile.id !== file.id && "ring-1 ring-dashed ring-primary/30",
                    file.type === "folder" && hoveredFolder === file.id && "bg-primary/15 ring-2 ring-primary shadow-sm scale-[1.01]",
                    draggedFile?.id === file.id && "opacity-50 scale-95"
                  )}
                  onClick={() => onFileClick(file)}
                  onDoubleClick={() => file.type !== "folder" && onFileDoubleClick?.(file)}
                >
                  {/* Name */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    {getFileIcon(file.type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {file.name}
                        </span>
                        
                        {/* AI Summary badge - only for PDFs */}
                        {file.type === "pdf" && (
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAIInsight(file);
                                  }}
                                  className="p-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                >
                                  <Sparkles className="w-3 h-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="max-w-[250px] p-2.5 bg-card border border-border/50"
                              >
                                <p className="text-xs text-foreground leading-relaxed">
                                  {aiSummaries[file.id] || "Click for AI summary"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      {file.aiTag && (
                        <span className="text-[10px] text-muted-foreground">
                          {file.aiTag}
                        </span>
                      )}
                      {/* Semantic context indicator */}
                      {'semanticContext' in file && file.semanticContext && !file.aiTag && (
                        <span className="text-[10px] text-primary/70 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          {file.semanticContext}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="col-span-3" onClick={(e) => e.stopPropagation()}>
                    {(() => {
                      const tags = file.tags || [];
                      const visibleTags = tags.slice(0, 2);
                      const overflowCount = tags.length - 2;
                      const hasOverflow = overflowCount > 0;

                      return (
                        <div className="flex items-center gap-1">
                          {tags.length === 0 ? (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          ) : (
                            <>
                              {/* Show first 2 tags */}
                              {visibleTags.map((tag) => (
                                <TooltipProvider key={tag} delayDuration={300}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => onTagClick?.(tag)}
                                        className="inline-flex items-center max-w-[80px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                                      >
                                        <span className="truncate">{truncateTag(tag)}</span>
                                      </button>
                                    </TooltipTrigger>
                                    {tag.length > 12 && (
                                      <TooltipContent side="top" className="text-xs">
                                        {tag}
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                              ))}

                              {/* Overflow indicator with popover */}
                              {hasOverflow && (
                                <Popover open={tagManagerFileId === file.id} onOpenChange={(open) => setTagManagerFileId(open ? file.id : null)}>
                                  <PopoverTrigger asChild>
                                    <button className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors">
                                      +{overflowCount}
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent 
                                    className="w-64 p-3" 
                                    align="start"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium flex items-center gap-1.5">
                                          <Tag className="w-3.5 h-3.5" />
                                          Tags ({tags.length})
                                        </h4>
                                      </div>
                                      
                                      {/* All tags list */}
                                      <ScrollArea className="max-h-32">
                                        <div className="flex flex-wrap gap-1.5">
                                          {tags.map((tag) => (
                                            <span
                                              key={tag}
                                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium group"
                                            >
                                              <button
                                                onClick={() => onTagClick?.(tag)}
                                                className="hover:underline"
                                              >
                                                {tag}
                                              </button>
                                              <button
                                                onClick={() => handleRemoveTag(file, tag)}
                                                className="opacity-60 hover:opacity-100 hover:bg-primary/20 rounded-sm p-0.5 transition-all"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </span>
                                          ))}
                                        </div>
                                      </ScrollArea>

                                      {/* Add tag input */}
                                      <div className="relative">
                                        <Input
                                          value={newTagInput}
                                          onChange={(e) => setNewTagInput(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter" && newTagInput.trim()) {
                                              handleAddTag(file, newTagInput);
                                            }
                                          }}
                                          placeholder="Add tag..."
                                          className="h-8 text-xs pr-8"
                                        />
                                        <button
                                          onClick={() => {
                                            if (newTagInput.trim()) {
                                              handleAddTag(file, newTagInput);
                                            }
                                          }}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                        
                                        {/* Tag suggestions */}
                                        {newTagInput && getTagSuggestions(newTagInput, tags).length > 0 && (
                                          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md z-10">
                                            {getTagSuggestions(newTagInput, tags).map((suggestion) => (
                                              <button
                                                key={suggestion}
                                                onClick={() => {
                                                  handleAddTag(file, suggestion);
                                                }}
                                                className="w-full text-left px-2 py-1.5 text-xs hover:bg-surface-2 transition-colors first:rounded-t-md last:rounded-b-md"
                                              >
                                                {suggestion}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </>
                          )}

                          {/* Quick add button (only show if not overflow popover) */}
                          {!hasOverflow && (
                            editingTagsFileId === file.id ? (
                              <div className="relative">
                                <Input
                                  value={newTagInput}
                                  onChange={(e) => setNewTagInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleAddTag(file, newTagInput);
                                    } else if (e.key === "Escape") {
                                      setEditingTagsFileId(null);
                                      setNewTagInput("");
                                    }
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => {
                                      if (newTagInput.trim()) {
                                        handleAddTag(file, newTagInput);
                                      }
                                      setEditingTagsFileId(null);
                                    }, 150);
                                  }}
                                  placeholder="Tag..."
                                  className="h-5 w-20 text-[10px] px-1.5 py-0"
                                  autoFocus
                                />
                                {/* Inline suggestions */}
                                {newTagInput && getTagSuggestions(newTagInput, tags).length > 0 && (
                                  <div className="absolute top-full left-0 mt-1 w-32 bg-popover border border-border rounded-md shadow-md z-10">
                                    {getTagSuggestions(newTagInput, tags).map((suggestion) => (
                                      <button
                                        key={suggestion}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          handleAddTag(file, suggestion);
                                          setEditingTagsFileId(null);
                                        }}
                                        className="w-full text-left px-2 py-1 text-[10px] hover:bg-surface-2 transition-colors first:rounded-t-md last:rounded-b-md"
                                      >
                                        {suggestion}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingTagsFileId(file.id)}
                                className="p-0.5 rounded hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Size */}
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>

                  {/* Modified */}
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground">
                      {file.lastModified}
                    </span>
                  </div>

                  {/* Actions - ••• menu */}
                  <div className="col-span-1 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          title="Actions"
                          className="p-1.5 rounded-md hover:bg-surface-2 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {renderFileActions(file, true)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              </ContextMenuTrigger>

              {/* Context menu (right-click) */}
              <ContextMenuContent className="w-40">
                {renderFileActions(file, false)}
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedFileList;
