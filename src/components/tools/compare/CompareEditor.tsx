import { useState } from "react";
import { CompareViewer } from "./CompareViewer";
import { CompareProcessing } from "./CompareProcessing";

interface CompareEditorProps { 
  files: File[]; 
  onProcess: () => void; 
}

type CompareStep = "processing" | "viewer";

export function CompareEditor({ files, onProcess }: CompareEditorProps) {
  const [step, setStep] = useState<CompareStep>("processing");

  const handleProcessingComplete = () => {
    setStep("viewer");
  };

  const handleBackFromViewer = () => {
    // This would go back to upload, but since we removed the preview, 
    // we'll let the parent handle navigation
    onProcess();
  };

  if (step === "processing") {
    return <CompareProcessing files={files} onComplete={handleProcessingComplete} />;
  }

  return <CompareViewer files={files} onBack={handleBackFromViewer} />;
}
