import { motion } from "framer-motion";
import { FolderOpen, Plus, Upload, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StorageHeaderProps {
  storageUsed: number;
  storageTotal: number;
  onCreateFolder: () => void;
  onUpload: () => void;
}

const StorageHeader = ({ 
  storageUsed, 
  storageTotal, 
  onCreateFolder, 
  onUpload 
}: StorageHeaderProps) => {
  const usagePercentage = (storageUsed / storageTotal) * 100;

  return (
    <div className="space-y-4">
      {/* Title and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Storage</h1>
          <p className="text-sm text-muted-foreground">
            Your intelligent document repository
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={onCreateFolder}
          >
            <Plus className="w-4 h-4" />
            Create folder
          </Button>
          <Button
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={onUpload}
          >
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Storage Usage Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 rounded-xl"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-foreground">
              {storageUsed.toFixed(2)} GB
            </span>
            <span className="text-sm text-muted-foreground">
              used from {storageTotal.toFixed(2)} GB
            </span>
          </div>
          
          {/* Trust indicators */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>SOC 2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>GDPR</span>
            </div>
            <span className="text-muted-foreground/60">Enterprise encryption</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usagePercentage}%` }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
          />
        </div>

        {/* Usage breakdown on hover - simplified version */}
        <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Documents: 1.8 GB</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Media: 0.35 GB</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Other: 0.1 GB</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StorageHeader;
