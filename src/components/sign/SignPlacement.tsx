import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ArrowRight, 
  ChevronDown,
  PenTool,
  Type,
  Calendar,
  Trash2,
  Copy,
  Undo2,
  Redo2,
  Layers,
  MessageSquare,
  ArrowLeft,
  ArrowRightIcon,
  User,
  Briefcase,
  MapPin,
  CheckSquare,
  Stamp,
  Image,
  RotateCw,
  Sparkles,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignatureData, SignaturePosition } from "@/pages/Sign";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StampPicker } from "./StampPicker";
import { useAIFieldSuggestion } from "@/hooks/useAIFieldSuggestion";

interface SignPlacementProps {
  file: File;
  signatureData: SignatureData;
  initialPosition: SignaturePosition;
  onComplete: (position: SignaturePosition) => void;
  onBack: () => void;
}

type FieldType = "signature" | "initials" | "date" | "note" | "name" | "title" | "company" | "location" | "checkbox" | "stamp" | "image";

interface PlacedField {
  id: string;
  type: FieldType;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  content: string;
  imageData?: string;
  rotation?: number;
  opacity?: number;
  isAISuggested?: boolean; // Track if field was AI-suggested
}

type ResizeCorner = "nw" | "ne" | "sw" | "se";

const TOTAL_PAGES = 3;

const SNAP_THRESHOLD = 2;
const SNAP_GUIDES = [10, 50, 90];

const SignPlacement = ({ 
  signatureData, 
  initialPosition, 
  onComplete, 
  onBack 
}: SignPlacementProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [fields, setFields] = useState<PlacedField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeSize, setResizeSize] = useState<{ width: number; height: number } | null>(null);
  const [history, setHistory] = useState<PlacedField[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [showApplyRemaining, setShowApplyRemaining] = useState(false);
  const [showStampPicker, setShowStampPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // AI Field Suggestion
  const { isScanning, suggestFields } = useAIFieldSuggestion({ totalPages: TOTAL_PAGES });

  // Generate initials from name
  const getInitials = () => {
    const words = signatureData.fullName.trim().split(/\s+/);
    return words.slice(0, 2).map(w => w.charAt(0).toUpperCase()).join("");
  };

  // Get today's date formatted
  const getFormattedDate = () => {
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  // Count signed pages
  const getSignedPagesCount = () => {
    const pagesWithSignatures = new Set(fields.filter(f => f.type === "signature").map(f => f.page));
    return pagesWithSignatures.size;
  };

  // Save to history
  const saveToHistory = useCallback((newFields: PlacedField[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newFields);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFields(history[historyIndex - 1]);
      setSelectedFieldId(null);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFields(history[historyIndex + 1]);
      setSelectedFieldId(null);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt key for disabling snap
      if (e.key === "Alt") {
        setIsAltPressed(true);
      }

      // Undo: Cmd/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Cmd/Ctrl + Shift + Z
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
        e.preventDefault();
        handleRedo();
      }

      // Delete selected field
      if ((e.key === "Delete" || e.key === "Backspace") && selectedFieldId) {
        e.preventDefault();
        deleteField();
      }

      // Page navigation with arrow keys
      if (e.key === "ArrowLeft" && !selectedFieldId) {
        e.preventDefault();
        setCurrentPage(p => Math.max(1, p - 1));
      }
      if (e.key === "ArrowRight" && !selectedFieldId) {
        e.preventDefault();
        setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setIsAltPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleUndo, handleRedo, selectedFieldId]);

  // Add field
  const addField = useCallback((type: FieldType, imageData?: string, options?: { rotation?: number; opacity?: number }) => {
    let content = "";
    let width = 180;
    let height = 50;

    switch (type) {
      case "signature":
        content = signatureData.fullName;
        width = 200;
        height = 60;
        break;
      case "initials":
        content = getInitials();
        width = 80;
        height = 50;
        break;
      case "date":
        content = getFormattedDate();
        width = 160;
        height = 40;
        break;
      case "note":
        content = "Add note...";
        width = 180;
        height = 60;
        break;
      case "name":
        content = signatureData.fullName;
        width = 180;
        height = 40;
        break;
      case "title":
        content = "Title / Role";
        width = 150;
        height = 40;
        break;
      case "company":
        content = "Company Name";
        width = 150;
        height = 40;
        break;
      case "location":
        content = "Location";
        width = 150;
        height = 40;
        break;
      case "checkbox":
        content = "☐";
        width = 40;
        height = 40;
        break;
      case "stamp":
        content = "Stamp";
        width = 120;
        height = 120;
        break;
      case "image":
        content = "Image";
        width = 120;
        height = 120;
        break;
    }

    const newField: PlacedField = {
      id: `field_${Date.now()}`,
      type,
      x: 50,
      y: 70,
      width,
      height,
      page: currentPage,
      content,
      imageData: (type === "stamp" || type === "image") ? imageData : undefined,
      rotation: options?.rotation ?? 0,
      opacity: options?.opacity ?? 1,
    };

    const newFields = [...fields, newField];
    setFields(newFields);
    saveToHistory(newFields);
    setSelectedFieldId(newField.id);

  }, [fields, currentPage, signatureData.fullName, saveToHistory]);

  // Handle stamp selection from picker
  const handleStampSelect = useCallback((imageData: string, options?: { rotation?: number; opacity?: number }) => {
    addField("stamp", imageData, options);
  }, [addField]);

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      addField("image", imageData, { rotation: 0, opacity: 1 });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }, [addField]);

  // Update stamp/image rotation
  const updateStampRotation = useCallback((fieldId: string, rotation: number) => {
    setFields(prev => prev.map(f => 
      f.id === fieldId ? { ...f, rotation } : f
    ));
  }, []);

  // Update stamp/image opacity
  const updateStampOpacity = useCallback((fieldId: string, opacity: number) => {
    setFields(prev => prev.map(f => 
      f.id === fieldId ? { ...f, opacity } : f
    ));
  }, []);

  // Delete selected field
  const deleteField = useCallback(() => {
    if (!selectedFieldId) return;
    const newFields = fields.filter(f => f.id !== selectedFieldId);
    setFields(newFields);
    saveToHistory(newFields);
    setSelectedFieldId(null);
  }, [fields, selectedFieldId, saveToHistory]);

  // Duplicate selected field
  const duplicateField = useCallback(() => {
    if (!selectedFieldId) return;
    const field = fields.find(f => f.id === selectedFieldId);
    if (!field) return;

    const newField: PlacedField = {
      ...field,
      id: `field_${Date.now()}`,
      x: Math.min(field.x + 5, 85),
      y: Math.min(field.y + 5, 85),
    };

    const newFields = [...fields, newField];
    setFields(newFields);
    saveToHistory(newFields);
    setSelectedFieldId(newField.id);
  }, [fields, selectedFieldId, saveToHistory]);

  // Apply signature to all pages
  const applyToAllPages = useCallback(() => {
    if (!selectedFieldId) return;
    const field = fields.find(f => f.id === selectedFieldId);
    if (!field) return;

    const newFields = [...fields];
    for (let page = 1; page <= TOTAL_PAGES; page++) {
      if (page !== field.page) {
        const exists = fields.some(f => 
          f.page === page && 
          f.type === field.type && 
          Math.abs(f.x - field.x) < 5 && 
          Math.abs(f.y - field.y) < 5
        );
        if (!exists) {
          newFields.push({
            ...field,
            id: `field_${Date.now()}_${page}`,
            page,
          });
        }
      }
    }
    
    setFields(newFields);
    saveToHistory(newFields);
    setShowApplyRemaining(false);
  }, [fields, selectedFieldId, saveToHistory]);

  // Apply to remaining pages (from first signature)
  const applyToRemainingPages = useCallback(() => {
    const firstSignature = fields.find(f => f.type === "signature" && f.page === currentPage);
    if (!firstSignature) return;

    const newFields = [...fields];
    for (let page = currentPage + 1; page <= TOTAL_PAGES; page++) {
      const exists = fields.some(f => 
        f.page === page && 
        f.type === "signature" && 
        Math.abs(f.x - firstSignature.x) < 5 && 
        Math.abs(f.y - firstSignature.y) < 5
      );
      if (!exists) {
        newFields.push({
          ...firstSignature,
          id: `field_${Date.now()}_${page}`,
          page,
        });
      }
    }
    
    setFields(newFields);
    saveToHistory(newFields);
    setShowApplyRemaining(false);
  }, [fields, currentPage, saveToHistory]);

  // AI Suggest Fields - Only Me mode
  const handleAISuggestFields = useCallback(async () => {
    const suggestions = await suggestFields();
    
    const newFields: PlacedField[] = suggestions.map((suggestion, index) => {
      let content = "";
      switch (suggestion.type) {
        case "signature":
          content = signatureData.fullName;
          break;
        case "initials":
          content = signatureData.fullName.split(" ").map(n => n[0]).join("").toUpperCase();
          break;
        case "date":
          content = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
          break;
        case "name":
          content = signatureData.fullName;
          break;
        case "title":
          content = "Title / Role";
          break;
        case "company":
          content = "Company Name";
          break;
        default:
          content = "";
      }
      
      return {
        id: `ai_field_${Date.now()}_${index}`,
        type: suggestion.type,
        x: suggestion.x,
        y: suggestion.y,
        width: suggestion.width,
        height: suggestion.height,
        page: suggestion.page,
        content,
        isAISuggested: true,
      };
    });
    
    const updatedFields = [...fields, ...newFields];
    setFields(updatedFields);
    saveToHistory(updatedFields);
    
    // Navigate to the page with most suggestions
    const pageWithMostFields = newFields.reduce((acc, f) => {
      acc[f.page] = (acc[f.page] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    const targetPage = Object.entries(pageWithMostFields).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (targetPage) {
      setCurrentPage(Number(targetPage));
    }
  }, [suggestFields, signatureData.fullName, fields, saveToHistory]);

  // Clear AI suggested flag when field is modified
  const clearAISuggestedFlag = useCallback((fieldId: string) => {
    setFields(prev => prev.map(f => 
      f.id === fieldId ? { ...f, isAISuggested: false } : f
    ));
  }, []);
  // Snap to guides
  const snapToGuide = (value: number): number => {
    if (isAltPressed) return value;
    for (const guide of SNAP_GUIDES) {
      if (Math.abs(value - guide) < SNAP_THRESHOLD) {
        return guide;
      }
    }
    return value;
  };

  // Handle drag
  const handleDrag = useCallback((fieldId: string, info: { point: { x: number; y: number } }) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let x = ((info.point.x - rect.left) / rect.width) * 100;
      let y = ((info.point.y - rect.top) / rect.height) * 100;
      
      // Apply snapping
      x = snapToGuide(x);
      y = snapToGuide(y);
      
      setFields(prev => prev.map(f => 
        f.id === fieldId 
          ? { ...f, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
          : f
      ));
    }
  }, [isAltPressed]);

  // Handle resize with proportional scaling
  const handleResize = useCallback((fieldId: string, corner: ResizeCorner, deltaX: number, deltaY: number, initialWidth: number, initialHeight: number) => {
    // Calculate aspect ratio for proportional resize
    const aspectRatio = initialWidth / initialHeight;
    
    setFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      
      let newWidth = initialWidth;
      let newHeight = initialHeight;
      
      // Determine which dimension to base the resize on
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      if (absDeltaX > absDeltaY) {
        // Width-based resize
        if (corner === "ne" || corner === "se") {
          newWidth = Math.max(60, initialWidth + deltaX);
        } else {
          newWidth = Math.max(60, initialWidth - deltaX);
        }
        newHeight = newWidth / aspectRatio;
      } else {
        // Height-based resize
        if (corner === "se" || corner === "sw") {
          newHeight = Math.max(30, initialHeight + deltaY);
        } else {
          newHeight = Math.max(30, initialHeight - deltaY);
        }
        newWidth = newHeight * aspectRatio;
      }
      
      // Ensure minimums
      newWidth = Math.max(60, newWidth);
      newHeight = Math.max(30, newHeight);
      
      setResizeSize({ width: Math.round(newWidth), height: Math.round(newHeight) });
      
      return { ...f, width: newWidth, height: newHeight };
    }));
  }, []);

  // Finish drag/resize and save to history
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    saveToHistory(fields);
  }, [fields, saveToHistory]);

  // Page navigation
  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1));

  // Current page fields
  const currentPageFields = fields.filter(f => f.page === currentPage);

  // Can continue?
  const hasRequiredFields = fields.some(f => f.type === "signature");

  // Handle complete
  const handleComplete = useCallback(() => {
    const signatureField = fields.find(f => f.type === "signature");
    if (signatureField) {
      onComplete({
        x: signatureField.x,
        y: signatureField.y,
        width: signatureField.width,
        height: signatureField.height,
        page: signatureField.page,
      });
    }
  }, [fields, onComplete]);

  // Click outside to deselect
  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setSelectedFieldId(null);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  // Calculate toolbar position near selected field
  const getToolbarPosition = () => {
    if (!selectedField || !containerRef.current) return { top: 0, left: 0 };
    const containerRect = containerRef.current.getBoundingClientRect();
    const fieldX = (selectedField.x / 100) * containerRect.width;
    const fieldY = (selectedField.y / 100) * containerRect.height;
    
    return {
      top: Math.max(10, fieldY - 60),
      left: Math.min(containerRect.width - 200, Math.max(10, fieldX + 50)),
    };
  };

  // Resize handle component
  const ResizeHandle = ({ corner, fieldId, field }: { 
    corner: ResizeCorner; 
    fieldId: string;
    field: PlacedField;
  }) => {
    const positionClasses = {
      nw: "-left-2 -top-2 cursor-nw-resize",
      ne: "-right-2 -top-2 cursor-ne-resize",
      sw: "-left-2 -bottom-2 cursor-sw-resize",
      se: "-right-2 -bottom-2 cursor-se-resize",
    };

    return (
      <div
        className={`absolute w-4 h-4 bg-primary border-2 border-background rounded-sm ${positionClasses[corner]}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsResizing(true);
          const startX = e.clientX;
          const startY = e.clientY;
          const initialWidth = field.width;
          const initialHeight = field.height;
          const aspectRatio = initialWidth / initialHeight;
          
          const handleMouseMove = (moveE: MouseEvent) => {
            const deltaX = moveE.clientX - startX;
            const deltaY = moveE.clientY - startY;
            
            let newWidth = initialWidth;
            let newHeight = initialHeight;
            
            // Simple resize based on corner
            if (corner === "se") {
              newWidth = Math.max(60, initialWidth + deltaX);
              newHeight = newWidth / aspectRatio;
            } else if (corner === "sw") {
              newWidth = Math.max(60, initialWidth - deltaX);
              newHeight = newWidth / aspectRatio;
            } else if (corner === "ne") {
              newWidth = Math.max(60, initialWidth + deltaX);
              newHeight = newWidth / aspectRatio;
            } else if (corner === "nw") {
              newWidth = Math.max(60, initialWidth - deltaX);
              newHeight = newWidth / aspectRatio;
            }
            
            newWidth = Math.max(60, newWidth);
            newHeight = Math.max(30, newHeight);
            
            setResizeSize({ width: Math.round(newWidth), height: Math.round(newHeight) });
            setFields(prev => prev.map(f => 
              f.id === fieldId ? { ...f, width: newWidth, height: newHeight } : f
            ));
          };
          
          const handleMouseUp = () => {
            setIsResizing(false);
            setResizeSize(null);
            saveToHistory(fields);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };
          
          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }}
      />
    );
  };

  const signedPagesCount = getSignedPagesCount();

  return (
    <div className="flex min-h-[calc(100vh-6rem)]">
      {/* Hidden image input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Left Toolbar - Field Picker */}
      <motion.div
        className="w-64 shrink-0 border-r border-border/50 bg-background"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="sticky top-0 h-screen flex flex-col pl-8 pr-6 pt-6">
          {/* Back button */}
          <button
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            onClick={onBack}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* Sidebar label */}
          <p className="text-xs text-muted-foreground mb-4">
            Select a field from below to place it on the document.
          </p>

          {/* Scrollable field picker */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 -mx-2 px-2 pb-4">
            {/* Primary Fields */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-2">
                Signature
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => addField("signature")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <PenTool className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">Signature</span>
                </button>

                <button
                  onClick={() => addField("initials")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                    <Type className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">Initials</span>
                </button>

                <button
                  onClick={() => addField("date")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">Date</span>
                </button>
              </div>
            </div>

            {/* Text Fields - Collapsible */}
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="w-full flex items-center justify-between py-2 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium hover:text-muted-foreground transition-colors group">
                <span>Text Fields</span>
                <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-1">
                <button
                  onClick={() => addField("name")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">Name</span>
                </button>

                <button
                  onClick={() => addField("title")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">Title</span>
                </button>

                <button
                  onClick={() => addField("company")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">Company</span>
                </button>

                <button
                  onClick={() => addField("location")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">Location</span>
                </button>

                <button
                  onClick={() => addField("note")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">Add Text</span>
                </button>
              </CollapsibleContent>
            </Collapsible>

            {/* Controls - Collapsible */}
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="w-full flex items-center justify-between py-2 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium hover:text-muted-foreground transition-colors group">
                <span>Controls</span>
                <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-1">
                <button
                  onClick={() => addField("checkbox")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">Checkbox</span>
                </button>
              </CollapsibleContent>
            </Collapsible>

            {/* Assets - Collapsible */}
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="w-full flex items-center justify-between py-2 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium hover:text-muted-foreground transition-colors group">
                <span>Assets</span>
                <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-1">
                <button
                  onClick={() => setShowStampPicker(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                    <Stamp className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">Stamp</span>
                </button>

                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                    <Image className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">Image</span>
                </button>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Undo/Redo - Fixed footer */}
          <div className="shrink-0 pt-4 pb-6 border-t border-border/50 bg-background">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100"
                    >
                      <Undo2 className="w-4 h-4" />
                      Undo
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">⌘Z</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleRedo}
                      disabled={historyIndex >= history.length - 1}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100"
                    >
                      <Redo2 className="w-4 h-4" />
                      Redo
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">⌘⇧Z</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Signed pages indicator */}
            {signedPagesCount > 0 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Signed on <span className="text-foreground font-medium">{signedPagesCount}</span> of {TOTAL_PAGES} pages
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Document Area */}
      <div className="flex-1 flex flex-col py-6 px-8 relative">
        {/* Top Right Actions - Fixed to top right */}
        <div className="absolute top-6 right-8 z-10 flex flex-col items-end gap-3">
          {/* Review and Finish */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button 
                    onClick={handleComplete} 
                    className="h-10 px-5 text-sm"
                    disabled={!hasRequiredFields}
                  >
                    Review and Finish
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </span>
              </TooltipTrigger>
              {!hasRequiredFields && (
                <TooltipContent>
                  <p>Place at least one signature to continue</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* AI Suggest - Below Review and Finish, aligned with page nav */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleAISuggestFields}
                  disabled={isScanning}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all disabled:opacity-60"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scanning…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>AI suggest</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Automatically detect and place signature fields</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Document Header - Centered */}
        <div className="w-full max-w-2xl mx-auto mb-6">
          <div className="flex flex-col items-center gap-3">
            {/* Title */}
            <h1 className="text-xl font-medium text-foreground tracking-tight">
              Place signature
            </h1>
            
            {/* Page Navigation */}
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">← Previous page</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm text-muted-foreground min-w-[100px] text-center">
                Page <span className="text-foreground font-medium">{currentPage}</span> of {TOTAL_PAGES}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === TOTAL_PAGES}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100"
                    >
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">→ Next page</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Document Canvas - Centered within document area */}
        <div className="flex-1 flex justify-center">
          <motion.div
            className="relative w-full max-w-2xl"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              ref={containerRef}
              onClick={handleContainerClick}
              className="relative bg-card rounded-xl border border-border/50 shadow-2xl shadow-black/5 overflow-hidden"
              style={{ aspectRatio: "8.5/11" }}
            >
              {/* Snap guides (visible only when dragging) */}
              {isDragging && !isAltPressed && (
                <>
                  {SNAP_GUIDES.map((guide) => (
                    <div
                      key={`v-${guide}`}
                      className="absolute top-0 bottom-0 w-px bg-primary/20 pointer-events-none"
                      style={{ left: `${guide}%` }}
                    />
                  ))}
                  {SNAP_GUIDES.map((guide) => (
                    <div
                      key={`h-${guide}`}
                      className="absolute left-0 right-0 h-px bg-primary/20 pointer-events-none"
                      style={{ top: `${guide}%` }}
                    />
                  ))}
                </>
              )}

              {/* Placeholder document content */}
              <div className="absolute inset-0 p-12 pointer-events-none">
                <div className="space-y-3">
                  <div className="h-5 bg-muted/40 rounded w-2/3" />
                  <div className="h-3 bg-muted/25 rounded w-full" />
                  <div className="h-3 bg-muted/25 rounded w-5/6" />
                  <div className="h-3 bg-muted/25 rounded w-full" />
                  <div className="h-3 bg-muted/25 rounded w-3/4" />
                  <div className="h-6" />
                  <div className="h-3 bg-muted/25 rounded w-full" />
                  <div className="h-3 bg-muted/25 rounded w-5/6" />
                  <div className="h-3 bg-muted/25 rounded w-full" />
                  <div className="h-3 bg-muted/25 rounded w-2/3" />
                  <div className="h-6" />
                  <div className="h-3 bg-muted/25 rounded w-full" />
                  <div className="h-3 bg-muted/25 rounded w-4/5" />
                  <div className="h-3 bg-muted/25 rounded w-full" />
                  <div className="h-3 bg-muted/25 rounded w-1/2" />
                </div>
                {/* Page indicator */}
                <div className="absolute bottom-4 right-4 text-xs text-muted-foreground/50">
                  Page {currentPage}
                </div>
              </div>

              {/* Placed Fields */}
              {currentPageFields.map((field) => (
                <div
                  key={field.id}
                  className={`
                    absolute cursor-move select-none z-20
                    ${selectedFieldId === field.id ? "z-30" : ""}
                  `}
                  style={{
                    left: `${field.x}%`,
                    top: `${field.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onMouseDown={(e) => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                    setSelectedFieldId(field.id);
                    // Clear AI suggested flag when user drags
                    if (field.isAISuggested) {
                      clearAISuggestedFlag(field.id);
                    }
                    
                    const handleMouseMove = (moveE: MouseEvent) => {
                      if (containerRef.current) {
                        const rect = containerRef.current.getBoundingClientRect();
                        let x = ((moveE.clientX - rect.left) / rect.width) * 100;
                        let y = ((moveE.clientY - rect.top) / rect.height) * 100;
                        
                        x = snapToGuide(x);
                        y = snapToGuide(y);
                        
                        setFields(prev => prev.map(f => 
                          f.id === field.id 
                            ? { ...f, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
                            : f
                        ));
                      }
                    };
                    
                    const handleMouseUp = () => {
                      setIsDragging(false);
                      saveToHistory(fields);
                      document.removeEventListener("mousemove", handleMouseMove);
                      document.removeEventListener("mouseup", handleMouseUp);
                    };
                    
                    document.addEventListener("mousemove", handleMouseMove);
                    document.addEventListener("mouseup", handleMouseUp);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFieldId(field.id);
                  }}
                >
                  {/* Field Content */}
                  <div
                    className={`
                      relative rounded-lg border-2 transition-all duration-100
                      ${selectedFieldId === field.id 
                        ? "border-primary shadow-lg shadow-primary/20" 
                        : field.isAISuggested
                          ? "border-primary/50 border-dashed"
                          : "border-primary/30 hover:border-primary/50"
                      }
                      ${field.type === "signature" ? "bg-primary/5" : "bg-card/90"}
                    `}
                    style={{ 
                      width: `${field.width}px`, 
                      height: `${field.height}px`,
                      transform: `rotate(${field.rotation || 0}deg)`,
                      opacity: field.opacity ?? 1,
                    }}
                  >
                    {/* Field type label */}
                    <div className="absolute -top-5 left-0 text-[10px] text-primary font-medium uppercase tracking-wider flex items-center gap-1">
                      {field.isAISuggested && <Sparkles className="w-3 h-3" />}
                      {field.type}
                    </div>

                    {/* Field content */}
                    <div className="w-full h-full flex items-center justify-center p-2">
                      {field.type === "signature" ? (
                        <span 
                          className="text-lg text-foreground select-none"
                          style={{ fontFamily: signatureData.selectedFont }}
                        >
                          {field.content}
                        </span>
                      ) : field.type === "initials" ? (
                        <span 
                          className="text-xl font-semibold text-foreground select-none"
                          style={{ fontFamily: signatureData.selectedFont }}
                        >
                          {field.content}
                        </span>
                      ) : field.type === "checkbox" ? (
                        <div className="w-5 h-5 border-2 border-primary rounded" />
                      ) : (field.type === "stamp" || field.type === "image") && field.imageData ? (
                        <img 
                          src={field.imageData} 
                          alt={field.type}
                          className="w-full h-full object-contain"
                          style={{ 
                            opacity: field.opacity ?? 1,
                          }}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground select-none">
                          {field.content}
                        </span>
                      )}
                    </div>

                    {/* Resize handles */}
                    {selectedFieldId === field.id && (
                      <>
                        <ResizeHandle corner="nw" fieldId={field.id} field={field} />
                        <ResizeHandle corner="ne" fieldId={field.id} field={field} />
                        <ResizeHandle corner="sw" fieldId={field.id} field={field} />
                        <ResizeHandle corner="se" fieldId={field.id} field={field} />
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Floating toolbar for selected field */}
              <AnimatePresence>
                {selectedField && !isDragging && !isResizing && (
                  <div className="absolute top-4 right-4 z-50">
                    <motion.div
                      ref={toolbarRef}
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.1 }}
                      className="flex items-center gap-1 p-1.5 rounded-lg bg-popover border border-border shadow-xl"
                    >
                      {/* Size indicator during resize */}
                      {resizeSize && (
                        <div className="px-2 py-1 text-xs text-muted-foreground font-mono">
                          {resizeSize.width}×{resizeSize.height}
                        </div>
                      )}
                      
                      {/* Duplicate */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={duplicateField}
                              className="p-2 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">Duplicate</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Apply to all pages */}
                      {(selectedField.type === "signature" || selectedField.type === "initials") && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={applyToAllPages}
                                className="p-2 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                              >
                                <Layers className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p className="text-xs">Apply to all pages</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Stamp/Image rotation */}
                      {(selectedField.type === "stamp" || selectedField.type === "image") && (
                        <>
                          <div className="w-px h-5 bg-border mx-1" />
                          <div className="flex items-center gap-2 px-2">
                            <RotateCw className="w-3.5 h-3.5 text-muted-foreground" />
                            <Slider
                              value={[selectedField.rotation || 0]}
                              onValueChange={([value]) => updateStampRotation(selectedField.id, value)}
                              min={0}
                              max={360}
                              step={1}
                              className="w-20"
                            />
                          </div>
                        </>
                      )}

                      <div className="w-px h-5 bg-border mx-1" />
                      
                      {/* Delete */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={deleteField}
                              className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Empty state prompt - slightly below center */}
              {currentPageFields.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-16">
                  <div className="text-center px-12">
                    <p className="text-sm text-muted-foreground/60">
                      Select a field from the left to place it on the document.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Stamp Picker Modal */}
        <StampPicker
          isOpen={showStampPicker}
          onClose={() => setShowStampPicker(false)}
          onSelectStamp={handleStampSelect}
        />
      </div>
    </div>
  );
};

export default SignPlacement;
