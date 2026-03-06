import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { TransferLanding } from "@/components/transfer/TransferLanding";

// Export types for other components that may need them
export interface TransferFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress: number;
  status: 'waiting' | 'uploading' | 'completed' | 'error';
}

export interface TransferSettings {
  deliveryMethod: 'link' | 'email';
  recipients: string[];
  subject: string;
  message: string;
  password: string;
  expiryDays: number;
  downloadLimit: number | null;
  viewOnly: boolean;
}

export default function Transfer() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [incomingFileName, setIncomingFileName] = useState<string>("");

  // Handle file passed from Storage
  useEffect(() => {
    const stateFile = location.state?.file;
    if (stateFile) {
      setIncomingFileName(stateFile.name);
      setIsLoading(true);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15;
        setUploadProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 400);
        }
      }, 100);
    }
  }, [location.state]);

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
      <div className="h-screen flex flex-col overflow-hidden">
        {isLoading ? renderUploadingState() : <TransferLanding />}
      </div>
    </AppLayout>
  );
}
