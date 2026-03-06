import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stamp, 
  Upload, 
  Trash2, 
  X, 
  Eraser, 
  Loader2,
  Check,
  RotateCw,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useStampStorage, SavedStamp } from "@/hooks/useStampStorage";
import { removeBackground, loadImage, blobToDataURL } from "@/lib/removeBackground";
import { toast } from "sonner";

interface StampPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStamp: (imageData: string, options?: { rotation?: number; opacity?: number }) => void;
}

export function StampPicker({ isOpen, onClose, onSelectStamp }: StampPickerProps) {
  const { stamps, addStamp, deleteStamp } = useStampStorage();
  const [activeTab, setActiveTab] = useState<"upload" | "saved">(stamps.length > 0 ? "saved" : "upload");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [saveForFuture, setSaveForFuture] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [stampToDelete, setStampToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp" || file.type === "image/svg+xml")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPendingImage(event.target?.result as string);
        setRotation(0);
        setOpacity(100);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleRemoveBackground = useCallback(async () => {
    if (!pendingImage) return;
    setIsRemovingBackground(true);
    try {
      const img = await loadImage(pendingImage);
      const blob = await removeBackground(img);
      const dataUrl = await blobToDataURL(blob);
      setPendingImage(dataUrl);
      toast.success("Background removed");
    } catch (error) {
      console.error("Failed to remove background:", error);
      toast.error("Failed to remove background");
    } finally {
      setIsRemovingBackground(false);
    }
  }, [pendingImage]);

  const handleConfirmUpload = useCallback(() => {
    if (!pendingImage) return;
    
    if (saveForFuture) {
      addStamp(pendingImage);
      toast.success("Stamp saved for future use");
    }
    
    onSelectStamp(pendingImage, { rotation, opacity: opacity / 100 });
    setPendingImage(null);
    setSaveForFuture(false);
    setRotation(0);
    setOpacity(100);
    onClose();
  }, [pendingImage, saveForFuture, rotation, opacity, addStamp, onSelectStamp, onClose]);

  const handleSelectSavedStamp = useCallback((stamp: SavedStamp) => {
    onSelectStamp(stamp.imageData, { rotation: 0, opacity: 1 });
    onClose();
  }, [onSelectStamp, onClose]);

  const handleDeleteStamp = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStampToDelete(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (stampToDelete) {
      deleteStamp(stampToDelete);
      setStampToDelete(null);
      toast.success("Stamp deleted");
    }
  }, [stampToDelete, deleteStamp]);

  const handleClose = useCallback(() => {
    setPendingImage(null);
    setSaveForFuture(false);
    setRotation(0);
    setOpacity(100);
    setStampToDelete(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Stamp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Stamp</h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/30 rounded-lg mb-5">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "upload"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload New
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "saved"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Saved Stamps
            {stamps.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                {stamps.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {!pendingImage ? (
                  /* Upload Zone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp" || file.type === "image/svg+xml")) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setPendingImage(event.target?.result as string);
                          setRotation(0);
                          setOpacity(100);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      Click to upload
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      Drag & drop supported
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, SVG with transparency
                    </p>
                  </div>
                ) : (
                  /* Preview & Options */
                  <>
                    <div className="bg-muted/30 rounded-xl p-6 flex items-center justify-center min-h-[180px]">
                      <img
                        src={pendingImage}
                        alt="Stamp preview"
                        className="max-w-full max-h-40 object-contain rounded-lg"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          opacity: opacity / 100,
                        }}
                      />
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                      {/* Remove Background */}
                      <button
                        onClick={handleRemoveBackground}
                        disabled={isRemovingBackground}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground hover:bg-muted/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRemovingBackground ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Removing background...
                          </>
                        ) : (
                          <>
                            <Eraser className="w-4 h-4" />
                            Remove Background
                          </>
                        )}
                      </button>

                      {/* Rotation */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-muted-foreground flex items-center gap-2">
                            <RotateCw className="w-3.5 h-3.5" />
                            Rotation
                          </label>
                          <span className="text-xs text-muted-foreground">{rotation}°</span>
                        </div>
                        <Slider
                          value={[rotation]}
                          onValueChange={([val]) => setRotation(val)}
                          min={0}
                          max={360}
                          step={15}
                          className="w-full"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-muted-foreground">Opacity</label>
                          <span className="text-xs text-muted-foreground">{opacity}%</span>
                        </div>
                        <Slider
                          value={[opacity]}
                          onValueChange={([val]) => setOpacity(val)}
                          min={10}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      {/* Save for future */}
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors">
                        <Checkbox
                          checked={saveForFuture}
                          onCheckedChange={(checked) => setSaveForFuture(checked === true)}
                        />
                        <span className="text-sm text-foreground">Save this stamp for future use</span>
                      </label>
                    </div>
                  </>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </motion.div>
            )}

            {activeTab === "saved" && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {stamps.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-1">No saved stamps yet</p>
                    <p className="text-xs text-muted-foreground">
                      Upload a stamp and check "Save for future use"
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {stamps.map((stamp) => (
                      <div
                        key={stamp.id}
                        onClick={() => handleSelectSavedStamp(stamp)}
                        className="group relative aspect-square bg-muted/30 rounded-xl border border-border/50 p-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                      >
                        <img
                          src={stamp.imageData}
                          alt={stamp.name}
                          className="w-full h-full object-contain"
                        />
                        
                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDeleteStamp(stamp.id, e)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-background/90 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        {/* Use indicator on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium">
                            Use
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {activeTab === "upload" && pendingImage && (
          <div className="flex gap-3 mt-5 pt-5 border-t border-border/50">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPendingImage(null)}
              disabled={isRemovingBackground}
            >
              Choose Different
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmUpload}
              disabled={isRemovingBackground}
            >
              <Check className="w-4 h-4 mr-2" />
              Place on Document
            </Button>
          </div>
        )}

        {/* Delete Confirmation */}
        <AnimatePresence>
          {stampToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center rounded-2xl"
            >
              <div className="text-center p-6">
                <Trash2 className="w-10 h-10 text-destructive mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">Delete this stamp?</p>
                <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStampToDelete(null)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDelete}>
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
