import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Send, 
  Mail, 
  FileText, 
  Users, 
  Shield, 
  Clock,
  Pen,
  CheckCircle2,
  Eye,
  ChevronDown,
  Check,
  FileSignature,
  Calendar,
  Type,
  Pencil,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Recipient } from "./SignMultipleRecipients";
import { DocumentField } from "./SignMultipleFields";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SignMultipleSendProps {
  file: File;
  recipients: Recipient[];
  fields: DocumentField[];
  enforceOrder: boolean;
  onSend: (message: string, subject: string) => void;
  onBack: () => void;
  onEditOrder: () => void;
}

const ROLE_ICONS = {
  signer: <Pen className="w-3.5 h-3.5" />,
  approver: <CheckCircle2 className="w-3.5 h-3.5" />,
  viewer: <Eye className="w-3.5 h-3.5" />,
  cc: <Mail className="w-3.5 h-3.5" />,
};

const FIELD_TYPE_LABELS: Record<string, { label: string; icon: typeof Pen }> = {
  signature: { label: "Signature", icon: Pen },
  initials: { label: "Initials", icon: Type },
  date: { label: "Date", icon: Calendar },
  name: { label: "Name", icon: Type },
  title: { label: "Title", icon: Type },
  company: { label: "Company", icon: Type },
  location: { label: "Location", icon: Type },
  text: { label: "Text", icon: Type },
  checkbox: { label: "Checkbox", icon: CheckCircle2 },
  stamp: { label: "Stamp", icon: FileSignature },
  image: { label: "Image", icon: FileSignature },
};

const SignMultipleSend = ({ file, recipients, fields, enforceOrder, onSend, onBack, onEditOrder }: SignMultipleSendProps) => {
  const [subject, setSubject] = useState(`Please sign: ${file.name.replace(/\.[^/.]+$/, "")}`);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [expandedSigner, setExpandedSigner] = useState<string | null>(null);

  const handleSend = () => {
    setIsSending(true);
    // Simulate send delay
    setTimeout(() => {
      onSend(message, subject);
    }, 1500);
  };

  // Separate signers from non-signers
  const signers = recipients.filter(r => r.role === "signer");
  const nonSigners = recipients.filter(r => r.role !== "signer");
  const sender = recipients.find(r => r.isSender);

  // Get fields for a specific recipient
  const getFieldsForRecipient = (recipientId: string) => {
    return fields.filter(f => f.recipientId === recipientId);
  };

  // Get field summary for a recipient
  const getFieldSummary = (recipientId: string) => {
    const recipientFields = getFieldsForRecipient(recipientId);
    const fieldTypes = recipientFields.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const pages = [...new Set(recipientFields.map(f => f.page))].sort((a, b) => a - b);
    
    return { fieldTypes, pages, total: recipientFields.length };
  };

  // Check if sender has completed their signature
  const senderIsSigner = sender && sender.role === "signer";
  const senderFields = sender ? getFieldsForRecipient(sender.id) : [];
  const senderSignatureFields = senderFields.filter(f => f.type === "signature");
  const senderHasSigned = senderSignatureFields.some(f => f.signatureData);
  
  // Check readiness conditions
  const allSignersHaveFields = signers.every(s => getFieldsForRecipient(s.id).length > 0);
  // If sender is a signer, they've already confirmed through the legal step to reach this page
  const senderSignatureComplete = !senderIsSigner || true;
  
  const canSend = allSignersHaveFields && senderSignatureComplete && subject.trim();

  const toggleExpanded = (signerId: string) => {
    setExpandedSigner(expandedSigner === signerId ? null : signerId);
  };

  return (
    <div className="flex items-start justify-center min-h-0 px-8 py-12 overflow-auto">
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
          Back to fields
        </motion.button>

        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-light text-foreground tracking-tight mb-2">
            Review & send
          </h1>
          <p className="text-muted-foreground">
            Confirm signers and send for signatures
          </p>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          className="bg-card/50 border border-border/60 rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Document</p>
                <p className="font-medium text-foreground truncate max-w-[120px]">
                  {file.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signers</p>
                <p className="font-medium text-foreground">
                  {signers.length} {signers.length === 1 ? "person" : "people"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Pen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fields</p>
                <p className="font-medium text-foreground">
                  {fields.length} {fields.length === 1 ? "field" : "fields"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Signing Order - Locked with Edit Link */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">
              {enforceOrder ? "Signing order" : "Signers"}
            </h3>
            <button
              onClick={onEditOrder}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Pencil className="w-3 h-3" />
              {enforceOrder ? "Edit signing order" : "Edit signers"}
            </button>
          </div>
          
          <div className="space-y-2">
            {signers.map((signer, index) => {
              const summary = getFieldSummary(signer.id);
              const isSender = signer.isSender;
              const hasSigned = isSender && senderHasSigned;
              const isExpanded = expandedSigner === signer.id;
              
              // Get initials from name
              const getInitials = (name: string) => {
                return name
                  .split(" ")
                  .map(part => part[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
              };
              
              return (
                <div key={signer.id}>
                  <button
                    onClick={() => toggleExpanded(signer.id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl transition-all
                      ${hasSigned ? "bg-muted/20 opacity-70" : "bg-muted/30 hover:bg-muted/40"}
                    `}
                  >
                    {/* Order number (sequential) or initials (parallel) or check (signed) */}
                    {hasSigned ? (
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                    ) : enforceOrder ? (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
                        style={{ backgroundColor: signer.color }}
                      >
                        {index + 1}
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white shrink-0"
                        style={{ backgroundColor: signer.color }}
                      >
                        {getInitials(signer.fullName)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${hasSigned ? "text-muted-foreground" : "text-foreground"}`}>
                          {isSender ? "You (Sender)" : signer.fullName}
                        </p>
                        <span className="text-xs text-muted-foreground/60">
                          • {summary.total} {summary.total === 1 ? "field" : "fields"}
                        </span>
                      </div>
                      {!isSender && (
                        <p className="text-xs text-muted-foreground truncate">
                          {signer.email}
                        </p>
                      )}
                    </div>
                    
                    {/* Status pill */}
                    <div className={`
                      flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg shrink-0
                      ${hasSigned 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-muted/50 text-muted-foreground"
                      }
                    `}>
                      {hasSigned ? (
                        <>
                          <Check className="w-3 h-3" />
                          Signed
                        </>
                      ) : (
                        <>
                          {ROLE_ICONS.signer}
                          Signer
                        </>
                      )}
                    </div>
                    
                    {/* Expand indicator */}
                    <ChevronDown 
                      className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} 
                    />
                  </button>
                  
                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-9 mt-2 p-3 bg-muted/15 rounded-lg border border-border/30 space-y-3">
                          {/* Field types */}
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-1.5">
                              Required fields
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(summary.fieldTypes).map(([type, count]) => {
                                const config = FIELD_TYPE_LABELS[type] || { label: type, icon: Type };
                                const Icon = config.icon;
                                return (
                                  <span
                                    key={type}
                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-background/60 rounded-md text-foreground"
                                  >
                                    <Icon className="w-3 h-3 text-muted-foreground" />
                                    {config.label}
                                    {count > 1 && <span className="text-muted-foreground">×{count}</span>}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Pages */}
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-1">
                              Pages
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {summary.pages.length === 1 
                                ? `Page ${summary.pages[0]}`
                                : `Pages ${summary.pages.join(", ")}`
                              }
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          
          {/* Non-signers (collapsed) */}
          {nonSigners.length > 0 && (
            <div className="mt-4 opacity-60">
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="w-full flex items-center justify-between py-1 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium hover:text-muted-foreground transition-colors group">
                  <span>Other recipients ({nonSigners.length})</span>
                  <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="space-y-1.5">
                    {nonSigners.map((recipient) => (
                      <div 
                        key={recipient.id}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/20"
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-white/70 shrink-0"
                          style={{ backgroundColor: recipient.color, opacity: 0.6 }}
                        >
                          {recipient.role === "approver" ? "A" : recipient.role === "viewer" ? "V" : "C"}
                        </div>
                        <span className="text-sm truncate text-muted-foreground">
                          {recipient.fullName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground/70 font-medium shrink-0 capitalize ml-auto">
                          {recipient.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </motion.div>

        {/* Email Customization */}
        <motion.div
          className="space-y-4 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Email subject
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-background/50"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Message (optional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              className="bg-background/50 min-h-[100px] resize-none"
            />
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <Shield className="w-3.5 h-3.5" />
            SOC 2 compliant
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <Clock className="w-3.5 h-3.5" />
            Audit trail included
          </div>
        </motion.div>

        {/* Send Button with readiness check */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="space-y-3"
        >
          {/* Readiness warning */}
          <AnimatePresence>
            {!canSend && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-center text-xs text-muted-foreground/70 py-2"
              >
                {!senderSignatureComplete && (
                  <span>You need to complete your signature before sending.</span>
                )}
                {!allSignersHaveFields && senderSignatureComplete && (
                  <span>All signers must have at least one field assigned.</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            onClick={handleSend}
            disabled={isSending || !canSend}
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-base"
          >
            <AnimatePresence mode="wait">
              {isSending ? (
                <motion.div
                  key="sending"
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Sending...
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Send for signatures
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignMultipleSend;