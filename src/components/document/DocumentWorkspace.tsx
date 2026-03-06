import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Download, Share2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  FileText, Play, Pause, Image as ImageIcon, Volume2, VolumeX,
  MoreHorizontal, Check, Clock, Undo, Redo, Type, Bold, Italic, Underline, AlignLeft,
  List, Link2, Image, Table, Save, Loader2, PanelRightOpen, PanelRightClose, Users,
  ChevronDown, Highlighter, Strikethrough, Square, ArrowUpRight, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CollaborationModeSelector,
  CollaborationRail,
  DocumentCanvas,
  UserRole,
  CollaborationMode,
  ThreadedComment,
  Suggestion,
  VersionHistoryItem,
  Collaborator,
  Annotation,
  canPerformAction,
} from "./collaboration";

interface DocumentWorkspaceFile {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx" | "pptx" | "mp4" | "jpg" | "png" | "folder";
  size?: number;
  pageCount?: number;
}

interface DocumentWorkspaceProps {
  file: DocumentWorkspaceFile;
  userRole: UserRole;
  onClose: () => void;
  onShare?: () => void;
}

// Mock data
const mockCollaborators: Collaborator[] = [
  { id: "1", name: "You", email: "you@company.com", avatar: "MF", role: "owner", isOnline: true, cursorColor: "#3B82F6" },
  { id: "2", name: "Sarah Chen", email: "sarah@company.com", avatar: "SC", role: "editor", isOnline: true, cursorColor: "#10B981" },
  { id: "3", name: "Alex Johnson", email: "alex@company.com", avatar: "AJ", role: "viewer", isOnline: false, cursorColor: "#F59E0B" },
];

const mockComments: ThreadedComment[] = [
  {
    id: "1",
    author: "Sarah Chen",
    avatar: "SC",
    content: "Should we update the pricing section to reflect the new tiers?",
    timestamp: "2 hours ago",
    resolved: false,
    selection: { id: "sel1", text: "Budget allocation has been optimized", startOffset: 0, endOffset: 36, paragraphId: "p4" },
    replies: [
      { id: "r1", author: "You", avatar: "MF", content: "Good catch! I'll update it now.", timestamp: "1 hour ago" }
    ]
  },
  {
    id: "2",
    author: "Alex Johnson",
    avatar: "AJ",
    content: "The introduction looks great!",
    timestamp: "Yesterday",
    resolved: true,
    selection: { id: "sel2", text: "Executive Summary", startOffset: 0, endOffset: 17, paragraphId: "p1" },
  },
  {
    id: "3",
    author: "You",
    avatar: "MF",
    content: "Need to verify these KPIs with the finance team",
    timestamp: "3 hours ago",
    resolved: false,
    selection: { id: "sel3", text: "Key Performance Indicators", startOffset: 0, endOffset: 26, paragraphId: "p3" },
  }
];

const mockSuggestions: Suggestion[] = [
  {
    id: "s1",
    author: "Sarah Chen",
    avatar: "SC",
    originalText: "primary objective",
    suggestedText: "strategic priority",
    selection: { id: "sel4", text: "primary objective", startOffset: 4, endOffset: 21, paragraphId: "p2" },
    timestamp: "1 hour ago",
    status: "pending",
  },
  {
    id: "s2",
    author: "Alex Johnson",
    avatar: "AJ",
    originalText: "operational efficiency",
    suggestedText: "operational excellence and efficiency",
    selection: { id: "sel5", text: "operational efficiency", startOffset: 45, endOffset: 67, paragraphId: "p2" },
    timestamp: "30 mins ago",
    status: "pending",
  },
];

const mockVersions: VersionHistoryItem[] = [
  { id: "1", timestamp: "Jan 8, 2026 at 2:45 PM", author: "You", changes: "Updated pricing section with new tier structure" },
  { id: "2", timestamp: "Jan 8, 2026 at 11:30 AM", author: "Sarah Chen", changes: "Added new paragraph to Section 2 about market expansion" },
  { id: "3", timestamp: "Jan 7, 2026 at 4:15 PM", author: "Alex Johnson", changes: "Reviewed and added comments on KPIs" },
  { id: "4", timestamp: "Jan 7, 2026 at 2:00 PM", author: "You", changes: "Initial document creation" },
];

const DocumentWorkspace = ({ file, userRole, onClose, onShare }: DocumentWorkspaceProps) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  // Default to edit mode for owners/editors, comment mode for viewers
  const [collaborationMode, setCollaborationMode] = useState<CollaborationMode>(
    userRole === "owner" || userRole === "editor" ? "edit" : "comment"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Collaboration state
  const [showRail, setShowRail] = useState(false);
  const [activeRailTab, setActiveRailTab] = useState<"comments" | "suggestions" | "ai" | "history">("comments");
  const [comments, setComments] = useState<ThreadedComment[]>(mockComments);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotationType, setActiveAnnotationType] = useState<string | null>(null);
  const [annotationColor, setAnnotationColor] = useState("#FBBF24");
  const [selectedFont, setSelectedFont] = useState("Inter");

  // Autosave effect
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const autosaveTimer = setTimeout(async () => {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsSaving(false);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setShowSavedConfirmation(true);
      
      // Hide confirmation after 3 seconds
      setTimeout(() => setShowSavedConfirmation(false), 3000);
    }, 1500);

    return () => clearTimeout(autosaveTimer);
  }, [hasUnsavedChanges]);

  // Mark changes when editing
  const markUnsavedChanges = () => {
    if (collaborationMode === "edit" || collaborationMode === "suggest" || collaborationMode === "annotate") {
      setHasUnsavedChanges(true);
      setShowSavedConfirmation(false);
    }
  };

  // Available document fonts
  const documentFonts = [
    { name: "Inter", family: "Inter, system-ui, sans-serif", category: "Sans-serif" },
    { name: "Roboto", family: "Roboto, system-ui, sans-serif", category: "Sans-serif" },
    { name: "Open Sans", family: "Open Sans, system-ui, sans-serif", category: "Sans-serif" },
    { name: "Source Sans", family: "Source Sans 3, system-ui, sans-serif", category: "Sans-serif" },
    { name: "Nunito", family: "Nunito, system-ui, sans-serif", category: "Sans-serif" },
    { name: "Merriweather", family: "Merriweather, Georgia, serif", category: "Serif" },
    { name: "Lora", family: "Lora, Georgia, serif", category: "Serif" },
    { name: "Playfair Display", family: "Playfair Display, Georgia, serif", category: "Serif" },
    { name: "PT Serif", family: "PT Serif, Georgia, serif", category: "Serif" },
    { name: "Libre Baskerville", family: "Libre Baskerville, Georgia, serif", category: "Serif" },
  ];

  const pageCount = file.pageCount || getDefaultPageCount(file.type);

  function getDefaultPageCount(type?: string): number {
    switch (type) {
      case "pdf": return 8;
      case "docx": return 4;
      case "pptx": return 12;
      case "xlsx": return 3;
      default: return 1;
    }
  }

  const canEdit = canPerformAction(userRole, collaborationMode, "edit");
  const canManagePermissions = userRole === "owner";

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  const handleModeChange = (mode: CollaborationMode) => {
    setCollaborationMode(mode);
    toast({ 
      title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} mode`, 
      description: getModeDescription(mode) 
    });
  };

  const getModeDescription = (mode: CollaborationMode): string => {
    switch (mode) {
      case "view": return "Read-only viewing";
      case "comment": return "You can add comments to the document";
      case "suggest": return "Your edits will be saved as suggestions for review";
      case "edit": return "Direct editing enabled";
      default: return "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setLastSaved(new Date());
    toast({ title: "Saved", description: "All changes saved" });
  };

  const handleDownload = () => {
    toast({ title: "Download started", description: `Downloading ${file.name}...` });
  };

  const handleShare = () => {
    onShare?.();
    const shareUrl = `${window.location.origin}/shared/${file.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied", description: "Share link copied to clipboard" });
  };

  const handleResolveComment = (id: string) => {
    setComments(prev => prev.map(c => 
      c.id === id ? { ...c, resolved: !c.resolved } : c
    ));
    toast({ title: "Comment updated" });
  };

  const handleAcceptSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, status: "accepted" as const } : s
    ));
    toast({ title: "Suggestion accepted", description: "The edit has been applied" });
  };

  const handleRejectSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, status: "rejected" as const } : s
    ));
    toast({ title: "Suggestion rejected" });
  };

  const handleAIAction = (action: string) => {
    const messages: Record<string, { title: string; description: string }> = {
      summarize_comments: { title: "AI Summary", description: "Analyzing 3 unresolved comments... There are concerns about pricing tiers and KPI verification that need attention." },
      suggest_from_comments: { title: "Generating suggestions", description: "AI is creating edit suggestions based on comment feedback..." },
      rewrite_selection: { title: "Rewrite", description: "Select text in the document to rewrite" },
      explain_changes: { title: "Change Analysis", description: "4 changes made in the last 24 hours: pricing updates, section additions, and KPI comments." },
    };
    toast(messages[action] || { title: "AI Action", description: "Processing..." });
  };

  const handleAddComment = (selection: { text: string; paragraphId: string }, content: string, mentions: string[]) => {
    const mentionedNames = mentions
      .map(id => mockCollaborators.find(c => c.id === id)?.name)
      .filter(Boolean);
    
    const newComment: ThreadedComment = {
      id: `c${Date.now()}`,
      author: "You",
      avatar: "MF",
      content: content,
      timestamp: "Just now",
      resolved: false,
      selection: { 
        id: `sel${Date.now()}`, 
        text: selection.text, 
        startOffset: 0, 
        endOffset: selection.text.length, 
        paragraphId: selection.paragraphId 
      },
    };
    setComments(prev => [newComment, ...prev]);
    setShowRail(true);
    setActiveRailTab("comments");
    
    if (mentionedNames.length > 0) {
      toast({ 
        title: "Comment added", 
        description: `Notified ${mentionedNames.join(", ")}` 
      });
    } else {
      toast({ title: "Comment added", description: "Your comment has been added to the selected text" });
    }
  };

  const handleAddAnnotation = (annotation: Annotation) => {
    setAnnotations(prev => [...prev, annotation]);
  };

  const handleCommentMarkerClick = (commentId: string) => {
    setShowRail(true);
    setActiveRailTab("comments");
  };

  const handleAddSuggestion = (paragraphId: string, originalText: string, suggestedText: string) => {
    const newSuggestion: Suggestion = {
      id: `s${Date.now()}`,
      author: "You",
      avatar: "MF",
      originalText,
      suggestedText,
      selection: {
        id: `sel${Date.now()}`,
        text: originalText,
        startOffset: 0,
        endOffset: originalText.length,
        paragraphId,
      },
      timestamp: "Just now",
      status: "pending",
    };
    setSuggestions(prev => [newSuggestion, ...prev]);
    setShowRail(true);
    setActiveRailTab("suggestions");
  };

  const isDocument = ["pdf", "docx", "xlsx", "pptx"].includes(file.type);
  const isVideo = file.type === "mp4";
  const isImage = ["jpg", "png"].includes(file.type);

  const activeCollaborators = mockCollaborators.filter(c => c.isOnline && c.id !== "1");
  const unresolvedComments = comments.filter(c => !c.resolved).length;
  const pendingSuggestions = suggestions.filter(s => s.status === "pending").length;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      {/* Top action bar - enterprise-grade with collaboration controls */}
      <header className="shrink-0 h-12 bg-zinc-900/95 border-b border-white/10 flex items-center justify-between px-3">
        {/* Left: Close + File name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Close</TooltipContent>
          </Tooltip>
          
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-white/50 shrink-0" />
            <h1 className="text-sm font-medium text-white truncate">{file.name}</h1>
            
            {/* Save status - show in edit, suggest, or annotate modes */}
            {(collaborationMode === "edit" || collaborationMode === "suggest" || collaborationMode === "annotate") && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSaving ? "saving" : showSavedConfirmation ? "saved" : "idle"}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex items-center gap-1.5 text-[10px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-white/50" />
                      <span className="text-white/50">Saving...</span>
                    </>
                  ) : showSavedConfirmation ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center"
                      >
                        <Check className="w-2.5 h-2.5 text-emerald-500" />
                      </motion.div>
                      <span className="text-emerald-500 font-medium">Changes saved</span>
                    </>
                  ) : lastSaved ? (
                    <span className="text-white/30">
                      Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Center: Collaboration mode selector + annotation tools */}
        <div className="flex items-center gap-2">
          <CollaborationModeSelector
            currentMode={collaborationMode}
            userRole={userRole}
            onModeChange={handleModeChange}
          />


          <Separator orientation="vertical" className="h-5 bg-white/10" />

          {/* Active collaborators */}
          {activeCollaborators.length > 0 && (
            <div className="flex items-center -space-x-1.5 mx-1">
              {activeCollaborators.slice(0, 3).map((collab) => (
                <Tooltip key={collab.id}>
                  <TooltipTrigger asChild>
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold border-2 border-zinc-900"
                      style={{ backgroundColor: collab.cursorColor + "30", color: collab.cursorColor }}
                    >
                      {collab.avatar}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <div className="text-xs">
                      <p className="font-medium">{collab.name}</p>
                      <p className="text-muted-foreground capitalize">{collab.role}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
              {activeCollaborators.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-medium text-white/70 border-2 border-zinc-900">
                  +{activeCollaborators.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Share button */}
          <Button
            size="sm"
            onClick={handleShare}
            className="h-7 px-3 text-xs gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
        </div>

        {/* Right: Rail toggle, role badge, secondary actions */}
        <div className="flex items-center gap-1 flex-1 justify-end">
          {/* Collaboration rail toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowRail(!showRail)}
                className={cn(
                  "p-2 rounded-md transition-colors relative",
                  showRail ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {showRail ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                {(unresolvedComments > 0 || pendingSuggestions > 0) && !showRail && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unresolvedComments + pendingSuggestions}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {showRail ? "Hide collaboration panel" : "Show collaboration panel"}
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 bg-white/10 mx-1" />

          {/* Role badge */}
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] h-5 border",
              userRole === "owner" && "bg-primary/10 text-primary border-primary/30",
              userRole === "editor" && "bg-blue-500/10 text-blue-500 border-blue-500/30",
              userRole === "viewer" && "bg-muted text-muted-foreground border-border"
            )}
          >
            {userRole === "owner" ? "Owner" : userRole === "editor" ? "Editor" : "Viewer"}
          </Badge>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleDownload}
                className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Download</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "Print", description: "Opening print dialog..." })}>
                <FileText className="w-4 h-4 mr-2" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Edit/Annotate toolbar - shown in edit or annotate mode */}
      <AnimatePresence>
        {(collaborationMode === "edit" || collaborationMode === "annotate") && isDocument && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 bg-zinc-900/80 border-b border-white/10 overflow-hidden"
          >
            <div className="flex items-center gap-1 px-4 py-2">
              {collaborationMode === "edit" ? (
                <>
                  {/* Font selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-2 py-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors text-xs font-medium min-w-[120px]">
                        <Type className="w-3.5 h-3.5" />
                        <span className="truncate">{selectedFont}</span>
                        <ChevronDown className="w-3 h-3 ml-auto opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 max-h-[300px] overflow-y-auto">
                      <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Sans-serif
                      </div>
                      {documentFonts.filter(f => f.category === "Sans-serif").map((font) => (
                        <DropdownMenuItem 
                          key={font.name}
                          onClick={() => {
                            setSelectedFont(font.name);
                            toast({ title: "Font changed", description: `Document font set to ${font.name}` });
                          }}
                          className="flex items-center justify-between"
                        >
                          <span style={{ fontFamily: font.family }}>{font.name}</span>
                          {selectedFont === font.name && <Check className="w-4 h-4 text-primary" />}
                        </DropdownMenuItem>
                      ))}
                      <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-2">
                        Serif
                      </div>
                      {documentFonts.filter(f => f.category === "Serif").map((font) => (
                        <DropdownMenuItem 
                          key={font.name}
                          onClick={() => {
                            setSelectedFont(font.name);
                            toast({ title: "Font changed", description: `Document font set to ${font.name}` });
                          }}
                          className="flex items-center justify-between"
                        >
                          <span style={{ fontFamily: font.family }}>{font.name}</span>
                          {selectedFont === font.name && <Check className="w-4 h-4 text-primary" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Separator orientation="vertical" className="h-5 bg-white/10 mx-2" />

                  {/* Undo/Redo */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <Undo className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Undo</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <Redo className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Redo</TooltipContent>
                  </Tooltip>

                  <Separator orientation="vertical" className="h-5 bg-white/10 mx-2" />

                  {/* Text formatting */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <Bold className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Bold</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <Italic className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Italic</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <Underline className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Underline</TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <>
                  {/* Annotation tools */}
                  {[
                    { type: "highlight", icon: Highlighter, label: "Highlight" },
                    { type: "underline", icon: Underline, label: "Underline" },
                    { type: "strikethrough", icon: Strikethrough, label: "Strikethrough" },
                    { type: "rectangle", icon: Square, label: "Rectangle" },
                    { type: "arrow", icon: ArrowUpRight, label: "Arrow" },
                    { type: "callout", icon: MessageCircle, label: "Callout bubble" },
                  ].map(({ type, icon: Icon, label }) => (
                    <Tooltip key={type}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setActiveAnnotationType(activeAnnotationType === type ? null : type)}
                          className={cn(
                            "p-1.5 rounded transition-colors",
                            activeAnnotationType === type 
                              ? "bg-white/15 text-white" 
                              : "text-white/50 hover:text-white hover:bg-white/10"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{label}</TooltipContent>
                    </Tooltip>
                  ))}

                  <Separator orientation="vertical" className="h-5 bg-white/10 mx-2" />

                  {/* Color picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                        <div 
                          className="w-4 h-4 rounded-sm border border-white/20"
                          style={{ backgroundColor: annotationColor }}
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                      <div className="grid grid-cols-6 gap-1.5">
                        {[
                          { color: "#FBBF24", name: "Yellow" },
                          { color: "#34D399", name: "Green" },
                          { color: "#60A5FA", name: "Blue" },
                          { color: "#F472B6", name: "Pink" },
                          { color: "#A78BFA", name: "Purple" },
                          { color: "#FB923C", name: "Orange" },
                        ].map(({ color, name }) => (
                          <Tooltip key={color}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setAnnotationColor(color)}
                                className={cn(
                                  "w-6 h-6 rounded-md transition-transform hover:scale-110",
                                  annotationColor === color && "ring-2 ring-white ring-offset-2 ring-offset-background"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="bottom">{name}</TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Separator orientation="vertical" className="h-5 bg-white/10 mx-2" />

                  {/* Undo/Redo for annotations */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <Undo className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Undo</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <Redo className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Redo</TooltipContent>
                  </Tooltip>

                  {/* Clear annotation tool */}
                  {activeAnnotationType && (
                    <>
                      <Separator orientation="vertical" className="h-5 bg-white/10 mx-2" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setActiveAnnotationType(null)}
                            className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Clear tool</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </>
              )}

              <Separator orientation="vertical" className="h-5 bg-white/10 mx-2" />

              {/* Paragraph formatting */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                    <AlignLeft className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Align</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                    <List className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">List</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-5 bg-white/10 mx-2" />

              {/* Insert */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                    <Link2 className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Insert link</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                    <Image className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Insert image</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                    <Table className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Insert table</TooltipContent>
              </Tooltip>

              <div className="flex-1" />

              {/* Save button */}
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSave}
                disabled={isSaving}
                className="h-7 px-3 text-xs gap-1.5"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document viewer */}
        <main className={cn(
          "flex-1 overflow-auto bg-zinc-900 transition-all",
          showRail && "mr-[340px]"
        )}>
          {/* Document canvas with collaboration */}
          {isDocument && (
            <DocumentCanvas
              fileName={file.name}
              fileType={file.type}
              pageCount={pageCount}
              zoom={zoom}
              currentPage={currentPage}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              collaborationMode={collaborationMode}
              userRole={userRole}
              annotations={annotations}
              comments={comments}
              suggestions={suggestions}
              collaborators={mockCollaborators}
              activeAnnotationType={activeAnnotationType}
              annotationColor={annotationColor}
              selectedFont={documentFonts.find(f => f.name === selectedFont)?.family || "Inter, system-ui, sans-serif"}
              onAddComment={handleAddComment}
              onAddAnnotation={handleAddAnnotation}
              onCommentMarkerClick={handleCommentMarkerClick}
              onAddSuggestion={handleAddSuggestion}
              onContentChange={markUnsavedChanges}
            />
          )}

          {/* Video viewer */}
          {isVideo && (
            <div className="h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-black">
                <div className="relative w-full max-w-4xl aspect-video bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                      {isPlaying ? (
                        <Pause className="w-9 h-9 text-white" />
                      ) : (
                        <Play className="w-9 h-9 text-white ml-1" />
                      )}
                    </div>
                  </motion.button>
                </div>
              </div>
              
              <div className="shrink-0 bg-zinc-900 border-t border-white/10 p-4">
                <div className="max-w-4xl mx-auto">
                  <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group">
                    <div className="h-full w-1/3 bg-primary rounded-full relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 hover:bg-white/10 rounded transition-colors">
                        {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                      </button>
                      <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/10 rounded transition-colors">
                        {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                      </button>
                      <span className="text-sm text-white/60">0:45 / 2:30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image viewer */}
          {isImage && (
            <div className="h-full flex items-center justify-center p-8 overflow-auto">
              <div 
                className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg shadow-2xl flex items-center justify-center transition-transform"
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  width: '800px',
                  height: '600px',
                }}
              >
                <ImageIcon className="w-32 h-32 text-purple-500/40" />
              </div>
            </div>
          )}
        </main>

        {/* Collaboration Rail */}
        <CollaborationRail
          isOpen={showRail}
          activeTab={activeRailTab}
          onTabChange={setActiveRailTab}
          onClose={() => setShowRail(false)}
          comments={comments}
          suggestions={suggestions}
          versions={mockVersions}
          userRole={userRole}
          currentMode={collaborationMode}
          onResolveComment={handleResolveComment}
          onAcceptSuggestion={handleAcceptSuggestion}
          onRejectSuggestion={handleRejectSuggestion}
          onAIAction={handleAIAction}
        />
      </div>
    </div>
  );
};

export default DocumentWorkspace;
