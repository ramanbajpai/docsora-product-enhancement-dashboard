import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import ConvertUpload from "@/components/convert/ConvertUpload";
import ConvertAnalysis from "@/components/convert/ConvertAnalysis";
import ConvertFormatSelect from "@/components/convert/ConvertFormatSelect";
import ConvertProgress from "@/components/convert/ConvertProgress";
import ConvertResult from "@/components/convert/ConvertResult";

type ConvertStage = "upload" | "uploading" | "analysis" | "format" | "converting" | "success";

interface FileData {
  name: string;
  size: number;
  type: string;
}

interface ConversionData {
  originalFormat: string;
  targetFormat: string;
  pages: number;
  originalSize: number;
  newSize: number;
}

const Convert = () => {
  const location = useLocation();
  const [stage, setStage] = useState<ConvertStage>("upload");
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [conversionData, setConversionData] = useState<ConversionData | null>(null);

  // Handle file passed from Storage
  useEffect(() => {
    const stateFile = location.state?.file;
    if (stateFile) {
      const fileData = { name: stateFile.name, size: stateFile.size || 1024000, type: stateFile.type };
      setFiles([fileData]);
      setStage("uploading");
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15;
        setUploadProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          setStage("analysis");
          setTimeout(() => setStage("format"), 3500);
        }
      }, 100);
    }
  }, [location.state]);

  const handleFilesUploaded = (uploadedFiles: FileData[]) => {
    setFiles(prev => [...prev, ...uploadedFiles]);
    if (files.length === 0) {
      setStage("analysis");
      // Simulate analysis
      setTimeout(() => setStage("format"), 3500);
    }
  };

  const handleStartConvert = (uploadedFiles: FileData[]) => {
    setFiles(uploadedFiles);
    setStage("analysis");
    // Simulate analysis
    setTimeout(() => setStage("format"), 3500);
  };

  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
    setStage("converting");
    // Simulate conversion
    setTimeout(() => {
      setConversionData({
        originalFormat: files[0]?.type.split("/")[1]?.toUpperCase() || "PDF",
        targetFormat: format,
        pages: Math.floor(Math.random() * 20) + 1,
        originalSize: files[0]?.size || 2500000,
        newSize: Math.floor((files[0]?.size || 2500000) * 0.85),
      });
      setStage("success");
    }, 4000);
  };

  const handleReset = () => {
    setStage("upload");
    setFiles([]);
    setUploadProgress(0);
    setSelectedFormat("");
    setConversionData(null);
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
          <p className="text-sm text-muted-foreground">{files[0]?.name}</p>
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

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AppLayout>
      <div className="h-screen flex flex-col overflow-hidden relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10" />
        
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10 flex-1 min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            {(stage === "upload" || stage === "uploading") && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex-1 min-h-0 flex flex-col"
              >
                {stage === "uploading" ? renderUploadingState() : (
                  <ConvertUpload onFilesUploaded={handleFilesUploaded} onStartConvert={handleStartConvert} files={files} />
                )}
              </motion.div>
            )}

            {stage === "analysis" && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex-1 min-h-0 flex flex-col"
              >
                <ConvertAnalysis file={files[0]} />
              </motion.div>
            )}

            {stage === "format" && (
              <motion.div
                key="format"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex-1 min-h-0 flex flex-col"
              >
                <ConvertFormatSelect
                  files={files}
                  onSelectFormat={handleFormatSelect}
                  onRemoveFile={handleRemoveFile}
                />
              </motion.div>
            )}

            {stage === "converting" && (
              <motion.div
                key="converting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex-1 min-h-0 flex flex-col"
              >
                <ConvertProgress
                  file={files[0]}
                  targetFormat={selectedFormat}
                />
              </motion.div>
            )}

            {stage === "success" && conversionData && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 min-h-0 flex flex-col"
              >
                <ConvertResult
                  conversionData={conversionData}
                  fileName={files[0]?.name || "document"}
                  fileCount={files.length}
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

export default Convert;
