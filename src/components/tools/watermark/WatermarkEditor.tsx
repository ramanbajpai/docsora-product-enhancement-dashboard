import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolLayout } from "../shared/ToolLayout";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface WatermarkEditorProps {
  files: File[];
  onProcess: () => void;
}

type Rotation = 0 | 45 | -45 | 90;
type FontFamily = "Inter" | "Helvetica" | "Arial" | "Georgia";
type FontWeight = "normal" | "500" | "bold";

const fontFamilies: { value: FontFamily; label: string; style: string }[] = [
  { value: "Inter", label: "Inter", style: "font-sans" },
  { value: "Helvetica", label: "Helvetica", style: "font-sans" },
  { value: "Arial", label: "Arial", style: "font-sans" },
  { value: "Georgia", label: "Serif", style: "font-serif" },
];

const fontWeights: { value: FontWeight; label: string }[] = [
  { value: "normal", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "bold", label: "Bold" },
];


export function WatermarkEditor({ files, onProcess }: WatermarkEditorProps) {
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState([50]);
  const [fontSize, setFontSize] = useState([48]);
  const [rotation, setRotation] = useState<Rotation>(-45);
  const [fontFamily, setFontFamily] = useState<FontFamily>("Inter");
  const [fontWeight, setFontWeight] = useState<FontWeight>("bold");
  const [color, setColor] = useState("#9ca3af");
  const [showFontDropdown, setShowFontDropdown] = useState(false);

  const rotationOptions: { value: Rotation; label: string }[] = [
    { value: 0, label: "0°" },
    { value: -45, label: "-45°" },
    { value: 45, label: "45°" },
    { value: 90, label: "90°" },
  ];

  const currentFont = fontFamilies.find(f => f.value === fontFamily);

  return (
    <ToolLayout
      title="Add Watermark"
      description="Add a text watermark to your document"
      fileCount={files.length}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Watermark will be applied to all pages
          </p>
          <Button 
            onClick={onProcess} 
            disabled={!text.trim()} 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          >
            <Droplets className="w-4 h-4 mr-2" />
            Apply watermark
          </Button>
        </div>
      }
    >
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Live Preview */}
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground mb-3">Live preview</p>
            <div className="flex-1 min-h-[360px] md:min-h-[480px] rounded-xl bg-white dark:bg-neutral-100 relative overflow-hidden border border-border/30 shadow-sm">
              {/* Mock document lines */}
              <div className="absolute inset-4 flex flex-col gap-2 pointer-events-none opacity-30">
                <div className="w-3/4 h-2 bg-neutral-300 rounded" />
                <div className="w-full h-2 bg-neutral-200 rounded" />
                <div className="w-5/6 h-2 bg-neutral-200 rounded" />
                <div className="w-2/3 h-2 bg-neutral-200 rounded" />
                <div className="mt-4 w-full h-2 bg-neutral-200 rounded" />
                <div className="w-4/5 h-2 bg-neutral-200 rounded" />
                <div className="w-full h-2 bg-neutral-200 rounded" />
                <div className="w-3/4 h-2 bg-neutral-200 rounded" />
              </div>

              {/* Watermark - always centered */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <motion.span
                  animate={{ opacity: opacity[0] / 100 }}
                  style={{ 
                    fontSize: fontSize[0],
                    transform: `rotate(${rotation}deg)`,
                    color: color,
                    fontFamily: fontFamily === "Georgia" ? "Georgia, serif" : `${fontFamily}, sans-serif`,
                    fontWeight: fontWeight,
                  }}
                  className="select-none text-center break-words max-w-[80%] leading-tight"
                >
                  {text || "WATERMARK"}
                </motion.span>
              </div>
            </div>
          </div>

          {/* Right: Controls - centered vertically */}
          <div className="flex flex-col gap-5 justify-center">
            {/* Watermark Text */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Watermark text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-background px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Enter watermark text"
              />
            </div>

            {/* Font Family & Weight Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Font Family Dropdown */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Font</label>
                <div className="relative">
                  <button
                    onClick={() => setShowFontDropdown(!showFontDropdown)}
                    className="w-full h-10 rounded-lg border border-border bg-background px-4 text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors"
                  >
                    <span>{currentFont?.label}</span>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showFontDropdown && "rotate-180")} />
                  </button>
                  {showFontDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                      {fontFamilies.map((font) => (
                        <button
                          key={font.value}
                          onClick={() => {
                            setFontFamily(font.value);
                            setShowFontDropdown(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2.5 text-sm text-left hover:bg-secondary/50 transition-colors",
                            fontFamily === font.value && "bg-primary/10 text-primary"
                          )}
                          style={{ fontFamily: font.value === "Georgia" ? "Georgia, serif" : `${font.value}, sans-serif` }}
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Font Weight */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Weight</label>
                <div className="flex gap-1.5">
                  {fontWeights.map((weight) => (
                    <button
                      key={weight.value}
                      onClick={() => setFontWeight(weight.value)}
                      className={cn(
                        "flex-1 h-10 rounded-lg border text-xs font-medium transition-all duration-150",
                        fontWeight === weight.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/50 text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {weight.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Color</label>
              <div className="relative w-14 h-10">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="w-14 h-10 rounded-lg border border-border cursor-pointer shadow-sm"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>

            {/* Size Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">Size</label>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">{fontSize[0]}px</span>
              </div>
              <Slider value={fontSize} onValueChange={setFontSize} min={16} max={96} step={4} />
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">Opacity</label>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">{opacity[0]}%</span>
              </div>
              <Slider value={opacity} onValueChange={setOpacity} min={10} max={100} step={5} />
            </div>

            {/* Rotation */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Rotation</label>
              <div className="flex gap-2">
                {rotationOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRotation(opt.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150",
                      rotation === opt.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/50 text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
