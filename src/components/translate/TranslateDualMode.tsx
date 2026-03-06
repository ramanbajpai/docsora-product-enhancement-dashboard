import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Plus, Columns, AlignJustify, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "./LanguageSelector";
import { DetectedLanguageDisplay } from "./DetectedLanguageDisplay";
import { TranslationResult } from "@/pages/Translate";
import { toast } from "sonner";

const supportedFormats = ['PDF', 'DOCX', 'DOC', 'TXT'];

interface TranslateDualModeProps {
  onTranslate: (result: TranslationResult) => void;
  onStartTranslating: () => void;
}

type DualLayout = "split" | "paragraph";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  pageCount?: number;
}

const layoutOptions = [
  {
    id: "split" as DualLayout,
    label: "Split Page",
    description: "Left/Right columns",
    icon: Columns,
  },
  {
    id: "paragraph" as DualLayout,
    label: "Paragraph by Paragraph",
    description: "Alternating paragraphs",
    icon: AlignJustify,
  },
];

export const TranslateDualMode = ({
  onTranslate,
  onStartTranslating,
}: TranslateDualModeProps) => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [layout, setLayout] = useState<DualLayout>("split");
  const [showFormats, setShowFormats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      pageCount: Math.floor(Math.random() * 20) + 1,
    });

    // Simulate language detection on file upload
    setIsDetecting(true);
    setTimeout(() => {
      setDetectedLanguage("en"); // Mock detected language
      setIsDetecting(false);
    }, 800);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleTranslate = () => {
    if (!file || !targetLanguage) {
      toast.error("Please upload a file and select a target language");
      return;
    }

    onStartTranslating();
    
    setTimeout(() => {
      onTranslate({
        sourceLanguage: detectedLanguage || "en",
        targetLanguage,
        fileName: file.name,
        pageCount: file.pageCount,
        mode: "dual",
      });
    }, 2500);
  };

  // Get language name for preview
  const getLanguageName = (code: string | null) => {
    const languages: Record<string, string> = {
      en: "English",
      ar: "العربية",
      fr: "French",
      de: "German",
      es: "Spanish",
      ja: "Japanese",
      "zh-CN": "Chinese",
    };
    return code ? languages[code] || code : "Target";
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-medium text-primary">
          Built for press, legal, and enterprise communications
        </span>
      </div>

      {/* Language Selection */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Primary:</span>
          <DetectedLanguageDisplay 
            detectedLanguage={detectedLanguage} 
            isDetecting={isDetecting}
          />
        </div>
        
        <Plus className="w-4 h-4 text-muted-foreground hidden sm:block" />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Secondary:</span>
          <LanguageSelector
            value={targetLanguage}
            onChange={setTargetLanguage}
            placeholder="Select secondary language"
          />
        </div>
      </div>

      {/* Layout Selection */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground">Document Layout</label>
          <p className="text-sm text-muted-foreground mt-1">
            Choose how the original and translated content should appear in the final document.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          {layoutOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setLayout(option.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${layout === option.id 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
                }
              `}
            >
              <option.icon className={`w-5 h-5 mb-2 ${layout === option.id ? "text-primary" : "text-muted-foreground"}`} />
              <div className="font-medium text-sm text-foreground">{option.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
              
              {layout === option.id && (
                <motion.div
                  layoutId="activeLayout"
                  className="absolute inset-0 border-2 border-primary rounded-xl"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      {!file ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl py-16 px-12
            transition-all duration-300
            ${isDragging 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-border hover:border-primary/50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ y: isDragging ? -5 : 0 }}
              className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5"
            >
              <Upload className="w-7 h-7 text-primary" />
            </motion.div>
            
            <h3 className="text-lg font-medium text-foreground mb-5">
              Upload document
            </h3>
            
            {/* Primary CTA */}
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-11 px-6 rounded-xl font-medium text-sm overflow-hidden"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="absolute -inset-2 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                }}
              />
              <div className="absolute inset-0 bg-primary rounded-xl transition-all duration-300 group-hover:bg-primary/90" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-xl" />
              <span className="relative flex items-center gap-2 text-primary-foreground font-medium">
                <Upload className="w-4 h-4" />
                Choose File
              </span>
            </motion.button>
            
            <p className="text-[11px] text-muted-foreground/40 mt-3">Drag & drop supported</p>
            
            {/* View supported formats link */}
            <button
              onClick={() => setShowFormats(!showFormats)}
              className="inline-flex items-center gap-1 mt-4 text-[11px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors duration-200"
            >
              <span>{showFormats ? 'Hide' : 'View'} supported formats</span>
              <motion.div
                animate={{ rotate: showFormats ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <ChevronDown className="w-3 h-3" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {showFormats && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap justify-center gap-1.5 pt-3">
                    {supportedFormats.map((format, i) => (
                      <motion.span
                        key={format}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="px-2 py-0.5 text-[10px] font-medium rounded bg-muted/50 text-muted-foreground/60"
                      >
                        {format}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{file.name}</h4>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>{file.pageCount} pages</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setFile(null);
                setDetectedLanguage(null);
              }}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Preview Layout Indicator */}
          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <div className="text-xs font-medium text-muted-foreground mb-3">Output Preview</div>
            <div className="flex gap-2 h-24">
              {layout === "split" && (
                <>
                  <div className="flex-1 bg-background rounded border border-border p-2">
                    <div className="text-[10px] text-muted-foreground mb-1">
                      {getLanguageName(detectedLanguage)}
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 bg-muted-foreground/20 rounded w-full" />
                      <div className="h-1.5 bg-muted-foreground/20 rounded w-4/5" />
                      <div className="h-1.5 bg-muted-foreground/20 rounded w-3/4" />
                    </div>
                  </div>
                  <div className="flex-1 bg-background rounded border border-border p-2">
                    <div className="text-[10px] text-muted-foreground mb-1 text-right">
                      {getLanguageName(targetLanguage)}
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 bg-primary/30 rounded w-full" />
                      <div className="h-1.5 bg-primary/30 rounded w-4/5 ml-auto" />
                      <div className="h-1.5 bg-primary/30 rounded w-3/4 ml-auto" />
                    </div>
                  </div>
                </>
              )}
              {layout === "paragraph" && (
                <div className="flex-1 bg-background rounded border border-border p-2 space-y-2">
                  <div className="space-y-0.5">
                    <div className="h-1 bg-muted-foreground/20 rounded w-full" />
                    <div className="h-1 bg-muted-foreground/20 rounded w-3/4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="h-1 bg-primary/30 rounded w-full" />
                    <div className="h-1 bg-primary/30 rounded w-4/5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="h-1 bg-muted-foreground/20 rounded w-full" />
                    <div className="h-1 bg-muted-foreground/20 rounded w-2/3" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Options */}
          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <span>Export as:</span>
            <span className="px-2 py-0.5 bg-muted rounded text-xs">DOCX</span>
            <span className="px-2 py-0.5 bg-muted rounded text-xs">PDF</span>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleTranslate}
              disabled={!targetLanguage}
              size="lg"
              className="px-8"
            >
              Generate Dual-Language Document
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
