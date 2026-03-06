import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { 
  ChevronLeft, 
  Plus, 
  GripVertical, 
  X, 
  Pen, 
  CheckCircle2, 
  Eye, 
  Mail,
  Lock,
  User,
  AlertTriangle,
  Users2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

export type RecipientRole = "signer" | "approver" | "viewer" | "cc";

export interface Recipient {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: RecipientRole;
  color: string;
  isSender?: boolean;
  canDelegate?: boolean;
}

export interface InvoiceSettings {
  amount: string;
  currency: string;
  billTo: string;
  description: string;
  invoiceDate: string;
  dueDate: string;
}

export interface PostSignActions {
  sendInvoice: boolean;
  invoiceSettings?: InvoiceSettings;
}

// Field type for checking existing assignments
interface ExistingField {
  recipientId: string;
}

interface SignMultipleRecipientsProps {
  file: File;
  initialRecipients?: Recipient[];
  initialEnforceOrder?: boolean;
  existingFields?: ExistingField[];
  onComplete: (recipients: Recipient[], options: { enforceOrder: boolean; postSignActions: PostSignActions }) => void;
  onBack: () => void;
}

const RECIPIENT_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(280, 67%, 58%)",
  "hsl(24, 95%, 53%)",
  "hsl(340, 82%, 52%)",
  "hsl(173, 80%, 40%)",
];

const ROLE_CONFIG: Record<RecipientRole, { label: string; icon: React.ReactNode; description: string }> = {
  signer: { 
    label: "Signer", 
    icon: <Pen className="w-3.5 h-3.5" />,
    description: "Must sign the document"
  },
  approver: { 
    label: "Approver", 
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    description: "Reviews before signing begins"
  },
  viewer: { 
    label: "Viewer", 
    icon: <Eye className="w-3.5 h-3.5" />,
    description: "Can view only"
  },
  cc: { 
    label: "CC", 
    icon: <Mail className="w-3.5 h-3.5" />,
    description: "Receives a copy"
  },
};

const SENDER_COLOR = "hsl(220, 15%, 50%)";

const SignMultipleRecipients = ({ 
  file, 
  initialRecipients = [], 
  initialEnforceOrder = false,
  existingFields = [],
  onComplete, 
  onBack 
}: SignMultipleRecipientsProps) => {
  // Initialize from props for non-destructive navigation
  const [recipients, setRecipients] = useState<Recipient[]>(() => 
    initialRecipients.filter(r => !r.isSender)
  );
  const [includeSender, setIncludeSender] = useState(() => 
    initialRecipients.some(r => r.isSender)
  );
  const [showAddForm, setShowAddForm] = useState(() => initialRecipients.length === 0);
  const [newRecipient, setNewRecipient] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "signer" as RecipientRole,
    canDelegate: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [enforceOrder, setEnforceOrder] = useState(initialEnforceOrder);
  const [editingRecipient, setEditingRecipient] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ fullName: string; email: string; role: RecipientRole; password: string; canDelegate: boolean }>({ 
    fullName: "", 
    email: "", 
    role: "signer",
    password: "",
    canDelegate: false
  });
  const editRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [postSignActions] = useState<PostSignActions>({
    sendInvoice: false,
  });
  
  // Confirmation dialog for removing recipients with fields
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [recipientToRemove, setRecipientToRemove] = useState<string | null>(null);
  const [fieldsToRemoveCount, setFieldsToRemoveCount] = useState(0);

  const senderRecipient: Recipient = {
    id: "sender",
    fullName: "You (Sender)",
    email: "you@sender.local",
    role: "signer",
    color: SENDER_COLOR,
    isSender: true,
  };

  const allRecipients = includeSender ? [senderRecipient, ...recipients] : recipients;

  const getNextColor = useCallback(() => {
    return RECIPIENT_COLORS[recipients.length % RECIPIENT_COLORS.length];
  }, [recipients.length]);

  const handleAddRecipient = useCallback(() => {
    if (!newRecipient.fullName.trim() || !newRecipient.email.trim()) return;

    const canDelegateRole = newRecipient.role === "signer" || newRecipient.role === "approver";
    const recipient: Recipient = {
      id: crypto.randomUUID(),
      fullName: newRecipient.fullName.trim(),
      email: newRecipient.email.trim(),
      password: newRecipient.password || undefined,
      role: newRecipient.role,
      color: getNextColor(),
      canDelegate: canDelegateRole ? newRecipient.canDelegate : undefined,
    };

    setRecipients(prev => [...prev, recipient]);
    setNewRecipient({ fullName: "", email: "", password: "", role: "signer", canDelegate: false });
    setShowPassword(false);
    setShowAddForm(false);
  }, [newRecipient, getNextColor]);

  const handleRemoveRecipient = useCallback((id: string) => {
    // Check if this recipient has existing fields
    const fieldsForRecipient = existingFields.filter(f => f.recipientId === id);
    
    if (fieldsForRecipient.length > 0) {
      // Show confirmation dialog
      setRecipientToRemove(id);
      setFieldsToRemoveCount(fieldsForRecipient.length);
      setRemoveConfirmOpen(true);
    } else {
      // No fields, remove directly
      setRecipients(prev => prev.filter(r => r.id !== id));
    }
  }, [existingFields]);

  const confirmRemoveRecipient = useCallback(() => {
    if (recipientToRemove) {
      setRecipients(prev => prev.filter(r => r.id !== recipientToRemove));
    }
    setRemoveConfirmOpen(false);
    setRecipientToRemove(null);
    setFieldsToRemoveCount(0);
  }, [recipientToRemove]);

  const startEditing = useCallback((recipient: Recipient) => {
    setEditingRecipient(recipient.id);
    setEditValues({ 
      fullName: recipient.fullName, 
      email: recipient.email,
      role: recipient.role,
      password: recipient.password || "",
      canDelegate: recipient.canDelegate || false
    });
  }, []);

  const saveEditing = useCallback(() => {
    if (!editingRecipient || !editValues.fullName.trim() || !editValues.email.trim()) return;
    
    const canDelegateRole = editValues.role === "signer" || editValues.role === "approver";
    setRecipients(prev => 
      prev.map(r => r.id === editingRecipient 
        ? { 
            ...r, 
            fullName: editValues.fullName.trim(), 
            email: editValues.email.trim(),
            role: editValues.role,
            password: editValues.password || undefined,
            canDelegate: canDelegateRole ? editValues.canDelegate : undefined
          } 
        : r
      )
    );
    setEditingRecipient(null);
    setEditValues({ fullName: "", email: "", role: "signer", password: "", canDelegate: false });
  }, [editingRecipient, editValues]);

  const cancelEditing = useCallback(() => {
    setEditingRecipient(null);
    setEditValues({ fullName: "", email: "", role: "signer", password: "", canDelegate: false });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editRef.current && !editRef.current.contains(event.target as Node) && editingRecipient) {
        saveEditing();
      }
    };

    if (editingRecipient) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingRecipient, saveEditing]);

  const canContinue = allRecipients.length > 0 && allRecipients.some(r => r.role === "signer");

  return (
    <div className="flex items-start justify-center min-h-[calc(100vh-6rem)] px-8 py-12">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Back */}
        <motion.button
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          onClick={onBack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Header with Signing Order Toggle */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start justify-between gap-8">
            <div className="min-w-0">
              <h1 className="text-3xl font-light text-foreground tracking-tight">
                Add recipients
              </h1>
              <motion.p 
                key={enforceOrder ? "seq" : "par"}
                className="text-muted-foreground text-sm mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {enforceOrder 
                  ? "Signers receive the document one at a time, in order."
                  : "All signers receive the document at the same time."
                }
              </motion.p>
            </div>

            {/* Segmented Control */}
            <div className="shrink-0">
              <div className="flex items-center p-1 bg-muted/50 rounded-lg">
                <button
                  onClick={() => setEnforceOrder(false)}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${!enforceOrder 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  Parallel
                </button>
                <button
                  onClick={() => setEnforceOrder(true)}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${enforceOrder 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  Sequential
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sender Card - Separate Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div 
            className={`
              relative rounded-2xl p-5 transition-all cursor-pointer
              ${includeSender 
                ? "bg-card border border-primary/20 shadow-sm" 
                : "bg-muted/30 border border-transparent hover:bg-muted/50"
              }
            `}
            onClick={() => setIncludeSender(!includeSender)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${includeSender 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-medium transition-colors ${includeSender ? "text-foreground" : "text-muted-foreground"}`}>
                    You (Sender)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You'll sign this document before it's sent.
                  </p>
                </div>
              </div>
              <Switch
                checked={includeSender}
                onCheckedChange={setIncludeSender}
                onClick={(e) => e.stopPropagation()}
                className="scale-110"
              />
            </div>
            
            {includeSender && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 ml-14 flex items-center gap-2 text-xs text-primary"
              >
                <Pen className="w-3 h-3" />
                <span>Signer</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Recipients List */}
        <div className="space-y-3 mb-6">
          <Reorder.Group
            axis="y"
            values={recipients}
            onReorder={setRecipients}
            className="space-y-3"
          >
            <AnimatePresence>
              {recipients.map((recipient, index) => (
                <Reorder.Item
                  key={recipient.id}
                  value={recipient}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  dragListener={enforceOrder && editingRecipient !== recipient.id}
                  onDragStart={() => { isDraggingRef.current = true; }}
                  onDragEnd={() => { 
                    setTimeout(() => { isDraggingRef.current = false; }, 100);
                  }}
                >
                  {editingRecipient === recipient.id ? (
                    /* Expanded Edit State */
                    <motion.div
                      ref={editRef}
                      className="bg-card border border-border rounded-2xl p-6 shadow-lg"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-5">
                        {/* Name & Email */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Full name</label>
                            <Input
                              value={editValues.fullName}
                              onChange={(e) => setEditValues(prev => ({ ...prev, fullName: e.target.value }))}
                              placeholder="John Smith"
                              className="bg-background"
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Email</label>
                            <Input
                              value={editValues.email}
                              onChange={(e) => setEditValues(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="john@company.com"
                              type="email"
                              className="bg-background"
                            />
                          </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-3 block">Role</label>
                          <div className="flex flex-wrap gap-2">
                            <TooltipProvider delayDuration={0}>
                              {(Object.keys(ROLE_CONFIG) as RecipientRole[]).map((role) => (
                                <Tooltip key={role}>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => setEditValues(prev => ({ ...prev, role }))}
                                      className={`
                                        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                                        ${editValues.role === role
                                          ? "bg-primary text-primary-foreground shadow-sm"
                                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }
                                      `}
                                    >
                                      {ROLE_CONFIG[role].icon}
                                      {ROLE_CONFIG[role].label}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p className="text-xs">{ROLE_CONFIG[role].description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </TooltipProvider>
                          </div>
                        </div>

                        {/* Delegation Toggle - Only for Signer/Approver */}
                        <AnimatePresence>
                          {(editValues.role === "signer" || editValues.role === "approver") && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pt-3 border-t border-border/50"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Users2 className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">Allow delegation</span>
                                </div>
                                <Switch
                                  checked={editValues.canDelegate}
                                  onCheckedChange={(checked) => setEditValues(prev => ({ 
                                    ...prev, 
                                    canDelegate: checked 
                                  }))}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 ml-6">
                                {editValues.canDelegate 
                                  ? "This recipient can delegate their action to another person if needed."
                                  : "This recipient must complete the action themselves."
                                }
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Password Protection */}
                        <div className="pt-3 border-t border-border/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">Password protection</span>
                            </div>
                            <Switch
                              checked={!!editValues.password}
                              onCheckedChange={(checked) => setEditValues(prev => ({ 
                                ...prev, 
                                password: checked ? prev.password || "" : "" 
                              }))}
                            />
                          </div>
                          
                          <AnimatePresence>
                            {editValues.password !== "" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-3"
                              >
                                <Input
                                  type="password"
                                  value={editValues.password}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, password: e.target.value }))}
                                  placeholder="Enter access password"
                                  className="bg-background"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveRecipient(recipient.id);
                            }}
                            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                          >
                            Remove
                          </button>
                          <Button
                            onClick={saveEditing}
                            size="sm"
                            className="px-6"
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* Collapsed View */
                    <motion.div
                      onClick={() => {
                        if (isDraggingRef.current) return;
                        startEditing(recipient);
                      }}
                      className={`group relative bg-card border border-border/50 rounded-2xl p-4 cursor-pointer transition-all hover:border-border hover:shadow-sm ${enforceOrder ? "cursor-grab active:cursor-grabbing" : ""}`}
                      whileHover={{ y: -1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Drag Handle */}
                        {enforceOrder && (
                          <div 
                            className="text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                        )}

                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
                          style={{ backgroundColor: recipient.color }}
                        >
                          {enforceOrder ? (includeSender ? index + 2 : index + 1) : recipient.fullName.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {recipient.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {recipient.email}
                          </p>
                        </div>

                        {/* Role Badge */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-sm text-muted-foreground">
                            {ROLE_CONFIG[recipient.role].icon}
                            <span>{ROLE_CONFIG[recipient.role].label}</span>
                          </div>
                          
                          {/* Delegation Badge */}
                          {recipient.canDelegate && (recipient.role === "signer" || recipient.role === "approver") && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-xs text-primary">
                              <Users2 className="w-3 h-3" />
                              <span>Delegation allowed</span>
                            </div>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRecipient(recipient.id);
                          }}
                          className="p-2 rounded-full text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {recipient.password && (
                        <div className="flex items-center gap-1.5 mt-3 ml-13 text-xs text-muted-foreground">
                          <Lock className="w-3 h-3" />
                          Password protected
                        </div>
                      )}
                    </motion.div>
                  )}
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>

        {/* Drag hint */}
        {recipients.length > 1 && enforceOrder && (
          <motion.p
            className="text-xs text-muted-foreground/60 mb-6 text-center flex items-center justify-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <GripVertical className="w-3 h-3" />
            Drag to reorder
          </motion.p>
        )}

        {/* Add Recipient Form */}
        <AnimatePresence mode="wait">
          {showAddForm ? (
            <motion.div
              key="form"
              className="bg-muted/20 border border-border/40 rounded-2xl p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-5">
                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Full name
                    </label>
                    <Input
                      value={newRecipient.fullName}
                      onChange={(e) => setNewRecipient(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="John Smith"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={newRecipient.email}
                      onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@company.com"
                      className="bg-background"
                    />
                  </div>
                </div>

                {/* Row 2: Role Selection */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-3 block">
                    Role
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <TooltipProvider delayDuration={0}>
                      {(Object.keys(ROLE_CONFIG) as RecipientRole[]).map((role) => (
                        <Tooltip key={role}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setNewRecipient(prev => ({ ...prev, role }))}
                              className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                                ${newRecipient.role === role
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                }
                              `}
                            >
                              {ROLE_CONFIG[role].icon}
                              {ROLE_CONFIG[role].label}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">{ROLE_CONFIG[role].description}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </div>

                {/* Delegation Toggle - Only for Signer/Approver */}
                <AnimatePresence>
                  {(newRecipient.role === "signer" || newRecipient.role === "approver") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Users2 className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="text-sm">Allow delegation</span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {newRecipient.canDelegate 
                                ? "This recipient can delegate their action to another person if needed."
                                : "This recipient must complete the action themselves."
                              }
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={newRecipient.canDelegate}
                          onCheckedChange={(checked) => setNewRecipient(prev => ({ 
                            ...prev, 
                            canDelegate: checked 
                          }))}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password (optional) */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {showPassword ? "Remove password" : "Add password protection"}
                  </button>
                  
                  <AnimatePresence>
                    {showPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3"
                      >
                        <Input
                          type="password"
                          value={newRecipient.password}
                          onChange={(e) => setNewRecipient(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter access password"
                          className="bg-background"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={handleAddRecipient}
                    disabled={!newRecipient.fullName.trim() || !newRecipient.email.trim()}
                  >
                    Add recipient
                  </Button>
                  {recipients.length > 0 && (
                    <Button
                      variant="ghost"
                      onClick={() => setShowAddForm(false)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="add-button"
              onClick={() => setShowAddForm(true)}
              className="w-full p-4 border border-dashed border-border/60 rounded-2xl text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/20 transition-all flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ y: -2 }}
            >
              <Plus className="w-4 h-4" />
              Add another recipient
            </motion.button>
          )}
        </AnimatePresence>

        {/* Continue Section */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Confirmation text */}
          {canContinue && (
            <p className="text-xs text-muted-foreground text-center mb-4">
              Recipients will be able to complete only the fields assigned to them.
            </p>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => onComplete(allRecipients, { enforceOrder, postSignActions })}
              disabled={!canContinue}
              size="lg"
              className="px-8"
            >
              Continue to field placement
            </Button>
          </div>

          {/* Validation hint */}
          {allRecipients.length > 0 && !canContinue && (
            <motion.p
              className="text-sm text-amber-500 mt-3 text-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              At least one recipient must be a signer
            </motion.p>
          )}
        </motion.div>

        {/* File info */}
        <motion.p
          className="text-center text-xs text-muted-foreground/40 mt-10 truncate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {file.name}
        </motion.p>
      </motion.div>

      {/* Confirmation dialog for removing recipients with fields */}
      <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Remove recipient?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This recipient has {fieldsToRemoveCount} assigned {fieldsToRemoveCount === 1 ? 'field' : 'fields'} on the document. 
              Removing them will also remove their assigned fields.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveRecipient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove recipient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


export default SignMultipleRecipients;
