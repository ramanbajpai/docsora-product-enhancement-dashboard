import { useState } from "react";
import { FileText, Image, Table, Presentation, Files, ChevronDown, ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface FileData {
  name: string;
  size: number;
  type: string;
}

interface ConvertFormatSelectProps {
  files: FileData[];
  onSelectFormat: (format: string) => void;
  onRemoveFile?: (index: number) => void;
}

const formatGroups = [
  {
    name: "Documents",
    icon: FileText,
    formats: [
      { id: "docx", label: "DOCX", description: "Microsoft Word" },
      { id: "pdf-a", label: "PDF/A", description: "Archive format", recommended: true },
      { id: "odt", label: "ODT", description: "OpenDocument" },
      { id: "txt", label: "TXT", description: "Plain text" },
    ],
  },
  {
    name: "Presentations",
    icon: Presentation,
    formats: [
      { id: "pptx", label: "PPTX", description: "PowerPoint" },
      { id: "ppt", label: "PPT", description: "Legacy PowerPoint" },
      { id: "odp", label: "ODP", description: "OpenDocument" },
    ],
  },
  {
    name: "Data",
    icon: Table,
    formats: [
      { id: "xlsx", label: "XLSX", description: "Excel spreadsheet" },
      { id: "csv", label: "CSV", description: "Comma separated" },
      { id: "xml", label: "XML", description: "Structured data" },
    ],
  },
  {
    name: "Images",
    icon: Image,
    formats: [
      { id: "jpg", label: "JPG", description: "Compressed image" },
      { id: "png", label: "PNG", description: "Lossless image" },
    ],
  },
];

const ConvertFormatSelect = ({ files, onSelectFormat, onRemoveFile }: ConvertFormatSelectProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [showFiles, setShowFiles] = useState(false);

  const isMultiFile = files.length > 1;
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  const formatSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const selectedFormatLabel = formatGroups
    .flatMap(g => g.formats)
    .find(f => f.id === selectedFormat)?.label;

  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 lg:p-8">
      <div className="w-full max-w-3xl -mt-[5vh]">
        {/* Header */}
        <div className="mb-8 lg:pl-60">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Choose output format
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            The selected format will be applied to all files.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: File Summary */}
          <div className="w-full lg:w-52 flex-shrink-0">
            <div 
              className="rounded-2xl border border-border/40 overflow-hidden"
              style={{
                background: "hsl(var(--card) / 0.6)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Summary Header */}
              <div className="p-4">
                <div className="flex items-center gap-3">
                  {isMultiFile ? (
                    <div className="relative w-9 h-9 flex-shrink-0">
                      <div className="absolute top-0 left-0 w-5.5 h-7 rounded bg-muted/30 border border-border/20" />
                      <div className="absolute top-0.5 left-0.5 w-5.5 h-7 rounded bg-muted/50 border border-border/20" />
                      <div className="absolute top-1 left-1 w-5.5 h-7 rounded bg-card border border-border/40 flex items-center justify-center">
                        <Files className="w-3 h-3 text-primary" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {isMultiFile ? `${files.length} files` : files[0]?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(totalSize)}{isMultiFile ? " total" : ""}
                    </p>
                  </div>
                </div>

                {/* Show/Hide Files Toggle */}
                {files.length > 1 && (
                  <button
                    onClick={() => setShowFiles(!showFiles)}
                    className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <motion.span
                      animate={{ rotate: showFiles ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </motion.span>
                    {showFiles ? "Hide files" : "Show files"}
                  </button>
                )}
              </div>

              {/* Expandable File List */}
              <AnimatePresence>
                {showFiles && files.length > 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden border-t border-border/20"
                  >
                    <ScrollArea className="max-h-44">
                      <div className="p-2">
                        {files.map((file, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ 
                              duration: 0.2, 
                              delay: index * 0.04,
                              ease: [0.4, 0, 0.2, 1]
                            }}
                            className="group flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/20 transition-colors duration-150"
                          >
                            <div className="min-w-0 flex-1 mr-2">
                              <p className="text-xs text-foreground truncate">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70">
                                {formatSize(file.size)}
                              </p>
                            </div>
                            {onRemoveFile && files.length > 1 && (
                              <button
                                onClick={() => onRemoveFile(index)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 transition-all duration-150"
                                title="Remove file"
                              >
                                <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Format Selection */}
          <div className="flex-1">
            <div className="space-y-5">
              {formatGroups.map((group) => (
                <div key={group.name}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <group.icon className="w-3.5 h-3.5 text-muted-foreground/50" />
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                      {group.name}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {group.formats.map((format) => {
                      const isSelected = selectedFormat === format.id;
                      const hasSelection = selectedFormat !== null;
                      
                      return (
                        <motion.button
                          key={format.id}
                          onClick={() => handleFormatSelect(format.id)}
                          animate={{
                            scale: isSelected ? 1 : 1,
                            opacity: hasSelection && !isSelected ? 0.6 : 1,
                          }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                          className={`relative px-4 py-2.5 rounded-xl text-left transition-all duration-200 ${
                            isSelected
                              ? "bg-primary/10 border-2 border-primary"
                              : "border border-border/30 hover:border-border/50 bg-card/30 hover:bg-card/50"
                          }`}
                        >
                          {/* Selection glow */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                className="absolute inset-0 rounded-xl shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)]"
                              />
                            )}
                          </AnimatePresence>
                          
                          {format.recommended && (
                            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[7px] font-medium bg-primary/80 text-primary-foreground rounded-md">
                              Recommended
                            </span>
                          )}
                          <p className={`font-medium text-sm relative z-10 transition-colors duration-150 ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}>
                            {format.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground relative z-10">
                            {format.description}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button - Only shows when format selected */}
            <AnimatePresence>
              {selectedFormat && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="flex justify-end mt-8"
                >
                  <Button
                    onClick={() => onSelectFormat(selectedFormatLabel || "")}
                    size="lg"
                    className="px-8"
                  >
                    Convert {files.length} {files.length === 1 ? "file" : "files"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvertFormatSelect;
