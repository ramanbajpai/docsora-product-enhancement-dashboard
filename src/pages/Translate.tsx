import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { TranslateModeSelector } from "@/components/translate/TranslateModeSelector";
import { TranslateTextMode } from "@/components/translate/TranslateTextMode";
import { TranslateDocumentMode } from "@/components/translate/TranslateDocumentMode";
import { TranslateDualMode } from "@/components/translate/TranslateDualMode";
import { TranslateSuccess } from "@/components/translate/TranslateSuccess";
import { TranslateProcessing } from "@/components/translate/TranslateProcessing";
import { UpgradeModal } from "@/components/translate/UpgradeModal";

export type TranslateMode = "text" | "document" | "dual";
export type TranslateStage = "input" | "uploading" | "translating" | "success";

export interface TranslationResult {
  sourceLanguage: string;
  targetLanguage: string;
  originalText?: string;
  translatedText?: string;
  fileName?: string;
  pageCount?: number;
  mode: TranslateMode;
}

const Translate = () => {
  const location = useLocation();
  const [mode, setMode] = useState<TranslateMode>("document");
  const [stage, setStage] = useState<TranslateStage>("input");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [incomingFileName, setIncomingFileName] = useState<string>("");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Handle file passed from Storage
  useEffect(() => {
    const stateFile = location.state?.file;
    if (stateFile) {
      setMode("document");
      setIncomingFileName(stateFile.name);
      setStage("uploading");
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15;
        setUploadProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => setStage("input"), 400);
        }
      }, 100);
    }
  }, [location.state]);

  const handleTranslationComplete = (translationResult: TranslationResult) => {
    setResult(translationResult);
    setStage("success");
  };

  const handleReset = () => {
    setStage("input");
    setResult(null);
    setIncomingFileName("");
    setUploadProgress(0);
  };

  const handleModeChange = (newMode: TranslateMode) => {
    // Gate dual-language mode behind upgrade
    if (newMode === "dual") {
      setShowUpgradeModal(true);
      return;
    }
    setMode(newMode);
    setStage("input");
    setResult(null);
  };

  const renderUploadingState = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
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
          <p className="text-sm text-muted-foreground">{incomingFileName}</p>
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
      <div className="p-6 lg:p-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header - hide during translating and success */}
          {stage === "input" && (
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-2">Translate</h1>
              <p className="text-muted-foreground">
                Enterprise-grade translation for documents and text
              </p>
            </div>
          )}

          {/* Mode Selector */}
          {stage === "input" && (
            <TranslateModeSelector mode={mode} onModeChange={handleModeChange} />
          )}

          {/* Uploading state */}
          {stage === "uploading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderUploadingState()}
            </motion.div>
          )}

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {stage === "input" && (
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {mode === "text" && (
                  <TranslateTextMode
                    onTranslate={handleTranslationComplete}
                    onStartTranslating={() => setStage("translating")}
                  />
                )}
                {mode === "document" && (
                  <TranslateDocumentMode
                    onTranslate={handleTranslationComplete}
                    onStartTranslating={() => setStage("translating")}
                  />
                )}
                {mode === "dual" && (
                  <TranslateDualMode
                    onTranslate={handleTranslationComplete}
                    onStartTranslating={() => setStage("translating")}
                  />
                )}
              </motion.div>
            )}

            {stage === "translating" && (
              <TranslateProcessing />
            )}

            {stage === "success" && result && (
              <TranslateSuccess result={result} onReset={handleReset} />
            )}
          </AnimatePresence>

          {/* Trust Signals */}
          {stage === "input" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Enterprise-grade translation
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                No data used for training
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Formatting preserved
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Upgrade Modal for Dual-Language */}
        <UpgradeModal 
          open={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)} 
        />
      </div>
    </AppLayout>
  );
};

export default Translate;
