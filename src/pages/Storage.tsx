import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import StorageHeader from "@/components/storage/StorageHeader";
import SmartSearchBar from "@/components/storage/SmartSearchBar";
import IntelligentFileSections from "@/components/storage/IntelligentFileSections";
import EnhancedFileList from "@/components/storage/EnhancedFileList";
import FilePreviewPanel from "@/components/storage/FilePreviewPanel";
import AISummaryPanel from "@/components/storage/AISummaryPanel";
import CreateFolderModal from "@/components/storage/CreateFolderModal";
import StorageUploadZone from "@/components/storage/StorageUploadZone";
import ToolPickerModal from "@/components/storage/ToolPickerModal";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ChevronRight, Folder } from "lucide-react";
import { useSemanticSearch, SemanticResult } from "@/hooks/useSemanticSearch";

export interface StorageFile {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx" | "pptx" | "mp4" | "jpg" | "png" | "folder";
  size?: number;
  uploadDate: string;
  lastModified: string;
  owner: string;
  status?: "signed" | "pending" | "draft";
  aiTag?: string;
  thumbnail?: string;
  parentId?: string;
  tags?: string[];
}

const demoFiles: StorageFile[] = [
  {
    id: "1",
    name: "Estelle Darcy Resume.pdf",
    type: "pdf",
    size: 302.57 * 1024,
    uploadDate: "04/12/2025",
    lastModified: "04/12/2025",
    owner: "Myles Fleming",
    status: "signed",
    aiTag: "Resume",
    thumbnail: "/placeholder.svg",
    tags: ["Important", "HR", "Hiring", "Q1-2025", "Interview", "Reviewed"]
  },
  {
    id: "2",
    name: "Docsora Introduction.pdf",
    type: "pdf",
    size: 1.07 * 1024 * 1024,
    uploadDate: "04/12/2025",
    lastModified: "04/12/2025",
    owner: "Myles Fleming",
    aiTag: "Presentation",
    tags: ["Marketing", "Branding", "Sales"]
  },
  {
    id: "3",
    name: "Try Docsora.pdf",
    type: "pdf",
    size: 120.94 * 1024,
    uploadDate: "22/11/2025",
    lastModified: "22/11/2025",
    owner: "Myles Fleming",
    aiTag: "Guide"
  },
  {
    id: "4",
    name: "One Platform Updated.mp4",
    type: "mp4",
    size: 45.2 * 1024 * 1024,
    uploadDate: "15/11/2025",
    lastModified: "15/11/2025",
    owner: "Myles Fleming"
  },
  {
    id: "5",
    name: "Final-Docsora-July.mp4",
    type: "mp4",
    size: 82.1 * 1024 * 1024,
    uploadDate: "01/07/2025",
    lastModified: "01/07/2025",
    owner: "Myles Fleming"
  },
  {
    id: "6",
    name: "Docsora Teaser.docx",
    type: "docx",
    size: 31.95 * 1024,
    uploadDate: "22/10/2025",
    lastModified: "22/10/2025",
    owner: "Myles Fleming",
    status: "draft"
  },
  {
    id: "7",
    name: "Projects",
    type: "folder",
    uploadDate: "17/09/2025",
    lastModified: "17/09/2025",
    owner: "Myles Fleming"
  },
  {
    id: "8",
    name: "NDA Agreement.pdf",
    type: "pdf",
    size: 245 * 1024,
    uploadDate: "10/12/2025",
    lastModified: "10/12/2025",
    owner: "Sarah Chen",
    status: "signed",
    aiTag: "Contract"
  },
  {
    id: "9",
    name: "Project Proposal.docx",
    type: "docx",
    size: 512 * 1024,
    uploadDate: "08/12/2025",
    lastModified: "09/12/2025",
    owner: "Alex Johnson",
    status: "pending",
    aiTag: "Proposal"
  },
  {
    id: "10",
    name: "Archive",
    type: "folder",
    uploadDate: "01/06/2025",
    lastModified: "01/06/2025",
    owner: "Myles Fleming"
  }
];

const Storage = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [files, setFiles] = useState<StorageFile[]>(demoFiles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showToolPicker, setShowToolPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFile, setDraggedFile] = useState<StorageFile | null>(null);
  const [draggedFiles, setDraggedFiles] = useState<StorageFile[]>([]);
  const [hoveredDropTarget, setHoveredDropTarget] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: "My Files" }
  ]);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<StorageFile[]>([]);

  const storageUsed = 2.25;
  const storageTotal = 200;

  // Collect all unique tags from files with counts
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    files.forEach(file => {
      file.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [files]);

  // Count files per tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    files.forEach(file => {
      file.tags?.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [files]);

  // Handle scroll for sticky search
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsSearchSticky(scrollTop > 180);
  };

  // Handle tag click - add to filters
  const handleTagClick = (tag: string) => {
    if (!activeTagFilters.includes(tag)) {
      setActiveTagFilters([...activeTagFilters, tag]);
    }
  };

  // Remove tag filter
  const handleRemoveTagFilter = (tag: string) => {
    setActiveTagFilters(activeTagFilters.filter(t => t !== tag));
  };

  // Clear all tag filters
  const handleClearAllFilters = () => {
    setActiveTagFilters([]);
    setSearchQuery("");
  };

  // Get files in current folder first
  const folderFiles = useMemo(() => {
    let result = files.filter(f => f.parentId === currentFolderId || (!f.parentId && !currentFolderId));
    
    // Apply tag filters (AND logic)
    if (activeTagFilters.length > 0) {
      result = result.filter(file => {
        const fileTags = file.tags || [];
        return activeTagFilters.every(tag => fileTags.includes(tag));
      });
    }
    
    return result;
  }, [files, currentFolderId, activeTagFilters]);

  // Use semantic search for query-based filtering
  const semanticResults = useSemanticSearch(folderFiles, searchQuery);
  
  // Filter files based on semantic search results
  const filteredFiles: SemanticResult[] = useMemo(() => {
    if (!searchQuery.trim()) {
      return folderFiles.map(f => ({ ...f, relevanceScore: 1 }));
    }
    return semanticResults;
  }, [folderFiles, searchQuery, semanticResults]);

  const handleFileClick = (file: StorageFile) => {
    if (file.type === "folder") {
      setCurrentFolderId(file.id);
      setBreadcrumbs([...breadcrumbs, { id: file.id, name: file.name }]);
    } else {
      setSelectedFile(file);
      setShowPreviewPanel(true);
    }
  };

  const handleFileDoubleClick = (file: StorageFile) => {
    if (file.type !== "folder") {
      // Determine user role based on file ownership (mock logic)
      // In production, this would come from permissions data
      const userRole = file.owner === "Myles Fleming" ? "owner" : "viewer";
      
      navigate("/document-viewer", { 
        state: { 
          file: { 
            id: file.id, 
            name: file.name, 
            type: file.type, 
            size: file.size 
          },
          userRole
        } 
      });
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const crumb = breadcrumbs[index];
    setCurrentFolderId(crumb.id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleAIInsight = (file: StorageFile) => {
    setSelectedFile(file);
    setShowAIPanel(true);
  };

  // Create a mock File object from StorageFile for navigation
  const createMockFile = (storageFile: StorageFile): File => {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      mp4: 'video/mp4',
      jpg: 'image/jpeg',
      png: 'image/png',
    };
    const blob = new Blob([], { type: mimeTypes[storageFile.type] || 'application/octet-stream' });
    return new File([blob], storageFile.name, { type: mimeTypes[storageFile.type] || 'application/octet-stream' });
  };

  const handleAICheck = (file: StorageFile) => {
    navigate("/ai-check", { state: { file: { name: file.name, size: file.size, type: file.type } } });
  };

  const handleSign = (file: StorageFile) => {
    navigate("/sign", { state: { file: { name: file.name, size: file.size, type: file.type } } });
  };

  const handleShare = (file: StorageFile) => {
    // Create a shareable link (simulated)
    const shareUrl = `${window.location.origin}/shared/${file.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied", description: `Share link for "${file.name}" copied to clipboard` });
  };

  const handlePermissions = (file: StorageFile) => {
    toast({ title: "Permissions", description: `Manage permissions for ${file.name}` });
  };

  const handleConvert = (file: StorageFile) => {
    navigate("/convert", { state: { file: { name: file.name, size: file.size, type: file.type } } });
  };

  const handleCompress = (file: StorageFile) => {
    navigate("/compress", { state: { file: { name: file.name, size: file.size, type: file.type } } });
  };

  const handleTrack = (file: StorageFile) => {
    navigate("/track", { state: { file: { name: file.name, size: file.size, type: file.type } } });
  };

  const handleTranslate = (file: StorageFile) => {
    navigate("/translate", { state: { file: { name: file.name, size: file.size, type: file.type } } });
  };

  const handleTransfer = (file: StorageFile) => {
    navigate("/transfer", { state: { file: { name: file.name, size: file.size, type: file.type } } });
  };

  const handleArchive = (file: StorageFile) => {
    toast({ title: "Archived", description: `${file.name} has been archived` });
  };

  const handleRename = (file: StorageFile) => {
    const newName = prompt("Enter new name:", file.name);
    if (newName && newName !== file.name) {
      setFiles(files.map(f => f.id === file.id ? { ...f, name: newName } : f));
      toast({ title: "Renamed", description: `File renamed to "${newName}"` });
    }
  };

  const handleMove = (file: StorageFile) => {
    // Get available folders
    const folders = files.filter(f => f.type === "folder" && f.id !== file.parentId);
    if (folders.length === 0) {
      toast({ title: "No folders available", description: "Create a folder first to move files" });
      return;
    }
    const folderNames = folders.map(f => f.name).join(", ");
    const targetFolder = prompt(`Move to folder (${folderNames}):`, folders[0]?.name);
    if (targetFolder) {
      const folder = folders.find(f => f.name.toLowerCase() === targetFolder.toLowerCase());
      if (folder) {
        setFiles(files.map(f => f.id === file.id ? { ...f, parentId: folder.id } : f));
        toast({ title: "Moved", description: `${file.name} moved to ${folder.name}` });
      } else {
        toast({ title: "Folder not found", description: "Please enter a valid folder name", variant: "destructive" });
      }
    }
  };

  const handleDuplicate = (file: StorageFile) => {
    const duplicate: StorageFile = {
      ...file,
      id: Date.now().toString(),
      name: `${file.name.replace(/\.[^/.]+$/, "")} (copy)${file.name.match(/\.[^/.]+$/)?.[0] || ""}`,
    };
    setFiles([duplicate, ...files]);
    toast({ title: "Duplicated", description: `Created copy of ${file.name}` });
  };

  const handleDownload = (file: StorageFile) => {
    // Simulate download by creating a blob and triggering download
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      mp4: 'video/mp4',
    };
    const blob = new Blob(['Demo file content'], { type: mimeTypes[file.type] || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download started", description: `Downloading ${file.name}...` });
  };

  const handleDelete = (file: StorageFile) => {
    setFiles(files.filter(f => f.id !== file.id));
    if (selectedFile?.id === file.id) {
      setSelectedFile(null);
      setShowPreviewPanel(false);
    }
    toast({ title: "Deleted", description: `${file.name} has been deleted` });
  };

  const handleTagsChange = (file: StorageFile, tags: string[]) => {
    const updatedFile = { ...file, tags };
    setFiles(files.map(f => f.id === file.id ? updatedFile : f));
    // Also update selectedFile if it's the same file
    if (selectedFile?.id === file.id) {
      setSelectedFile(updatedFile);
    }
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: StorageFile = {
      id: Date.now().toString(),
      name,
      type: "folder",
      uploadDate: new Date().toLocaleDateString("en-GB"),
      lastModified: new Date().toLocaleDateString("en-GB"),
      owner: "Myles Fleming",
      parentId: currentFolderId || undefined
    };
    setFiles([newFolder, ...files]);
    setShowCreateFolder(false);
  };

  const handleFilesUpload = useCallback((uploadedFiles: File[]) => {
    const newFiles: StorageFile[] = uploadedFiles.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.name.split('.').pop()?.toLowerCase() as StorageFile['type'] || 'pdf',
      size: file.size,
      uploadDate: new Date().toLocaleDateString("en-GB"),
      lastModified: new Date().toLocaleDateString("en-GB"),
      owner: "Myles Fleming",
      parentId: currentFolderId || undefined
    }));
    setFiles([...newFiles, ...files]);
    setShowUploadZone(false);
  }, [files, currentFolderId]);

  const handleDragStart = (file: StorageFile) => {
    // If the file is in selected files, drag all selected
    if (selectedFiles.some(f => f.id === file.id) && selectedFiles.length > 1) {
      setDraggedFiles(selectedFiles);
    } else {
      setDraggedFiles([file]);
    }
    setDraggedFile(file);
  };

  const handleDragEnd = () => {
    setDraggedFile(null);
    setDraggedFiles([]);
    setHoveredDropTarget(null);
  };

  const handleDropOnFolder = (file: StorageFile, folder: StorageFile) => {
    const filesToMove = draggedFiles.length > 0 ? draggedFiles : [file];
    setFiles(files.map(f => 
      filesToMove.some(df => df.id === f.id) ? { ...f, parentId: folder.id } : f
    ));
    const count = filesToMove.length;
    toast({ 
      title: "Moved", 
      description: count === 1 
        ? `${filesToMove[0].name} moved to ${folder.name}` 
        : `${count} files moved to ${folder.name}`
    });
    handleDragEnd();
  };

  const handleDropOnRoot = () => {
    const filesToMove = draggedFiles.length > 0 ? draggedFiles : (draggedFile ? [draggedFile] : []);
    if (filesToMove.length === 0) return;
    
    setFiles(files.map(f => 
      filesToMove.some(df => df.id === f.id) ? { ...f, parentId: undefined } : f
    ));
    const count = filesToMove.length;
    toast({ 
      title: "Moved to My Files", 
      description: count === 1 
        ? `${filesToMove[0].name} moved to root` 
        : `${count} files moved to root`
    });
    handleDragEnd();
  };

  const handleBreadcrumbDragOver = (e: React.DragEvent, crumbId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedFile || draggedFiles.length > 0) {
      setHoveredDropTarget(crumbId === null ? "root" : crumbId);
    }
  };

  const handleBreadcrumbDragLeave = () => {
    setHoveredDropTarget(null);
  };

  const handleBreadcrumbDrop = (e: React.DragEvent, crumbId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (crumbId === null) {
      // Drop on "My Files" - move to root
      handleDropOnRoot();
    } else {
      // Drop on a folder breadcrumb
      const folder = files.find(f => f.id === crumbId);
      if (folder && draggedFile) {
        handleDropOnFolder(draggedFile, folder);
      }
    }
    setHoveredDropTarget(null);
  };

  const handlePageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedFile && draggedFiles.length === 0) {
      setIsDragging(true);
    }
  };

  const handlePageDragLeave = () => {
    setIsDragging(false);
  };

  const handlePageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFilesUpload(droppedFiles);
    }
  };

  return (
    <AppLayout>
      <motion.div 
        className="min-h-[calc(100vh-4rem)] relative flex"
        onDragOver={handlePageDragOver}
        onDragLeave={handlePageDragLeave}
        onDrop={handlePageDrop}
      >
        {/* Main content area */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-w-0 relative overflow-y-auto"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10 pointer-events-none" />

          <div className="relative z-10 p-6 pl-10 space-y-6">
            {/* Header with storage usage */}
            <StorageHeader
              storageUsed={storageUsed}
              storageTotal={storageTotal}
              onCreateFolder={() => setShowCreateFolder(true)}
              onUpload={() => setShowUploadZone(true)}
            />

            {/* Sticky Search Bar */}
            <div className={cn(
              "transition-all duration-200",
              isSearchSticky && "sticky top-0 z-20 -mx-6 px-6 py-3 bg-background/95 backdrop-blur-sm border-b border-border/50"
            )}>
              <SmartSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                allTags={allTags}
                tagCounts={tagCounts}
                activeTagFilters={activeTagFilters}
                onAddTagFilter={handleTagClick}
                onRemoveTagFilter={handleRemoveTagFilter}
                onClearAllFilters={handleClearAllFilters}
              />
            </div>

            {/* Breadcrumbs with drag-and-drop support */}
            {breadcrumbs.length > 1 && (
              <div className="flex items-center gap-1 text-sm">
                {breadcrumbs.map((crumb, idx) => {
                  const isDropTarget = (draggedFile || draggedFiles.length > 0) && idx < breadcrumbs.length - 1;
                  const isHovered = hoveredDropTarget === (crumb.id === null ? "root" : crumb.id);
                  
                  return (
                    <div key={crumb.id || "root"} className="flex items-center gap-1">
                      {idx > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      <button
                        onClick={() => handleBreadcrumbClick(idx)}
                        onDragOver={(e) => isDropTarget ? handleBreadcrumbDragOver(e, crumb.id) : undefined}
                        onDragLeave={handleBreadcrumbDragLeave}
                        onDrop={(e) => isDropTarget ? handleBreadcrumbDrop(e, crumb.id) : undefined}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all",
                          idx === breadcrumbs.length - 1
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface-2",
                          isDropTarget && "ring-1 ring-dashed ring-primary/40",
                          isHovered && "bg-primary/20 ring-2 ring-primary text-foreground scale-105"
                        )}
                      >
                        {idx === 0 ? null : <Folder className="w-3.5 h-3.5" />}
                        {crumb.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* "Move to My Files" drop zone - visible when dragging inside a folder */}
            <AnimatePresence>
              {(draggedFile || draggedFiles.length > 0) && currentFolderId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    onDragOver={(e) => handleBreadcrumbDragOver(e, null)}
                    onDragLeave={handleBreadcrumbDragLeave}
                    onDrop={(e) => handleBreadcrumbDrop(e, null)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                      hoveredDropTarget === "root"
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/50 text-muted-foreground hover:border-primary/50 hover:bg-surface-2/50"
                    )}
                  >
                    <Folder className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Drop here to move to My Files
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drag indicator */}
            <AnimatePresence>
              {draggedFile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg"
                >
                  {draggedFiles.length > 1 
                    ? `Moving ${draggedFiles.length} files`
                    : `Moving: ${draggedFile.name}`
                  }
                </motion.div>
              )}
            </AnimatePresence>

            {/* Intelligent File Sections */}
            {!searchQuery && !currentFolderId && (
              <IntelligentFileSections
                files={files}
                onFileClick={handleFileClick}
                onAIInsight={handleAIInsight}
              />
            )}

            {/* All Files List */}
            <EnhancedFileList
              files={filteredFiles}
              onFileClick={handleFileClick}
              onFileDoubleClick={handleFileDoubleClick}
              onAIInsight={handleAIInsight}
              onAICheck={handleAICheck}
              onPreview={handleFileClick}
              onSign={handleSign}
              onShare={handleShare}
              onConvert={handleConvert}
              onTrack={handleTrack}
              onArchive={handleArchive}
              onRename={handleRename}
              onMove={handleMove}
              onDuplicate={handleDuplicate}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onPermissions={handlePermissions}
              onCompress={handleCompress}
              onTranslate={handleTranslate}
              onTransfer={handleTransfer}
              onTagsChange={handleTagsChange}
              onTagClick={handleTagClick}
              allTags={allTags}
              draggedFile={draggedFile}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDropOnFolder={handleDropOnFolder}
            />
          </div>

          {/* Drag overlay for file uploads */}
          <AnimatePresence>
            {isDragging && !draggedFile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-xl flex items-center justify-center"
              >
                <div className="text-center">
                  <p className="text-xl font-semibold text-foreground">Drop files here</p>
                  <p className="text-sm text-muted-foreground mt-1">Release to upload</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* File Preview Panel - side panel */}
        <FilePreviewPanel
          file={selectedFile}
          isOpen={showPreviewPanel}
          onClose={() => setShowPreviewPanel(false)}
          onDownload={handleDownload}
          onRename={handleRename}
          onMove={handleMove}
          onDelete={handleDelete}
          onTagsChange={handleTagsChange}
          onTagClick={handleTagClick}
          onExpand={(file) => {
            navigate("/document-viewer", { 
              state: { 
                file: { 
                  id: file.id, 
                  name: file.name, 
                  type: file.type, 
                  size: file.size 
                } 
              } 
            });
          }}
          allTags={allTags}
        />

        {/* AI Summary Panel */}
        <AISummaryPanel
          file={selectedFile}
          isOpen={showAIPanel}
          onClose={() => setShowAIPanel(false)}
        />

        {/* Create Folder Modal */}
        <CreateFolderModal
          isOpen={showCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          onCreate={handleCreateFolder}
        />

        {/* Upload Zone Modal */}
        <Dialog open={showUploadZone} onOpenChange={setShowUploadZone}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
            <StorageUploadZone
              onUpload={handleFilesUpload}
              onClose={() => setShowUploadZone(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Tool Picker Modal */}
        <ToolPickerModal
          file={selectedFile}
          isOpen={showToolPicker}
          onClose={() => setShowToolPicker(false)}
        />
      </motion.div>
    </AppLayout>
  );
};

export default Storage;
