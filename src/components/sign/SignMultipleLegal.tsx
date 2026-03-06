import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Shield, Lock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Recipient } from "./SignMultipleRecipients";
import { DocumentField } from "./SignMultipleFields";

interface SignMultipleLegalProps {
  sender: Recipient;
  fields: DocumentField[];
  onConfirm: () => void;
  onBack: () => void;
}

const SignMultipleLegal = ({ sender, fields, onConfirm, onBack }: SignMultipleLegalProps) => {
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = useCallback(() => {
    if (agreed) onConfirm();
  }, [agreed, onConfirm]);

  // Get sender's signature from their fields
  const senderSignatureField = fields.find(
    f => f.recipientId === sender.id && f.type === "signature" && f.signatureData
  );

  const trustIndicators = [
    { icon: Shield, label: "SOC 2" },
    { icon: Award, label: "ISO 27001" },
    { icon: Lock, label: "Encrypted" },
  ];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] px-8">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back */}
        <motion.button
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
          onClick={onBack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h1 className="text-3xl font-light text-foreground tracking-tight mb-3">
            Ready to sign
          </h1>
          <p className="text-muted-foreground">
            Review your signature below
          </p>
        </motion.div>

        {/* Signature Preview */}
        <motion.div
          className="mb-10 p-8 bg-card/50 rounded-2xl border border-border/50"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {senderSignatureField?.signatureData ? (
            <div className="flex items-center justify-center">
              <img 
                src={senderSignatureField.signatureData} 
                alt="Your signature" 
                className="max-h-20 max-w-full object-contain"
              />
            </div>
          ) : (
            <div
              className="text-3xl text-primary text-center"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              {sender.fullName}
            </div>
          )}
        </motion.div>

        {/* Legal Checkbox */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
              I understand this is a legally binding electronic signature.
            </span>
          </label>
        </motion.div>

        {/* Sign Button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            size="lg"
            className="w-full h-14 text-base font-medium"
            onClick={handleConfirm}
            disabled={!agreed}
          >
            Sign Document
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="flex items-center justify-center gap-8 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {trustIndicators.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 text-muted-foreground/50"
            >
              <item.icon className="w-3.5 h-3.5" />
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignMultipleLegal;