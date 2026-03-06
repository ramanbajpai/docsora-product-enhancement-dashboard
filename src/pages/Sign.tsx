import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import SignUpload from "@/components/sign/SignUpload";
import SignIntent from "@/components/sign/SignIntent";
import SignIdentity from "@/components/sign/SignIdentity";
import SignPlacement from "@/components/sign/SignPlacement";
import SignLegal from "@/components/sign/SignLegal";
import SignComplete from "@/components/sign/SignComplete";
import SignMultipleRecipients, { Recipient, PostSignActions } from "@/components/sign/SignMultipleRecipients";
import SignMultipleFields, { DocumentField } from "@/components/sign/SignMultipleFields";
import SignMultipleLegal from "@/components/sign/SignMultipleLegal";
import SignMultipleSend from "@/components/sign/SignMultipleSend";
import SignMultipleSuccess from "@/components/sign/SignMultipleSuccess";
import SignVerifyEmail from "@/components/sign/SignVerifyEmail";
import SignVerifyCode from "@/components/sign/SignVerifyCode";

export type SigningStep = 
  | "upload" 
  | "uploading"
  | "intent" 
  | "identity" 
  | "placement" 
  | "legal" 
  | "complete"
  | "multiple-recipients"
  | "multiple-fields"
  | "multiple-legal"
  | "multiple-send"
  | "verify-email"
  | "verify-code"
  | "multiple-success";

export interface SignatureData {
  fullName: string;
  initials: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  signatureStyle: "style" | "draw" | "upload" | "saved";
  selectedFont: string;
  drawnSignature?: string;
  uploadedSignature?: string;
}

export interface SignaturePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

const Sign = () => {
  const location = useLocation();
  const [step, setStep] = useState<SigningStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [signatureData, setSignatureData] = useState<SignatureData>({
    fullName: "",
    initials: "",
    signatureStyle: "style",
    selectedFont: "Dancing Script",
  });
  const [signaturePosition, setSignaturePosition] = useState<SignaturePosition>({
    x: 50,
    y: 70,
    width: 200,
    height: 60,
    page: 1,
  });
  
  // Multiple signers state
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [documentFields, setDocumentFields] = useState<DocumentField[]>([]);
  const [enforceSigningOrder, setEnforceSigningOrder] = useState(true);
  const [verifyEmail, setVerifyEmail] = useState("");

  // Handle file passed from Storage, Revise & Resend, or Resend Expired flow
  useEffect(() => {
    const stateFile = location.state?.file;
    const isReviseAndResend = location.state?.reviseAndResend;
    const isResendExpired = location.state?.resendExpired;
    const prefilledRecipients = location.state?.prefilledRecipients;
    const enforceOrder = location.state?.enforceSigningOrder;
    
    if (stateFile) {
      // Create file from state
      let mockFile: File;
      if (stateFile.blob instanceof File) {
        // Revise & Resend passes actual File object
        mockFile = stateFile.blob;
      } else {
        // Storage or Resend Expired passes minimal file info
        const blob = new Blob([], { type: stateFile.type === 'pdf' ? 'application/pdf' : 'application/octet-stream' });
        mockFile = new File([blob], stateFile.name, { type: blob.type });
      }
      setFile(mockFile);
      
      if ((isReviseAndResend || isResendExpired) && prefilledRecipients) {
        // Revise & Resend or Resend Expired flow: pre-populate recipients, clear fields, go to field placement
        setRecipients(prefilledRecipients);
        setEnforceSigningOrder(enforceOrder ?? true);
        // IMPORTANT: Clear document fields - they must be placed fresh on the new document
        setDocumentFields([]);
        setStep("uploading");
        
        // Simulate upload animation then go directly to field placement
        let progress = 0;
        const interval = setInterval(() => {
          progress += 15;
          setUploadProgress(Math.min(progress, 100));
          if (progress >= 100) {
            clearInterval(interval);
            // Go to multiple-fields (signature placement), NOT multiple-recipients
            setTimeout(() => setStep("multiple-fields"), 400);
          }
        }, 100);
      } else {
        // Normal flow from Storage
        setStep("uploading");
        
        let progress = 0;
        const interval = setInterval(() => {
          progress += 15;
          setUploadProgress(Math.min(progress, 100));
          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep("intent"), 400);
          }
        }, 100);
      }
    }
  }, [location.state]);

  const handleFileUpload = useCallback((uploadedFile: File) => {
    setFile(uploadedFile);
    setTimeout(() => setStep("intent"), 400);
  }, []);

  const handleIntentSelect = useCallback((intent: "only-me" | "multiple") => {
    if (intent === "only-me") {
      setStep("identity");
    } else {
      setStep("multiple-recipients");
    }
  }, []);

  const handleRecipientsComplete = useCallback((newRecipients: Recipient[], options: { enforceOrder: boolean; postSignActions: PostSignActions }) => {
    // When updating recipients, clean up fields for removed recipients
    const newRecipientIds = new Set(newRecipients.map(r => r.id));
    setDocumentFields(prev => prev.filter(f => newRecipientIds.has(f.recipientId)));
    setRecipients(newRecipients);
    setEnforceSigningOrder(options.enforceOrder);
    setStep("multiple-fields");
  }, []);

  const handleFieldsComplete = useCallback((fields: DocumentField[]) => {
    setDocumentFields(fields);
    // Check if sender is a signer - if so, show legal confirmation
    const sender = recipients.find(r => r.isSender);
    const senderIsSigner = sender && sender.role === "signer";
    if (senderIsSigner) {
      setStep("multiple-legal");
    } else {
      setStep("multiple-send");
    }
  }, [recipients]);

  const handleMultipleLegalConfirm = useCallback(() => {
    setStep("multiple-send");
  }, []);

  const handleSend = useCallback(() => {
    setStep("verify-email");
  }, []);

  const handleVerifyEmailSend = useCallback((email: string) => {
    setVerifyEmail(email);
    setStep("verify-code");
  }, []);

  const handleVerified = useCallback(() => {
    setStep("multiple-success");
  }, []);

  const handleIdentityComplete = useCallback((data: SignatureData) => {
    setSignatureData(data);
    setStep("placement");
  }, []);

  const handlePlacementComplete = useCallback((position: SignaturePosition) => {
    setSignaturePosition(position);
    setStep("legal");
  }, []);

  const handleLegalConfirm = useCallback(() => {
    setStep("complete");
  }, []);

  const handleReset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setUploadProgress(0);
    setRecipients([]);
    setDocumentFields([]);
    setSignatureData({
      fullName: "",
      initials: "",
      signatureStyle: "style",
      selectedFont: "Dancing Script",
    });
  }, []);

  return (
    <AppLayout>
      <div className="relative h-screen flex flex-col overflow-hidden">
        {/* Ambient background - Ultra subtle */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.03) 0%, transparent 60%)",
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--accent) / 0.02) 0%, transparent 60%)",
            }}
            animate={{
              x: [0, -40, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            {(step === "upload" || step === "uploading") && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ 
                  opacity: 0, 
                  scale: 1.3,
                  filter: 'blur(12px)',
                  y: -20,
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 min-h-0 flex flex-col"
              >
                {step === "uploading" ? (
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <motion.div
                          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium">Preparing document...</p>
                        <p className="text-sm text-muted-foreground">{file?.name}</p>
                        <div className="w-48 h-1.5 bg-muted rounded-full mx-auto overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <SignUpload onFileUpload={handleFileUpload} />
                )}
              </motion.div>
            )}

            {step === "intent" && file && (
              <motion.div
                key="intent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SignIntent
                  file={file}
                  onSelect={handleIntentSelect}
                  onBack={() => setStep("upload")}
                />
              </motion.div>
            )}

            {step === "identity" && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SignIdentity
                  initialData={signatureData}
                  onComplete={handleIdentityComplete}
                  onBack={() => setStep("intent")}
                />
              </motion.div>
            )}

            {step === "placement" && file && (
              <motion.div
                key="placement"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SignPlacement
                  file={file}
                  signatureData={signatureData}
                  initialPosition={signaturePosition}
                  onComplete={handlePlacementComplete}
                  onBack={() => setStep("identity")}
                />
              </motion.div>
            )}

            {step === "legal" && (
              <motion.div
                key="legal"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SignLegal
                  signatureData={signatureData}
                  onConfirm={handleLegalConfirm}
                  onBack={() => setStep("placement")}
                />
              </motion.div>
            )}

            {step === "complete" && file && (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <SignComplete
                  file={file}
                  signatureData={signatureData}
                  onReset={handleReset}
                />
              </motion.div>
            )}

            {/* Multiple Signers Flow */}
            {step === "multiple-recipients" && file && (
              <motion.div
                key="multiple-recipients"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SignMultipleRecipients
                  file={file}
                  initialRecipients={recipients}
                  initialEnforceOrder={enforceSigningOrder}
                  existingFields={documentFields}
                  onComplete={handleRecipientsComplete}
                  onBack={() => setStep("intent")}
                />
              </motion.div>
            )}

            {step === "multiple-fields" && file && (
              <motion.div
                key="multiple-fields"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
              <SignMultipleFields
                  file={file}
                  recipients={recipients}
                  initialFields={documentFields}
                  onComplete={handleFieldsComplete}
                  onBack={() => setStep("multiple-recipients")}
                />
              </motion.div>
            )}

            {step === "multiple-legal" && file && recipients.find(r => r.isSender) && (
              <motion.div
                key="multiple-legal"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SignMultipleLegal
                  sender={recipients.find(r => r.isSender)!}
                  fields={documentFields}
                  onConfirm={handleMultipleLegalConfirm}
                  onBack={() => setStep("multiple-fields")}
                />
              </motion.div>
            )}

            {step === "multiple-send" && file && (
              <motion.div
                key="multiple-send"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SignMultipleSend
                  file={file}
                  recipients={recipients}
                  fields={documentFields}
                  enforceOrder={enforceSigningOrder}
                  onSend={handleSend}
                  onBack={() => {
                    const sender = recipients.find(r => r.isSender);
                    const senderIsSigner = sender && sender.role === "signer";
                    setStep(senderIsSigner ? "multiple-legal" : "multiple-fields");
                  }}
                  onEditOrder={() => setStep("multiple-recipients")}
                />
              </motion.div>
            )}

            {step === "verify-email" && (
              <motion.div
                key="verify-email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SignVerifyEmail
                  onSendCode={handleVerifyEmailSend}
                  onBack={() => setStep("multiple-send")}
                />
              </motion.div>
            )}

            {step === "verify-code" && (
              <motion.div
                key="verify-code"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SignVerifyCode
                  email={verifyEmail}
                  onVerified={handleVerified}
                  onChangeEmail={() => setStep("verify-email")}
                />
              </motion.div>
            )}

            {step === "multiple-success" && file && (
              <motion.div
                key="multiple-success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <SignMultipleSuccess
                  file={file}
                  recipients={recipients}
                  enforceOrder={enforceSigningOrder}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
};

export default Sign;