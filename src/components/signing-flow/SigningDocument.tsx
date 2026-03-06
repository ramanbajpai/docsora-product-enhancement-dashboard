import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, 
  PenTool, Type, Calendar, MessageSquare, Check, Upload, 
  SquareCheck, FileText, ChevronDown, Undo2, Redo2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SigningDocument as SigningDocumentType, SigningField, SigningComment } from "./types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SigningDocumentProps {
  document: SigningDocumentType;
  onFieldComplete: (fieldId: string, value: string) => void;
  onFieldClear?: (fieldId: string) => void;
  onAllFieldsComplete: () => void;
  onAddComment: (comment: Omit<SigningComment, "id" | "createdAt">) => void;
  signerName?: string;
  signerEmail?: string;
}

// Action history for undo support
interface FieldAction {
  fieldId: string;
  value: string;
  timestamp: Date;
}

export function SigningDocument({ 
  document, 
  onFieldComplete,
  onFieldClear,
  onAllFieldsComplete,
  onAddComment,
  signerName = "John Doe",
  signerEmail = "john.doe@example.com"
}: SigningDocumentProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputValue, setTextInputValue] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [hasCompletedFirst, setHasCompletedFirst] = useState(false);
  const [actionHistory, setActionHistory] = useState<FieldAction[]>([]);
  const [redoHistory, setRedoHistory] = useState<FieldAction[]>([]);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [justCompletedFieldId, setJustCompletedFieldId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const requiredFields = document.fields.filter(f => f.required);
  const completedFields = requiredFields.filter(f => f.completed);
  const currentField = requiredFields[activeFieldIndex];
  const remainingFields = requiredFields.length - completedFields.length;

  // Auto-scroll to current field
  useEffect(() => {
    if (currentField && containerRef.current) {
      if (currentField.page !== currentPage) {
        setCurrentPage(currentField.page);
      }
    }
  }, [activeFieldIndex, currentField]);

  // Check if all fields are complete
  useEffect(() => {
    if (completedFields.length === requiredFields.length && requiredFields.length > 0) {
      onAllFieldsComplete();
    }
  }, [completedFields.length, requiredFields.length]);

  // Focus text input when shown
  useEffect(() => {
    if (showTextInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showTextInput]);

  // Keyboard shortcuts for undo (Cmd/Ctrl + Z) and redo (Cmd/Ctrl + Shift + Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actionHistory, redoHistory]);

  // Clear justCompletedFieldId after animation
  useEffect(() => {
    if (justCompletedFieldId) {
      const timer = setTimeout(() => setJustCompletedFieldId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [justCompletedFieldId]);

  // Get dynamic helper text based on completion state
  const getHelperText = () => {
    const signatureFields = requiredFields.filter(f => f.type === "signature");
    const dateFields = requiredFields.filter(f => f.type === "date");
    const signatureComplete = signatureFields.every(f => f.completed);
    const dateComplete = dateFields.every(f => f.completed);

    if (completedFields.length === 0) {
      return `${remainingFields} required field${remainingFields !== 1 ? "s" : ""} — start with your signature`;
    }
    if (!signatureComplete) {
      return `${remainingFields} remaining — add your signature`;
    }
    if (!dateComplete) {
      return "Almost done — add the date to finish";
    }
    if (remainingFields > 0) {
      return `${remainingFields} field${remainingFields !== 1 ? "s" : ""} remaining`;
    }
    return "All fields complete — ready to submit";
  };

  // Handle field completion with history tracking
  const completeFieldWithHistory = (fieldId: string, value: string) => {
    const field = document.fields.find(f => f.id === fieldId);
    if (field && (field.type === "signature" || field.type === "date")) {
      setActionHistory(prev => [...prev, { fieldId, value, timestamp: new Date() }]);
      // Clear redo history when a new action is performed
      setRedoHistory([]);
    }
    onFieldComplete(fieldId, value);
    setJustCompletedFieldId(fieldId);
  };

  // Handle undo
  const handleUndo = useCallback(() => {
    if (actionHistory.length === 0) return;
    const lastAction = actionHistory[actionHistory.length - 1];
    setActionHistory(prev => prev.slice(0, -1));
    setRedoHistory(prev => [...prev, lastAction]);
    onFieldClear?.(lastAction.fieldId);
  }, [actionHistory, onFieldClear]);

  // Handle redo
  const handleRedo = useCallback(() => {
    if (redoHistory.length === 0) return;
    const lastRedoAction = redoHistory[redoHistory.length - 1];
    setRedoHistory(prev => prev.slice(0, -1));
    setActionHistory(prev => [...prev, lastRedoAction]);
    onFieldComplete(lastRedoAction.fieldId, lastRedoAction.value);
    setJustCompletedFieldId(lastRedoAction.fieldId);
  }, [redoHistory, onFieldComplete]);

  // Handle field clear
  const handleClearField = (fieldId: string) => {
    setActionHistory(prev => prev.filter(a => a.fieldId !== fieldId));
    onFieldClear?.(fieldId);
  };

  const handleFieldClick = (field: SigningField) => {
    if (field.completed) return;
    
    // Find the index of this field
    const fieldIndex = requiredFields.findIndex(f => f.id === field.id);
    if (fieldIndex !== -1) {
      setActiveFieldIndex(fieldIndex);
    }

    if (field.type === "signature") {
      setShowSignatureModal(true);
    } else if (field.type === "initials") {
      // Initials: instant apply with user's initials (simulated)
      const initials = signerName.split(" ").map(n => n[0]).join("").toUpperCase();
      completeFieldWithHistory(field.id, initials);
      setHasCompletedFirst(true);
      advanceToNextField(field.id);
    } else if (field.type === "date") {
      // Date: auto-fill today in display format
      const today = format(new Date(), "d MMM yyyy");
      completeFieldWithHistory(field.id, today);
      setHasCompletedFirst(true);
      advanceToNextField(field.id);
    } else if (field.type === "checkbox") {
      // Checkbox: toggle on click
      completeFieldWithHistory(field.id, "checked");
      setHasCompletedFirst(true);
      advanceToNextField(field.id);
    } else if (field.type === "text") {
      // Text: show inline input
      setShowTextInput(true);
      setTextInputValue("");
    }
  };

  const handleTextInputComplete = () => {
    if (!currentField || !textInputValue.trim()) return;
    completeFieldWithHistory(currentField.id, textInputValue.trim());
    setShowTextInput(false);
    setTextInputValue("");
    setHasCompletedFirst(true);
    advanceToNextField(currentField.id);
  };

  const handleSignatureComplete = (signature: string) => {
    if (!currentField) return;
    completeFieldWithHistory(currentField.id, signature);
    setShowSignatureModal(false);
    setHasCompletedFirst(true);
    advanceToNextField(currentField.id);
  };

  const advanceToNextField = (completedFieldId?: string) => {
    const nextIncompleteIndex = requiredFields.findIndex(
      (f, i) => i > activeFieldIndex && !f.completed && f.id !== completedFieldId
    );
    if (nextIncompleteIndex !== -1) {
      setActiveFieldIndex(nextIncompleteIndex);
    } else {
      // Check if there are any incomplete fields before current
      const anyIncomplete = requiredFields.findIndex(
        f => !f.completed && f.id !== completedFieldId
      );
      if (anyIncomplete !== -1) {
        setActiveFieldIndex(anyIncomplete);
      }
    }
  };

  const goToNextRequiredField = () => {
    const nextIncomplete = requiredFields.findIndex(
      (f, i) => i > activeFieldIndex && !f.completed
    );
    if (nextIncomplete !== -1) {
      setActiveFieldIndex(nextIncomplete);
      if (requiredFields[nextIncomplete].page !== currentPage) {
        setCurrentPage(requiredFields[nextIncomplete].page);
      }
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    onAddComment({
      text: commentText,
      selection: undefined
    });
    setCommentText("");
    setShowCommentInput(false);
  };

  const getFieldIcon = (type: SigningField["type"], className = "w-4 h-4") => {
    switch (type) {
      case "signature":
        return <PenTool className={className} />;
      case "initials":
        return <Type className={className} />;
      case "date":
        return <Calendar className={className} />;
      case "checkbox":
        return <SquareCheck className={className} />;
      case "text":
        return <FileText className={className} />;
      default:
        return <Type className={className} />;
    }
  };

  const getFieldTypeName = (type: SigningField["type"]) => {
    switch (type) {
      case "signature":
        return "Signature";
      case "initials":
        return "Initials";
      case "date":
        return "Date";
      case "checkbox":
        return "Checkbox";
      case "text":
        return "Text";
      default:
        return "Field";
    }
  };

  const hasNextField = requiredFields.some((f, i) => i > activeFieldIndex && !f.completed);

  return (
    <div className="flex h-full bg-muted/30">
      {/* Left Panel - Required Fields */}
      <div className="hidden md:flex flex-col w-72 border-r border-border/50 bg-background">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-medium text-foreground">Required fields</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {remainingFields} of {requiredFields.length} remaining
          </p>
        </div>
        
        <div className="flex-1 overflow-auto p-3 space-y-1.5">
          {requiredFields.map((field, i) => (
            <button
              key={field.id}
              onClick={() => {
                setActiveFieldIndex(i);
                if (field.page !== currentPage) {
                  setCurrentPage(field.page);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                field.completed
                  ? "bg-emerald-50 dark:bg-emerald-950/30"
                  : i === activeFieldIndex
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                field.completed
                  ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                  : i === activeFieldIndex
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              )}>
                {field.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  getFieldIcon(field.type)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  field.completed ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"
                )}>
                  {field.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getFieldTypeName(field.type)} · Page {field.page}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Go to next field button - more prominent */}
        {hasNextField && (
          <div className="p-3 border-t border-border/50 space-y-2">
            <Button 
              onClick={goToNextRequiredField}
              variant="secondary"
              className="w-full gap-2 h-10 font-medium"
            >
              Go to next field
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top guidance bar */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
          <div className="flex flex-col items-center gap-2 max-w-4xl mx-auto">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {requiredFields.map((field, i) => (
                <button
                  key={field.id}
                  onClick={() => {
                    setActiveFieldIndex(i);
                    if (field.page !== currentPage) {
                      setCurrentPage(field.page);
                    }
                  }}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all hover:scale-125",
                    field.completed 
                      ? "bg-emerald-500" 
                      : i === activeFieldIndex 
                        ? "bg-primary ring-4 ring-primary/20" 
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
            
            {/* Dynamic helper text */}
            <p className="text-sm text-muted-foreground text-center">
              {getHelperText()}
            </p>
          </div>
        </div>

        {/* Scrollable document area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto px-4 py-6"
        >
          <div 
            className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            {/* Mock PDF page */}
            <div className="relative aspect-[8.5/11] min-h-[800px] p-12">
              {/* Document content placeholder */}
              <div className="space-y-4 text-sm text-muted-foreground/70">
                <div className="h-8 w-48 bg-muted/50 rounded mb-8" />
                <div className="h-4 w-full bg-muted/30 rounded" />
                <div className="h-4 w-11/12 bg-muted/30 rounded" />
                <div className="h-4 w-full bg-muted/30 rounded" />
                <div className="h-4 w-9/12 bg-muted/30 rounded" />
                <div className="h-4 w-full bg-muted/30 rounded" />
                <div className="h-4 w-10/12 bg-muted/30 rounded" />
                <div className="h-20 w-full" />
                <div className="h-4 w-full bg-muted/30 rounded" />
                <div className="h-4 w-8/12 bg-muted/30 rounded" />
                <div className="h-4 w-full bg-muted/30 rounded" />
                <div className="h-4 w-11/12 bg-muted/30 rounded" />
              </div>

              {/* Fields on document */}
              {document.fields
                .filter(f => f.page === currentPage)
                .map((field) => {
                  const isActive = requiredFields[activeFieldIndex]?.id === field.id;
                  const isNextField = !field.completed && requiredFields.findIndex(f => !f.completed) === requiredFields.findIndex(f => f.id === field.id);
                  const canEditField = field.completed && (field.type === "signature" || field.type === "date");
                  const isHovered = hoveredFieldId === field.id;
                  const wasJustCompleted = justCompletedFieldId === field.id;
                  
                  return (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: 1, 
                        scale: isNextField && hasCompletedFirst ? [1, 1.02, 1] : 1 
                      }}
                      transition={{ 
                        scale: isNextField && hasCompletedFirst ? { 
                          duration: 1.5, 
                          repeat: Infinity, 
                          repeatType: "reverse" 
                        } : {} 
                      }}
                      className={cn(
                        "absolute transition-all",
                        field.completed && !canEditField ? "pointer-events-none" : "cursor-pointer"
                      )}
                      style={{
                        left: `${field.position.x}%`,
                        top: `${field.position.y}%`,
                        width: `${field.position.width}%`,
                        height: `${field.position.height}%`
                      }}
                      onClick={() => !field.completed && handleFieldClick(field)}
                      onMouseEnter={() => canEditField && setHoveredFieldId(field.id)}
                      onMouseLeave={() => setHoveredFieldId(null)}
                    >
                      <div
                        className={cn(
                          "w-full h-full rounded-md border-2 flex flex-col items-center justify-center gap-1 transition-all relative",
                          field.completed
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600 border-solid"
                            : isActive
                              ? "bg-primary/15 border-primary border-solid shadow-lg shadow-primary/20 ring-4 ring-primary/10"
                              : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/70 dark:border-amber-700/50 border-dashed hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        )}
                      >
                        {field.completed ? (
                          <>
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <Check className="w-4 h-4" />
                              <span className="text-xs font-medium">
                                {field.type === "date" ? field.value : "Done"}
                              </span>
                            </div>
                            {/* Signature reassurance - show briefly after signing */}
                            {field.type === "signature" && wasJustCompleted && (
                              <motion.p 
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70"
                              >
                                Signing as {signerName}
                              </motion.p>
                            )}
                            {/* Hover actions for editable fields */}
                            {canEditField && isHovered && (
                              <motion.div
                                initial={{ opacity: 0, y: 2 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background border border-border rounded-md px-2 py-1 shadow-lg z-10"
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearField(field.id);
                                  }}
                                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  Clear
                                </button>
                              </motion.div>
                            )}
                          </>
                        ) : (
                          <>
                            {getFieldIcon(field.type)}
                            <span className={cn(
                              "text-xs font-medium",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                              {field.label}
                            </span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Fixed bottom controls */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* Zoom controls + Undo/Redo */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(Math.max(50, zoom - 25))}
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                disabled={zoom >= 200}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              {/* Separator */}
              <div className="w-px h-5 bg-border/50 mx-1.5" />
              
              {/* Undo/Redo controls */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground disabled:opacity-30"
                onClick={handleUndo}
                disabled={actionHistory.length === 0}
                title="Undo (⌘Z)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground disabled:opacity-30"
                onClick={handleRedo}
                disabled={redoHistory.length === 0}
                title="Redo (⌘⇧Z)"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {document.totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(Math.min(document.totalPages, currentPage + 1))}
                disabled={currentPage >= document.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Comment button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setShowCommentInput(true)}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Add comment</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Signature modal */}
      <AnimatePresence>
        {showSignatureModal && currentField && (
          <SignatureModal
            fieldType={currentField.type as "signature" | "initials"}
            onComplete={handleSignatureComplete}
            onCancel={() => setShowSignatureModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Text input modal */}
      <AnimatePresence>
        {showTextInput && currentField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowTextInput(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-foreground mb-3">{currentField.label}</h3>
              <Input
                ref={textInputRef}
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                placeholder="Enter text..."
                className="mb-4"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && textInputValue.trim()) {
                    handleTextInputComplete();
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowTextInput(false)}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleTextInputComplete}
                  disabled={!textInputValue.trim()}
                >
                  Apply
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment input panel */}
      <AnimatePresence>
        {showCommentInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 w-80 bg-card border border-border rounded-xl shadow-lg p-4 z-40"
          >
            <p className="text-sm font-medium text-foreground mb-2">Add a comment</p>
            <Textarea
              placeholder="Type your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[80px] mb-3"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCommentInput(false);
                  setCommentText("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                Add comment
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Comments are visible to sender but do not block signing.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Signature modal component
interface SignatureModalProps {
  fieldType: "signature" | "initials";
  onComplete: (signature: string) => void;
  onCancel: () => void;
}

function SignatureModal({ fieldType, onComplete, onCancel }: SignatureModalProps) {
  const [mode, setMode] = useState<"draw" | "type" | "upload">("type");
  const [typedValue, setTypedValue] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);

  const title = fieldType === "signature" ? "Add your signature" : "Add your initials";
  const placeholder = fieldType === "signature" ? "Type your full name" : "Type your initials";

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      processUploadedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = () => {
    if (mode === "type" && typedValue.trim()) {
      onComplete(typedValue);
    } else if (mode === "draw" && canvasRef.current) {
      onComplete(canvasRef.current.toDataURL());
    } else if (mode === "upload" && uploadedImage) {
      onComplete(uploadedImage);
    }
  };

  const canApply = () => {
    if (mode === "type") return typedValue.trim().length > 0;
    if (mode === "draw") return true;
    if (mode === "upload") return !!uploadedImage;
    return false;
  };

  const showUpload = fieldType === "signature";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === "type" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("type")}
          >
            <Type className="w-4 h-4 mr-1.5" />
            Type
          </Button>
          <Button
            variant={mode === "draw" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("draw")}
          >
            <PenTool className="w-4 h-4 mr-1.5" />
            Draw
          </Button>
          {showUpload && (
            <Button
              variant={mode === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("upload")}
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Upload
            </Button>
          )}
        </div>

        {/* Input area */}
        {mode === "type" ? (
          <div className="mb-6">
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 text-2xl font-serif italic border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            {typedValue && (
              <div className="mt-3 p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-serif italic text-foreground text-center">
                  {typedValue}
                </p>
              </div>
            )}
          </div>
        ) : mode === "draw" ? (
          <div className="mb-6">
            <canvas
              ref={canvasRef}
              width={360}
              height={120}
              className="w-full h-32 border border-border rounded-lg bg-white cursor-crosshair"
              onMouseDown={(e) => {
                isDrawing.current = true;
                const ctx = canvasRef.current?.getContext("2d");
                if (ctx) {
                  const rect = canvasRef.current!.getBoundingClientRect();
                  ctx.beginPath();
                  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                  ctx.strokeStyle = "#000";
                  ctx.lineWidth = 2;
                  ctx.lineCap = "round";
                }
              }}
              onMouseMove={handleDraw}
              onMouseUp={() => (isDrawing.current = false)}
              onMouseLeave={() => (isDrawing.current = false)}
            />
            <button
              onClick={() => {
                const ctx = canvasRef.current?.getContext("2d");
                if (ctx && canvasRef.current) {
                  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
              }}
              className="text-xs text-muted-foreground hover:text-foreground mt-2"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleFileChange}
            />
            
            {uploadedImage ? (
              <div className="space-y-3">
                <div className="relative h-32 border border-border rounded-lg bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded signature" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Replace
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedImage(null)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-colors
                  bg-[hsl(220,13%,12%)] dark:bg-[hsl(220,13%,12%)]
                  ${isDragging 
                    ? "border-primary/60" 
                    : "border-[hsl(220,10%,25%)] hover:border-[hsl(220,10%,35%)]"
                  }
                `}
              >
                <Upload className={`w-5 h-5 ${isDragging ? "text-primary" : "text-[hsl(220,10%,50%)]"}`} />
                <div className="text-center space-y-1">
                  <span className="block text-sm font-medium text-white">Upload an image of your signature</span>
                  <span className="block text-xs text-[hsl(220,10%,55%)]">PNG or JPG · Transparent background recommended</span>
                  <span className="block text-xs text-[hsl(220,10%,45%)]">Drag and drop supported</span>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={!canApply()}
          >
            Apply
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
