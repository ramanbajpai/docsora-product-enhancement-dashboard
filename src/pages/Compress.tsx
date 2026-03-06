import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CompressUpload } from "@/components/compress/CompressUpload";
import { CompressModeSelect } from "@/components/compress/CompressModeSelect";
import { CompressProgress } from "@/components/compress/CompressProgress";
import { CompressResult } from "@/components/compress/CompressResult";

export type CompressionMode = "balanced" | "maximum" | "quality";

export interface FileData {
  name: string;
  size: number;
  type: string;
}

export type CompressStage = "upload" | "uploading" | "mode" | "progress" | "result";

const Compress = () => {
  const location = useLocation();
  const [stage, setStage] = useState<CompressStage>("upload");
  const [file, setFile] = useState<FileData | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mode, setMode] = useState<CompressionMode>("balanced");
  const [compressionResult, setCompressionResult] = useState({
    originalSize: 0,
    compressedSize: 0,
    reduction: 0,
  });

  // Handle file passed from Storage
  useEffect(() => {
    const stateFile = location.state?.file;
    if (stateFile) {
      setFile({ name: stateFile.name, size: stateFile.size || 1024000, type: stateFile.type });
      setStage("uploading");
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15;
        setUploadProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => setStage("mode"), 400);
        }
      }, 100);
    }
  }, [location.state]);

  const handleFileSelect = (fileData: FileData) => {
    setFile(fileData);
    setStage("mode");
  };

  const handleStartCompress = (files: FileData[]) => {
    const fileData = files[0];
    setFile(fileData);
    setStage("mode");
  };

  const handleModeSelect = (selectedMode: CompressionMode) => {
    setMode(selectedMode);
  };

  const handleStartCompression = () => {
    setStage("progress");
    
    setTimeout(() => {
      const reductions = { balanced: 0.58, maximum: 0.72, quality: 0.32 };
      const reduction = reductions[mode];
      setCompressionResult({
        originalSize: file?.size || 42600000,
        compressedSize: (file?.size || 42600000) * (1 - reduction),
        reduction: reduction * 100,
      });
      setStage("result");
    }, 4000);
  };

  const handleReset = () => {
    setStage("upload");
    setFile(null);
    setUploadProgress(0);
    setMode("balanced");
    setCompressionResult({ originalSize: 0, compressedSize: 0, reduction: 0 });
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
  );

  return (
    <AppLayout>
      <div className="h-screen flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {(stage === "upload" || stage === "uploading") && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1 min-h-0 flex flex-col"
            >
              {stage === "uploading" ? renderUploadingState() : (
                <CompressUpload onFileSelect={handleFileSelect} onStartCompress={handleStartCompress} />
              )}
            </motion.div>
          )}
        
        
          {stage === "mode" && file && (
            <motion.div
              key="mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1 min-h-0 flex items-center justify-center p-6"
            >
              <CompressModeSelect
                file={file}
                selectedMode={mode}
                onModeSelect={handleModeSelect}
                onStartCompression={handleStartCompression}
              />
            </motion.div>
          )}
        
          {stage === "progress" && file && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1 min-h-0 flex items-center justify-center p-6"
            >
              <CompressProgress file={file} mode={mode} />
            </motion.div>
          )}
        
          {stage === "result" && file && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1 min-h-0 flex items-center justify-center p-6"
            >
              <CompressResult
                file={file}
                result={compressionResult}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Compress;
