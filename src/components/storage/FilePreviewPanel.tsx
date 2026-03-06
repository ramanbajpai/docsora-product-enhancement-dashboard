import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  X, FileText, Play, Pause, Image as ImageIcon, Folder, 
  Download, Clock, User, HardDrive, History,
  ChevronRight, ChevronLeft, MoreHorizontal, Pencil, Trash2, 
  FolderInput, FileStack, Shield, UserPlus, UserMinus,
  ZoomIn, ZoomOut, Maximize2, Minimize2, Volume2, VolumeX,
  Mail, Calendar as CalendarIcon, ChevronDown, FileDown, Eye, Share2,
  Lock, KeyRound, Tag, Plus, Info, Film, SkipBack, SkipForward, MessageSquare
} from "lucide-react";
import { StorageFile } from "@/pages/Storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FilePreviewPanelProps {
  file: StorageFile | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (file: StorageFile) => void;
  onRename?: (file: StorageFile) => void;
  onMove?: (file: StorageFile) => void;
  onDelete?: (file: StorageFile) => void;
  onTagsChange?: (file: StorageFile, tags: string[]) => void;
  onTagClick?: (tag: string) => void;
  onExpand?: (file: StorageFile) => void;
  allTags?: string[];
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileTypeColor = (type: StorageFile["type"]) => {
  switch (type) {
    case "pdf": return "bg-red-500/10 text-red-500 border-red-500/20";
    case "docx": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "xlsx": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "pptx": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "mp4": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "jpg":
    case "png": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "folder": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const getStatusStyle = (status?: string) => {
  switch (status) {
    case "signed": return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "pending": return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "draft": return "bg-muted text-muted-foreground border-border";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

// Role definitions (Owner, Editor, Viewer only) - enterprise-grade
const ROLES = [
  { value: "owner", label: "Owner", description: "Full control, permissions, audit access", color: "bg-primary/10 text-primary border-primary/30" },
  { value: "editor", label: "Editor", description: "Edit & collaborate", color: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  { value: "viewer", label: "Viewer", description: "View only", color: "bg-muted text-muted-foreground border-border" },
];

// Mock activity log with enterprise-grade specificity (no "Signed" events - tracked elsewhere)
const mockActivity = [
  { action: "Viewed", user: "You", email: "you@company.com", time: "2 min ago", timestamp: "Jan 8, 2026 at 2:43 PM", icon: Eye, group: "today" },
  { action: "Downloaded", user: "Sarah Chen", email: "sarah@company.com", time: "45 min ago", timestamp: "Jan 8, 2026 at 2:00 PM", icon: Download, group: "today" },
  { action: "Permission changed", user: "You", email: "you@company.com", time: "1 hour ago", timestamp: "Jan 8, 2026 at 1:45 PM", icon: KeyRound, detail: "Changed Sarah Chen role from Viewer → Editor", group: "today" },
  { action: "Comment added", user: "Sarah Chen", email: "sarah@company.com", time: "3 hours ago", timestamp: "Jan 8, 2026 at 11:30 AM", icon: Pencil, detail: "Added comment on page 3", group: "today" },
  { action: "Text edited", user: "Sarah Chen", email: "sarah@company.com", time: "Yesterday", timestamp: "Jan 7, 2026 at 4:30 PM", icon: Pencil, detail: "Modified paragraph in Section 2.1", group: "yesterday" },
  { action: "Comment resolved", user: "You", email: "you@company.com", time: "Yesterday", timestamp: "Jan 7, 2026 at 2:15 PM", icon: Pencil, detail: "Resolved comment thread on page 1", group: "yesterday" },
  { action: "Section edited", user: "You", email: "you@company.com", time: "Yesterday", timestamp: "Jan 7, 2026 at 10:00 AM", icon: Pencil, detail: "Updated 'Terms & Conditions' section", group: "yesterday" },
  { action: "Reply added", user: "Alex Johnson", email: "alex@company.com", time: "Dec 28, 2025", timestamp: "Dec 28, 2025 at 3:45 PM", icon: Pencil, detail: "Replied to Sarah Chen's comment", group: "earlier" },
  { action: "Shared", user: "You", email: "you@company.com", time: "Dec 28, 2025", timestamp: "Dec 28, 2025 at 10:15 AM", icon: Share2, detail: "Shared with alex@company.com", group: "earlier" },
  { action: "Permission changed", user: "You", email: "you@company.com", time: "Dec 20, 2025", timestamp: "Dec 20, 2025 at 9:30 AM", icon: KeyRound, detail: "Set access expiry for Sarah Chen: Jan 12, 2026", group: "earlier" },
  { action: "Created", user: "You", email: "you@company.com", time: "Dec 4, 2025", timestamp: "Dec 4, 2025 at 9:00 AM", icon: FileText, group: "earlier" },
];

// Group activities by day
const groupActivitiesByDay = (activities: typeof mockActivity) => {
  const groups: { [key: string]: typeof mockActivity } = {
    today: [],
    yesterday: [],
    earlier: []
  };
  activities.forEach(activity => {
    if (activity.group && groups[activity.group]) {
      groups[activity.group].push(activity);
    }
  });
  return groups;
};

// Initial permissions data - with detailed expiry info
const initialPermissions = [
  { id: "1", user: "You", email: "you@company.com", role: "owner", avatar: "MF" },
  { id: "2", user: "Sarah Chen", email: "sarah@company.com", role: "editor", avatar: "SC", expires: "Jan 12, 2026", expiresTime: "17:00", expiresTimezone: "UTC" },
  { id: "3", user: "Alex Johnson", email: "alex@company.com", role: "viewer", avatar: "AJ" },
];

// Mock page count
const getPageCount = (file: StorageFile) => {
  const pageCounts: Record<string, number> = {
    "1": 2, "2": 12, "3": 8, "6": 1, "8": 6, "9": 15
  };
  return pageCounts[file.id] || 4;
};

const FilePreviewPanel = ({ 
  file, 
  isOpen, 
  onClose, 
  onDownload,
  onRename,
  onMove,
  onDelete,
  onTagsChange,
  onTagClick,
  onExpand,
  allTags = []
}: FilePreviewPanelProps) => {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviteExpiry, setInviteExpiry] = useState("never");
  const [customExpiryDate, setCustomExpiryDate] = useState<Date | undefined>(undefined);
  const [customExpiryTime, setCustomExpiryTime] = useState("12:00");
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [newTagInput, setNewTagInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(150); // 2:30 in seconds
  const [videoVolume, setVideoVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Format time for video player
  const formatVideoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle timeline scrubbing
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * videoDuration;
    setVideoCurrentTime(Math.max(0, Math.min(videoDuration, newTime)));
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Skip forward/back
  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(videoDuration, videoCurrentTime + seconds));
    setVideoCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Volume change
  const handleVolumeChange = (value: number) => {
    setVideoVolume(value);
    setIsMuted(value === 0);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
  };

  // Close fullscreen on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
      if (isFullscreen && e.key === " ") {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, isPlaying]);

  // Tag management
  const handleAddTag = (tag: string) => {
    if (!file || !tag.trim()) return;
    const currentTags = file.tags || [];
    if (!currentTags.includes(tag.trim())) {
      onTagsChange?.(file, [...currentTags, tag.trim()]);
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!file) return;
    const currentTags = file.tags || [];
    onTagsChange?.(file, currentTags.filter(t => t !== tagToRemove));
  };

  // Filter tag suggestions
  const getTagSuggestions = (input: string) => {
    if (!file) return [];
    const currentTags = file.tags || [];
    if (!input.trim()) return allTags.filter(t => !currentTags.includes(t)).slice(0, 5);
    return allTags
      .filter(t => t.toLowerCase().includes(input.toLowerCase()) && !currentTags.includes(t))
      .slice(0, 5);
  };

  if (!file) return null;

  const pageCount = getPageCount(file);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, pageCount));

  const handleInvite = () => {
    if (!inviteEmail) return;
    toast({ 
      title: "Invitation sent", 
      description: `${inviteEmail} has been invited as ${ROLES.find(r => r.value === inviteRole)?.label}` 
    });
    setInviteEmail("");
    setShowInviteForm(false);
  };

  const handleExportAuditLog = () => {
    toast({ title: "Exporting audit log", description: "Your audit log is being prepared for download..." });
  };

  const getRoleStyle = (role: string) => {
    return ROLES.find(r => r.value === role)?.color || ROLES[3].color;
  };

  const getRoleLabel = (role: string) => {
    return ROLES.find(r => r.value === role)?.label || "Viewer";
  };

  // Render main content viewer
  const renderContentViewer = () => {
    if (file.type === "folder") {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 bg-surface-2/20">
          <div className="w-24 h-24 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Folder className="w-12 h-12 text-amber-500" />
          </div>
          <p className="text-sm text-muted-foreground">Folder</p>
        </div>
      );
    }

    if (file.type === "mp4") {
      const progressPercent = (videoCurrentTime / videoDuration) * 100;
      
      return (
        <div className="relative h-full bg-zinc-950 flex flex-col">
          {/* Video player area */}
          <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
            {/* Placeholder video background - in production, this would be the actual video */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 via-zinc-900 to-black" />
            
            {/* Video preview frame indicator */}
            <div className="absolute top-3 left-3 flex items-center gap-2 text-white/50 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded">
              <Film className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">{file.name}</span>
            </div>
            
            {/* Center play/pause button */}
            <div className="relative z-10 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl hover:bg-white/15 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-white" />
                ) : (
                  <Play className="w-7 h-7 text-white ml-0.5" />
                )}
              </motion.button>
            </div>
          </div>
          
          {/* Video controls bar - always visible */}
          <div className="shrink-0 bg-zinc-900 border-t border-white/10 px-3 pt-2.5 pb-3">
            {/* Progress bar with scrubbing */}
            <div 
              ref={progressRef}
              onClick={handleProgressClick}
              className="w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer group relative"
            >
              <div 
                className="h-full bg-primary rounded-full relative transition-all"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg ring-2 ring-white/20" />
              </div>
              {/* Hover preview time indicator */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {formatVideoTime(videoCurrentTime)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {/* Skip back */}
                <button 
                  onClick={() => handleSkip(-10)}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  title="Skip back 10s"
                >
                  <SkipBack className="w-4 h-4 text-white/80" />
                </button>
                
                {/* Play/Pause */}
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                </button>
                
                {/* Skip forward */}
                <button 
                  onClick={() => handleSkip(10)}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  title="Skip forward 10s"
                >
                  <SkipForward className="w-4 h-4 text-white/80" />
                </button>
                
                {/* Volume control */}
                <div 
                  className="relative flex items-center"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <button 
                    onClick={() => {
                      if (isMuted) {
                        setIsMuted(false);
                        handleVolumeChange(0.8);
                      } else {
                        setIsMuted(true);
                        handleVolumeChange(0);
                      }
                    }}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  >
                    {isMuted || videoVolume === 0 ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  
                  {/* Volume slider */}
                  <AnimatePresence>
                    {showVolumeSlider && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden"
                      >
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : videoVolume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-16 h-1 ml-1 accent-primary cursor-pointer"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Time display */}
                <span className="text-xs text-white/60 font-medium ml-2">
                  {formatVideoTime(videoCurrentTime)} / {formatVideoTime(videoDuration)}
                </span>
              </div>
              
              {/* Fullscreen button */}
              <button 
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (file.type === "jpg" || file.type === "png") {
      return (
        <div className="h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-4 relative">
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
            <ImageIcon className="w-20 h-20 text-purple-500/40" />
          </div>
          
          {/* Image controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border/50 shadow-lg">
            <button onClick={handleZoomOut} className="p-1 hover:bg-surface-2 rounded transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium w-12 text-center">{zoom}%</span>
            <button onClick={handleZoomIn} className="p-1 hover:bg-surface-2 rounded transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button 
              onClick={() => onExpand?.(file)}
              className="p-1 hover:bg-surface-2 rounded transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    // PDF/Document full-page reader
    return (
      <div className="h-full flex flex-col bg-zinc-100 dark:bg-zinc-900">
        {/* Optional thumbnail strip */}
        <AnimatePresence>
          {showThumbnails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 80, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="shrink-0 border-b border-border/30 bg-background overflow-hidden"
            >
              <div className="flex items-center gap-2 p-2 overflow-x-auto">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "shrink-0 w-12 h-16 rounded border flex items-center justify-center text-[10px] font-medium transition-all",
                      currentPage === page 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-border/50 bg-white dark:bg-zinc-800 text-muted-foreground hover:border-border"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main document view */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <div 
            className="bg-white dark:bg-zinc-800 shadow-xl rounded-lg border border-border/30 flex items-center justify-center transition-transform"
            style={{ 
              width: `${Math.min(320 * (zoom / 100), 400)}px`,
              height: `${Math.min(420 * (zoom / 100), 520)}px`,
            }}
          >
            <div className="text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Page {currentPage}</p>
              <p className="text-xs text-muted-foreground mt-1">{file.name}</p>
            </div>
          </div>
        </div>

        {/* Document controls - unified centered bar */}
        <div className="shrink-0 border-t border-border/30 bg-background px-4 py-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1">
              {/* Page navigation */}
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="p-1.5 hover:bg-surface-2 rounded transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium px-2">
                {currentPage} / {pageCount}
              </span>
              <button 
                onClick={handleNextPage}
                disabled={currentPage === pageCount}
                className="p-1.5 hover:bg-surface-2 rounded transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <div className="w-px h-4 bg-border mx-2" />
              
              {/* Zoom controls */}
              <button onClick={handleZoomOut} className="p-1.5 hover:bg-surface-2 rounded transition-colors">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium w-10 text-center">{zoom}%</span>
              <button onClick={handleZoomIn} className="p-1.5 hover:bg-surface-2 rounded transition-colors">
                <ZoomIn className="w-4 h-4" />
              </button>
              
              <div className="w-px h-4 bg-border mx-2" />
              
              {/* Expand */}
              <button 
                onClick={() => onExpand?.(file)}
                className="p-1.5 hover:bg-surface-2 rounded transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render fullscreen video overlay
  const renderFullscreenOverlay = () => {
    if (!isFullscreen || file.type !== "mp4") return null;
    
    const progressPercent = (videoCurrentTime / videoDuration) * 100;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
        onClick={() => setIsFullscreen(false)}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Film className="w-5 h-5 text-white/60" />
            <span className="text-white font-medium">{file.name}</span>
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Minimize2 className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* Video area */}
        <div 
          className="flex-1 flex items-center justify-center px-8 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full max-w-5xl aspect-video bg-zinc-900 rounded-xl overflow-hidden shadow-2xl">
            {/* Video placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 via-zinc-900 to-black flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-white" />
                ) : (
                  <Play className="w-10 h-10 text-white ml-1" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div 
          className="shrink-0 px-8 pb-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-5xl mx-auto bg-zinc-900/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
            {/* Progress bar */}
            <div 
              onClick={handleProgressClick}
              className="w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer group relative"
            >
              <div 
                className="h-full bg-primary rounded-full relative transition-all"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg ring-2 ring-white/20" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleSkip(-10)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <SkipBack className="w-5 h-5 text-white/80" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
                </button>
                <button 
                  onClick={() => handleSkip(10)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <SkipForward className="w-5 h-5 text-white/80" />
                </button>
                
                <div className="flex items-center gap-2 ml-2">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isMuted || videoVolume === 0 ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : videoVolume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-24 h-1 accent-primary cursor-pointer"
                  />
                </div>
                
                <span className="text-sm text-white/60 font-medium ml-4">
                  {formatVideoTime(videoCurrentTime)} / {formatVideoTime(videoDuration)}
                </span>
              </div>
              
              <button 
                onClick={() => setIsFullscreen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Minimize2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Fullscreen video overlay */}
      <AnimatePresence>
        {renderFullscreenOverlay()}
      </AnimatePresence>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="w-[480px] h-full border-l border-border/50 bg-background flex flex-col shrink-0 overflow-hidden"
          >
            {/* ============================================= */}
            {/* DOCUMENT HEADER - Minimal for video */}
            {/* ============================================= */}
            <div className="shrink-0 border-b border-border/50 bg-background">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* File type badge */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                    getFileTypeColor(file.type)
                  )}>
                    {file.type === "folder" ? (
                      <Folder className="w-5 h-5" />
                    ) : (
                      <span className="text-[10px] font-bold">{file.type.toUpperCase()}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-foreground truncate text-sm leading-tight">
                      {file.name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onDownload?.(file)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRename?.(file)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onMove?.(file)}>
                        <FolderInput className="w-4 h-4 mr-2" />
                        Move
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(file)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metadata row - show here for non-video files */}
              {file.type !== "mp4" && (
                <div className="px-4 pb-3 flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    {formatFileSize(file.size)}
                  </span>
                  {file.type !== "folder" && (
                    <span className="flex items-center gap-1">
                      <FileStack className="w-3 h-3" />
                      {pageCount} pages
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {file.lastModified}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {file.owner}
                  </span>
                </div>
              )}
            </div>

            {/* ============================================= */}
            {/* VIDEO PLAYER - Priority placement at top */}
            {/* ============================================= */}
            {file.type === "mp4" && (
              <div className="shrink-0">
                {renderContentViewer()}
                
                {/* Video metadata - directly below player */}
                <div className="px-4 py-3 border-b border-border/50 bg-surface-2/30">
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5" />
                      {formatFileSize(file.size)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatVideoTime(videoDuration)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {file.owner}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {file.lastModified}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================= */}
            {/* NON-VIDEO CONTENT VIEWER */}
            {/* ============================================= */}
            {file.type !== "mp4" && (
              <div className="flex-1 min-h-0">
                {renderContentViewer()}
              </div>
            )}

            {/* ============================================= */}
            {/* SCROLLABLE SECTIONS - Tags, Permissions, Activity */}
            {/* ============================================= */}
            <ScrollArea className={cn(
              "shrink-0",
              file.type === "mp4" ? "flex-1" : ""
            )}>
              <div>
                {/* TAGS (Collapsible) */}
                <Collapsible open={tagsOpen} onOpenChange={setTagsOpen}>
                  <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2/50 transition-colors border-t border-border/50">
                    <div className="flex items-center gap-2.5">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Tags</span>
                      <span className="text-[10px] text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded-full">
                        {file?.tags?.length || 0}
                      </span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      tagsOpen && "rotate-180"
                    )} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 py-3 bg-surface-2/20 border-t border-border/30 space-y-3">
                      {(file?.tags?.length || 0) > 0 ? (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {file?.tags?.slice(0, 4).map((tag) => (
                            <motion.span
                              key={tag}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium group"
                            >
                              <button onClick={() => onTagClick?.(tag)} className="hover:underline">
                                {tag}
                              </button>
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="opacity-60 hover:opacity-100 hover:bg-primary/20 rounded-sm p-0.5 transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.span>
                          ))}
                          {(file?.tags?.length || 0) > 4 && (
                            <span className="text-xs text-muted-foreground px-1.5 py-1">
                              +{(file?.tags?.length || 0) - 4} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No tags added yet</p>
                      )}
                      <div className="relative">
                        <Input
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.key === "Enter" || e.key === ",") && newTagInput.trim()) {
                              e.preventDefault();
                              handleAddTag(newTagInput.replace(/,/g, "").trim());
                            }
                            if (e.key === "Backspace" && !newTagInput && file?.tags?.length) {
                              handleRemoveTag(file.tags[file.tags.length - 1]);
                            }
                          }}
                          onBlur={() => {
                            if (newTagInput.trim()) {
                              handleAddTag(newTagInput.trim());
                            }
                          }}
                          placeholder="Add a tag..."
                          className="h-8 text-xs"
                        />
                        {newTagInput && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md z-10 overflow-hidden">
                            {getTagSuggestions(newTagInput).map((suggestion) => (
                              <button
                                key={suggestion}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleAddTag(suggestion);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-surface-2 transition-colors flex items-center gap-2"
                              >
                                <Tag className="w-3 h-3 text-muted-foreground" />
                                {suggestion}
                              </button>
                            ))}
                            {newTagInput.trim() && !allTags.some(t => t.toLowerCase() === newTagInput.trim().toLowerCase()) && (
                              <button
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleAddTag(newTagInput.trim());
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-surface-2 transition-colors flex items-center gap-2 border-t border-border/30"
                              >
                                <Plus className="w-3 h-3 text-muted-foreground" />
                                Create "{newTagInput.trim()}"
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* PERMISSIONS (Collapsible) */}
                <Collapsible open={permissionsOpen} onOpenChange={setPermissionsOpen}>
                  <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2/50 transition-colors border-t border-border/50">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Permissions</span>
                      <span className="text-[10px] text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded-full">
                        {permissions.length}
                      </span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      permissionsOpen && "rotate-180"
                    )} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 py-3 bg-surface-2/20 border-t border-border/30 space-y-3">
                      {/* Collaboration helper text */}
                      <div className="flex items-start gap-2 p-2 bg-blue-500/5 border border-blue-500/20 rounded-md">
                        <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">
                          Editors can collaboratively edit this document in real-time. Only Owners can manage permissions.
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        {permissions.filter(p => p.role === "owner").map((perm) => (
                          <div key={perm.id} className="flex items-center justify-between py-2.5 group">
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
                                {perm.avatar}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-foreground font-medium">{perm.user}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{perm.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={cn(
                                "text-[10px] font-semibold px-2.5 py-1 rounded-md border min-w-[60px] text-center h-6 flex items-center justify-center",
                                getRoleStyle(perm.role)
                              )}>
                                {getRoleLabel(perm.role)}
                              </span>
                              {/* Invisible placeholder for 3-dot menu alignment */}
                              <div className="w-6" />
                            </div>
                          </div>
                        ))}
                        {permissions.filter(p => p.role !== "owner").map((perm) => (
                          <div key={perm.id} className="flex items-center justify-between py-2.5 group">
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-[11px] font-semibold text-muted-foreground shrink-0">
                                {perm.avatar}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-foreground font-medium">{perm.user}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{perm.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {perm.expires && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1 cursor-default">
                                      <Clock className="w-2.5 h-2.5" />
                                      Expires {perm.expires}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    {perm.expires}{perm.expiresTime ? ` at ${perm.expiresTime}` : ""}{perm.expiresTimezone ? ` ${perm.expiresTimezone}` : ""}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              <span className={cn(
                                "text-[10px] font-semibold px-2.5 py-1 rounded-md border min-w-[60px] text-center h-6 flex items-center justify-center",
                                getRoleStyle(perm.role)
                              )}>
                                {getRoleLabel(perm.role)}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 rounded hover:bg-surface-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  {ROLES.filter(r => r.value !== "owner" && r.value !== perm.role).map(role => (
                                    <DropdownMenuItem 
                                      key={role.value} 
                                      className="flex flex-col items-start gap-0.5 py-2 cursor-pointer"
                                      onClick={() => {
                                        setPermissions(prev => prev.map(p => 
                                          p.id === perm.id ? { ...p, role: role.value } : p
                                        ));
                                        toast({
                                          title: "Role updated",
                                          description: `${perm.user} is now ${role.label}`
                                        });
                                      }}
                                    >
                                      <span className="font-medium">Make {role.label}</span>
                                      <span className="text-[10px] text-muted-foreground">{role.description}</span>
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                    onClick={() => {
                                      setPermissions(prev => prev.filter(p => p.id !== perm.id));
                                      toast({
                                        title: "Access removed",
                                        description: `${perm.user} no longer has access to this file`
                                      });
                                    }}
                                  >
                                    <UserMinus className="w-3.5 h-3.5 mr-2" />
                                    Remove access
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border/30" />
                      <Collapsible open={showInviteForm} onOpenChange={setShowInviteForm}>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-2">
                            <UserPlus className="w-3.5 h-3.5" />
                            Invite people
                            <ChevronDown className={cn("w-3 h-3 ml-auto transition-transform", showInviteForm && "rotate-180")} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-3 space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-foreground">Email address</label>
                              <Input
                                type="email"
                                placeholder="colleague@company.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-foreground">Role</label>
                              <Select value={inviteRole} onValueChange={setInviteRole}>
                                <SelectTrigger className="h-auto min-h-[36px] py-1.5 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLES.filter(r => r.value !== "owner").map(role => (
                                    <SelectItem key={role.value} value={role.value}>
                                      <div className="flex flex-col items-start py-0.5">
                                        <span className="font-medium text-xs">{role.label}</span>
                                        <span className="text-muted-foreground text-[10px]">{role.description}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-foreground">Access expires</label>
                              <Select value={inviteExpiry} onValueChange={(val) => {
                                setInviteExpiry(val);
                                if (val !== "custom") setCustomExpiryDate(undefined);
                              }}>
                                <SelectTrigger className="h-9 text-sm">
                                  <CalendarIcon className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="never">Never expires</SelectItem>
                                  <SelectItem value="24hours">24 hours</SelectItem>
                                  <SelectItem value="7days">7 days</SelectItem>
                                  <SelectItem value="30days">30 days</SelectItem>
                                  <SelectItem value="custom">Custom...</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {inviteExpiry === "custom" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-2 pl-2 border-l-2 border-primary/20"
                              >
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-muted-foreground">Date</label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className={cn("w-full h-8 justify-start text-left text-xs font-normal", !customExpiryDate && "text-muted-foreground")}
                                        >
                                          <CalendarIcon className="w-3 h-3 mr-1.5" />
                                          {customExpiryDate ? format(customExpiryDate, "MMM d, yyyy") : "Select date"}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={customExpiryDate}
                                          onSelect={setCustomExpiryDate}
                                          disabled={(date) => date < new Date()}
                                          initialFocus
                                          className="p-3 pointer-events-auto"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-muted-foreground">Time (optional)</label>
                                    <Select value={customExpiryTime} onValueChange={setCustomExpiryTime}>
                                      <SelectTrigger className="h-8 text-xs">
                                        <Clock className="w-3 h-3 mr-1.5" />
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[
                                          "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
                                          "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
                                          "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
                                          "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "23:59"
                                        ].map(time => (
                                          <SelectItem key={time} value={time}>{time}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="bg-muted/50 rounded-md px-2.5 py-1.5 flex items-center justify-between">
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                    <Info className="w-3 h-3" />
                                    Timezone: UTC
                                  </p>
                                  {customExpiryDate && (
                                    <p className="text-[10px] font-medium text-foreground">
                                      {format(customExpiryDate, "MMM d, yyyy")} · {customExpiryTime}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                            <p className="text-xs text-muted-foreground py-1">User will be notified by email</p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                onClick={() => {
                                  handleInvite();
                                  setShowInviteForm(false);
                                }}
                                disabled={!inviteEmail}
                              >
                                Send invitation
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-muted hover:text-muted-foreground" onClick={() => setShowInviteForm(false)}>
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        </CollapsibleContent>
                      </Collapsible>
                      <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1.5 pt-1">
                        <History className="w-3 h-3" />
                        All access changes are logged in the audit trail
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* ACTIVITY & AUDIT LOG (Collapsible) - Enterprise-grade */}
                <Collapsible open={activityOpen} onOpenChange={setActivityOpen}>
                  <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2/50 transition-colors border-t border-border/50">
                    <div className="flex items-center gap-2.5">
                      <History className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Activity & Audit Log</span>
                      <span className="text-[10px] text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded-full">
                        {mockActivity.length}
                      </span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      activityOpen && "rotate-180"
                    )} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 py-3 bg-surface-2/20 border-t border-border/30">
                      {/* Grouped activity log by day */}
                      {(() => {
                        const grouped = groupActivitiesByDay(mockActivity);
                        const dayLabels: { [key: string]: string } = {
                          today: "Today",
                          yesterday: "Yesterday", 
                          earlier: "Earlier"
                        };
                        
                        return (
                          <div className="space-y-4 mb-4">
                            {Object.entries(grouped).map(([dayKey, activities]) => {
                              if (activities.length === 0) return null;
                              return (
                                <div key={dayKey} className="space-y-2">
                                  {/* Day header */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                      {dayLabels[dayKey]}
                                    </span>
                                    <div className="flex-1 h-px bg-border/30" />
                                  </div>
                                  
                                  {/* Activities for this day */}
                                  <div className="relative">
                                    <div className="absolute left-3 top-3 bottom-3 w-px bg-border/30" />
                                    <div className="space-y-2.5">
                                      {activities.map((activity, idx) => {
                                        const Icon = activity.icon;
                                        return (
                                          <div key={idx} className="flex items-start gap-3 relative group">
                                            <div className="w-6 h-6 rounded-full bg-background border border-border/50 flex items-center justify-center z-10 shrink-0">
                                              <Icon className="w-3 h-3 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                              <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                  <p className="text-xs text-muted-foreground">
                                                    <span className="font-medium text-foreground">{activity.action}</span>
                                                  </p>
                                                  <p className="text-[10px] text-muted-foreground/70">
                                                    {activity.user} ({activity.email})
                                                  </p>
                                                  {activity.detail && (
                                                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{activity.detail}</p>
                                                  )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                  <span className="text-[10px] text-muted-foreground/70">{activity.time}</span>
                                                  <p className="text-[9px] text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {activity.timestamp}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                      
                      {/* Export audit log - secondary style with dropdown for format */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full h-9 text-xs gap-2 justify-center"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            Download audit log
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-[200px]">
                          <DropdownMenuItem onClick={handleExportAuditLog} className="gap-2 text-xs">
                            <FileText className="w-3.5 h-3.5" />
                            Export as PDF
                            <span className="ml-auto text-[10px] text-muted-foreground">Recommended</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleExportAuditLog} className="gap-2 text-xs">
                            <FileDown className="w-3.5 h-3.5" />
                            Export as CSV
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FilePreviewPanel;