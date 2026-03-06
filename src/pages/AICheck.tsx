import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AICheckUpload } from "@/components/ai-check/AICheckUpload";
import { AICheckProcessing } from "@/components/ai-check/AICheckProcessing";
import { AICheckResults } from "@/components/ai-check/AICheckResults";
import { AICheckEnhancement } from "@/components/ai-check/AICheckEnhancement";
import { AICheckSuccess } from "@/components/ai-check/AICheckSuccess";

export type AICheckState = "upload" | "uploading" | "processing" | "grammar" | "enhancement" | "success";

export interface DocumentSuggestion {
  id: string;
  type: "grammar" | "spelling" | "clarity" | "style";
  original: string;
  suggested: string;
  explanation: string;
  context: string;
  severity: "low" | "medium" | "high";
  position: { start: number; end: number };
  accepted?: boolean;
}

export interface EnhancementSuggestion {
  id: string;
  original: string;
  enhanced: string;
  explanation: string;
  lineNumber: number;
  accepted?: boolean;
}

export interface AICheckResultData {
  score: number;
  suggestions: DocumentSuggestion[];
  documentText: string;
  enhancements: EnhancementSuggestion[];
}

export type TonePreset = "executive" | "legal" | "simple" | "marketing";

const AICheck = () => {
  const location = useLocation();
  const [state, setState] = useState<AICheckState>("upload");
  const [fileName, setFileName] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [inputText, setInputText] = useState<string>("");
  const [resultData, setResultData] = useState<AICheckResultData | null>(null);
  const [selectedTone, setSelectedTone] = useState<TonePreset>("executive");

  // Handle file passed from Storage
  useEffect(() => {
    const stateFile = location.state?.file;
    if (stateFile) {
      setFileName(stateFile.name);
      setState("uploading");
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15;
        setUploadProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          setState("processing");
        }
      }, 100);
    }
  }, [location.state]);

  const handleFileUpload = useCallback((file: File) => {
    setFileName(file.name);
    setState("processing");
  }, []);

  const handleTextSubmit = useCallback((text: string) => {
    setInputText(text);
    setFileName("Pasted Text");
    setState("processing");
  }, []);

  const handleProcessingComplete = useCallback(() => {
    const mockResult: AICheckResultData = {
      score: 84,
      documentText: inputText || `Sprint 2 – Consolidated Feedback

1. Translate – Cached Language Preferences

Approved.

2. Sign – Push Reminder

Add a hover tooltip on the bell icon:
Group: "Send reminders to all pending recipients"
Individual: "Send Individual Reminder"

What is the standard email template used for auto-reminders.
Sender should not be able to trigger reminders from Track → Sign → Signed section.

3. Track – Resend Transfer

The current "resend transfer" icon is wrong - follow the icon specified in the user story.

Behaviour should match Sign:
Mass re-share. Small popup saying "Reshare transfer with all recipients"
Individual re-share. Small popup saying "Reshare transfer with this recipient"

Currently there is no option to re-share with a specific recipient — this needs to be added as per the title and story.

Move the Add Recipient button below the recipients list (shift above status)`,
      suggestions: [
        { id: "1", type: "grammar", original: "auto-reminders.", suggested: "auto-reminders?", explanation: "This appears to be a question and should end with a question mark.", context: "What is the standard email template used for auto-reminders.", severity: "high", position: { start: 320, end: 336 } },
        { id: "2", type: "spelling", original: "Behaviour", suggested: "Behavior", explanation: "Use American English spelling for consistency.", context: "Behaviour should match Sign:", severity: "low", position: { start: 530, end: 539 } },
        { id: "3", type: "grammar", original: "popup", suggested: "pop-up", explanation: "Hyphenated form is preferred in formal documentation.", context: "Small popup saying", severity: "medium", position: { start: 580, end: 585 } },
        { id: "4", type: "grammar", original: "-", suggested: "—", explanation: "Use em-dash for this context to improve readability.", context: "icon is wrong - follow", severity: "low", position: { start: 450, end: 451 } },
        { id: "5", type: "clarity", original: "Currently", suggested: "Currently,", explanation: "Add comma after introductory adverb for clarity.", context: "Currently there is no option", severity: "medium", position: { start: 650, end: 659 } },
        { id: "6", type: "style", original: "this needs to be added", suggested: "this must be added", explanation: "Use stronger language for requirements.", context: "this needs to be added as per the title", severity: "low", position: { start: 700, end: 721 } },
      ],
      enhancements: [
        { id: "e1", original: "Add a hover tooltip on the bell icon:", enhanced: "Implement a contextual tooltip that appears when users hover over the notification bell icon:", explanation: "More specific and professional phrasing", lineNumber: 9, accepted: false },
        { id: "e2", original: "The current \"resend transfer\" icon is wrong - follow the icon specified in the user story.", enhanced: "The current resend transfer icon does not align with the design specification. Please reference the icon defined in User Story #[X] for the correct implementation.", explanation: "More actionable and includes reference placeholder", lineNumber: 18, accepted: false },
        { id: "e3", original: "Currently there is no option to re-share with a specific recipient — this needs to be added as per the title and story.", enhanced: "A critical gap exists: individual recipient re-sharing is not currently available. This functionality must be implemented to fulfill the requirements outlined in the user story.", explanation: "Clearer problem statement with urgency", lineNumber: 24, accepted: false },
      ]
    };
    setResultData(mockResult);
    setState("grammar");
  }, [inputText]);

  const handleAcceptSuggestion = (id: string) => {
    if (!resultData) return;
    setResultData({
      ...resultData,
      suggestions: resultData.suggestions.map(s => 
        s.id === id ? { ...s, accepted: true } : s
      )
    });
  };

  const handleRejectSuggestion = (id: string) => {
    if (!resultData) return;
    setResultData({
      ...resultData,
      suggestions: resultData.suggestions.filter(s => s.id !== id)
    });
  };

  const handleAcceptAllSafe = () => {
    if (!resultData) return;
    setResultData({
      ...resultData,
      suggestions: resultData.suggestions.map(s => 
        s.severity === "high" || s.severity === "medium" ? { ...s, accepted: true } : s
      )
    });
  };

  const handleProceedToEnhancement = () => {
    setState("enhancement");
  };

  const handleAcceptEnhancement = (id: string) => {
    if (!resultData) return;
    setResultData({
      ...resultData,
      enhancements: resultData.enhancements.map(e => 
        e.id === id ? { ...e, accepted: true } : e
      )
    });
  };

  const handleRejectEnhancement = (id: string) => {
    if (!resultData) return;
    setResultData({
      ...resultData,
      enhancements: resultData.enhancements.filter(e => e.id !== id)
    });
  };

  const handleComplete = () => {
    setState("success");
  };

  const handleReset = () => {
    setState("upload");
    setFileName("");
    setUploadProgress(0);
    setInputText("");
    setResultData(null);
  };

  const renderUploadingState = () => (
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
          <p className="text-sm text-muted-foreground">{fileName}</p>
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
  );

  return (
    <AppLayout>
      <div className="h-screen flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {(state === "upload" || state === "uploading") && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 min-h-0 flex flex-col"
            >
              {state === "uploading" ? renderUploadingState() : (
                <AICheckUpload 
                  onFileUpload={handleFileUpload}
                  onTextSubmit={handleTextSubmit}
                />
              )}
            </motion.div>
          )}

          {state === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex items-center justify-center p-6"
            >
              <AICheckProcessing fileName={fileName} onComplete={handleProcessingComplete} />
            </motion.div>
          )}

          {state === "grammar" && resultData && (
            <motion.div
              key="grammar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1 min-h-0"
            >
              <AICheckResults 
                data={resultData}
                onAccept={handleAcceptSuggestion}
                onReject={handleRejectSuggestion}
                onAcceptAllSafe={handleAcceptAllSafe}
                onProceed={handleProceedToEnhancement}
              />
            </motion.div>
          )}

          {state === "enhancement" && resultData && (
            <motion.div
              key="enhancement"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 min-h-0"
            >
              <AICheckEnhancement
                data={resultData}
                selectedTone={selectedTone}
                onToneChange={setSelectedTone}
                onAccept={handleAcceptEnhancement}
                onReject={handleRejectEnhancement}
                onComplete={handleComplete}
                onBack={() => setState("grammar")}
              />
            </motion.div>
          )}

          {state === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex items-center justify-center p-6"
            >
              <AICheckSuccess fileName={fileName} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default AICheck;