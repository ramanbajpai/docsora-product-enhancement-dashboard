import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Download, PenTool, Type, Calendar, 
  Check, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  XCircle, CheckCircle2, FileText, Edit3, Building2,
  MapPin, User, MessageSquare, CheckSquare, Image, Stamp,
  RotateCcw, Pencil, AlertTriangle, Undo2, Redo2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { SigningDeclineModal } from "@/components/signing-flow/SigningDeclineModal";
import { DeclineReason } from "@/components/signing-flow/types";
import { useSignerProfile } from "@/hooks/useSignerProfile";
import { DocumentPasswordGate } from "@/components/signing-flow/DocumentPasswordGate";
import { RecipientSigningConfirmation } from "@/components/signing-flow/RecipientSigningConfirmation";

// Extended field types to match sender-defined fields
type FieldType = "signature" | "initials" | "date" | "name" | "title" | "company" | "location" | "text" | "checkbox" | "stamp" | "image";

// Types for the signing workspace
interface SigningField {
  id: string;
  type: FieldType;
  label: string;
  page: number;
  position: { x: number; y: number; width: number; height: number };
  required: boolean;
  completed: boolean;
  value?: string;
  placeholder?: string;
}

// Get field icon based on type
const getFieldIcon = (type: FieldType) => {
  switch (type) {
    case "signature": return PenTool;
    case "initials": return Type;
    case "date": return Calendar;
    case "name": return User;
    case "title": return User;
    case "company": return Building2;
    case "location": return MapPin;
    case "text": return MessageSquare;
    case "checkbox": return CheckSquare;
    case "stamp": return Stamp;
    case "image": return Image;
    default: return FileText;
  }
};

// Get placeholder text for each field type (used in input fields)
const getFieldPlaceholder = (type: FieldType, label: string) => {
  switch (type) {
    case "signature": return "Click to add signature";
    case "initials": return "Click to add initials";
    case "date": return "Click to add date";
    case "name": return "Enter your full legal name";
    case "title": return "Enter your title";
    case "company": return "Company name";
    case "location": return "Location";
    case "text": return label.toLowerCase().includes("note") ? "Add a note…" : `Enter ${label.toLowerCase()}`;
    case "checkbox": return "Click to confirm";
    case "stamp": return "Click to upload stamp";
    case "image": return "Click to upload image";
    default: return "Click to complete";
  }
};

// Get modal subtext for each field type
const getFieldSubtext = (type: FieldType, label: string) => {
  switch (type) {
    case "name": return "Your full legal name as it appears on official documents";
    case "title": return "Your role or position";
    case "company": return "Legal company or organization name";
    case "location": return "City, state or country";
    case "text": return label.toLowerCase().includes("note") ? "Optional message for the recipient" : `Enter ${label.toLowerCase()}`;
    default: return getFieldPlaceholder(type, label);
  }
};

// Mock data with ALL field types for Vendor Agreement (default)
const defaultMockFields: SigningField[] = [
  // Page 1 - Primary signing fields
  {
    id: "sig-1",
    type: "signature",
    label: "Signature",
    page: 1,
    position: { x: 8, y: 62, width: 28, height: 8 },
    required: true,
    completed: false
  },
  {
    id: "name-1",
    type: "name",
    label: "Full Name",
    page: 1,
    position: { x: 8, y: 72, width: 28, height: 5 },
    required: true,
    completed: false
  },
  {
    id: "title-1",
    type: "title",
    label: "Title",
    page: 1,
    position: { x: 40, y: 72, width: 20, height: 5 },
    required: true,
    completed: false
  },
  {
    id: "date-1",
    type: "date",
    label: "Date",
    page: 1,
    position: { x: 65, y: 72, width: 18, height: 5 },
    required: true,
    completed: false
  },
  {
    id: "init-1",
    type: "initials",
    label: "Initials",
    page: 1,
    position: { x: 85, y: 62, width: 10, height: 6 },
    required: true,
    completed: false
  },
  // Page 2 - Company & Location
  {
    id: "company-1",
    type: "company",
    label: "Company",
    page: 2,
    position: { x: 8, y: 25, width: 35, height: 5 },
    required: true,
    completed: false
  },
  {
    id: "location-1",
    type: "location",
    label: "Location",
    page: 2,
    position: { x: 50, y: 25, width: 35, height: 5 },
    required: true,
    completed: false
  },
  {
    id: "text-1",
    type: "text",
    label: "Additional Notes",
    page: 2,
    position: { x: 8, y: 45, width: 50, height: 8 },
    required: true,
    completed: false
  },
  {
    id: "checkbox-1",
    type: "checkbox",
    label: "I agree to terms",
    page: 2,
    position: { x: 8, y: 58, width: 5, height: 4 },
    required: true,
    completed: false
  },
  {
    id: "init-2",
    type: "initials",
    label: "Initials",
    page: 2,
    position: { x: 85, y: 85, width: 10, height: 6 },
    required: true,
    completed: false
  },
  // Page 3 - Stamps & Images
  {
    id: "stamp-1",
    type: "stamp",
    label: "Company Stamp",
    page: 3,
    position: { x: 8, y: 30, width: 25, height: 12 },
    required: true,
    completed: false
  },
  {
    id: "image-1",
    type: "image",
    label: "ID Photo",
    page: 3,
    position: { x: 50, y: 30, width: 20, height: 12 },
    required: true,
    completed: false
  },
  {
    id: "sig-2",
    type: "signature",
    label: "Final Signature",
    page: 3,
    position: { x: 8, y: 70, width: 28, height: 8 },
    required: true,
    completed: false
  },
  {
    id: "date-2",
    type: "date",
    label: "Date",
    page: 3,
    position: { x: 40, y: 70, width: 18, height: 5 },
    required: true,
    completed: false
  }
];

// Enterprise Software License Agreement - simplified fields (signature + date only)
const enterpriseLicenseFields: SigningField[] = [
  {
    id: "sig-1",
    type: "signature",
    label: "Signature",
    page: 1,
    position: { x: 8, y: 62, width: 28, height: 8 },
    required: true,
    completed: false
  },
  {
    id: "date-1",
    type: "date",
    label: "Date",
    page: 1,
    position: { x: 40, y: 62, width: 18, height: 5 },
    required: true,
    completed: false
  }
];

// Function to get fields based on document ID
const getFieldsForDocument = (documentId: string): SigningField[] => {
  switch (documentId) {
    case "s2b": // Enterprise Software License Agreement
      return enterpriseLicenseFields;
    default:
      return defaultMockFields;
  }
};

export default function SignReceived() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mock document data - in real app would fetch from API
  const documentName = location.state?.documentName || "Employment Agreement";
  const senderName = location.state?.senderName || "Sarah Chen";
  const recipientEmail = location.state?.recipientEmail || "recipient@example.com";
  const dueDate = location.state?.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const fromSetup = location.state?.fromSetup || false;
  const isProtected = location.state?.isProtected ?? true; // Mock: assume protected for demo
  const passwordUnlocked = location.state?.passwordUnlocked || false;
  
  // Get signer profile
  const { profile, isLoading } = useSignerProfile(requestId || "", recipientEmail);

  // Password protection state - must be declared before useEffect that uses it
  // Track if password has been set and verified for this session
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(passwordUnlocked);
  // Determine password gate mode: "setup" if password never set, "entry" if returning
  const passwordStorageKey = `doc_pwd_set_${requestId}`;
  const hasPasswordBeenSet = typeof window !== 'undefined' && sessionStorage.getItem(passwordStorageKey) === 'true';
  const [showPasswordGate, setShowPasswordGate] = useState(
    isProtected && !passwordUnlocked
  );
  const passwordGateMode = hasPasswordBeenSet ? "entry" : "setup";

  // Always show the "Confirm your details & signature" step when entering this request
  // (only skip it in the same navigation when coming directly from setup).
  // Also skip redirect if password gate is showing
  useEffect(() => {
    // Only redirect to setup if:
    // 1. Not still loading
    // 2. Not coming directly from setup
    // 3. Either: not protected, OR password is unlocked
    const shouldShowSetup = !isLoading && !fromSetup && (!isProtected || isPasswordUnlocked);
    
    if (shouldShowSetup) {
      navigate(`/sign/received/${requestId}/setup`, {
        state: { documentName, senderName, recipientEmail, isProtected, passwordUnlocked: isPasswordUnlocked },
        replace: true,
      });
    }
  }, [isLoading, fromSetup, isPasswordUnlocked, isProtected, navigate, requestId, documentName, senderName, recipientEmail]);

  // State - get fields based on document ID
  const initialFields = getFieldsForDocument(requestId || "");
  const [fields, setFields] = useState<SigningField[]>(initialFields);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = initialFields.length > 0 ? Math.max(...initialFields.map(f => f.page)) : 1;
  const [zoom, setZoom] = useState(100);
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentFieldType, setCurrentFieldType] = useState<"signature" | "initials">("signature");
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showTextInputModal, setShowTextInputModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [currentUploadField, setCurrentUploadField] = useState<SigningField | null>(null);
  const [uploadPreviewImage, setUploadPreviewImage] = useState<string | null>(null);
  const [currentTextField, setCurrentTextField] = useState<SigningField | null>(null);
  const [textInputValue, setTextInputValue] = useState("");
  const [showSigningConfirmation, setShowSigningConfirmation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [actionHistory, setActionHistory] = useState<Array<{ fieldId: string; value: string }>>([]);
  const [redoHistory, setRedoHistory] = useState<Array<{ fieldId: string; value: string }>>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const requiredFields = fields.filter(f => f.required);
  const completedFields = requiredFields.filter(f => f.completed);
  const remainingFields = requiredFields.length - completedFields.length;
  const allFieldsComplete = remainingFields === 0;
  const currentField = requiredFields.find(f => !f.completed);
  
  // Track unsaved changes
  useEffect(() => {
    if (completedFields.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [completedFields.length]);
  
  // Find next incomplete field
  const goToNextField = useCallback(() => {
    const nextField = requiredFields.find((f, i) => !f.completed && i > activeFieldIndex);
    if (nextField) {
      const newIndex = requiredFields.findIndex(f => f.id === nextField.id);
      setActiveFieldIndex(newIndex);
      if (nextField.page !== currentPage) {
        setCurrentPage(nextField.page);
      }
    }
  }, [requiredFields, activeFieldIndex, currentPage]);
  
  // Undo last action
  const handleUndo = useCallback(() => {
    if (actionHistory.length === 0) return;
    const lastAction = actionHistory[actionHistory.length - 1];
    setActionHistory(prev => prev.slice(0, -1));
    setRedoHistory(prev => [...prev, lastAction]);
    setFields(prev => prev.map(f => 
      f.id === lastAction.fieldId ? { ...f, completed: false, value: undefined } : f
    ));
  }, [actionHistory]);
  
  // Redo last undone action
  const handleRedo = useCallback(() => {
    if (redoHistory.length === 0) return;
    const lastRedoAction = redoHistory[redoHistory.length - 1];
    setRedoHistory(prev => prev.slice(0, -1));
    setActionHistory(prev => [...prev, lastRedoAction]);
    setFields(prev => prev.map(f => 
      f.id === lastRedoAction.fieldId ? { ...f, completed: true, value: lastRedoAction.value } : f
    ));
  }, [redoHistory]);
  
  // Keyboard shortcuts for undo/redo
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
  }, [handleUndo, handleRedo]);
  
  // Clear a field (undo)
  const clearField = (fieldId: string) => {
    setFields(prev => prev.map(f => 
      f.id === fieldId ? { ...f, completed: false, value: undefined } : f
    ));
    toast.success("Field cleared");
  };
  
  // Handle field click - auto-fill from profile or allow edit
  const handleFieldClick = (field: SigningField) => {
    // Set active field index
    const fieldIndex = requiredFields.findIndex(f => f.id === field.id);
    if (fieldIndex >= 0) setActiveFieldIndex(fieldIndex);
    
    // For completed fields, allow re-editing
    if (field.completed) {
      if (field.type === "signature" || field.type === "initials") {
        setCurrentFieldType(field.type);
        setShowSignatureModal(true);
      } else if (field.type === "date") {
        const today = format(new Date(), "do MMMM yyyy");
        completeField(field.id, today);
      } else if (["name", "title", "company", "location", "text"].includes(field.type)) {
        setCurrentTextField(field);
        setTextInputValue(field.value || "");
        setShowTextInputModal(true);
      } else if (field.type === "checkbox") {
        // Toggle checkbox
        setFields(prev => prev.map(f => 
          f.id === field.id ? { ...f, completed: !f.completed, value: f.completed ? undefined : "checked" } : f
        ));
      } else if (field.type === "stamp" || field.type === "image") {
        setCurrentUploadField(field);
        setShowImageUploadModal(true);
      }
      return;
    }
    
    // Handle incomplete fields
    if (field.type === "signature" && profile?.signatureData) {
      completeField(field.id, profile.signatureData);
    } else if (field.type === "initials" && profile?.initials) {
      completeField(field.id, profile.initials);
    } else if (field.type === "signature" || field.type === "initials") {
      setCurrentFieldType(field.type);
      setShowSignatureModal(true);
    } else if (field.type === "date") {
      const today = format(new Date(), "do MMMM yyyy");
      completeField(field.id, today);
    } else if (["name", "title", "company", "location", "text"].includes(field.type)) {
      // Open text input modal
      setCurrentTextField(field);
      // Pre-fill from profile if available
      if (field.type === "name" && profile?.fullName) {
        setTextInputValue(profile.fullName);
      } else if (field.type === "title" && profile?.title) {
        setTextInputValue(profile.title);
      } else if (field.type === "company" && profile?.company) {
        setTextInputValue(profile.company);
      } else if (field.type === "location" && profile?.location) {
        setTextInputValue(profile.location);
      } else {
        setTextInputValue("");
      }
      setShowTextInputModal(true);
    } else if (field.type === "checkbox") {
      completeField(field.id, "checked");
    } else if (field.type === "stamp" || field.type === "image") {
      setCurrentUploadField(field);
      setShowImageUploadModal(true);
    }
  };
  
  // Handle image/stamp upload - now just shows preview
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUploadPreviewImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Apply the uploaded image/stamp to the field
  const handleApplyUpload = () => {
    if (currentUploadField && uploadPreviewImage) {
      completeField(currentUploadField.id, uploadPreviewImage);
      setShowImageUploadModal(false);
      setCurrentUploadField(null);
      setUploadPreviewImage(null);
    }
  };
  
  // Clear the upload preview and reset input
  const handleClearUploadPreview = () => {
    setUploadPreviewImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };
  
  // Handle text input completion
  const handleTextInputComplete = () => {
    if (currentTextField && textInputValue.trim()) {
      completeField(currentTextField.id, textInputValue.trim());
      setShowTextInputModal(false);
      setCurrentTextField(null);
      setTextInputValue("");
    }
  };
  
  // Navigate to edit signature
  const handleEditSignature = () => {
    navigate(`/sign/received/${requestId}/setup`, {
      state: { documentName, senderName, recipientEmail }
    });
  };
  
  // Complete a field
  const completeField = (fieldId: string, value: string) => {
    // Add to action history for undo, clear redo history
    setActionHistory(prev => [...prev, { fieldId, value }]);
    setRedoHistory([]);
    
    setFields(prev => prev.map(f => 
      f.id === fieldId ? { ...f, completed: true, value } : f
    ));
    
    // Auto-advance to next field
    setTimeout(() => {
      goToNextField();
    }, 300);
  };
  
  // Handle signature complete
  const handleSignatureComplete = (signature: string) => {
    const field = requiredFields[activeFieldIndex];
    if (field) {
      completeField(field.id, signature);
    }
    setShowSignatureModal(false);
  };
  
  // Handle back navigation with confirmation
  const handleBackClick = () => {
    if (hasUnsavedChanges && completedFields.length > 0) {
      setShowLeaveModal(true);
    } else {
      handleBack();
    }
  };
  
  const handleBack = () => {
    navigate("/track", { 
      state: { 
        activeTab: "sign",
        subTab: "received",
        preserveScroll: true 
      }
    });
  };
  
  // Handle signing completion (called after OTP verification)
  const handleSigningComplete = useCallback(() => {
    // This is called when the user has completed the entire signing flow
    // In a real app, this would submit the signed document to the server
    console.log("Document signing completed");
  }, []);
  
  // Handle view document after signing
  const handleViewDocument = useCallback(() => {
    // In a real app, this would open the signed document
    navigate(`/document/${requestId}`);
  }, [navigate, requestId]);
  
  // Get signature data for confirmation screen
  const getSignatureForConfirmation = useCallback(() => {
    const signatureField = fields.find(f => f.type === "signature" && f.completed);
    return signatureField?.value;
  }, [fields]);
  
  // Handle decline
  const handleDecline = async (reason: DeclineReason, note?: string, clauseReference?: string) => {
    toast.success("Document declined. Sender has been notified.");
    setShowDeclineModal(false);
    handleBack();
  };
  
  // Show all complete toast
  useEffect(() => {
    if (allFieldsComplete && completedFields.length > 0) {
      toast.success("All required fields complete — ready to submit", {
        duration: 4000
      });
    }
  }, [allFieldsComplete, completedFields.length]);
  
  // Handle password gate success
  const handlePasswordSuccess = useCallback(() => {
    // Mark password as set in session storage for re-entry flow
    if (passwordGateMode === "setup") {
      sessionStorage.setItem(passwordStorageKey, 'true');
    }
    setIsPasswordUnlocked(true);
    setShowPasswordGate(false);
  }, [passwordGateMode, passwordStorageKey]);

  // Handle password gate cancel - return to track
  const handlePasswordCancel = useCallback(() => {
    navigate("/track", { 
      state: { 
        activeTab: "sign",
        subTab: "received",
        preserveScroll: true 
      }
    });
  }, [navigate]);

  // Password gate - show BEFORE anything else for protected documents
  // Always use "entry" mode for recipients - they're entering a password set by the sender
  if (showPasswordGate && isProtected) {
    return (
      <DocumentPasswordGate
        documentId={requestId || ""}
        documentName={documentName}
        mode="entry"
        recipientEmail={recipientEmail}
        onSuccess={handlePasswordSuccess}
        onCancel={handlePasswordCancel}
      />
    );
  }
  
  // Loading state while checking profile
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  
  
  // Signing confirmation flow - replaces old success screen
  if (showSigningConfirmation) {
    const signatureData = getSignatureForConfirmation();
    const nameField = fields.find(f => f.type === "name" && f.completed);
    const signerName = nameField?.value || profile?.fullName || "Signer";
    
    return (
      <RecipientSigningConfirmation
        documentName={documentName}
        signaturePreview={signatureData?.startsWith("data:image") ? signatureData : undefined}
        signatureFont={signatureData && !signatureData.startsWith("data:image") ? signatureData : "'Dancing Script', cursive"}
        fullName={signerName}
        email={recipientEmail}
        isAuthenticated={false} // Mock - in real app, check if user is logged in
        onComplete={handleSigningComplete}
        onBack={() => setShowSigningConfirmation(false)}
        onViewDocument={handleViewDocument}
        onBackToTrack={handleBack}
      />
    );
  }
  
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* ========== STICKY HEADER ========== */}
      <header className="flex-shrink-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Back button with confirmation */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={handleBackClick}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          {/* Center: Title + Document info */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h1 className="text-sm font-medium text-foreground">Review & Sign</h1>
            <p className="text-xs text-muted-foreground">
              {documentName} • From {senderName}
            </p>
          </div>
          
          {/* Right: CTA only - no redundant progress */}
          <div className="flex items-center gap-3">
            <Button 
              size="sm"
              disabled={!allFieldsComplete}
              onClick={() => setShowSigningConfirmation(true)}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              Finish & Submit
            </Button>
          </div>
        </div>
      </header>
      
      {/* ========== MAIN LAYOUT ========== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========== LEFT SIDEBAR - Field Navigation ========== */}
        <aside className="w-72 flex-shrink-0 border-r border-border bg-background hidden lg:flex lg:flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
              {/* Required fields list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">Your required fields</h3>
                  <Badge variant={allFieldsComplete ? "default" : "secondary"} className="text-xs">
                    {remainingFields} left
                  </Badge>
                </div>
                
                <div className="space-y-1.5">
                  {requiredFields.map((field, i) => {
                    const FieldIcon = getFieldIcon(field.type);
                    const isNext = currentField?.id === field.id;
                    
                    return (
                      <motion.div
                        key={field.id}
                        className="relative group"
                      >
                        <motion.button
                          onClick={() => {
                            setActiveFieldIndex(i);
                            setCurrentPage(field.page);
                            setTimeout(() => {
                              const fieldElement = document.getElementById(`field-${field.id}`);
                              fieldElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 100);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all",
                            field.completed 
                              ? "bg-emerald-50 dark:bg-emerald-950/20" 
                              : isNext
                                ? "bg-primary/10 ring-1 ring-primary/30"
                                : "hover:bg-muted/50"
                          )}
                          animate={field.completed ? { scale: [1, 1.02, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div 
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                              field.completed 
                                ? "bg-emerald-100 dark:bg-emerald-900/50" 
                                : "bg-muted"
                            )}
                            animate={field.completed ? { scale: [0.8, 1.1, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {field.completed ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <FieldIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium capitalize",
                              field.completed ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"
                            )}>
                              {field.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Page {field.page}
                            </p>
                          </div>
                          {/* Clear button for completed fields */}
                          {field.completed && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearField(field.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted/50 transition-all"
                              title="Clear field"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          )}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              {/* Progress bar */}
              <div className="py-2">
                <Progress 
                  value={(completedFields.length / requiredFields.length) * 100} 
                  className="h-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1.5 text-center">
                  {completedFields.length} of {requiredFields.length} completed
                </p>
              </div>
              
              {/* Next field button - improved behavior */}
              {!allFieldsComplete && currentField && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => {
                    setCurrentPage(currentField.page);
                    setTimeout(() => {
                      const fieldElement = document.getElementById(`field-${currentField.id}`);
                      fieldElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                >
                  Go to next field
                </Button>
              )}
              
              {/* Edit signature option */}
              {profile && (
                <button
                  onClick={handleEditSignature}
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit signature
                </button>
              )}
              
            </div>
          </div>
          
          {/* Decline action - always visible at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-border/50">
            <button
              onClick={() => setShowDeclineModal(true)}
              className="flex items-center gap-2 text-sm text-destructive/80 hover:text-destructive transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Decline to sign
            </button>
          </div>
        </aside>
        
        {/* PDF Viewer - Center */}
        <main className="flex-1 flex flex-col overflow-hidden bg-muted/30">
          {/* Guidance bar - sticky at top of content area */}
          <div className="flex-shrink-0 px-4 sm:px-6 pt-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between bg-background rounded-lg border border-border/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {requiredFields.map((field, i) => (
                      <div
                        key={field.id}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          field.completed 
                            ? "bg-emerald-500" 
                            : !requiredFields.slice(0, i).some(f => !f.completed)
                              ? "bg-primary animate-pulse" 
                              : "bg-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{remainingFields}</span>
                    {" "}field{remainingFields !== 1 ? "s" : ""} remaining
                  </span>
                </div>
                {/* Primary instruction - clear and human */}
                <p className="text-sm font-medium text-foreground hidden sm:block">
                  Start by clicking a highlighted field to complete it.
                </p>
              </div>
            </div>
          </div>
          
          {/* Scrollable document area */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">
            {/* Document canvas */}
            <div 
              className="max-w-4xl mx-auto"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            >
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                <div className="relative aspect-[8.5/11] min-h-[700px] p-8 sm:p-12">
                  {/* Mock document content */}
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
                  
                  {/* Signature fields for current page */}
                  {fields
                    .filter(f => f.page === currentPage)
                    .map((field, index) => {
                      const FieldIcon = getFieldIcon(field.type);
                      const isFirstIncomplete = currentField?.id === field.id && index === 0;
                      
                      // Render the actual field value
                      const renderFieldValue = () => {
                        if (!field.value) return null;
                        
                        switch (field.type) {
                          case "signature":
                          case "initials":
                            // Check if it's a data URL (drawn/uploaded) or styled text
                            if (field.value.startsWith("data:")) {
                              return (
                                <img 
                                  src={field.value} 
                                  alt={field.type} 
                                  className="max-w-full max-h-full object-contain"
                                />
                              );
                            }
                            // Styled text signature/initials
                            // Parse font index from signature value (format: "fontIndex::text")
                            const parseSignatureValue = (value: string) => {
                              if (value.includes("::")) {
                                const [fontIdx, text] = value.split("::");
                                const fontIndex = parseInt(fontIdx, 10);
                                const fonts = [
                                  "'Dancing Script', cursive",
                                  "'Great Vibes', cursive", 
                                  "'Caveat', cursive"
                                ];
                                return { text, fontFamily: fonts[fontIndex] || fonts[0] };
                              }
                              return { text: value, fontFamily: "'Dancing Script', cursive" };
                            };
                            const { text: sigText, fontFamily: sigFont } = parseSignatureValue(field.value || "");
                            
                            if (field.type === "initials") {
                              return (
                                <span className="text-base font-semibold tracking-wider">
                                  {field.value}
                                </span>
                              );
                            }
                            
                            // Use SignatureText for auto-scaling signatures
                            return (
                              <SignatureText
                                text={sigText}
                                fontFamily={sigFont}
                                maxWidth={field.position.width * 1.5}
                                baseSize={20}
                                minSize={12}
                              />
                            );
                          case "date":
                          case "name":
                          case "title":
                          case "company":
                          case "location":
                          case "text":
                            return (
                              <span className="text-sm font-medium text-foreground truncate px-1">
                                {field.value}
                              </span>
                            );
                          case "checkbox":
                            return (
                              <Check className="w-5 h-5 text-foreground" />
                            );
                          case "stamp":
                          case "image":
                            return (
                              <img 
                                src={field.value} 
                                alt={field.type} 
                                className="max-w-full max-h-full object-contain"
                              />
                            );
                          default:
                            return <span className="text-sm">{field.value}</span>;
                        }
                      };
                      
                      return (
                        <motion.div
                          key={field.id}
                          id={`field-${field.id}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1,
                            // Subtle pulse for first field on load
                            boxShadow: isFirstIncomplete && !field.completed
                              ? ["0 0 0 0 rgba(var(--primary), 0)", "0 0 0 8px rgba(var(--primary), 0.15)", "0 0 0 0 rgba(var(--primary), 0)"]
                              : "none"
                          }}
                          transition={{ 
                            duration: 0.3,
                            boxShadow: isFirstIncomplete ? { duration: 1.5, repeat: 1, ease: "easeInOut" } : {}
                          }}
                          className={cn(
                            "absolute cursor-pointer transition-all group",
                            field.completed 
                              ? "hover:ring-2 hover:ring-primary/30" 
                              : "hover:ring-2 hover:ring-primary hover:shadow-lg hover:shadow-primary/20"
                          )}
                          style={{
                            left: `${field.position.x}%`,
                            top: `${field.position.y}%`,
                            width: `${field.position.width}%`,
                            height: `${field.position.height}%`
                          }}
                          onClick={() => handleFieldClick(field)}
                        >
                          <div
                            className={cn(
                              "w-full h-full rounded-md border-2 transition-all relative overflow-hidden",
                              field.completed
                                ? "bg-white dark:bg-zinc-800 border-emerald-400/50 dark:border-emerald-600/50 border-solid shadow-sm flex items-center justify-center"
                                : currentField?.id === field.id
                                  ? "bg-primary/10 border-primary border-dashed"
                                  : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/50 dark:border-amber-700/50 border-dashed group-hover:border-primary group-hover:bg-primary/5"
                            )}
                          >
                            {field.completed ? (
                              <>
                                {/* Render actual value */}
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center justify-center w-full h-full p-1"
                                >
                                  {renderFieldValue()}
                                </motion.div>
                                
                                {/* Subtle completion indicator - corner checkmark */}
                                <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                                
                                {/* Edit/Clear hints on hover */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                  <span className="text-[10px] text-muted-foreground bg-background/90 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                    <Pencil className="w-2.5 h-2.5" />
                                    Edit
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full min-h-[44px] gap-0.5">
                                <FieldIcon className="w-4 h-4 text-primary flex-shrink-0" />
                                {/* Inline helper text - hide for checkbox */}
                                {field.type !== "checkbox" && (
                                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors text-center px-1 whitespace-nowrap leading-none">
                                    {getFieldPlaceholder(field.type, field.label)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
          
          {/* ========== STICKY BOTTOM CONTROLS ========== */}
          <div className="flex-shrink-0 px-4 sm:px-6 pb-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between bg-background rounded-xl border border-border/50 px-3 py-2 shadow-sm">
                {/* LEFT: Undo/Redo */}
                <div className="flex items-center gap-0.5 min-w-[88px]">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    onClick={handleUndo}
                    disabled={actionHistory.length === 0}
                    title="Undo (⌘Z)"
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    onClick={handleRedo}
                    disabled={redoHistory.length === 0}
                    title="Redo (⌘⇧Z)"
                  >
                    <Redo2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* CENTER: Page Navigation */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums min-w-[80px] text-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* RIGHT: Zoom Controls */}
                <div className="flex items-center gap-0.5 min-w-[88px] justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    disabled={zoom <= 50}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums w-12 text-center">{zoom}%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setZoom(Math.min(150, zoom + 25))}
                    disabled={zoom >= 150}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* ========== SIGNATURE MODAL ========== */}
      <AnimatePresence>
        {showSignatureModal && (
          <SignatureModal
            fieldType={currentFieldType}
            onComplete={handleSignatureComplete}
            onCancel={() => setShowSignatureModal(false)}
          />
        )}
      </AnimatePresence>
      
      {/* ========== DECLINE MODAL ========== */}
      <SigningDeclineModal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        onDecline={handleDecline}
      />
      
      {/* ========== LEAVE CONFIRMATION MODAL ========== */}
      <Dialog open={showLeaveModal} onOpenChange={setShowLeaveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <DialogTitle>Leave signing?</DialogTitle>
            </div>
            <DialogDescription className="text-left">
              You haven't finished signing this document. Any completed fields will be lost and you'll need to re-enter them.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLeaveModal(false)}>
              Stay & continue signing
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setShowLeaveModal(false);
                handleBack();
              }}
            >
              Leave & discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* ========== TEXT INPUT MODAL ========== */}
      <Dialog open={showTextInputModal} onOpenChange={setShowTextInputModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentTextField?.label || "Enter value"}
            </DialogTitle>
            <DialogDescription>
              {getFieldSubtext(currentTextField?.type || "text", currentTextField?.label || "")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-2">
            {/* Use textarea for notes, input for other text fields */}
            {currentTextField?.label?.toLowerCase().includes("note") ? (
              <>
                <textarea
                  value={textInputValue}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setTextInputValue(e.target.value);
                    }
                  }}
                  placeholder={getFieldPlaceholder(currentTextField?.type || "text", currentTextField?.label || "")}
                  className="w-full min-h-[120px] max-h-[240px] px-3 py-2 text-base border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                  autoFocus
                />
                <div className="flex justify-end">
                  <span className={`text-xs ${
                    textInputValue.length >= 500 
                      ? "text-destructive" 
                      : textInputValue.length >= 400 
                        ? "text-amber-500" 
                        : "text-muted-foreground/50"
                  }`}>
                    {textInputValue.length}/500
                  </span>
                </div>
              </>
            ) : (
              <Input
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                placeholder={getFieldPlaceholder(currentTextField?.type || "text", currentTextField?.label || "")}
                className="text-base"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && textInputValue.trim()) {
                    handleTextInputComplete();
                  }
                }}
              />
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowTextInputModal(false);
              setCurrentTextField(null);
              setTextInputValue("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleTextInputComplete}
              disabled={!textInputValue.trim()}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* ========== IMAGE/STAMP UPLOAD MODAL ========== */}
      <Dialog open={showImageUploadModal} onOpenChange={(open) => {
        if (!open) {
          setUploadPreviewImage(null);
          setCurrentUploadField(null);
        }
        setShowImageUploadModal(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentUploadField?.type === "stamp" ? "Upload Company Stamp" : "Upload Image"}
            </DialogTitle>
            <DialogDescription>
              {uploadPreviewImage 
                ? "Review your upload before applying"
                : currentUploadField?.type === "stamp" 
                  ? "Upload your company stamp or seal image"
                  : "Upload an image file (JPG, PNG)"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {uploadPreviewImage ? (
              // Preview state
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4 bg-muted/30 flex items-center justify-center min-h-[140px]">
                  <img 
                    src={uploadPreviewImage} 
                    alt="Upload preview" 
                    className="max-h-[120px] max-w-full object-contain"
                  />
                </div>
              </div>
            ) : (
              // Upload state
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => imageInputRef.current?.click()}
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  {currentUploadField?.type === "stamp" ? (
                    <Stamp className="w-10 h-10 text-muted-foreground" />
                  ) : (
                    <Image className="w-10 h-10 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              if (uploadPreviewImage) {
                handleClearUploadPreview();
              } else {
                setShowImageUploadModal(false);
                setCurrentUploadField(null);
                setUploadPreviewImage(null);
              }
            }}>
              {uploadPreviewImage ? "Replace" : "Cancel"}
            </Button>
            <Button 
              onClick={handleApplyUpload}
              disabled={!uploadPreviewImage}
            >
              {currentUploadField?.type === "stamp" ? "Apply stamp" : "Apply image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========== AUTO-SCALING SIGNATURE TEXT COMPONENT ==========
interface SignatureTextProps {
  text: string;
  fontFamily: string;
  maxWidth: number;
  baseSize?: number;
  minSize?: number;
  className?: string;
}

function SignatureText({ text, fontFamily, maxWidth, baseSize = 20, minSize = 10, className = "" }: SignatureTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(baseSize);

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return;
    
    // Reset to base size first
    let currentSize = baseSize;
    textRef.current.style.fontSize = `${currentSize}px`;
    
    // Measure and scale down if needed
    const containerWidth = maxWidth;
    let textWidth = textRef.current.scrollWidth;
    
    while (textWidth > containerWidth && currentSize > minSize) {
      currentSize -= 1;
      textRef.current.style.fontSize = `${currentSize}px`;
      textWidth = textRef.current.scrollWidth;
    }
    
    setFontSize(currentSize);
  }, [text, fontFamily, maxWidth, baseSize, minSize]);

  return (
    <div ref={containerRef} className={`flex items-center justify-center ${className}`}>
      <span
        ref={textRef}
        className="text-foreground whitespace-nowrap"
        style={{ 
          fontFamily, 
          fontSize: `${fontSize}px`,
          lineHeight: 1.2
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ========== SIGNATURE MODAL COMPONENT ==========
interface SignatureModalProps {
  fieldType: "signature" | "initials";
  onComplete: (signature: string) => void;
  onCancel: () => void;
}

// Signature font styles
const SIGNATURE_FONTS = [
  { name: "Dancing Script", style: "'Dancing Script', cursive" },
  { name: "Great Vibes", style: "'Great Vibes', cursive" },
  { name: "Caveat", style: "'Caveat', cursive" },
];

function SignatureModal({ fieldType, onComplete, onCancel }: SignatureModalProps) {
  const [mode, setMode] = useState<"draw" | "type" | "upload">("type");
  const [typedValue, setTypedValue] = useState("");
  const [selectedFontIndex, setSelectedFontIndex] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [drawHistory, setDrawHistory] = useState<ImageData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);

  const isInitials = fieldType === "initials";
  const title = isInitials ? "Add your initials" : "Add your signature";
  const placeholder = isInitials ? "AB" : "Enter your name";

  // Initialize canvas with baseline
  useEffect(() => {
    if (mode === "draw" && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawBaseline(ctx, canvasRef.current.width, canvasRef.current.height);
        setHasDrawn(false);
        setDrawHistory([]);
      }
    }
  }, [mode]);

  const drawBaseline = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, height - 25);
    ctx.lineTo(width - 20, height - 25);
    ctx.stroke();
    ctx.restore();
  };

  const saveCanvasState = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setDrawHistory(prev => [...prev, imageData]);
    }
  };

  const handleUndo = () => {
    if (!canvasRef.current || drawHistory.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const newHistory = [...drawHistory];
    newHistory.pop();
    setDrawHistory(newHistory);

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawBaseline(ctx, canvasRef.current.width, canvasRef.current.height);

    if (newHistory.length > 0) {
      ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
      setHasDrawn(true);
    } else {
      setHasDrawn(false);
    }
  };

  const handleClear = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawBaseline(ctx, canvasRef.current.width, canvasRef.current.height);
      setHasDrawn(false);
      setDrawHistory([]);
    }
  };

  // Keyboard shortcut for undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && mode === "draw") {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, drawHistory]);

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
      // For signatures, encode font index with value using a delimiter
      const value = isInitials ? typedValue : `${selectedFontIndex}::${typedValue}`;
      onComplete(value);
    } else if (mode === "draw" && canvasRef.current && hasDrawn) {
      onComplete(canvasRef.current.toDataURL());
    } else if (mode === "upload" && uploadedImage) {
      onComplete(uploadedImage);
    }
  };

  const canApply = () => {
    if (mode === "type") return typedValue.trim().length > 0;
    if (mode === "draw") return hasDrawn;
    if (mode === "upload") return !!uploadedImage;
    return false;
  };

  // Handle typed value - auto-capitalize for initials
  const handleTypedValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = isInitials ? e.target.value.toUpperCase() : e.target.value;
    setTypedValue(value);
  };

  // Only show upload for signatures, not initials
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
            <Pencil className="w-4 h-4 mr-1.5" />
            Draw
          </Button>
          {showUpload && (
            <Button
              variant={mode === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("upload")}
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Upload
            </Button>
          )}
        </div>

        {/* Input area */}
        {mode === "type" ? (
          <div className="mb-6 space-y-4">
            <input
              type="text"
              value={typedValue}
              onChange={handleTypedValueChange}
              placeholder={placeholder}
              className={`w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                isInitials 
                  ? "text-lg font-semibold tracking-wider uppercase text-center" 
                  : "text-base"
              }`}
              autoFocus
              maxLength={isInitials ? 3 : 100}
            />
            {/* Signature style picker - only for signatures */}
            {typedValue && !isInitials && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Choose a style</p>
                <div className="grid grid-cols-3 gap-2">
                  {SIGNATURE_FONTS.map((font, index) => (
                    <button
                      key={font.name}
                      onClick={() => setSelectedFontIndex(index)}
                      className={`p-3 rounded-lg border transition-all overflow-hidden ${
                        selectedFontIndex === index
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <SignatureText 
                        text={typedValue} 
                        fontFamily={font.style}
                        maxWidth={100}
                        baseSize={18}
                        minSize={10}
                      />
                    </button>
                  ))}
                </div>
                {typedValue.length > 20 && (
                  <p className="text-[10px] text-muted-foreground/60 text-center">
                    Your name has been resized to fit.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : mode === "draw" ? (
          <div className="mb-6">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={360}
                height={isInitials ? 100 : 120}
                className="w-full border border-border rounded-lg bg-white cursor-crosshair"
                style={{ height: isInitials ? "100px" : "120px" }}
                onMouseDown={(e) => {
                  saveCanvasState();
                  isDrawing.current = true;
                  const ctx = canvasRef.current?.getContext("2d");
                  if (ctx) {
                    const rect = canvasRef.current!.getBoundingClientRect();
                    ctx.beginPath();
                    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                    ctx.strokeStyle = "#000";
                    ctx.lineWidth = 2;
                    ctx.lineCap = "round";
                    ctx.lineJoin = "round";
                  }
                }}
                onMouseMove={handleDraw}
                onMouseUp={() => {
                  isDrawing.current = false;
                  setHasDrawn(true);
                }}
                onMouseLeave={() => {
                  isDrawing.current = false;
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {isInitials ? "Draw your initials above the line" : "Draw your signature above the line"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={drawHistory.length === 0}
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Undo (⌘Z)"
                >
                  <Undo2 className="w-3 h-3" />
                  Undo
                </button>
                <span className="text-muted-foreground/30">·</span>
                <button
                  onClick={handleClear}
                  disabled={!hasDrawn}
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
            </div>
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
                <FileText className={`w-5 h-5 ${isDragging ? "text-primary" : "text-[hsl(220,10%,50%)]"}`} />
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
