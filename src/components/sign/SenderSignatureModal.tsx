import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, Type, Upload, Trash2, Undo2, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { removeBackground, loadImage } from "@/lib/removeBackground";
import { toast } from "sonner";

interface SenderSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (signatureData: string, type: "styled" | "drawn" | "uploaded") => void;
  senderName: string;
  fieldType: "signature" | "initials";
}

const SIGNATURE_FONTS = [
  { name: "Dancing Script", label: "Script" },
  { name: "Great Vibes", label: "Elegant" },
  { name: "Caveat", label: "Natural" },
];

type TabType = "style" | "draw" | "upload";

interface CanvasHistory {
  data: ImageData;
}

const SenderSignatureModal = ({ 
  isOpen, 
  onClose, 
  onComplete, 
  senderName,
  fieldType 
}: SenderSignatureModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("style");
  const [selectedFontIndex, setSelectedFontIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  
  // Draw state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState<"small" | "medium" | "large">("medium");
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState<CanvasHistory[]>([]);
  
  // Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize canvas
  useEffect(() => {
    if (activeTab === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = penSize === "small" ? 1.5 : penSize === "medium" ? 2.5 : 4;
      }
    }
  }, [activeTab, penSize]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setHasDrawnSignature(false);
      setUploadedImage(null);
      setCanvasHistory([]);
    }
  }, [isOpen, senderName, fieldType]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory(prev => [...prev, { data: imageData }]);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    
    saveCanvasState();
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawnSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    saveCanvasState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const undoCanvas = () => {
    if (canvasHistory.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    
    const newHistory = [...canvasHistory];
    const lastState = newHistory.pop();
    setCanvasHistory(newHistory);
    
    if (lastState) {
      ctx.putImageData(lastState.data, 0, 0);
      // Check if canvas is empty after undo
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = imageData.data.some((val, idx) => idx % 4 === 3 && val > 0);
      setHasDrawnSignature(hasContent);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      processUploadedFile(file);
    }
  };

  const handleRemoveBackground = async () => {
    if (!uploadedImage) return;
    
    setIsRemovingBg(true);
    try {
      // Load the image element from the data URL
      const imageElement = await loadImage(uploadedImage);
      
      const resultBlob = await removeBackground(imageElement);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        toast.success("Background removed");
      };
      reader.readAsDataURL(resultBlob);
    } catch (error) {
      console.error("Error removing background:", error);
      toast.error("Failed to remove background");
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleConfirm = useCallback(() => {
    let signatureData: string | null = null;
    let type: "styled" | "drawn" | "uploaded" = "styled";

    if (activeTab === "style") {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 300;
      tempCanvas.height = 80;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 300, 80);
        // For initials, use Inter font; for signatures, use selected fancy font
        if (fieldType === "initials") {
          ctx.font = "32px 'Inter', sans-serif";
        } else {
          ctx.font = `36px '${SIGNATURE_FONTS[selectedFontIndex].name}'`;
        }
        ctx.fillStyle = "#1a1a1a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(inputValue || (fieldType === "initials" ? "AB" : "Your Signature"), 150, 40);
        signatureData = tempCanvas.toDataURL();
        type = "styled";
      }
    } else if (activeTab === "draw" && canvasRef.current && hasDrawnSignature) {
      const sourceCanvas = canvasRef.current;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = sourceCanvas.width;
      tempCanvas.height = sourceCanvas.height;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(sourceCanvas, 0, 0);
        signatureData = tempCanvas.toDataURL();
      }
      type = "drawn";
    } else if (activeTab === "upload" && uploadedImage) {
      signatureData = uploadedImage;
      type = "uploaded";
    }

    if (signatureData) {
      onComplete(signatureData, type);
    }
  }, [activeTab, inputValue, selectedFontIndex, hasDrawnSignature, uploadedImage, fieldType, onComplete]);

  const canConfirm = () => {
    if (activeTab === "style") return inputValue.trim().length > 0;
    if (activeTab === "draw") return hasDrawnSignature;
    if (activeTab === "upload") return !!uploadedImage;
    return false;
  };

  // For initials, only show the Type tab
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = fieldType === "initials" 
    ? [{ id: "style", label: "Type", icon: Type }]
    : [
        { id: "style", label: "Type", icon: Type },
        { id: "draw", label: "Draw", icon: Pencil },
        { id: "upload", label: "Upload", icon: Upload },
      ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            Create your {fieldType === "initials" ? "initials" : "signature"}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs - only show multiple tabs for signature */}
        {tabs.length > 1 && (
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-all
                    ${activeTab === tab.id 
                      ? "bg-background shadow-sm text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content */}
        <div className="min-h-[200px]">
          <AnimatePresence mode="wait">
            {activeTab === "style" && (
              <motion.div
                key="style"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={fieldType === "initials" ? "JM" : "Your name"}
                  className="text-center text-lg"
                  maxLength={fieldType === "initials" ? 4 : undefined}
                />
                
                {/* Font Preview */}
                <div className="h-20 bg-white border border-border rounded-lg flex items-center justify-center">
                  <span
                    className="text-3xl text-gray-900"
                    style={{ 
                      fontFamily: fieldType === "initials" 
                        ? "'Inter', sans-serif" 
                        : `'${SIGNATURE_FONTS[selectedFontIndex].name}', cursive` 
                    }}
                  >
                    {inputValue || (fieldType === "initials" ? "JM" : "Your Signature")}
                  </span>
                </div>

                {/* Font Selector - only for signatures */}
                {fieldType === "signature" && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {SIGNATURE_FONTS.map((font, idx) => (
                      <button
                        key={font.name}
                        onClick={() => setSelectedFontIndex(idx)}
                        className={`
                          px-3 py-2 rounded-lg border text-sm whitespace-nowrap transition-all
                          ${selectedFontIndex === idx 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                          }
                        `}
                        style={{ fontFamily: `'${font.name}', cursive` }}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "draw" && fieldType === "signature" && (
              <motion.div
                key="draw"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={120}
                    className="w-full h-32 border border-border rounded-lg bg-white cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>

                {/* Draw controls: pen size + clear/undo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Stroke:</span>
                    {(["small", "medium", "large"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setPenSize(size)}
                        className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                          ${penSize === size ? "border-primary" : "border-border"}
                        `}
                      >
                        <div 
                          className="rounded-full bg-foreground"
                          style={{ 
                            width: size === "small" ? 4 : size === "medium" ? 6 : 8,
                            height: size === "small" ? 4 : size === "medium" ? 6 : 8,
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={undoCanvas}
                      disabled={canvasHistory.length === 0}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      Undo
                    </button>
                    <button
                      onClick={clearCanvas}
                      disabled={!hasDrawnSignature}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "upload" && fieldType === "signature" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                {uploadedImage ? (
                  <div className="space-y-3">
                    <div className="relative h-32 border border-border rounded-lg bg-white flex items-center justify-center overflow-hidden">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded signature" 
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveBackground}
                      disabled={isRemovingBg}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isRemovingBg ? "Removing background..." : "Remove background"}
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-colors
                      bg-[hsl(220,13%,12%)] dark:bg-[hsl(220,13%,12%)]
                      ${isDragging 
                        ? "border-primary/60" 
                        : "border-[hsl(220,10%,25%)] hover:border-[hsl(220,10%,35%)]"
                      }
                    `}
                  >
                    <Upload className={`w-5 h-5 ${isDragging ? "text-primary" : "text-[hsl(220,10%,50%)]"}`} />
                    <div className="text-center space-y-1">
                      <span className="block text-sm font-medium text-white">Upload an image of your signature</span>
                      <span className="block text-xs text-[hsl(220,10%,55%)]">PNG or JPG · Transparent background recommended</span>
                      <span className="block text-xs text-[hsl(220,10%,45%)]">Drag and drop supported</span>
                    </div>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm()} className="flex-1">
            Add {fieldType === "initials" ? "Initials" : "Signature"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SenderSignatureModal;
