import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MetadataModeSelect } from "./MetadataModeSelect";
import { MetadataForm } from "./MetadataForm";
import { MetadataRemove } from "./MetadataRemove";

interface MetadataEditorProps {
  files: File[];
  onProcess: (mode: "update" | "remove") => void;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

type MetadataMode = "select" | "update" | "remove";

export function MetadataEditor({ files, onProcess }: MetadataEditorProps) {
  const [mode, setMode] = useState<MetadataMode>("select");

  const handleModeSelect = (selectedMode: "update" | "remove") => {
    setMode(selectedMode);
  };

  const handleCancel = () => {
    setMode("select");
  };

  const handleProcess = () => {
    if (mode === "update" || mode === "remove") {
      onProcess(mode);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {mode === "select" && (
        <motion.div
          key="mode-select"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: appleEasing }}
        >
          <MetadataModeSelect files={files} onModeSelect={handleModeSelect} />
        </motion.div>
      )}

      {mode === "update" && (
        <motion.div
          key="update-form"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: appleEasing }}
        >
          <MetadataForm files={files} onProcess={handleProcess} onCancel={handleCancel} />
        </motion.div>
      )}

      {mode === "remove" && (
        <motion.div
          key="remove-confirm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: appleEasing }}
        >
          <MetadataRemove files={files} onProcess={handleProcess} onCancel={handleCancel} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
