import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Download, FileText, Calendar, Lock, 
  Eye, EyeOff, AlertTriangle, Shield, Mail, User,
  Maximize2, Play, Volume2, VolumeX, ZoomIn, ZoomOut, Trash2
} from "lucide-react";
import { TrackItem } from "@/pages/Track";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ReceivedDetailPanelProps {
  item: TrackItem;
  onClose: () => void;
}

// Get sender info from item, with fallback
const getSenderInfo = (item: TrackItem) => ({
  name: item.sender?.name || "Unknown Sender",
  email: item.sender?.email || "unknown@email.com",
});

// Check if file is a video
const VIDEO_FORMATS = ["mp4", "mov", "webm", "avi", "mkv", "m4v"];
const isVideoFile = (type: string) => VIDEO_FORMATS.includes(type.toLowerCase());

// Fullscreen Preview Modal
interface FullscreenPreviewProps {
  item: TrackItem;
  isOpen: boolean;
  onClose: () => void;
}

function FullscreenPreview({ item, isOpen, onClose }: FullscreenPreviewProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const isVideo = isVideoFile(item.type);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 border-none bg-black/95 backdrop-blur-xl [&>button]:hidden">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-white/70" />
              <div>
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-white/50">{item.type.toUpperCase()} • {item.size}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs text-white/50 min-w-[40px] text-center">{zoom}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              {isVideo && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div 
            className="flex-1 overflow-auto p-6 select-none"
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <div 
              className="min-h-full flex items-start justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              {isVideo ? (
                <div className="w-full max-w-4xl">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    {/* Mock video player - in production would use actual video */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/20 to-black/60">
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 cursor-pointer hover:bg-white/30 transition-colors">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-white/60 text-sm mt-1">Click to play</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-4xl">
                  {/* Mock document preview - in production would render actual content */}
                  <div className="bg-white rounded-lg shadow-2xl p-8 min-h-[800px]">
                    <div className="space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-100 rounded w-full" />
                      <div className="h-4 bg-gray-100 rounded w-5/6" />
                      <div className="h-4 bg-gray-100 rounded w-4/5" />
                      <div className="h-32 bg-gray-50 rounded mt-6" />
                      <div className="h-4 bg-gray-100 rounded w-full" />
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-4 bg-gray-100 rounded w-5/6" />
                      <div className="h-4 bg-gray-100 rounded w-2/3" />
                      <div className="h-24 bg-gray-50 rounded mt-6" />
                      <div className="h-4 bg-gray-100 rounded w-full" />
                      <div className="h-4 bg-gray-100 rounded w-4/5" />
                      <div className="h-32 bg-gray-50 rounded mt-6" />
                      <div className="h-4 bg-gray-100 rounded w-full" />
                      <div className="h-4 bg-gray-100 rounded w-5/6" />
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-24 bg-gray-50 rounded mt-6" />
                      <div className="h-4 bg-gray-100 rounded w-full" />
                      <div className="h-4 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 flex items-center justify-center shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Eye className="w-3 h-3" />
              <span>Read-only preview</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Preview component
interface PreviewSectionProps {
  item: TrackItem;
  isPasswordVerified: boolean;
  isExpired: boolean;
}

function PreviewSection({ item, isPasswordVerified, isExpired }: PreviewSectionProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canPreview = !isExpired && isPasswordVerified;
  const isLocked = !isPasswordVerified && item.hasPassword && !isExpired;
  const isVideo = isVideoFile(item.type);

  // Locked state - password required
  if (isLocked) {
    return (
      <div className="rounded-lg border border-border/50 bg-muted/30 overflow-hidden">
        <div className="aspect-[4/3] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Preview locked</p>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            Enter the password below to preview this file
          </p>
        </div>
      </div>
    );
  }

  // Expired state
  if (isExpired) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 overflow-hidden">
        <div className="aspect-[4/3] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive mb-1">Preview unavailable</p>
          <p className="text-xs text-destructive/70 max-w-[200px]">
            This transfer has expired
          </p>
        </div>
      </div>
    );
  }

  // Active preview
  return (
    <>
      <div 
        className="rounded-lg border border-border/50 bg-background overflow-hidden cursor-pointer group"
        onClick={() => setIsFullscreen(true)}
      >
        <div 
          className="aspect-[4/3] flex flex-col items-center justify-center p-6 bg-muted/20 select-none relative"
          onContextMenu={(e) => e.preventDefault()}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {/* Fullscreen hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex items-center gap-2 text-white">
              <Maximize2 className="w-5 h-5" />
              <span className="text-sm font-medium">Click to expand</span>
            </div>
          </div>

          {/* Preview content */}
          <div className="w-full h-full flex flex-col items-center justify-center text-center">
            {isVideo ? (
              <>
                <div className="w-16 h-12 rounded bg-background border border-border/50 flex items-center justify-center mb-3 shadow-sm relative">
                  <Play className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.type.toUpperCase()} • {item.size}</p>
                <div className="mt-3 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Play className="w-3 h-3" />
                    <span>Click to play video</span>
                  </div>
                  <span className="text-xs text-muted-foreground/60">
                    Click to view in fullscreen
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-20 rounded bg-background border border-border/50 flex items-center justify-center mb-3 shadow-sm">
                  <FileText className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.type.toUpperCase()} • {item.size}</p>
                <div className="mt-3 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>Read-only preview</span>
                  </div>
                  <span className="text-xs text-muted-foreground/60">
                    Click to view in fullscreen
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenPreview 
        item={item}
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
      />
    </>
  );
}

export function ReceivedDetailPanel({ item, onClose }: ReceivedDetailPanelProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordVerified, setIsPasswordVerified] = useState(!item.hasPassword);
  const [requestSent, setRequestSent] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const sender = getSenderInfo(item);
  const isExpired = item.status === "expired";
  const isActive = !isExpired;

  const getFileTypeIcon = () => {
    const iconClass = "w-5 h-5";
    switch (item.type) {
      case "pdf":
        return <FileText className={cn(iconClass, "text-red-500")} />;
      case "docx":
        return <FileText className={cn(iconClass, "text-blue-500")} />;
      case "xlsx":
        return <FileText className={cn(iconClass, "text-emerald-500")} />;
      case "pptx":
        return <FileText className={cn(iconClass, "text-orange-500")} />;
      default:
        return <FileText className={cn(iconClass, "text-muted-foreground")} />;
    }
  };

  const handlePasswordSubmit = () => {
    // Mock password verification - in real app would verify with backend
    if (password === "demo123" || password.length >= 4) {
      setIsPasswordVerified(true);
      setPasswordError("");
      toast.success("Password verified");
    } else {
      setPasswordError("Incorrect password. Try again.");
    }
  };

  const handleDownload = async () => {
    if (!isPasswordVerified) {
      toast.error("Please enter the password first");
      return;
    }
    
    setIsDownloading(true);
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsDownloading(false);
    toast.success("Download started");
  };

  const handleRequestReactivation = async () => {
    setRequestSent(true);
    toast.success(`Request sent to ${sender.name}`);
  };

  const handleDeleteTransfer = () => {
    toast.success("Transfer removed from your inbox");
    onClose();
  };

  return (
    <div className="h-[calc(100vh-200px)] rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-4">
            {/* Document Title (non-editable) */}
            <h2 className="text-lg font-semibold text-foreground truncate mb-3">
              {item.name}
            </h2>
            
            {/* Subtext row */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span>{item.size}</span>
              <span>•</span>
              <span>Received {format(item.sentAt, "MMM d, yyyy 'at' h:mm a")}</span>
              <span>•</span>
              <span className="uppercase">{item.type}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{sender.name}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 hover:bg-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Banner */}
        {isActive && item.expiresAt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
              <span>Active until {format(item.expiresAt, "MMM d, yyyy")}</span>
            </div>
          </motion.div>
        )}

        {isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-destructive mb-1">Transfer expired</h4>
                <p className="text-xs text-destructive/80 mb-3">
                  This transfer has expired. You can request the sender to reactivate it.
                </p>
                <Button 
                  size="sm" 
                  onClick={handleRequestReactivation}
                  disabled={requestSent}
                  className={cn(
                    requestSent 
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  )}
                >
                  {requestSent ? (
                    <>Request sent to {sender.name}</>
                  ) : (
                    "Request reactivation"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Password Protected Badge */}
        {item.hasPassword && !isExpired && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>Password required to download</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Preview Section */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Preview
            </label>
            <PreviewSection 
              item={item}
              isPasswordVerified={isPasswordVerified}
              isExpired={isExpired}
            />
          </div>
          {/* Password Gate (compact) */}
          {item.hasPassword && !isPasswordVerified && !isExpired && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                    className={cn(
                      "pr-10 h-9",
                      passwordError && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <Button size="sm" onClick={handlePasswordSubmit} disabled={!password.trim()} className="h-9">
                  Verify
                </Button>
              </div>
              {passwordError && (
                <p className="text-xs text-destructive">{passwordError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Password required. Contact the sender to obtain the password.
              </p>
            </div>
          )}

          {/* Info Section */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Transfer Details
            </label>
            <div className="space-y-3">
              {/* Sender */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Sender</span>
                </div>
                <div className="text-sm text-foreground text-right">
                  <p className="font-medium">{sender.name}</p>
                  <p className="text-xs text-muted-foreground">{sender.email}</p>
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Received */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Received</span>
                </div>
                <span className="text-sm text-foreground">
                  {format(item.sentAt, "MMM d, yyyy")}
                </span>
              </div>

              <Separator className="bg-border/30" />

              {/* Expires / Expired on */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{isExpired ? "Expired on" : "Expires"}</span>
                </div>
                <span className={cn(
                  "text-sm",
                  isExpired ? "text-destructive" : "text-foreground"
                )}>
                  {item.expiresAt ? format(item.expiresAt, "MMM d, yyyy") : "Never"}
                </span>
              </div>

              <Separator className="bg-border/30" />

              {/* Security */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Password protected</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    item.hasPassword 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.hasPassword ? "Yes" : "No"}
                </Badge>
              </div>

              <Separator className="bg-border/30" />

              {/* File */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>File</span>
                </div>
                <span className="text-sm text-foreground truncate max-w-[180px]">{item.name}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          {isActive && (
            <Button 
              className="flex-1 gap-2"
              onClick={handleDownload}
              disabled={!isPasswordVerified || isDownloading}
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
          )}

          {isExpired && !requestSent && (
            <Button 
              className="flex-1 gap-2"
              onClick={handleRequestReactivation}
            >
              <Mail className="w-4 h-4" />
              Request reactivation
            </Button>
          )}

          {isExpired && requestSent && (
            <div className="flex-1 text-center">
              <p className="text-sm text-muted-foreground">
                Request sent to <span className="font-medium text-foreground">{sender.name}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll be notified when the transfer is reactivated
              </p>
            </div>
          )}

          {/* Delete button */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="bg-popover text-popover-foreground border-border text-xs"
              >
                Delete transfer
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transfer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{item.name}" from your received transfers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransfer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
