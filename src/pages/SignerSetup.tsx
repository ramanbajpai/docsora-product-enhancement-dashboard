import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ArrowRight, RotateCcw, Upload, PenTool, Trash2, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSignerProfile } from "@/hooks/useSignerProfile";
import { useSavedSignatures, SavedSignature } from "@/hooks/useSavedSignatures";

const SIGNATURE_FONTS = [
  { name: "Dancing Script", label: "Script" },
  { name: "Great Vibes", label: "Elegant" },
  { name: "Caveat", label: "Natural" },
];

type SignatureTab = "style" | "draw" | "upload" | "saved";

export default function SignerSetup() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get document info from state or use defaults
  const documentName = location.state?.documentName || "Document";
  const senderName = location.state?.senderName || "Sender";
  const recipientEmail = location.state?.recipientEmail || "recipient@example.com";
  const isProtected = location.state?.isProtected ?? false;
  const passwordUnlocked = location.state?.passwordUnlocked || false;
  
  const { profile, isLoading, saveProfile } = useSignerProfile(requestId || "", recipientEmail);
  
  // Shared saved signatures
  const { signatures: savedSignatures, addSignature, deleteSignature, hasSignatures, refresh: refreshSignatures } = useSavedSignatures();
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [locationValue, setLocationValue] = useState("");
  
  // Signature state
  const [activeTab, setActiveTab] = useState<SignatureTab>("style");
  const [selectedFontIndex, setSelectedFontIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([]);
  const [penSize, setPenSize] = useState<"small" | "medium" | "large">("medium");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Refresh signatures on mount
  useEffect(() => {
    refreshSignatures();
  }, [refreshSignatures]);
  
  // Initialize tabs with saved option if we have saved signatures
  const tabs: { id: SignatureTab; label: string }[] = [
    { id: "style", label: "Style" },
    { id: "draw", label: "Draw" },
    { id: "upload", label: "Upload" },
    ...(hasSignatures ? [{ id: "saved" as SignatureTab, label: "Saved" }] : []),
  ];
  
  // Initialize from existing profile if editing
  useEffect(() => {
    if (profile && !isLoading) {
      setFullName(profile.fullName);
      setInitials(profile.initials);
      setTitle(profile.title || "");
      setCompany(profile.company || "");
      setLocationValue(profile.location || "");
      // Always default to "style" tab - don't auto-switch to saved
      setActiveTab("style");
      if (profile.signatureMethod === "style" && profile.signatureFont) {
        const fontIndex = SIGNATURE_FONTS.findIndex(f => f.name === profile.signatureFont);
        if (fontIndex >= 0) setSelectedFontIndex(fontIndex);
      } else if (profile.signatureMethod === "upload") {
        setUploadedImage(profile.signatureData);
      }
    }
  }, [profile, isLoading]);
  
  // Auto-generate initials from name
  useEffect(() => {
    if (fullName) {
      const words = fullName.trim().split(/\s+/);
      const generatedInitials = words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
      setInitials(generatedInitials);
    }
  }, [fullName]);
  
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
  
  // Canvas drawing handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ("touches" in e) {
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
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
  };
  
  const canContinue = () => {
    if (!fullName.trim()) return false;
    if (activeTab === "saved") return true;
    if (activeTab === "draw" && !hasDrawnSignature) return false;
    if (activeTab === "upload" && !uploadedImage) return false;
    return true;
  };

  const canSave = () => {
    if (!fullName.trim()) return false;
    if (activeTab === "draw" && !hasDrawnSignature) return false;
    if (activeTab === "upload" && !uploadedImage) return false;
    return true;
  };
  
  const getSignatureData = (): string => {
    // If using a saved signature from shared library
    if (activeTab === "saved" && selectedSavedId) {
      const selectedSig = savedSignatures.find(s => s.id === selectedSavedId);
      if (selectedSig) {
        return selectedSig.data;
      }
    }
    if (activeTab === "style") {
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
        ctx.fillText(fullName || "Your Name", 200, 50);
        return tempCanvas.toDataURL();
      }
    } else if (activeTab === "draw" && canvasRef.current) {
      const sourceCanvas = canvasRef.current;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = sourceCanvas.width;
      tempCanvas.height = sourceCanvas.height;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(sourceCanvas, 0, 0);
        return tempCanvas.toDataURL();
      }
    } else if (activeTab === "upload" && uploadedImage) {
      return uploadedImage;
    }
    return "";
  };

  const getSignatureMethod = (): "style" | "draw" | "upload" => {
    if (activeTab === "saved" && selectedSavedId) {
      const selectedSig = savedSignatures.find(s => s.id === selectedSavedId);
      if (selectedSig) {
        return selectedSig.type === "styled" ? "style" : selectedSig.type === "drawn" ? "draw" : "upload";
      }
    }
    return activeTab === "saved" ? "style" : activeTab;
  };
  
  const getSignatureFont = (): string | undefined => {
    if (activeTab === "saved" && selectedSavedId) {
      const selectedSig = savedSignatures.find(s => s.id === selectedSavedId);
      if (selectedSig?.fontName) {
        return selectedSig.fontName;
      }
    }
    if (activeTab === "style") {
      return SIGNATURE_FONTS[selectedFontIndex].name;
    }
    return profile?.signatureFont;
  };
  
  const handleSaveSignature = useCallback(() => {
    if (!canSave()) {
      toast.error("Please complete all required fields");
      return;
    }
    
    const signatureData = getSignatureData();
    
    const success = saveProfile({
      fullName: fullName.trim(),
      initials: initials.trim(),
      email: recipientEmail,
      signatureMethod: getSignatureMethod(),
      signatureData,
      signatureFont: getSignatureFont(),
      title: title.trim() || undefined,
      company: company.trim() || undefined,
      location: locationValue.trim() || undefined,
    });
    
    if (success) {
      toast.success("Signature saved");
    } else {
      toast.error("Failed to save signature");
    }
  }, [fullName, initials, activeTab, selectedFontIndex, title, company, locationValue, recipientEmail, profile, saveProfile]);
  
  const handleContinue = useCallback(() => {
    if (!canContinue()) {
      toast.error("Please complete all required fields");
      return;
    }
    
    const signatureData = getSignatureData();
    
    const success = saveProfile({
      fullName: fullName.trim(),
      initials: initials.trim(),
      email: recipientEmail,
      signatureMethod: getSignatureMethod(),
      signatureData,
      signatureFont: getSignatureFont(),
      title: title.trim() || undefined,
      company: company.trim() || undefined,
      location: locationValue.trim() || undefined,
    });
    
    if (success) {
      toast.success("Signature saved");
      navigate(`/sign/received/${requestId}`, {
        state: { 
          documentName, 
          senderName, 
          recipientEmail,
          fromSetup: true,
          isProtected,
          passwordUnlocked
        }
      });
    } else {
      toast.error("Failed to save profile. Please try again.");
    }
  }, [fullName, initials, activeTab, selectedFontIndex, title, company, locationValue, recipientEmail, requestId, documentName, senderName, profile, saveProfile, navigate, isProtected, passwordUnlocked]);
  
  const handleBack = () => {
    navigate("/track", { 
      state: { 
        activeTab: "sign",
        subTab: "received" 
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back button - positioned absolutely */}
      <div className="absolute top-6 left-6 z-10">
        <button
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleBack}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Centered content wrapper */}
      <div className="flex-1 flex items-start justify-center pt-20 lg:pt-24 pb-8 px-4 lg:px-8">
        <motion.div
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title & Subtitle - centered */}
          <div className="text-center mb-3">
            <h1 className="text-2xl font-light text-foreground tracking-tight mb-1">
              Confirm your details & signature
            </h1>
            <p className="text-sm text-muted-foreground">
              This will be used to complete the document you've been asked to sign.
            </p>
          </div>
          
          {/* Signing As Identity - centered */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border/50">
              <span className="text-xs text-muted-foreground">Signing as</span>
              <span className="text-sm font-medium text-foreground">{recipientEmail}</span>
            </div>
          </div>

          {/* Split Layout - tighter gap, items-start for top alignment */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
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
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="CEO"
                    className="h-10 bg-background border border-border rounded-lg px-3 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-sm transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Company</label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc"
                    className="h-10 bg-background border border-border rounded-lg px-3 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-sm transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 w-1/2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Location</label>
                <Input
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
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
            <div className="flex items-center gap-1 mb-5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300
                    ${activeTab === tab.id 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground/70"
                    }
                  `}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 bg-muted/60 rounded-full"
                      layoutId="activeTabRecipient"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content Container - Fixed Height */}
            <div className="min-h-[340px]">
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
                        key={`${fullName}-${selectedFontIndex}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-4xl text-primary relative z-10"
                        style={{ fontFamily: `'${SIGNATURE_FONTS[selectedFontIndex].name}', cursive` }}
                      >
                        {fullName || "Your Name"}
                      </motion.div>
                    </div>

                    {/* Font Options */}
                    <div className="space-y-3">
                      {SIGNATURE_FONTS.map((font, index) => (
                        <motion.button
                          key={font.name}
                          onClick={() => setSelectedFontIndex(index)}
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
                            {fullName || "Your Name"}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeUploadedImage}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Remove
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

                {/* Saved Tab - Using shared signature library */}
                {activeTab === "saved" && hasSignatures && (
                  <motion.div
                    key="saved"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {savedSignatures.map((sig) => (
                      <motion.button
                        key={sig.id}
                        onClick={() => setSelectedSavedId(sig.id)}
                        className={`
                          relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                          ${selectedSavedId === sig.id 
                            ? "border-primary/60 bg-primary/[0.02]" 
                            : "border-border/50 hover:border-border hover:bg-muted/30"
                          }
                        `}
                        whileTap={{ scale: 0.995 }}
                      >
                        <div className="flex items-center justify-between">
                          {/* Signature preview */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="h-12 w-32 flex items-center justify-center bg-white rounded-lg border border-neutral-200 px-2 overflow-hidden">
                              {sig.type === "styled" && sig.fontName ? (
                                <span
                                  style={{ fontFamily: sig.fontName }}
                                  className="text-xl text-neutral-800 truncate"
                                >
                                  {sig.name}
                                </span>
                              ) : (
                                <img 
                                  src={sig.data} 
                                  alt={sig.name} 
                                  className="max-h-full max-w-full object-contain"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground/90 truncate">{sig.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {sig.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Selection indicator or delete */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSignature(sig.id);
                                if (selectedSavedId === sig.id) {
                                  setSelectedSavedId(savedSignatures.length > 1 ? savedSignatures.find(s => s.id !== sig.id)?.id || null : null);
                                }
                                toast.success("Signature deleted");
                              }}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {selectedSavedId === sig.id && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                    
                    <p className="text-xs text-muted-foreground mt-4">
                      These are your saved signatures. Select one to use, or switch tabs to create a new one.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

          {/* Action Button - inside container, right aligned */}
          <div className="flex justify-end items-center mt-10">
            <Button
              size="lg"
              className="h-12 px-8 text-sm font-medium"
              onClick={handleContinue}
              disabled={!canContinue()}
            >
              Continue to document
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
