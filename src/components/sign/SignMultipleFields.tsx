import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
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
  User,
  Briefcase,
  MapPin,
  CheckSquare,
  Stamp,
  Image,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Move,
  Sparkles,
  Loader2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Recipient } from "./SignMultipleRecipients";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAIFieldSuggestion } from "@/hooks/useAIFieldSuggestion";
import SenderSignatureModal from "./SenderSignatureModal";
import { StampPicker } from "./StampPicker";

export type FieldType = "signature" | "initials" | "date" | "name" | "title" | "company" | "location" | "text" | "checkbox" | "stamp" | "image";

export interface DocumentField {
  id: string;
  type: FieldType;
  recipientId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  content?: string;
  imageData?: string;
  signatureData?: string; // For sender signature image data
  rotation?: number;
  opacity?: number;
  isAISuggested?: boolean;
  isSenderField?: boolean;
}

interface SignMultipleFieldsProps {
  file: File;
  recipients: Recipient[];
  initialFields?: DocumentField[];
  onComplete: (fields: DocumentField[]) => void;
  onBack: () => void;
}

// Field configuration matching SignPlacement
const FIELD_CONFIG: Record<FieldType, { 
  label: string; 
  description: string;
  icon: React.ComponentType<{ className?: string }>; 
  defaultSize: { w: number; h: number };
  isPrimary?: boolean;
}> = {
  signature: { 
    label: "Signature", 
    description: "Full signature",
    icon: PenTool, 
    defaultSize: { w: 200, h: 60 },
    isPrimary: true
  },
  initials: { 
    label: "Initials", 
    description: "First letters",
    icon: Type, 
    defaultSize: { w: 80, h: 50 },
    isPrimary: true
  },
  date: { 
    label: "Date", 
    description: "Signing date",
    icon: Calendar, 
    defaultSize: { w: 160, h: 40 },
    isPrimary: true
  },
  name: { 
    label: "Name", 
    description: "Full name",
    icon: User, 
    defaultSize: { w: 180, h: 40 }
  },
  title: { 
    label: "Title", 
    description: "Role or position",
    icon: Briefcase, 
    defaultSize: { w: 150, h: 40 }
  },
  company: { 
    label: "Company", 
    description: "Organization name",
    icon: Briefcase, 
    defaultSize: { w: 150, h: 40 }
  },
  location: { 
    label: "Location", 
    description: "City or address",
    icon: MapPin, 
    defaultSize: { w: 150, h: 40 }
  },
  text: { 
    label: "Add Text", 
    description: "Custom text field",
    icon: MessageSquare, 
    defaultSize: { w: 180, h: 60 }
  },
  checkbox: { 
    label: "Checkbox", 
    description: "Approval / confirmation",
    icon: CheckSquare, 
    defaultSize: { w: 40, h: 40 }
  },
  stamp: { 
    label: "Stamp", 
    description: "Company or saved stamps",
    icon: Stamp, 
    defaultSize: { w: 120, h: 120 }
  },
  image: { 
    label: "Image", 
    description: "Upload any image",
    icon: Image, 
    defaultSize: { w: 120, h: 120 }
  },
};

const PRIMARY_FIELDS: FieldType[] = ["signature", "initials", "date"];
const SECONDARY_FIELDS: FieldType[] = ["name", "title", "company", "location", "text", "checkbox"];

const TOTAL_PAGES = 3;

const SignMultipleFields = ({ file, recipients, initialFields = [], onComplete, onBack }: SignMultipleFieldsProps) => {
  const [fields, setFields] = useState<DocumentField[]>(initialFields);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [activeRecipient, setActiveRecipient] = useState<string>(recipients[0]?.id || "");
  const [activeFieldType, setActiveFieldType] = useState<FieldType>("signature");
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [history, setHistory] = useState<DocumentField[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const documentRef = useRef<HTMLDivElement>(null);
  
  // Sender signature modal state
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [pendingFieldData, setPendingFieldData] = useState<{ x: number; y: number; type: FieldType } | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  
  // Text field edit modal state
  const [textEditModalOpen, setTextEditModalOpen] = useState(false);
  const [textEditValue, setTextEditValue] = useState("");
  const [textEditFieldType, setTextEditFieldType] = useState<FieldType>("text");
  
  // Stamp picker modal state
  const [stampPickerOpen, setStampPickerOpen] = useState(false);
  
  // Image upload ref (for image fields only, not stamps)
  const imageUploadRef = useRef<HTMLInputElement>(null);

  // Separate sender from other recipients by role
  // Only Signers can have fields assigned - Approvers, Viewers, and CC cannot
  const sender = recipients.find(r => r.isSender);
  const signers = recipients.filter(r => r.role === "signer"); // Only signers, NOT approvers
  const recipientSigners = signers.filter(r => !r.isSender);
  
  // Check if active recipient can have fields assigned (is a signer or is sender)
  const activeRecipientData = recipients.find(r => r.id === activeRecipient);
  const isActiveRecipientAssignable = activeRecipientData?.role === "signer" || activeRecipientData?.isSender;
  
  // Get all non-signer recipients for reference
  const nonSigners = recipients.filter(r => r.role !== "signer" && !r.isSender);

  // AI Field Suggestion
  const { isScanning, suggestFieldsForMultiple } = useAIFieldSuggestion({ totalPages: TOTAL_PAGES });

  // Save to history
  const saveToHistory = useCallback((newFields: DocumentField[]) => {
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
      setSelectedField(null);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFields(history[historyIndex + 1]);
      setSelectedField(null);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      if ((e.key === "Delete" || e.key === "Backspace") && selectedField) {
        e.preventDefault();
        handleDeleteField(selectedField);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, selectedField]);

  // Page navigation
  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1));

  // Current page fields
  const currentPageFields = fields.filter(f => f.page === currentPage);

  const handleDocumentClick = useCallback((e: React.MouseEvent) => {
    if (!documentRef.current || isDragging || isResizing) return;
    
    // Prevent field placement for non-signers (approvers, viewers, CC)
    const clickedRecipient = recipients.find(r => r.id === activeRecipient);
    if (clickedRecipient && !clickedRecipient.isSender && clickedRecipient.role !== "signer") {
      // Non-signer selected - do nothing (disabled state shown in UI)
      return;
    }
    
    const rect = documentRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const defaultSize = FIELD_CONFIG[activeFieldType].defaultSize;
    const isSenderField = clickedRecipient?.isSender ?? false;

    const fieldX = Math.max(0, Math.min(x, 100 - (defaultSize.w / rect.width * 100)));
    const fieldY = Math.max(0, Math.min(y, 100 - (defaultSize.h / rect.height * 100)));

    // For sender fields, open appropriate modal first
    if (isSenderField) {
      setPendingFieldData({ x: fieldX, y: fieldY, type: activeFieldType });
      
      if (activeFieldType === "signature" || activeFieldType === "initials") {
        setSignatureModalOpen(true);
        return;
      } else if (activeFieldType === "name" || activeFieldType === "title" || activeFieldType === "company" || activeFieldType === "location" || activeFieldType === "text" || activeFieldType === "date") {
        // Set default value for text edit modal - only pre-fill date
        let defaultValue = "";
        if (activeFieldType === "date") {
          defaultValue = new Date().toLocaleDateString();
        }
        setTextEditValue(defaultValue);
        setTextEditFieldType(activeFieldType);
        setTextEditModalOpen(true);
        return;
      } else if (activeFieldType === "stamp") {
        setStampPickerOpen(true);
        return;
      } else if (activeFieldType === "image") {
        imageUploadRef.current?.click();
        return;
      } else if (activeFieldType === "checkbox") {
        // Checkbox can be placed directly
        const newField: DocumentField = {
          id: crypto.randomUUID(),
          type: activeFieldType,
          recipientId: activeRecipient,
          x: fieldX,
          y: fieldY,
          width: defaultSize.w,
          height: defaultSize.h,
          page: currentPage,
          required: false,
          content: "checked",
          isSenderField: true,
        };
        const newFields = [...fields, newField];
        setFields(newFields);
        saveToHistory(newFields);
        setSelectedField(newField.id);
        return;
      }
    }

    // For recipient fields, place directly as placeholders
    const newField: DocumentField = {
      id: crypto.randomUUID(),
      type: activeFieldType,
      recipientId: activeRecipient,
      x: fieldX,
      y: fieldY,
      width: defaultSize.w,
      height: defaultSize.h,
      page: currentPage,
      required: activeFieldType === "signature",
      isSenderField: false,
    };

    const newFields = [...fields, newField];
    setFields(newFields);
    saveToHistory(newFields);
    setSelectedField(newField.id);
  }, [activeRecipient, activeFieldType, isDragging, isResizing, fields, saveToHistory, currentPage, recipients, sender]);

  // Handle signature modal completion
  const handleSignatureComplete = useCallback((signatureData: string, type: "styled" | "drawn" | "uploaded") => {
    // If editing an existing field
    if (editingFieldId) {
      setFields(prev => prev.map(field => {
        if (field.id !== editingFieldId) return field;
        return { ...field, signatureData };
      }));
      setSignatureModalOpen(false);
      setEditingFieldId(null);
      return;
    }
    
    // Creating a new field
    if (!pendingFieldData || !documentRef.current) return;
    
    const defaultSize = FIELD_CONFIG[pendingFieldData.type].defaultSize;
    
    const newField: DocumentField = {
      id: crypto.randomUUID(),
      type: pendingFieldData.type,
      recipientId: activeRecipient,
      x: pendingFieldData.x,
      y: pendingFieldData.y,
      width: defaultSize.w,
      height: defaultSize.h,
      page: currentPage,
      required: pendingFieldData.type === "signature",
      signatureData,
      isSenderField: true,
    };

    const newFields = [...fields, newField];
    setFields(newFields);
    saveToHistory(newFields);
    setSelectedField(newField.id);
    setSignatureModalOpen(false);
    setPendingFieldData(null);
  }, [pendingFieldData, editingFieldId, activeRecipient, currentPage, fields, saveToHistory]);

  // Handle click on sender field to edit
  const handleSenderFieldClick = useCallback((field: DocumentField) => {
    if (!field.isSenderField) return;
    
    if (field.type === "signature" || field.type === "initials") {
      setEditingFieldId(field.id);
      setPendingFieldData({ x: field.x, y: field.y, type: field.type });
      setSignatureModalOpen(true);
    } else if (field.type === "name" || field.type === "title" || field.type === "company" || field.type === "location" || field.type === "text" || field.type === "date") {
      setEditingFieldId(field.id);
      setTextEditValue(field.content || "");
      setTextEditFieldType(field.type);
      setTextEditModalOpen(true);
    } else if (field.type === "stamp") {
      setEditingFieldId(field.id);
      setPendingFieldData({ x: field.x, y: field.y, type: field.type });
      setStampPickerOpen(true);
    } else if (field.type === "image") {
      setEditingFieldId(field.id);
      setPendingFieldData({ x: field.x, y: field.y, type: field.type });
      imageUploadRef.current?.click();
    } else if (field.type === "checkbox") {
      // Toggle checkbox
      setFields(prev => prev.map(f => 
        f.id === field.id ? { ...f, content: f.content === "checked" ? "" : "checked" } : f
      ));
    }
  }, []);

  // Handle stamp selection from StampPicker
  const handleStampSelect = useCallback((imageData: string, options?: { rotation?: number; opacity?: number }) => {
    if (editingFieldId) {
      // Editing existing stamp field
      setFields(prev => prev.map(field => 
        field.id === editingFieldId 
          ? { ...field, imageData, rotation: options?.rotation, opacity: options?.opacity } 
          : field
      ));
    } else if (pendingFieldData) {
      // Creating new stamp field
      const defaultSize = FIELD_CONFIG.stamp.defaultSize;
      const newField: DocumentField = {
        id: crypto.randomUUID(),
        type: "stamp",
        recipientId: activeRecipient,
        x: pendingFieldData.x,
        y: pendingFieldData.y,
        width: defaultSize.w,
        height: defaultSize.h,
        page: currentPage,
        required: false,
        imageData,
        rotation: options?.rotation,
        opacity: options?.opacity,
        isSenderField: true,
      };
      const newFields = [...fields, newField];
      setFields(newFields);
      saveToHistory(newFields);
      setSelectedField(newField.id);
    }
    setEditingFieldId(null);
    setPendingFieldData(null);
    setStampPickerOpen(false);
  }, [editingFieldId, pendingFieldData, activeRecipient, currentPage, fields, saveToHistory]);

  // Handle text field save
  const handleTextFieldSave = useCallback(() => {
    if (editingFieldId) {
      // Editing existing field
      setFields(prev => prev.map(field => 
        field.id === editingFieldId ? { ...field, content: textEditValue } : field
      ));
    } else if (pendingFieldData) {
      // Creating new field
      const defaultSize = FIELD_CONFIG[pendingFieldData.type].defaultSize;
      const newField: DocumentField = {
        id: crypto.randomUUID(),
        type: pendingFieldData.type,
        recipientId: activeRecipient,
        x: pendingFieldData.x,
        y: pendingFieldData.y,
        width: defaultSize.w,
        height: defaultSize.h,
        page: currentPage,
        required: false,
        content: textEditValue,
        isSenderField: true,
      };
      const newFields = [...fields, newField];
      setFields(newFields);
      saveToHistory(newFields);
      setSelectedField(newField.id);
    }
    setTextEditModalOpen(false);
    setEditingFieldId(null);
    setPendingFieldData(null);
    setTextEditValue("");
  }, [editingFieldId, pendingFieldData, textEditValue, activeRecipient, currentPage, fields, saveToHistory]);

  // Handle image/stamp upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (editingFieldId) {
        // Editing existing field
        setFields(prev => prev.map(field => 
          field.id === editingFieldId ? { ...field, imageData: ev.target?.result as string } : field
        ));
      } else if (pendingFieldData) {
        // Creating new field
        const defaultSize = FIELD_CONFIG[pendingFieldData.type].defaultSize;
        const newField: DocumentField = {
          id: crypto.randomUUID(),
          type: pendingFieldData.type,
          recipientId: activeRecipient,
          x: pendingFieldData.x,
          y: pendingFieldData.y,
          width: defaultSize.w,
          height: defaultSize.h,
          page: currentPage,
          required: false,
          imageData: ev.target?.result as string,
          isSenderField: true,
        };
        const newFields = [...fields, newField];
        setFields(newFields);
        saveToHistory(newFields);
        setSelectedField(newField.id);
      }
      setEditingFieldId(null);
      setPendingFieldData(null);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (imageUploadRef.current) {
      imageUploadRef.current.value = "";
    }
  }, [editingFieldId, pendingFieldData, activeRecipient, currentPage, fields, saveToHistory]);

  const handleFieldDrag = useCallback((id: string, deltaX: number, deltaY: number) => {
    if (!documentRef.current) return;
    
    const rect = documentRef.current.getBoundingClientRect();
    
    setFields(prev => prev.map(field => {
      if (field.id !== id) return field;
      
      const newX = field.x + (deltaX / rect.width) * 100;
      const newY = field.y + (deltaY / rect.height) * 100;
      
      return {
        ...field,
        x: Math.max(0, Math.min(newX, 100 - (field.width / rect.width * 100))),
        y: Math.max(0, Math.min(newY, 100 - (field.height / rect.height * 100))),
      };
    }));
  }, []);

  const handleFieldResize = useCallback((id: string, corner: "nw" | "ne" | "sw" | "se", deltaX: number, deltaY: number) => {
    if (!documentRef.current) return;
    
    const rect = documentRef.current.getBoundingClientRect();
    const deltaXPercent = (deltaX / rect.width) * 100;
    const deltaYPercent = (deltaY / rect.height) * 100;
    
    setFields(prev => prev.map(field => {
      if (field.id !== id) return field;
      
      let newWidth = field.width;
      let newHeight = field.height;
      let newX = field.x;
      let newY = field.y;
      
      switch (corner) {
        case "se": // Bottom-right: expand width/height
          newWidth = Math.max(40, field.width + deltaX);
          newHeight = Math.max(20, field.height + deltaY);
          break;
        case "sw": // Bottom-left: expand height, shrink width, move x
          newWidth = Math.max(40, field.width - deltaX);
          newHeight = Math.max(20, field.height + deltaY);
          newX = field.x + deltaXPercent;
          break;
        case "ne": // Top-right: expand width, shrink height, move y
          newWidth = Math.max(40, field.width + deltaX);
          newHeight = Math.max(20, field.height - deltaY);
          newY = field.y + deltaYPercent;
          break;
        case "nw": // Top-left: shrink both, move both
          newWidth = Math.max(40, field.width - deltaX);
          newHeight = Math.max(20, field.height - deltaY);
          newX = field.x + deltaXPercent;
          newY = field.y + deltaYPercent;
          break;
      }
      
      return {
        ...field,
        width: newWidth,
        height: newHeight,
        x: Math.max(0, Math.min(newX, 95)),
        y: Math.max(0, Math.min(newY, 95)),
      };
    }));
  }, []);

  // Update sender field content
  const handleUpdateFieldContent = useCallback((id: string, content: string) => {
    setFields(prev => prev.map(field => {
      if (field.id !== id) return field;
      return { ...field, content };
    }));
  }, []);

  const handleDeleteField = useCallback((id: string) => {
    const newFields = fields.filter(f => f.id !== id);
    setFields(newFields);
    saveToHistory(newFields);
    setSelectedField(null);
  }, [fields, saveToHistory]);

  // Note: In Multiple mode, stamp/image are just placeholders - no upload needed

  // Duplicate field
  const handleDuplicateField = useCallback((id: string) => {
    const field = fields.find(f => f.id === id);
    if (!field) return;

    const newField: DocumentField = {
      ...field,
      id: crypto.randomUUID(),
      x: Math.min(field.x + 3, 90),
      y: Math.min(field.y + 3, 90),
    };

    const newFields = [...fields, newField];
    setFields(newFields);
    saveToHistory(newFields);
    setSelectedField(newField.id);
  }, [fields, saveToHistory]);

  // Apply field to all pages
  const handleApplyToAllPages = useCallback((id: string) => {
    const field = fields.find(f => f.id === id);
    if (!field) return;

    const newFields = [...fields];
    for (let page = 1; page <= TOTAL_PAGES; page++) {
      if (page !== field.page) {
        // Check if similar field already exists on this page
        const exists = fields.some(f => 
          f.page === page && 
          f.type === field.type && 
          f.recipientId === field.recipientId &&
          Math.abs(f.x - field.x) < 5 && 
          Math.abs(f.y - field.y) < 5
        );
        if (!exists) {
          newFields.push({
            ...field,
            id: crypto.randomUUID(),
            page,
          });
        }
      }
    }
    
    setFields(newFields);
    saveToHistory(newFields);
  }, [fields, saveToHistory]);

  // AI Suggest Fields - Multiple mode
  const handleAISuggestFields = useCallback(async () => {
    const suggestions = await suggestFieldsForMultiple(signers.length);
    
    const newFields: DocumentField[] = suggestions.map((suggestion, index) => {
      // Assign to signers based on recipientHint or round-robin
      let recipientId = signers[0]?.id || activeRecipient;
      if (suggestion.recipientHint === "first" && signers[0]) {
        recipientId = signers[0].id;
      } else if (suggestion.recipientHint === "second" && signers[1]) {
        recipientId = signers[1].id;
      } else if (suggestion.recipientHint === "third" && signers[2]) {
        recipientId = signers[2].id;
      }
      
      return {
        id: `ai_field_${Date.now()}_${index}`,
        type: suggestion.type,
        recipientId,
        x: suggestion.x,
        y: suggestion.y,
        width: suggestion.width,
        height: suggestion.height,
        page: suggestion.page,
        required: suggestion.type === "signature",
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
  }, [suggestFieldsForMultiple, signers, activeRecipient, fields, saveToHistory]);

  // Clear AI suggested flag when field is modified
  const clearAISuggestedFlag = useCallback((fieldId: string) => {
    setFields(prev => prev.map(f => 
      f.id === fieldId ? { ...f, isAISuggested: false } : f
    ));
  }, []);

  const getRecipientById = (id: string) => recipients.find(r => r.id === id);

  // Check for missing required fields per signer - including sender if they're a signer
  // Sender fields with signatureData are considered complete and should not trigger warnings
  const getMissingFields = useCallback(() => {
    const missing: { recipient: Recipient; type: string; isSender?: boolean }[] = [];
    
    // Check sender if they're a signer - only if signature field exists but not completed
    if (sender && sender.role === "signer") {
      const senderSignatureFields = fields.filter(f => f.recipientId === sender.id && f.type === "signature");
      const hasSenderSignature = senderSignatureFields.some(f => f.signatureData);
      const hasSenderSignatureField = senderSignatureFields.length > 0;
      
      // Only show warning if sender has a signature field but hasn't completed it
      if (hasSenderSignatureField && !hasSenderSignature) {
        missing.push({ recipient: sender, type: "signature", isSender: true });
      }
      // If sender has no signature field at all, that's a missing field
      if (!hasSenderSignatureField) {
        missing.push({ recipient: sender, type: "signature", isSender: true });
      }
    }
    
    // Check non-sender signers for required fields
    signers.filter(s => !s.isSender).forEach(signer => {
      const hasSignature = fields.some(f => f.recipientId === signer.id && f.type === "signature");
      if (!hasSignature) {
        missing.push({ recipient: signer, type: "signature" });
      }
    });
    return missing;
  }, [fields, signers, sender]);

  const missingFields = getMissingFields();
  const canContinue = missingFields.length === 0;

  // Check if active recipient is the sender
  const isSenderActive = activeRecipientData?.isSender ?? false;

  const selectedFieldData = fields.find(f => f.id === selectedField);

  // Compact field button for cleaner UI
  const FieldButton = ({ type, onClick, compact = false }: { type: FieldType; onClick: () => void; compact?: boolean }) => {
    const config = FIELD_CONFIG[type];
    const IconComponent = config.icon;
    const isSignature = type === "signature";
    const isActive = activeFieldType === type;
    
    return (
      <button
        onClick={onClick}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-100 text-left
          ${isActive 
            ? "bg-primary/10 border border-primary/30" 
            : "hover:bg-muted/50 border border-transparent"
          }
        `}
      >
        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isSignature ? "bg-primary/10" : "bg-muted/30"}`}>
          <IconComponent className={`w-3.5 h-3.5 ${isSignature || isActive ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <span className={`text-sm ${isActive ? "text-primary font-medium" : "text-foreground"}`}>
          {config.label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex h-[calc(100vh-6rem)]">

      {/* Left Sidebar - Field Tools */}
      <motion.div
        className="w-72 border-r border-border/40 bg-card/20 flex flex-col"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Back */}
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* EDITING AS - Sender Section with Premium Experience */}
          {sender && (
            <div className="mb-5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-2">
                Editing as
              </p>
              <button
                onClick={() => setActiveRecipient(sender.id)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all
                  ${activeRecipient === sender.id 
                    ? "bg-card shadow-sm" 
                    : "hover:bg-muted/30"
                  }
                `}
                style={{
                  boxShadow: activeRecipient === sender.id 
                    ? `inset 0 0 0 2px ${sender.color}` 
                    : undefined,
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-primary"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="text-sm truncate text-foreground font-medium">
                  You (Sender)
                </span>
              </button>
              
            </div>
          )}

          {/* Divider between sender and recipients */}
          {sender && recipientSigners.length > 0 && (
            <div className="h-px bg-border/40 mb-5" />
          )}

          {/* FIELDS REQUIRED FROM - Only Signers Section */}
          {recipientSigners.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-2">
                Fields required from
              </p>
              {/* Scrollable list for unlimited recipients */}
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                {recipientSigners.map((recipient, idx) => (
                  <button
                    key={recipient.id}
                    onClick={() => setActiveRecipient(recipient.id)}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all
                      ${activeRecipient === recipient.id 
                        ? "bg-card shadow-sm" 
                        : "hover:bg-muted/30"
                      }
                    `}
                    style={{
                      boxShadow: activeRecipient === recipient.id 
                        ? `inset 0 0 0 2px ${recipient.color}` 
                        : undefined,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-white shrink-0"
                      style={{ backgroundColor: recipient.color }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-sm truncate text-foreground">
                        {recipient.fullName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium shrink-0">
                        Signer
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Recipient helper text */}
              <AnimatePresence>
                {!isSenderActive && activeRecipient && (
                  <motion.p 
                    className="text-xs text-muted-foreground/60 mt-2 leading-relaxed"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    You're placing fields this recipient must complete.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Non-Signers Info (Approvers, Viewers, CC) - De-emphasized & Collapsible */}
          {nonSigners.length > 0 && (
            <div className="mb-5 opacity-80">
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="w-full flex items-center justify-between py-1 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium hover:text-muted-foreground transition-colors group">
                  <span>Other recipients ({nonSigners.length})</span>
                  <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="space-y-1">
                    {nonSigners.map((recipient) => (
                      <div 
                        key={recipient.id}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-muted/10 cursor-default select-none"
                      >
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-medium text-white/50 shrink-0"
                          style={{ backgroundColor: recipient.color, opacity: 0.5 }}
                        >
                          {recipient.role === "approver" ? "A" : recipient.role === "viewer" ? "V" : "C"}
                        </div>
                        <span className="text-xs truncate text-muted-foreground/70">
                          {recipient.fullName}
                        </span>
                        <span className="text-[9px] px-1 py-0.5 rounded bg-muted/30 text-muted-foreground/50 font-medium shrink-0 capitalize ml-auto">
                          {recipient.role}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/40 mt-2 italic">
                    These recipients do not require fields.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-border/40 mb-5" />

          {/* Primary Fields */}
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-2">
              Signature
            </p>
            <div className="space-y-1">
              {PRIMARY_FIELDS.map((type) => (
                <FieldButton 
                  key={type} 
                  type={type} 
                  onClick={() => setActiveFieldType(type)} 
                />
              ))}
            </div>
          </div>

          {/* Text Fields - Collapsible */}
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="w-full flex items-center justify-between py-2 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium hover:text-muted-foreground transition-colors group">
              <span>Text Fields</span>
              <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
              {["name", "title", "company", "location", "text"].map((type) => (
                <FieldButton 
                  key={type} 
                  type={type as FieldType} 
                  onClick={() => setActiveFieldType(type as FieldType)} 
                />
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Controls - Collapsible */}
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="w-full flex items-center justify-between py-2 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium hover:text-muted-foreground transition-colors group">
              <span>Controls</span>
              <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
              <FieldButton 
                type="checkbox" 
                onClick={() => setActiveFieldType("checkbox")} 
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Assets - Collapsible */}
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="w-full flex items-center justify-between py-2 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium hover:text-muted-foreground transition-colors group">
              <span>Assets</span>
              <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
              {/* Stamp - placeholder only in Multiple mode */}
              <FieldButton 
                type="stamp" 
                onClick={() => setActiveFieldType("stamp")} 
              />

              {/* Image - placeholder only in Multiple mode */}
              <FieldButton 
                type="image" 
                onClick={() => setActiveFieldType("image")} 
              />
            </CollapsibleContent>
          </Collapsible>

        </div>

        {/* Bottom Section - Fixed */}
        <div className="p-5 border-t border-border/40 space-y-4">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
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
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                    Redo
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">⌘⇧Z</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Missing Fields Warning - Compressed */}
          <AnimatePresence>
            {missingFields.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 cursor-help"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1">Missing signature fields:</p>
                          <p className="text-xs text-muted-foreground">
                            {missingFields.map((item, i) => (
                              <span key={i}>
                                {i > 0 && " • "}
                                {item.isSender ? "You (Sender)" : item.recipient.fullName}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs">Each person listed needs a Signature field placed on the document.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </AnimatePresence>

          <Button
            onClick={() => onComplete(fields)}
            disabled={!canContinue}
            className="w-full"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>

      {/* Document Area */}
      <div className="flex-1 flex flex-col items-center bg-muted/20 p-8 overflow-auto">
        <motion.div
          className="relative flex items-center w-full max-w-3xl mb-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Page Navigation - Centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
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
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">→ Next page</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Spacer for layout */}
          <div className="flex-1" />

          {/* AI Suggest Fields Button - Right aligned */}
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
                      <span>Scanning document…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>AI suggest fields</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Automatically detect and place fields for each signer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>

        <motion.div
          className="max-w-3xl w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Document Preview */}
          <div
            ref={documentRef}
            onClick={handleDocumentClick}
            className="relative bg-white dark:bg-white rounded-xl border border-border/50 shadow-2xl shadow-black/5 aspect-[8.5/11] cursor-crosshair overflow-hidden"
          >
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

            {/* Fields - only show current page */}
            {currentPageFields.map((field) => {
              const recipient = getRecipientById(field.recipientId);
              const isSelected = selectedField === field.id;
              const isActiveRecipientField = field.recipientId === activeRecipient;
              const FieldIcon = FIELD_CONFIG[field.type].icon;

              return (
                <TooltipProvider key={field.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        className={`
                          absolute cursor-move select-none z-20
                          ${isSelected ? "z-30" : ""}
                          ${!isActiveRecipientField && !isSelected ? "opacity-40" : "opacity-100"}
                        `}
                        style={{
                          left: `${field.x}%`,
                          top: `${field.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: isActiveRecipientField || isSelected ? 1 : 0.4, scale: 1 }}
                        drag
                        dragMomentum={false}
                        onDragStart={() => {
                          setIsDragging(true);
                          setSelectedField(field.id);
                        }}
                        onDrag={(_, info) => {
                          handleFieldDrag(field.id, info.delta.x, info.delta.y);
                        }}
                        onDragEnd={() => {
                          setIsDragging(false);
                          saveToHistory(fields);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedField(field.id);
                          // If clicking on a sender field, open the appropriate editor
                          if (field.isSenderField) {
                            handleSenderFieldClick(field);
                          }
                        }}
                      >
                        {/* Recipient color indicator dot - shows checkmark for completed sender fields */}
                        {field.isSenderField && (field.signatureData || field.content || field.imageData) ? (
                          <div 
                            className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm z-10 flex items-center justify-center"
                          >
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        ) : (
                          <div 
                            className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10"
                            style={{ backgroundColor: recipient?.color }}
                          />
                        )}

                        {/* Field Box - matching SignPlacement px-4 py-2 padding */}
                        {/* Sender fields have distinct visual style - solid background with checkmark indicator */}
                        <div
                          className={`
                            relative px-4 py-2 rounded-lg transition-all duration-100
                            ${isSelected 
                              ? "ring-2 ring-primary bg-background shadow-lg" 
                              : field.isSenderField && (field.signatureData || field.content || field.imageData)
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500/40 shadow-md"
                                : "bg-background/95 border border-border/60 shadow-md hover:shadow-lg hover:border-border"
                            }
                            ${field.isAISuggested ? "ring-1 ring-violet-400/50" : ""}
                          `}
                          style={{ 
                            width: field.width,
                            height: field.height,
                            borderColor: isSelected ? undefined : (field.isSenderField && (field.signatureData || field.content || field.imageData)) ? undefined : recipient?.color,
                          }}
                        >
                          {/* AI Suggested label */}
                          {field.isAISuggested && (
                            <div className="absolute -top-5 left-0 flex items-center gap-1 text-[10px] text-violet-400 whitespace-nowrap">
                              <Sparkles className="w-2.5 h-2.5" />
                              AI suggested
                            </div>
                          )}
                          
                          {/* Subtle background halo for readability */}
                          <div className="absolute inset-0 bg-background rounded-lg" style={{ boxShadow: "0 0 20px 10px hsl(var(--background))" }} />
                          
                          <div 
                            className="relative z-10 flex items-center justify-center w-full h-full gap-1.5"
                            style={{ color: recipient?.color }}
                          >
                            {/* Sender fields show content/signature/image, recipient fields show placeholder */}
                            {field.isSenderField ? (
                              // Signature/Initials with signatureData
                              field.signatureData ? (
                                <img 
                                  src={field.signatureData} 
                                  alt={field.type === "initials" ? "Initials" : "Signature"}
                                  className="w-full h-full object-contain"
                                />
                              ) : field.imageData ? (
                                // Image or Stamp with imageData
                                <img 
                                  src={field.imageData} 
                                  alt={field.type === "stamp" ? "Stamp" : "Image"}
                                  className="w-full h-full object-contain"
                                />
                              ) : field.type === "checkbox" ? (
                                // Checkbox - show check if checked
                                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${field.content === "checked" ? "bg-primary border-primary" : "border-current"}`}>
                                  {field.content === "checked" && <Check className="w-3 h-3 text-primary-foreground" />}
                                </div>
                              ) : (
                                // Text fields
                                <span className="text-sm truncate font-medium">
                                  {field.content || FIELD_CONFIG[field.type].label}
                                </span>
                              )
                            ) : (
                              <>
                                <FieldIcon className="w-4 h-4 opacity-60" />
                                <span className="text-sm truncate opacity-80">
                                  {FIELD_CONFIG[field.type].label}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Selected Controls */}
                        <AnimatePresence>
                          {isSelected && (
                            <div
                              className="absolute left-1/2 z-30 pointer-events-auto"
                              style={{ 
                                top: "-52px",
                                transform: "translateX(-50%)" 
                              }}
                            >
                              <motion.div
                                className="flex items-center gap-1 bg-popover border border-border rounded-lg shadow-lg px-1 py-0.5"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                              >
                                {/* Signer name - show "You" for sender */}
                                <span 
                                  className="text-xs px-2 py-1 rounded"
                                  style={{ color: recipient?.color }}
                                >
                                  {recipient?.isSender ? "You" : recipient?.fullName?.split(" ")[0]}
                                </span>
                                
                                <div className="w-px h-4 bg-border" />
                                
                                {/* Duplicate button */}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDuplicateField(field.id);
                                        }}
                                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p className="text-xs">Duplicate</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                {/* Apply to all pages button */}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleApplyToAllPages(field.id);
                                        }}
                                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        <Layers className="w-3.5 h-3.5" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p className="text-xs">Apply to all pages</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <div className="w-px h-4 bg-border" />
                                
                                {/* Delete button */}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteField(field.id);
                                        }}
                                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p className="text-xs">Delete</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </motion.div>
                            </div>
                          )}
                        </AnimatePresence>


                        {/* Resize Handles - all 4 corners functional */}
                        {isSelected && (
                          <>
                            {/* Top-left resize handle */}
                            <motion.div
                              className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-nw-resize z-40"
                              drag
                              dragMomentum={false}
                              onDragStart={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                              }}
                              onDrag={(_, info) => {
                                handleFieldResize(field.id, "nw", info.delta.x, info.delta.y);
                              }}
                              onDragEnd={() => {
                                setIsResizing(false);
                                saveToHistory(fields);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            {/* Top-right resize handle */}
                            <motion.div
                              className="absolute -right-1.5 -top-1.5 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-ne-resize z-40"
                              drag
                              dragMomentum={false}
                              onDragStart={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                              }}
                              onDrag={(_, info) => {
                                handleFieldResize(field.id, "ne", info.delta.x, info.delta.y);
                              }}
                              onDragEnd={() => {
                                setIsResizing(false);
                                saveToHistory(fields);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            {/* Bottom-left resize handle */}
                            <motion.div
                              className="absolute -left-1.5 -bottom-1.5 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-sw-resize z-40"
                              drag
                              dragMomentum={false}
                              onDragStart={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                              }}
                              onDrag={(_, info) => {
                                handleFieldResize(field.id, "sw", info.delta.x, info.delta.y);
                              }}
                              onDragEnd={() => {
                                setIsResizing(false);
                                saveToHistory(fields);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            {/* Bottom-right resize handle */}
                            <motion.div
                              className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-se-resize z-40"
                              drag
                              dragMomentum={false}
                              onDragStart={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                              }}
                              onDrag={(_, info) => {
                                handleFieldResize(field.id, "se", info.delta.x, info.delta.y);
                              }}
                              onDragEnd={() => {
                                setIsResizing(false);
                                saveToHistory(fields);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </>
                        )}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Assigned to {recipient?.fullName}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}

            {/* Click hint */}
            {currentPageFields.length === 0 && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-center">
                  <Move className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground/50">
                    Click anywhere to place a field
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Sender Signature Modal */}
      <SenderSignatureModal
        isOpen={signatureModalOpen}
        onClose={() => {
          setSignatureModalOpen(false);
          setPendingFieldData(null);
          setEditingFieldId(null);
        }}
        onComplete={handleSignatureComplete}
        senderName={sender?.fullName || "You"}
        fieldType={pendingFieldData?.type === "signature" || pendingFieldData?.type === "initials" ? pendingFieldData.type : "signature"}
      />

      {/* Text Field Edit Modal */}
      <Dialog open={textEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setTextEditModalOpen(false);
          setEditingFieldId(null);
          setTextEditValue("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {textEditFieldType === "name" && "Name"}
              {textEditFieldType === "title" && "Title"}
              {textEditFieldType === "company" && "Company"}
              {textEditFieldType === "location" && "Location"}
              {textEditFieldType === "text" && "Text"}
              {textEditFieldType === "date" && "Date"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={textEditValue}
              onChange={(e) => setTextEditValue(e.target.value)}
              placeholder={
                textEditFieldType === "name" ? "Enter full name" :
                textEditFieldType === "title" ? "Enter role or position" :
                textEditFieldType === "company" ? "Enter company name" :
                textEditFieldType === "location" ? "Enter city or address" :
                textEditFieldType === "date" ? "Enter date" :
                "Enter text"
              }
              className="text-base"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTextFieldSave();
                }
              }}
            />
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setTextEditModalOpen(false);
                  setEditingFieldId(null);
                  setTextEditValue("");
                }}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleTextFieldSave}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden image upload input */}
      <input
        ref={imageUploadRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Stamp Picker Modal */}
      <StampPicker
        isOpen={stampPickerOpen}
        onClose={() => {
          setStampPickerOpen(false);
          setEditingFieldId(null);
          setPendingFieldData(null);
        }}
        onSelectStamp={handleStampSelect}
      />
    </div>
  );
};

export default SignMultipleFields;
