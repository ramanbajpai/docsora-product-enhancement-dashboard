import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandInput } from "./CommandInput";
import { ActionPreview } from "./ActionPreview";
import { SearchResults } from "./SearchResults";
import { InsightPanel } from "./InsightPanel";
import { useIntentDetection, DetectedIntent } from "@/hooks/useIntentDetection";
import { useCommandSearch, CommandDocument } from "@/hooks/useCommandSearch";
import { toast } from "sonner";

interface DroppedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

type CommandState = "idle" | "processing" | "preview" | "results" | "insight";

export function DocsoraCommand() {
  const [input, setInput] = useState("");
  const [droppedFiles, setDroppedFiles] = useState<DroppedFile[]>([]);
  const [commandState, setCommandState] = useState<CommandState>("idle");
  const [activeIntent, setActiveIntent] = useState<DetectedIntent | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<CommandDocument | null>(null);
  const [showInsight, setShowInsight] = useState(false);

  // Intent detection
  const detectedIntent = useIntentDetection(input);
  
  // Search results
  const searchQuery = detectedIntent?.type === "search" 
    ? detectedIntent.extractedEntities.query || input 
    : "";
  const searchResults = useCommandSearch(searchQuery);

  // Handle input changes with debounced processing
  useEffect(() => {
    if (!input.trim() && droppedFiles.length === 0) {
      setCommandState("idle");
      setActiveIntent(null);
      return;
    }

    // Simulate processing delay
    setCommandState("processing");
    const timer = setTimeout(() => {
      if (detectedIntent) {
        if (detectedIntent.type === "search" || detectedIntent.type === "insight") {
          setCommandState("results");
        } else {
          setActiveIntent(detectedIntent);
          setCommandState("preview");
        }
      } else {
        setCommandState("idle");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [input, detectedIntent, droppedFiles.length]);

  const handleFilesDrop = useCallback((files: File[]) => {
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setDroppedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setDroppedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleConfirmAction = useCallback(() => {
    toast.success(`${activeIntent?.action} initiated`, {
      description: `Action will be processed for ${droppedFiles[0]?.name || "your document"}`,
    });
    setInput("");
    setDroppedFiles([]);
    setCommandState("idle");
    setActiveIntent(null);
  }, [activeIntent, droppedFiles]);

  const handleEditAction = useCallback(() => {
    toast.info("Edit mode", {
      description: "Editing workflow is not yet implemented",
    });
  }, []);

  const handleCancelAction = useCallback(() => {
    setCommandState("idle");
    setActiveIntent(null);
  }, []);

  const handleDocumentAction = useCallback((doc: CommandDocument, action: "sign" | "remind" | "view") => {
    const actionLabels = {
      sign: "Opening signature flow",
      remind: "Sending reminder",
      view: "Opening document",
    };
    toast.success(actionLabels[action], {
      description: doc.name,
    });
  }, []);

  const handleShowInsight = useCallback((doc: CommandDocument) => {
    setSelectedDocument(doc);
    setShowInsight(true);
  }, []);

  const documentName = droppedFiles[0]?.name || "Selected Document";

  return (
    <div className="w-full">
      {/* Command container */}
      <div className={cn(
        "rounded-2xl border transition-all duration-300",
        "bg-card/80 backdrop-blur-xl",
        commandState === "idle" 
          ? "border-border shadow-glass" 
          : "border-primary/20 shadow-glow"
      )}>
        {/* Header badge */}
        <div className="flex items-center justify-between px-4 pt-3 pb-0">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-1 rounded-md transition-all duration-300",
              commandState !== "idle" ? "bg-primary/10" : "bg-muted/50"
            )}>
              <Sparkles className={cn(
                "w-3.5 h-3.5 transition-colors",
                commandState !== "idle" ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Docsora Command
            </span>
          </div>
          
          {/* Processing indicator */}
          <AnimatePresence>
            {commandState === "processing" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 text-primary"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-[10px] font-medium">Understanding request…</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input area */}
        <div className="p-4">
          <CommandInput
            value={input}
            onChange={setInput}
            onFilesDrop={handleFilesDrop}
            droppedFiles={droppedFiles}
            onRemoveFile={handleRemoveFile}
            isProcessing={commandState === "processing"}
          />
        </div>

        {/* Dynamic content area */}
        <AnimatePresence mode="wait">
          {commandState === "preview" && activeIntent && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4"
            >
              <ActionPreview
                intent={activeIntent}
                documentName={documentName}
                onConfirm={handleConfirmAction}
                onEdit={handleEditAction}
                onCancel={handleCancelAction}
              />
            </motion.div>
          )}

          {commandState === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 max-h-[400px] overflow-y-auto glassmorphic-scrollbar"
            >
              <SearchResults
                groups={searchResults}
                onDocumentAction={handleDocumentAction}
                onShowInsight={handleShowInsight}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Insight panel (overlay) */}
      <AnimatePresence>
        {showInsight && selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            <InsightPanel
              document={selectedDocument}
              onClose={() => {
                setShowInsight(false);
                setSelectedDocument(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick suggestions when idle */}
      <AnimatePresence>
        {commandState === "idle" && !input && droppedFiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex flex-wrap gap-2 mt-3"
          >
            {[
              "Show unsigned contracts",
              "What's blocking my deals?",
              "Documents waiting on Legal",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-full",
                  "bg-muted/50 text-muted-foreground",
                  "border border-border/50",
                  "hover:bg-muted hover:text-foreground hover:border-border",
                  "transition-all duration-150"
                )}
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
