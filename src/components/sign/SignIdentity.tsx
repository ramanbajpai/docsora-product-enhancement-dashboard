import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ArrowRight, RotateCcw, Upload, PenTool, Lightbulb, Clock, X, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignatureData } from "@/pages/Sign";
import { toast } from "sonner";
import { useSavedSignatures, SavedSignature } from "@/hooks/useSavedSignatures";

interface SignIdentityProps {
  initialData: SignatureData;
  onComplete: (data: SignatureData) => void;
  onBack: () => void;
}

const SIGNATURE_FONTS = [
  { name: "Dancing Script", label: "Script" },
  { name: "Great Vibes", label: "Elegant" },
  { name: "Caveat", label: "Natural" },
];

type TabType = "style" | "draw" | "upload" | "saved";

const SignIdentity = ({ initialData, onComplete, onBack }: SignIdentityProps) => {
  const [formData, setFormData] = useState<SignatureData>(initialData);
  const [activeTab, setActiveTab] = useState<TabType>("style");
  const [selectedFontIndex, setSelectedFontIndex] = useState(0);
  
  // Draw tab state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState<"small" | "medium" | "large">("medium");
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([]);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  
  // Upload tab state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Saved signatures - using shared hook
  const { signatures: savedSignatures, addSignature, deleteSignature, refresh: refreshSignatures } = useSavedSignatures();
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);

  // Refresh signatures when component mounts (in case they were added elsewhere)
  useEffect(() => {
    refreshSignatures();
  }, [refreshSignatures]);

  useEffect(() => {
    if (formData.fullName) {
      const words = formData.fullName.trim().split(/\s+/);
      const initials = words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
      setFormData(prev => ({ ...prev, initials }));
    }
  }, [formData.fullName]);

  // Initialize canvas - black ink only
  useEffect(() => {
    if (activeTab === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#1a1a1a"; // Always black ink
        ctx.lineWidth = penSize === "small" ? 1.5 : penSize === "medium" ? 2.5 : 4;
      }
    }
  }, [activeTab, penSize]);

  const handleInputChange = useCallback((field: keyof SignatureData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFontSelect = useCallback((index: number) => {
    setSelectedFontIndex(index);
    setFormData(prev => ({ ...prev, selectedFont: SIGNATURE_FONTS[index].name, signatureStyle: "style" }));
  }, []);

  // Canvas drawing handlers
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
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    
    // Save state for undo
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory(prev => [...prev, imageData]);
    
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

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasHistory([]);
    setHasDrawnSignature(false);
  };

  const undoCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas || canvasHistory.length === 0) return;
    
    const previousState = canvasHistory[canvasHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setCanvasHistory(prev => prev.slice(0, -1));
    
    if (canvasHistory.length === 1) {
      setHasDrawnSignature(false);
    }
  };

  // Upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      processUploadedFile(file);
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
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setFormData(prev => ({ ...prev, uploadedSignature: e.target?.result as string, signatureStyle: "upload" }));
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setFormData(prev => ({ ...prev, uploadedSignature: undefined }));
  };

  // Save signature to library
  const handleSaveSignature = useCallback(() => {
    const name = formData.fullName || "Signature";
    let signatureData: string | null = null;
    let type: SavedSignature["type"] = "styled";
    let fontName: string | undefined;

    if (activeTab === "style") {
      // For styled signatures, we'll create a simple canvas render
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 400;
      tempCanvas.height = 100;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 400, 100);
        ctx.font = `48px '${SIGNATURE_FONTS[selectedFontIndex].name}'`;
        ctx.fillStyle = "#1a1a1a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(formData.fullName || "Your Name", 200, 50);
        signatureData = tempCanvas.toDataURL();
        fontName = SIGNATURE_FONTS[selectedFontIndex].name;
        type = "styled";
      }
    } else if (activeTab === "draw" && canvasRef.current && hasDrawnSignature) {
      // Create a new canvas with white background for the preview
      const sourceCanvas = canvasRef.current;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = sourceCanvas.width;
      tempCanvas.height = sourceCanvas.height;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        // Fill with white background first
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        // Draw the signature on top
        ctx.drawImage(sourceCanvas, 0, 0);
        signatureData = tempCanvas.toDataURL();
      } else {
        signatureData = sourceCanvas.toDataURL();
      }
      type = "drawn";
    } else if (activeTab === "upload" && uploadedImage) {
      signatureData = uploadedImage;
      type = "uploaded";
    }

    if (!signatureData) {
      toast.error("Please create a signature first");
      return;
    }

    const newSig = addSignature(signatureData, name, type, fontName);
    
    toast.success("Signature saved to your library");
    
    // Auto-switch to Saved tab after brief delay
    setTimeout(() => {
      setActiveTab("saved");
      setSelectedSavedId(newSig.id);
    }, 800);
  }, [activeTab, formData.fullName, selectedFontIndex, hasDrawnSignature, uploadedImage, addSignature]);

  // Delete saved signature
  const handleDeleteSignature = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSignature(id);
    if (selectedSavedId === id) {
      setSelectedSavedId(null);
    }
    toast.success("Signature deleted");
  }, [deleteSignature, selectedSavedId]);

  // Use saved signature (applies it and switches to the appropriate tab context)
  const handleUseSignature = useCallback((sig: SavedSignature) => {
    setSelectedSavedId(sig.id);
    setFormData(prev => ({
      ...prev,
      fullName: prev.fullName || sig.name, // Use saved name if no name entered
      signatureStyle: sig.type === "styled" ? "style" : sig.type === "drawn" ? "draw" : "upload",
      ...(sig.type === "uploaded" ? { uploadedSignature: sig.data } : {}),
      ...(sig.type === "drawn" ? { drawnSignature: sig.data } : {}),
      ...(sig.type === "styled" && sig.fontName ? { selectedFont: sig.fontName } : {}),
    }));
  }, []);

  const handleContinue = useCallback(() => {
    if (formData.fullName.trim()) {
      let updatedData = { ...formData, signatureStyle: activeTab as SignatureData["signatureStyle"] };
      
      if (activeTab === "style") {
        updatedData.selectedFont = SIGNATURE_FONTS[selectedFontIndex].name;
      } else if (activeTab === "draw" && canvasRef.current) {
        updatedData.drawnSignature = canvasRef.current.toDataURL();
      } else if (activeTab === "saved" && selectedSavedId) {
        const selectedSig = savedSignatures.find(s => s.id === selectedSavedId);
        if (selectedSig) {
          if (selectedSig.type === "drawn") {
            updatedData.drawnSignature = selectedSig.data;
            updatedData.signatureStyle = "draw";
          } else if (selectedSig.type === "uploaded") {
            updatedData.uploadedSignature = selectedSig.data;
            updatedData.signatureStyle = "upload";
          } else if (selectedSig.type === "styled" && selectedSig.fontName) {
            updatedData.selectedFont = selectedSig.fontName;
            updatedData.signatureStyle = "style";
          }
        }
      }
      
      onComplete(updatedData);
    }
  }, [formData, activeTab, selectedFontIndex, selectedSavedId, savedSignatures, onComplete]);

  const canContinue = () => {
    if (!formData.fullName.trim()) return false;
    if (activeTab === "draw" && !hasDrawnSignature) return false;
    if (activeTab === "upload" && !uploadedImage) return false;
    if (activeTab === "saved" && !selectedSavedId && savedSignatures.length > 0) return false;
    if (activeTab === "saved" && savedSignatures.length === 0) return false;
    return true;
  };

  const canSave = () => {
    if (!formData.fullName.trim()) return false;
    if (activeTab === "style") return true;
    if (activeTab === "draw" && hasDrawnSignature) return true;
    if (activeTab === "upload" && uploadedImage) return true;
    return false;
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "style", label: "Style" },
    { id: "draw", label: "Draw" },
    { id: "upload", label: "Upload" },
    { id: "saved", label: "Saved" },
  ];

  return (
    <div className="relative min-h-[calc(100vh-6rem)] px-8 py-12 flex items-center justify-center">
      {/* Back button - positioned absolutely */}
      <button
        className="absolute top-6 left-8 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
        onClick={onBack}
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <motion.div
        className="w-full max-w-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-10">
          <h1 className="text-xl font-light text-foreground tracking-tight">Create signature</h1>
        </div>

        {/* Split Layout - items-start for top alignment */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Identity Form */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                Full Name
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Your full name"
                className="h-11 text-base bg-background border border-border rounded-lg px-3 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-colors"
              />
            </div>

            {/* Initials */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                Initials
              </label>
              <Input
                value={formData.initials}
                onChange={(e) => handleInputChange("initials", e.target.value)}
                placeholder="AB"
                maxLength={4}
                className="h-11 text-base bg-background border border-border rounded-lg px-3 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-colors w-28"
              />
            </div>

            {/* Optional Fields - with subtle divider */}
            <div className="pt-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/40" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground/50 font-medium">Optional</p>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Title</label>
                  <Input
                    value={formData.jobTitle || ""}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    placeholder="CEO"
                    className="h-10 bg-background border border-border rounded-lg px-3 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-sm transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Company</label>
                  <Input
                    value={formData.company || ""}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    placeholder="Acme Inc"
                    className="h-10 bg-background border border-border rounded-lg px-3 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-sm transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 w-1/2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Location</label>
                <Input
                  value={formData.location || ""}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="San Francisco"
                  className="h-10 bg-background border border-border rounded-lg px-3 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-sm transition-colors"
                />
              </div>
            </div>
          </motion.div>

          {/* Right: Signature Preview */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300
                    ${activeTab === tab.id 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground/70"
                    }
                  `}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 bg-muted/60 rounded-full"
                      layoutId="activeTab"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content Container - Fixed Height */}
            <div className="min-h-[420px]">
              <AnimatePresence mode="wait">
                {/* Style Tab */}
                {activeTab === "style" && (
                  <motion.div
                    key="style"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Live Preview */}
                    <div className="relative h-36 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent" />
                      <motion.div
                        key={`${formData.fullName}-${selectedFontIndex}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-4xl text-primary relative z-10"
                        style={{ fontFamily: `'${SIGNATURE_FONTS[selectedFontIndex].name}', cursive` }}
                      >
                        {formData.fullName || "Your Name"}
                      </motion.div>
                    </div>

                    {/* Font Options */}
                    <div className="space-y-3">
                      {SIGNATURE_FONTS.map((font, index) => (
                        <motion.button
                          key={font.name}
                          onClick={() => handleFontSelect(index)}
                          className={`
                            relative w-full text-left p-5 rounded-xl border-2 transition-all duration-200
                            ${selectedFontIndex === index 
                              ? "border-primary/60 bg-primary/[0.02]" 
                              : "border-transparent hover:bg-muted/30"
                            }
                          `}
                          whileTap={{ scale: 0.995 }}
                        >
                          <span
                            className="text-2xl text-foreground/90"
                            style={{ fontFamily: `'${font.name}', cursive` }}
                          >
                            {formData.fullName || "Your Name"}
                          </span>
                          {selectedFontIndex === index && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Draw Tab */}
                {activeTab === "draw" && (
                  <motion.div
                    key="draw"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {/* Canvas - Paper-like appearance */}
                    <div className="relative rounded-xl overflow-hidden bg-white border border-neutral-200 shadow-sm dark:bg-white">
                      {/* Subtle paper texture effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/50 to-transparent pointer-events-none" />
                      
                      {/* Canvas guide text */}
                      {!hasDrawnSignature && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="flex items-center gap-2 text-neutral-300">
                            <PenTool className="w-4 h-4" />
                            <span className="text-sm">Sign here</span>
                          </div>
                        </div>
                      )}
                      
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={200}
                        className="w-full h-52 cursor-crosshair touch-none bg-white"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                      
                      {/* Signature line */}
                      <div className="absolute bottom-8 left-8 right-8 border-b border-neutral-200" />
                      <span className="absolute bottom-3 left-8 text-[10px] text-neutral-400 uppercase tracking-wider">Signature</span>
                    </div>

                    {/* Stroke Thickness */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-medium">Stroke thickness</span>
                      <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/50">
                        {([
                          { key: "small", label: "Thin" },
                          { key: "medium", label: "Medium" },
                          { key: "large", label: "Bold" }
                        ] as const).map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => setPenSize(key)}
                            className={`
                              px-3 py-1.5 text-xs font-medium rounded-md transition-all
                              ${penSize === key 
                                ? "bg-background shadow-sm text-foreground" 
                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                              }
                            `}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={undoCanvas}
                        disabled={canvasHistory.length === 0}
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Undo
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCanvas}
                        disabled={!hasDrawnSignature}
                        className="gap-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Upload Tab */}
                {activeTab === "upload" && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {!uploadedImage ? (
                      <>
                        {/* Upload Zone */}
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`
                            relative h-52 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
                            flex flex-col items-center justify-center gap-3 bg-[hsl(220,13%,12%)] dark:bg-[hsl(220,13%,12%)]
                            ${isDragging 
                              ? "border-primary/60" 
                              : "border-[hsl(220,10%,25%)] hover:border-[hsl(220,10%,35%)]"
                            }
                          `}
                        >
                          <Upload className={`w-5 h-5 ${isDragging ? "text-primary" : "text-[hsl(220,10%,50%)]"}`} />
                          
                          <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-white">
                              {isDragging ? "Drop your signature here" : "Upload an image of your signature"}
                            </p>
                            <p className="text-xs text-[hsl(220,10%,55%)]">
                              PNG or JPG · Transparent background recommended
                            </p>
                            <p className="text-xs text-[hsl(220,10%,45%)]">
                              Drag and drop supported
                            </p>
                          </div>
                          
                          <Button size="sm" className="relative z-10 mt-1 bg-primary hover:bg-primary/90">
                            Choose File
                          </Button>
                          
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                        
                        {/* Upload tips */}
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="w-4 h-4 text-primary/70 mt-0.5 shrink-0" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">Tips for best results</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Use a clean, high-contrast signature on white paper. 
                                PNG with transparent background works best.
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Uploaded Image Preview */}
                        <div className="relative rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent" />
                          
                          <div className="relative h-40 flex items-center justify-center">
                            <img 
                              src={uploadedImage} 
                              alt="Uploaded signature" 
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          
                          {/* Remove button */}
                          <button
                            onClick={removeUploadedImage}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Actions for uploaded image */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="hover:bg-muted hover:text-foreground hover:border-muted"
                          >
                            Replace Image
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Saved Tab */}
                {activeTab === "saved" && (
                  <motion.div
                    key="saved"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {savedSignatures.length > 0 ? (
                      <div className="space-y-3">
                        {savedSignatures.map((sig) => (
                          <motion.button
                            key={sig.id}
                            onClick={() => {
                              setSelectedSavedId(sig.id);
                              handleUseSignature(sig);
                            }}
                            className={`
                              relative w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group
                              ${selectedSavedId === sig.id 
                                ? "border-primary/60 bg-primary/[0.02]" 
                                : "border-transparent hover:bg-muted/30"
                              }
                            `}
                            whileTap={{ scale: 0.995 }}
                          >
                            <div className="flex items-center justify-between">
                              {/* Signature preview */}
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="h-12 w-32 flex items-center justify-center bg-white rounded-lg border border-neutral-200 px-2">
                                  <img 
                                    src={sig.data} 
                                    alt={sig.name} 
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground/90 truncate">{sig.name}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {sig.createdAt.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Selection indicator & Delete */}
                              <div className="flex items-center gap-2">
                                {/* Delete button */}
                                <button
                                  onClick={(e) => handleDeleteSignature(sig.id, e)}
                                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                
                                {/* Checkmark for selected */}
                                {selectedSavedId === sig.id && (
                                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="w-3 h-3 text-primary-foreground" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      /* Empty State */
                      <div className="relative h-64 rounded-xl bg-card/50 backdrop-blur-sm border border-border/40 flex flex-col items-center justify-center p-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] to-transparent rounded-xl pointer-events-none" />
                        
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                          <PenTool className="w-5 h-5 text-muted-foreground" />
                        </div>
                        
                        <h3 className="text-sm font-medium text-foreground mb-1.5">No saved signatures yet</h3>
                        <p className="text-xs text-muted-foreground text-center max-w-xs mb-5">
                          Save a signature from Style, Draw, or Upload to reuse it anytime.
                        </p>
                        
                        <Button
                          size="sm"
                          onClick={() => setActiveTab("style")}
                          className="gap-2"
                        >
                          Create Signature
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex justify-end items-center gap-3 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Save Signature - Only show on Style, Draw, Upload tabs */}
          {activeTab !== "saved" && (
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-sm font-medium hover:bg-muted hover:text-foreground hover:border-muted"
              onClick={handleSaveSignature}
              disabled={!canSave()}
            >
              Save Signature
            </Button>
          )}
          
          <Button
            size="lg"
            className="h-12 px-8 text-sm font-medium"
            onClick={handleContinue}
            disabled={!canContinue()}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignIdentity;
