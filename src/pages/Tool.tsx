import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToolUpload } from "@/components/tools/ToolUpload";
import { EditPDFUpload } from "@/components/tools/EditPDFUpload";
import { MetadataUpload } from "@/components/tools/MetadataUpload";
import { WatermarkUpload } from "@/components/tools/WatermarkUpload";
import { ToolActionPlaceholder } from "@/components/tools/ToolActionPlaceholder";
import { RotateEditor, RotateProcessing, RotateSuccess } from "@/components/tools/rotate";
import { EditPDFEditor, EditPDFProcessing, EditPDFSuccess } from "@/components/tools/edit-pdf";
import { ToolProcessing, ToolSuccess } from "@/components/tools/shared";
import { MergeEditor, MergeSuccess } from "@/components/tools/merge";
import { SplitEditor, SplitSuccess } from "@/components/tools/split";
import { DeletePagesEditor, DeletePagesSuccess } from "@/components/tools/delete-pages";
import { OrganizeEditor, OrganizeSuccess } from "@/components/tools/organize";
import { ExtractEditor, ExtractSuccess } from "@/components/tools/extract";
import { ProtectEditor, ProtectProcessing, ProtectSuccess } from "@/components/tools/protect";
import { WatermarkEditor, WatermarkSuccess } from "@/components/tools/watermark";
import { CompareEditor, CompareSuccess } from "@/components/tools/compare";
import { RepairEditor, RepairProcessing, RepairSuccess } from "@/components/tools/repair";
import { MetadataEditor, MetadataUpdateSuccess, MetadataRemoveSuccess } from "@/components/tools/metadata";
import { OnePageEditor, OnePageProcessing, OnePageSuccess } from "@/components/tools/one-page";
import { getToolConfig } from "@/components/tools/toolConfig";

type ToolStep = "upload" | "uploading" | "complete" | "action" | "editor" | "processing" | "success";

// Apple-style easing
const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Tools that use the new editor framework
const EDITOR_TOOLS = ["merge", "split", "delete", "organize", "extract", "protect", "watermark", "compare", "repair", "metadata", "flatten"];

// Tools that skip the processing flow and handle everything internally
const SELF_CONTAINED_TOOLS: string[] = [];

// Tool-specific success messages
const TOOL_SUCCESS_CONFIG: Record<string, { 
  title: string; 
  subtitle: string; 
  downloadLabel: string; 
  resetLabel: string; 
  proFeatures: string;
  followUpAction?: { label: string; description: string; path: string };
}> = {
  merge: { 
    title: "Your document is ready", 
    subtitle: "Documents merged successfully", 
    downloadLabel: "Download merged PDF", 
    resetLabel: "Merge more files", 
    proFeatures: "Batch merge & advanced ordering",
    followUpAction: {
      label: "Want to reorder pages?",
      description: "Continue to Organize for page-level changes",
      path: "/tools/organize"
    }
  },
  split: { title: "Your document is ready", subtitle: "Document split successfully", downloadLabel: "Download split files", resetLabel: "Split another file", proFeatures: "Batch split & custom ranges" },
  delete: { title: "Your document is ready", subtitle: "Pages removed successfully", downloadLabel: "Download document", resetLabel: "Edit another file", proFeatures: "Batch processing & undo history" },
  organize: { title: "Your document is ready", subtitle: "Page order updated", downloadLabel: "Download document", resetLabel: "Organize another file", proFeatures: "Batch organize & templates" },
  extract: { title: "Your document is ready", subtitle: "Pages extracted successfully", downloadLabel: "Download extracted pages", resetLabel: "Extract more pages", proFeatures: "Batch extract & smart selection" },
  protect: { title: "Your document is ready", subtitle: "Document protected successfully", downloadLabel: "Download protected PDF", resetLabel: "Protect another file", proFeatures: "Advanced encryption & permissions" },
  watermark: { title: "Your document is ready", subtitle: "Watermark applied successfully", downloadLabel: "Download document", resetLabel: "Add another watermark", proFeatures: "Image watermarks & batch apply" },
  compare: { title: "Comparison complete", subtitle: "Differences highlighted", downloadLabel: "Download comparison", resetLabel: "Compare other files", proFeatures: "Detailed change tracking" },
  repair: { title: "Your document is ready", subtitle: "Document repaired successfully", downloadLabel: "Download repaired PDF", resetLabel: "Repair another file", proFeatures: "Advanced recovery options" },
  metadata: { title: "Your document is ready", subtitle: "Metadata saved successfully", downloadLabel: "Download document", resetLabel: "Edit another file", proFeatures: "Batch metadata editing" },
  flatten: { title: "Your document is ready", subtitle: "Converted to one page", downloadLabel: "Download document", resetLabel: "Convert another file", proFeatures: "Custom layouts & sizing" },
};

export default function Tool() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<ToolStep>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [incomingFileLoading, setIncomingFileLoading] = useState(false);
  const [metadataMode, setMetadataMode] = useState<"update" | "remove" | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const addFilesInputRef = useRef<HTMLInputElement | null>(null);
  const hasHandledIncomingFile = useRef(false);

  const config = toolId ? getToolConfig(toolId) : undefined;
  const isEditPDF = toolId === "edit";
  const isMetadata = toolId === "metadata";
  const isWatermark = toolId === "watermark";
  const isRotate = toolId === "rotate";
  const isEditorTool = toolId ? EDITOR_TOOLS.includes(toolId) : false;
  const isSelfContainedTool = toolId ? SELF_CONTAINED_TOOLS.includes(toolId) : false;
  const useCinematicUpload = isEditPDF;

  // Handle file passed from Storage
  useEffect(() => {
    const stateFile = location.state?.file;
    if (stateFile && !hasHandledIncomingFile.current) {
      hasHandledIncomingFile.current = true;
      
      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        mp4: 'video/mp4',
      };
      const blob = new Blob([], { type: mimeTypes[stateFile.type] || 'application/octet-stream' });
      const mockFile = new File([blob], stateFile.name, { type: blob.type });
      
      setIncomingFileLoading(true);
      setUploadedFiles([mockFile]);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15;
        setUploadProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIncomingFileLoading(false);
            // Go directly to editor for editor tools
            if (isRotate || isEditorTool) {
              setStep("editor");
            } else {
              setStep("action");
            }
          }, 400);
        }
      }, 100);
    }
  }, [location.state, isRotate, isEditorTool]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  if (!config) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Tool not found</h1>
            <p className="text-muted-foreground mb-6">The requested tool doesn't exist.</p>
            <button 
              onClick={() => navigate("/tools")}
              className="text-primary hover:underline"
            >
              Back to Tools
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleCinematicFileUploaded = useCallback((file: File) => {
    setUploadedFiles([file]);
    setStep("uploading");
    setUploadProgress(0);

    const totalDuration = 2500;
    const progressInterval = 50;
    let elapsed = 0;

    progressIntervalRef.current = setInterval(() => {
      elapsed += progressInterval;
      const normalizedTime = Math.min(elapsed / totalDuration, 1);
      const easedProgress = 1 - Math.pow(1 - normalizedTime, 3);
      const currentProgress = Math.min(easedProgress * 100, 99);

      setUploadProgress(currentProgress);

      if (elapsed >= totalDuration) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }, progressInterval);

    transitionTimeoutRef.current = setTimeout(() => {
      setUploadProgress(100);
      setStep("complete");

      setTimeout(() => {
        if (isEditPDF) {
          setStep("editor");
        } else {
          setStep("action");
        }
      }, 800);
    }, totalDuration);
  }, [isEditPDF]);

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files);
    if (isRotate || isEditorTool) {
      setStep("editor");
    } else {
      setStep("action");
    }
  };

  const handleAddMoreFiles = useCallback(() => {
    addFilesInputRef.current?.click();
  }, []);

  const handleAdditionalFilesSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
    }
    // Reset the input so the same file can be selected again
    e.target.value = "";
  }, []);

  const handleMergeFilesChange = useCallback((nextFiles: File[]) => {
    setUploadedFiles(nextFiles);
  }, []);

  const handleProcess = useCallback(() => {
    setStep("processing");
  }, []);

  const handleMetadataProcess = useCallback((mode: "update" | "remove") => {
    setMetadataMode(mode);
    setStep("processing");
  }, []);

  const handleProcessingComplete = useCallback(() => {
    setStep("success");
  }, []);

  const handleEditPDFApply = useCallback(() => {
    setStep("processing");
  }, []);

  const handleEditPDFProcessingComplete = useCallback(() => {
    setStep("success");
  }, []);

  const handleEditPDFExit = useCallback(() => {
    navigate("/tools");
  }, [navigate]);

  const handleBack = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    setStep("upload");
    setUploadedFiles([]);
    setUploadProgress(0);
  };

  const showUploadingState = step === "uploading" || step === "complete";

  // Edit PDF Editor is full screen, render without AppLayout
  if (isEditPDF && step === "editor") {
    return (
      <EditPDFEditor
        file={uploadedFiles[0]}
        onApply={handleEditPDFApply}
        onExit={handleEditPDFExit}
      />
    );
  }

  // Render the appropriate editor based on toolId
  const renderEditor = () => {
    const editorProps = { files: uploadedFiles, onProcess: handleProcess };
    
    switch (toolId) {
      case "merge":
        return (
          <MergeEditor
            {...editorProps}
            onAddFiles={handleAddMoreFiles}
            onFilesChange={handleMergeFilesChange}
          />
        );
      case "split":
        return <SplitEditor {...editorProps} />;
      case "delete":
        return <DeletePagesEditor {...editorProps} />;
      case "organize":
        return <OrganizeEditor {...editorProps} />;
      case "extract":
        return <ExtractEditor {...editorProps} />;
      case "protect":
        return <ProtectEditor {...editorProps} />;
      case "watermark":
        return <WatermarkEditor {...editorProps} />;
      case "compare":
        return <CompareEditor {...editorProps} />;
      case "repair":
        return <RepairEditor {...editorProps} />;
      case "metadata":
        return <MetadataEditor files={uploadedFiles} onProcess={handleMetadataProcess} />;
      case "flatten":
        return <OnePageEditor {...editorProps} />;
      default:
        return null;
    }
  };

  const successConfig = toolId ? TOOL_SUCCESS_CONFIG[toolId] : null;

  // Render loading state for incoming files from Storage
  const renderIncomingFileLoading = () => (
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
          <p className="text-sm text-muted-foreground">{uploadedFiles[0]?.name}</p>
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
      {/* Hidden file input for adding more files */}
      <input
        ref={addFilesInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.odp"
        className="hidden"
        onChange={handleAdditionalFilesSelected}
      />
      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Incoming file loading state */}
        {incomingFileLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderIncomingFileLoading()}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!incomingFileLoading && (step === "upload" || step === "uploading" || step === "complete") && isEditPDF && (
            <motion.div
              key="edit-pdf-upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.3, filter: 'blur(12px)', y: -20 }}
              transition={{ duration: 0.6, ease: appleEasing }}
              className="-mx-6 -mt-6"
            >
              <EditPDFUpload 
                onFileUploaded={handleCinematicFileUploaded}
                isUploading={showUploadingState}
                uploadProgress={uploadProgress}
                isComplete={step === "complete"}
              />
            </motion.div>
          )}

          {!incomingFileLoading && step === "upload" && !useCinematicUpload && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.3, filter: 'blur(12px)', y: -20 }}
              transition={{ duration: 0.6, ease: appleEasing }}
              className="-mx-6 -mt-6"
            >
              <ToolUpload config={config} onFilesUploaded={handleFilesUploaded} />
            </motion.div>
          )}

          {/* Rotate Editor */}
          {step === "editor" && isRotate && (
            <motion.div
              key="rotate-editor"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, ease: appleEasing }}
              className="-mx-6 -mt-6"
            >
              <RotateEditor files={uploadedFiles} onProcess={handleProcess} />
            </motion.div>
          )}

          {/* Rotate Processing */}
          {step === "processing" && isRotate && (
            <motion.div
              key="rotate-processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
              transition={{ duration: 0.4, ease: appleEasing }}
              className="-mx-6 -mt-6"
            >
              <RotateProcessing onComplete={handleProcessingComplete} />
            </motion.div>
          )}

          {/* Rotate Success */}
          {step === "success" && isRotate && (
            <motion.div
              key="rotate-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <RotateSuccess file={uploadedFiles[0]} onReset={handleBack} />
            </motion.div>
          )}

          {/* Edit PDF Processing */}
          {step === "processing" && isEditPDF && (
            <motion.div
              key="edit-pdf-processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
              transition={{ duration: 0.4, ease: appleEasing }}
              className="-mx-6 -mt-6"
            >
              <EditPDFProcessing onComplete={handleEditPDFProcessingComplete} />
            </motion.div>
          )}

          {/* Edit PDF Success */}
          {step === "success" && isEditPDF && (
            <motion.div
              key="edit-pdf-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <EditPDFSuccess file={uploadedFiles[0]} onReset={handleBack} />
            </motion.div>
          )}

          {/* New Tool Editors */}
          {step === "editor" && isEditorTool && (
            <motion.div
              key={`${toolId}-editor`}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, ease: appleEasing }}
              className="-mx-6 -mt-6"
            >
              {renderEditor()}
            </motion.div>
          )}

          {/* Repair Processing - Custom component */}
          {step === "processing" && toolId === "repair" && (
            <motion.div
              key="repair-processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
              transition={{ duration: 0.4, ease: appleEasing }}
              className="-mx-6 -mt-6"
            >
              <RepairProcessing onComplete={handleProcessingComplete} />
            </motion.div>
          )}

          {/* One Page Processing - Custom component */}
          {step === "processing" && toolId === "flatten" && (
            <motion.div
              key="onepage-processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
              transition={{ duration: 0.4, ease: appleEasing }}
              className="-mx-6 -mt-6"
            >
              <OnePageProcessing onComplete={handleProcessingComplete} />
            </motion.div>
          )}

          {/* New Tool Processing - Skip for self-contained tools and tools with custom processing components */}
          {step === "processing" && isEditorTool && !isSelfContainedTool && toolId !== "repair" && toolId !== "flatten" && toolId !== "protect" && (
            <motion.div
              key={`${toolId}-processing`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
              transition={{ duration: 0.4, ease: appleEasing }}
              className="-mx-6 -mt-6"
            >
              <ToolProcessing
                title="Processing document"
                subtitle="Please wait while we process your file"
                onComplete={handleProcessingComplete}
              />
            </motion.div>
          )}

          {/* Split Success - Custom component */}
          {step === "success" && toolId === "split" && (
            <motion.div
              key="split-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <SplitSuccess file={uploadedFiles[0]} onReset={handleBack} />
            </motion.div>
          )}

          {/* Merge Success - Custom component */}
          {step === "success" && toolId === "merge" && (
            <motion.div
              key="merge-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <MergeSuccess file={uploadedFiles[0]} onReset={handleBack} />
            </motion.div>
          )}

          {/* Delete Pages Success - Custom component */}
          {step === "success" && toolId === "delete" && (
            <motion.div
              key="delete-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <DeletePagesSuccess file={uploadedFiles[0]} onReset={handleBack} />
            </motion.div>
          )}

          {/* Compare Success - Custom component */}
          {step === "success" && toolId === "compare" && (
            <motion.div
              key="compare-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <CompareSuccess files={uploadedFiles} onReset={handleBack} />
            </motion.div>
          )}

          {/* Protect Processing - Custom component */}
          {step === "processing" && toolId === "protect" && (
            <motion.div
              key="protect-processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
              transition={{ duration: 0.4, ease: appleEasing }}
              className="-mx-6 -mt-6"
            >
              <ProtectProcessing onComplete={handleProcessingComplete} />
            </motion.div>
          )}

          {/* Protect Success - Custom component */}
          {step === "success" && toolId === "protect" && (
            <motion.div
              key="protect-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <ProtectSuccess file={uploadedFiles[0]} onReset={handleBack} />
            </motion.div>
          )}

          {/* Extract Success - Custom component */}
          {step === "success" && toolId === "extract" && (
            <motion.div
              key="extract-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <ExtractSuccess files={uploadedFiles} extractedCount={3} onReset={handleBack} />
            </motion.div>
          )}

          {/* One Page Success - Custom component */}
          {step === "success" && toolId === "flatten" && (
            <motion.div
              key="onepage-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <OnePageSuccess files={uploadedFiles} originalPageCount={5} onReset={handleBack} />
            </motion.div>
          )}

          {/* Watermark Success - Custom component */}
          {step === "success" && toolId === "watermark" && (
            <motion.div
              key="watermark-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <WatermarkSuccess files={uploadedFiles} pageCount={5} onReset={handleBack} />
            </motion.div>
          )}

          {/* Organize Success - Custom component */}
          {step === "success" && toolId === "organize" && (
            <motion.div
              key="organize-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <OrganizeSuccess files={uploadedFiles} pagesReordered={3} onReset={handleBack} />
            </motion.div>
          )}

          {/* Metadata Update Success */}
          {step === "success" && toolId === "metadata" && metadataMode === "update" && (
            <motion.div
              key="metadata-update-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <MetadataUpdateSuccess files={uploadedFiles} onReset={handleBack} />
            </motion.div>
          )}

          {/* Metadata Remove Success */}
          {step === "success" && toolId === "metadata" && metadataMode === "remove" && (
            <motion.div
              key="metadata-remove-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <MetadataRemoveSuccess files={uploadedFiles} onReset={handleBack} />
            </motion.div>
          )}

          {/* Repair Success - Custom component */}
          {step === "success" && toolId === "repair" && (
            <motion.div
              key="repair-success"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <RepairSuccess files={uploadedFiles} onReset={handleBack} />
            </motion.div>
          )}

          {/* New Tool Success - Skip for self-contained tools and tools with custom success components */}
          {step === "success" && isEditorTool && !isSelfContainedTool && toolId !== "split" && toolId !== "merge" && toolId !== "delete" && toolId !== "compare" && toolId !== "protect" && toolId !== "extract" && toolId !== "flatten" && toolId !== "watermark" && toolId !== "organize" && toolId !== "metadata" && toolId !== "repair" && successConfig && (
            <motion.div
              key={`${toolId}-success`}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <ToolSuccess
                title={successConfig.title}
                subtitle={successConfig.subtitle}
                fileName={uploadedFiles[0]?.name || "document.pdf"}
                downloadLabel={successConfig.downloadLabel}
                resetLabel={successConfig.resetLabel}
                proFeatures={successConfig.proFeatures}
                onReset={handleBack}
                followUpAction={successConfig.followUpAction}
              />
            </motion.div>
          )}

          {step === "action" && !isRotate && !isEditPDF && !isEditorTool && (
            <motion.div
              key="action"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: appleEasing }}
            >
              <ToolActionPlaceholder config={config} files={uploadedFiles} onBack={handleBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}