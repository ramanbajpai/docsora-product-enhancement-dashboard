import { useState, useEffect } from "react";
import { CinematicUploadCard } from "@/components/upload/CinematicUploadCard";
import { ToolConfig } from "./toolConfig";

interface ToolUploadProps {
  config: ToolConfig;
  onFilesUploaded: (files: File[]) => void;
}

export function ToolUpload({ config, onFilesUploaded }: ToolUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleFilesReady = (files: File[]) => {
    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(100);
        setIsComplete(true);
        
        // Wait for completion animation then proceed
        setTimeout(() => {
          onFilesUploaded(files);
        }, 800);
      } else {
        setUploadProgress(progress);
      }
    }, 150);
  };

  return (
    <CinematicUploadCard
      title={config.title}
      subtitle={config.subtitle}
      readyTitle={config.readyTitle}
      hint={config.hint}
      supportedFormats={config.supportedFormats}
      accept=".pdf"
      mode={config.uploadMode}
      acceptMultiple={config.acceptMultiple}
      minFiles={config.minFiles}
      maxFiles={config.maxFiles}
      minFilesMessage={config.minFilesMessage}
      onFilesReady={handleFilesReady}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      isComplete={isComplete}
    />
  );
}
