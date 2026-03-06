import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Type, 
  Highlighter, 
  Square, 
  Circle,
  Minus as LineIcon,
  MoveRight,
  Image, 
  Link, 
  FileText, 
  Eraser,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckSquare,
  CircleDot,
  ChevronDown,
  AlertTriangle,
  Check,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

interface EditPDFEditorProps {
  file: File;
  onApply: () => void;
  onExit: () => void;
}

type ToolType = "text" | "annotate" | "whiteout" | "shapes" | "images" | "links" | "forms";

interface Tool {
  id: ToolType;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
}

interface ToolSection {
  label: string;
  tools: Tool[];
}

const toolSections: ToolSection[] = [
  {
    label: "Edit",
    tools: [
      { id: "text", icon: Type, label: "Text", shortcut: "T" },
      { id: "annotate", icon: Highlighter, label: "Annotate", shortcut: "H" },
      { id: "shapes", icon: Square, label: "Shapes", shortcut: "S" },
    ],
  },
  {
    label: "Redact",
    tools: [
      { id: "whiteout", icon: Eraser, label: "Whiteout", shortcut: "R" },
    ],
  },
  {
    label: "Insert",
    tools: [
      { id: "images", icon: Image, label: "Image", shortcut: "I" },
      { id: "links", icon: Link, label: "Link", shortcut: "L" },
    ],
  },
  {
    label: "Forms",
    tools: [
      { id: "forms", icon: FileText, label: "Fields", shortcut: "F" },
    ],
  },
];

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function EditPDFEditor({ file, onApply, onExit }: EditPDFEditorProps) {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [hasEdits, setHasEdits] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editableTexts, setEditableTexts] = useState([
    { id: "title", text: "Document Title", x: 48, y: 48, fontSize: 24, fontWeight: "bold" },
    { id: "para1", text: "This is an editable paragraph. Click to edit the text directly.", x: 48, y: 96, fontSize: 14, fontWeight: "normal" },
    { id: "para2", text: "You can modify any text element in the document.", x: 48, y: 120, fontSize: 14, fontWeight: "normal" },
    { id: "para3", text: "Changes are saved automatically as you type.", x: 48, y: 144, fontSize: 14, fontWeight: "normal" },
  ]);
  const totalPages = 12;

  const handleExitClick = useCallback(() => {
    if (hasEdits) {
      setShowExitDialog(true);
    } else {
      onExit();
    }
  }, [hasEdits, onExit]);

  const handleTextClick = useCallback((id: string) => {
    setEditingTextId(id);
    if (!hasEdits) setHasEdits(true);
  }, [hasEdits]);

  const handleTextChange = useCallback((id: string, newText: string) => {
    setEditableTexts(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
  }, []);

  const handleTextBlur = useCallback(() => {
    setEditingTextId(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Undo: Cmd/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        // Undo logic here
        return;
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case 't':
          setActiveTool('text');
          if (!hasEdits) setHasEdits(true);
          break;
        case 'h':
          setActiveTool('annotate');
          if (!hasEdits) setHasEdits(true);
          break;
        case 'r':
          setActiveTool('whiteout');
          if (!hasEdits) setHasEdits(true);
          break;
        case 's':
          setActiveTool('shapes');
          if (!hasEdits) setHasEdits(true);
          break;
        case 'i':
          setActiveTool('images');
          if (!hasEdits) setHasEdits(true);
          break;
        case 'l':
          setActiveTool('links');
          if (!hasEdits) setHasEdits(true);
          break;
        case 'f':
          setActiveTool('forms');
          if (!hasEdits) setHasEdits(true);
          break;
        case 'escape':
          setActiveTool(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasEdits]);

  const handleToolSelect = useCallback((toolId: ToolType) => {
    setActiveTool(toolId);
    if (!hasEdits) {
      setHasEdits(true);
    }
  }, [hasEdits]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 50));
  }, []);

  const handleDiscard = useCallback(() => {
    setHasEdits(false);
    setActiveTool(null);
  }, []);

  const handleApply = useCallback(() => {
    setIsApplying(true);
    // Simulate processing delay
    setTimeout(() => {
      onApply();
    }, 1500);
  }, [onApply]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Top Bar */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: appleEasing }}
          className="h-14 border-b border-border/50 bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0"
        >
          {/* Left: Close & Document Name */}
          <div className="flex items-center gap-3 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleExitClick}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Exit editor
              </TooltipContent>
            </Tooltip>
            <div className="w-px h-6 bg-border/50" />
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {file.name}
              </span>
            </div>
          </div>

          {/* Center: Undo/Redo & Zoom - perfectly centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    disabled={!hasEdits}
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Undo <span className="text-muted-foreground ml-1">⌘Z</span>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    disabled={!hasEdits}
                  >
                    <Redo2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Redo <span className="text-muted-foreground ml-1">⌘⇧Z</span>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="w-px h-5 bg-border/50 mx-1" />
            
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Zoom out</TooltipContent>
              </Tooltip>
              <span className="text-xs text-muted-foreground w-10 text-center tabular-nums font-medium">
                {zoom}%
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Zoom in</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Right: Thumbnails toggle (icon only) */}
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary",
                    showThumbnails && "bg-secondary text-foreground"
                  )}
                  onClick={() => setShowThumbnails(!showThumbnails)}
                >
                  <FileText className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {showThumbnails ? "Hide pages" : "Show pages"}
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Tool Rail - Grouped */}
          <motion.aside
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: appleEasing }}
            className="w-16 border-r border-border/50 bg-card/60 backdrop-blur-xl flex flex-col py-2 shrink-0"
          >
            {toolSections.map((section, sectionIndex) => (
              <div key={section.label} className="flex flex-col">
                {/* Section divider (except for first) */}
                {sectionIndex > 0 && (
                  <div className="mx-2 my-1.5 border-t border-border/40" />
                )}
                
                {/* Section label */}
                <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider px-2 mb-1">
                  {section.label}
                </span>
                
                {/* Tools */}
                <div className="flex flex-col items-center gap-0.5 px-1">
                  {section.tools.map((tool, index) => (
                    <Tooltip key={tool.id}>
                      <TooltipTrigger asChild>
                        <motion.button
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.15 + (sectionIndex * 0.05) + (index * 0.03), ease: appleEasing }}
                          onClick={() => handleToolSelect(tool.id)}
                          className={cn(
                            "w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200",
                            "hover:bg-secondary",
                            activeTool === tool.id 
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <tool.icon className="w-5 h-5" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs flex items-center gap-2">
                        {tool.label}
                        {tool.shortcut && (
                          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono text-muted-foreground">
                            {tool.shortcut}
                          </kbd>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </motion.aside>

          {/* Page Thumbnails Panel (Collapsible) */}
          <AnimatePresence>
            {showThumbnails && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 140, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: appleEasing }}
                className="border-r border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shrink-0"
              >
                <div className="p-3 space-y-2 overflow-y-auto h-full">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "w-full aspect-[3/4] rounded-lg border-2 transition-all duration-200",
                        "bg-white/90 dark:bg-neutral-800/90",
                        currentPage === i + 1
                          ? "border-primary shadow-md shadow-primary/20"
                          : "border-border/50 hover:border-primary/50"
                      )}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-900/50">
            {/* Canvas */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2, ease: appleEasing }}
                className="relative"
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center center'
                }}
              >
                {/* PDF Page Mock with Editable Text */}
                <div 
                  className="w-[595px] h-[842px] bg-white dark:bg-neutral-100 rounded-sm relative"
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {/* Editable text elements */}
                  <div className="absolute inset-0 p-12">
                    {editableTexts.map((textItem) => (
                      <div
                        key={textItem.id}
                        className="absolute group"
                        style={{ left: textItem.x, top: textItem.y }}
                      >
                        {editingTextId === textItem.id ? (
                          <input
                            type="text"
                            value={textItem.text}
                            onChange={(e) => handleTextChange(textItem.id, e.target.value)}
                            onBlur={handleTextBlur}
                            autoFocus
                            className="bg-transparent border border-primary rounded px-1 outline-none text-neutral-900"
                            style={{
                              fontSize: textItem.fontSize,
                              fontWeight: textItem.fontWeight,
                              minWidth: '100px',
                            }}
                          />
                        ) : (
                          <span
                            onClick={() => handleTextClick(textItem.id)}
                            className={cn(
                              "cursor-text px-1 -mx-1 rounded transition-all duration-150 text-neutral-900",
                              "hover:bg-primary/10 hover:ring-1 hover:ring-primary/30",
                              "group-hover:bg-primary/5"
                            )}
                            style={{
                              fontSize: textItem.fontSize,
                              fontWeight: textItem.fontWeight,
                            }}
                          >
                            {textItem.text}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Decorative content lines (non-editable) */}
                  <div className="absolute left-12 right-12 top-[200px] space-y-4 pointer-events-none">
                    <div className="h-4 w-full bg-neutral-100 rounded" />
                    <div className="h-4 w-5/6 bg-neutral-100 rounded" />
                    <div className="h-4 w-4/5 bg-neutral-100 rounded" />
                    <div className="h-4 w-full bg-neutral-100 rounded" />
                    <div className="h-4 w-3/4 bg-neutral-100 rounded" />
                    <div className="mt-8 h-4 w-full bg-neutral-100 rounded" />
                    <div className="h-4 w-5/6 bg-neutral-100 rounded" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Page Navigation */}
            <div className="h-12 border-t border-border/30 bg-card/60 backdrop-blur-xl flex items-center justify-center gap-4 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-secondary"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-secondary"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right Contextual Panel */}
          <AnimatePresence mode="wait">
            {activeTool && (
              <motion.aside
                key={activeTool}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: appleEasing }}
                className="border-l border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden shrink-0"
              >
                <div className="p-4 w-[280px]">
                  <ToolContextPanel tool={activeTool} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Action Bar - Smarter behavior */}
        <AnimatePresence>
          {hasEdits && (
            <motion.footer
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.3, ease: appleEasing }}
              className="h-16 border-t border-border/50 bg-card/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0"
            >
              <div className="flex items-center gap-2 text-emerald-500">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">All changes are saved automatically</span>
              </div>
              <Button
                onClick={handleApply}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 min-w-[160px]"
                disabled={isApplying}
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Preparing…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Finish & Download
                  </>
                )}
              </Button>
            </motion.footer>
          )}
        </AnimatePresence>

        {/* Exit Confirmation Dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Exit without saving?</AlertDialogTitle>
              <AlertDialogDescription>
                Any edits you've made will be permanently discarded.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue editing</AlertDialogCancel>
              <AlertDialogAction onClick={onExit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Exit & discard changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

// Contextual panel content based on selected tool
function ToolContextPanel({ tool }: { tool: ToolType }) {
  const [selectedAnnotation, setSelectedAnnotation] = useState<string>("highlight");
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string>("#FBBF24");
  const [selectedWhiteoutColor, setSelectedWhiteoutColor] = useState<string>("#FFFFFF");
  const [selectedShape, setSelectedShape] = useState<string>("rectangle");

  const panels: Record<ToolType, React.ReactNode> = {
    text: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Add Text</h3>
          <p className="text-xs text-muted-foreground mt-1">Click and drag on the page to place a text box.</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Font</label>
            <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
              <option>Inter</option>
              <option>Arial</option>
              <option>Times New Roman</option>
              <option>Courier New</option>
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground block mb-1.5">Size</label>
              <input 
                type="number" 
                defaultValue={12} 
                min={8}
                max={72}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground block mb-1.5">Weight</label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option>Regular</option>
                <option>Medium</option>
                <option>Bold</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Color</label>
            <div className="flex gap-2">
              {["#000000", "#3B82F6", "#EF4444", "#F59E0B"].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-md border border-border/50 hover:scale-110 transition-transform focus:ring-2 focus:ring-primary/20"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    annotate: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Annotate</h3>
          <p className="text-xs text-muted-foreground mt-1">Select text on the page to apply annotation.</p>
        </div>
        <div className="space-y-2">
          {[
            { id: "highlight", label: "Highlight" },
            { id: "underline", label: "Underline" },
            { id: "strikethrough", label: "Strikethrough" }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedAnnotation(type.id)}
              className={cn(
                "w-full h-10 rounded-md border text-sm text-left px-3 transition-all duration-200",
                selectedAnnotation === type.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Color</label>
          <div className="flex gap-2">
            {/* Yellow (default), Blue, Pink, Orange - NO GREEN */}
            {["#FBBF24", "#60A5FA", "#F472B6", "#FB923C"].map((color) => (
              <button
                key={color}
                onClick={() => setSelectedHighlightColor(color)}
                className={cn(
                  "w-8 h-8 rounded-md border-2 transition-all",
                  selectedHighlightColor === color
                    ? "border-foreground scale-110"
                    : "border-transparent hover:scale-110"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    whiteout: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Whiteout</h3>
          <p className="text-xs text-muted-foreground mt-1">Click and drag to cover sensitive content.</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-2">Cover style</label>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedWhiteoutColor("#FFFFFF")}
              className={cn(
                "w-full h-12 rounded-md border-2 text-sm text-left px-3 transition-all duration-200 flex items-center gap-3",
                selectedWhiteoutColor === "#FFFFFF"
                  ? "border-primary bg-white"
                  : "border-border bg-white hover:border-primary/50"
              )}
            >
              <div className="w-6 h-6 rounded border border-border bg-white" />
              <span className="text-foreground">White cover</span>
            </button>
            <button
              onClick={() => setSelectedWhiteoutColor("#000000")}
              className={cn(
                "w-full h-12 rounded-md border-2 text-sm text-left px-3 transition-all duration-200 flex items-center gap-3",
                selectedWhiteoutColor === "#000000"
                  ? "border-primary bg-secondary"
                  : "border-border bg-background hover:border-primary/50"
              )}
            >
              <div className="w-6 h-6 rounded border border-border bg-black" />
              <div className="flex-1">
                <span className="text-foreground">Black redaction</span>
                <span className="text-[10px] text-destructive ml-2">(permanent)</span>
              </div>
            </button>
          </div>
        </div>
        {selectedWhiteoutColor === "#000000" && (
          <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded-md border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-[11px] text-destructive/90">
              Black redaction cannot be undone after saving.
            </p>
          </div>
        )}
      </div>
    ),
    shapes: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Shapes</h3>
          <p className="text-xs text-muted-foreground mt-1">Click and drag on the page to draw.</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "rectangle", icon: Square, label: "Rectangle" },
            { id: "circle", icon: Circle, label: "Circle" },
            { id: "line", icon: LineIcon, label: "Line" },
            { id: "arrow", icon: MoveRight, label: "Arrow" }
          ].map((shape) => (
            <button
              key={shape.id}
              onClick={() => setSelectedShape(shape.id)}
              className={cn(
                "aspect-square rounded-md border text-xs flex items-center justify-center transition-all duration-200",
                selectedShape === shape.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title={shape.label}
            >
              <shape.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Stroke color</label>
          <div className="flex gap-2">
            {["#000000", "#3B82F6", "#EF4444", "#F59E0B"].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-md border border-border/50 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Stroke width</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((width) => (
              <button
                key={width}
                className="flex-1 h-9 rounded-md border border-border bg-background hover:bg-secondary text-xs transition-colors"
              >
                {width}px
              </button>
            ))}
          </div>
        </div>
      </div>
    ),
    images: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Insert Image</h3>
          <p className="text-xs text-muted-foreground mt-1">Upload an image, then click to place it.</p>
        </div>
        <button className="w-full h-28 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-background hover:bg-secondary/30 transition-all duration-200 flex flex-col items-center justify-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Image className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Click to upload</span>
          <span className="text-[10px] text-muted-foreground/60">PNG, JPG, SVG up to 10MB</span>
        </button>
        <p className="text-[11px] text-muted-foreground">Resize after placing by dragging corners.</p>
      </div>
    ),
    links: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Add Link</h3>
          <p className="text-xs text-muted-foreground mt-1">Draw a rectangle to create a clickable area.</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Destination URL</label>
          <input 
            type="url" 
            placeholder="https://..."
            className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Link style</label>
          <div className="flex gap-2">
            <button className="flex-1 h-9 rounded-md border border-primary bg-primary/10 text-xs text-foreground transition-colors">
              Invisible
            </button>
            <button className="flex-1 h-9 rounded-md border border-border bg-background hover:bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors">
              Border
            </button>
          </div>
        </div>
      </div>
    ),
    forms: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Form Fields</h3>
          <p className="text-xs text-muted-foreground mt-1">Select a field type, then click to place.</p>
        </div>
        <div className="space-y-2">
          {[
            { id: "text", icon: Type, label: "Text Field" },
            { id: "checkbox", icon: CheckSquare, label: "Checkbox" },
            { id: "radio", icon: CircleDot, label: "Radio Button" },
            { id: "dropdown", icon: ChevronDown, label: "Dropdown" }
          ].map((type) => (
            <button
              key={type.id}
              className="w-full h-10 rounded-md border border-border bg-background hover:bg-secondary text-sm text-left px-3 transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">Fields become interactive in the final PDF.</p>
      </div>
    ),
  };

  return panels[tool];
}
