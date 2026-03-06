import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { getToolConfig, ToolConfig } from "@/components/tools/toolConfig";
import { LayoutGrid, Check, Zap } from "lucide-react";

// Ordered by usage and value - grouped into rows
const toolOrder = [
  // Primary tools (Row 1)
  ["edit", "merge", "split", "compress"],
  // Document structure & cleanup (Row 2)
  ["rotate", "delete", "organize", "extract"],
  // Advanced / trust features (Row 3)
  ["protect", "watermark", "compare", "repair"],
  // Low-frequency utilities (Row 4)
  ["metadata", "flatten"],
];

// Short, action-focused descriptions
const toolDescriptions: Record<string, string> = {
  edit: "Edit text, images, and pages",
  merge: "Combine multiple PDFs into one",
  split: "Separate pages into files",
  compress: "Reduce file size",
  rotate: "Change page orientation",
  delete: "Remove unwanted pages",
  organize: "Reorder and arrange pages",
  extract: "Pull specific pages out",
  protect: "Add password encryption",
  watermark: "Add text or image overlay",
  compare: "Spot differences between files",
  repair: "Fix corrupted documents",
  metadata: "View document properties",
  flatten: "Condense to single page",
};

// Extended tool info for contextual panel
const toolDetails: Record<string, { bestFor: string[]; proFeatures: string[] }> = {
  edit: {
    bestFor: ["Quick text corrections", "Adding annotations", "Filling form fields"],
    proFeatures: ["Batch editing", "OCR text recognition", "Advanced annotations"],
  },
  merge: {
    bestFor: ["Combining reports", "Creating portfolios", "Assembling contracts"],
    proFeatures: ["Unlimited file merging", "Custom page ordering", "Bookmarks preservation"],
  },
  split: {
    bestFor: ["Extracting chapters", "Separating invoices", "Breaking large files"],
    proFeatures: ["Split by bookmarks", "Batch splitting", "Auto-naming rules"],
  },
  compress: {
    bestFor: ["Email attachments", "Web uploads", "Storage optimization"],
    proFeatures: ["Lossless compression", "Batch processing", "Quality presets"],
  },
  rotate: {
    bestFor: ["Scanned documents", "Portrait to landscape", "Fixing orientation"],
    proFeatures: ["Batch rotation", "Custom angles", "Auto-detect orientation"],
  },
  delete: {
    bestFor: ["Removing blank pages", "Cleaning up drafts", "Trimming documents"],
    proFeatures: ["Batch page removal", "Range selection", "Undo history"],
  },
  organize: {
    bestFor: ["Reordering presentations", "Restructuring reports", "Custom arrangements"],
    proFeatures: ["Drag-and-drop ordering", "Thumbnail preview", "Multi-document organize"],
  },
  extract: {
    bestFor: ["Pulling specific pages", "Creating excerpts", "Isolating content"],
    proFeatures: ["Extract to multiple files", "Page range presets", "Metadata preservation"],
  },
  protect: {
    bestFor: ["Confidential documents", "Legal files", "Sharing sensitive data"],
    proFeatures: ["256-bit encryption", "Permission controls", "Watermark + password"],
  },
  watermark: {
    bestFor: ["Branding documents", "Draft marking", "Copyright protection"],
    proFeatures: ["Image watermarks", "Custom positioning", "Batch watermarking"],
  },
  compare: {
    bestFor: ["Contract revisions", "Version control", "Legal review"],
    proFeatures: ["AI-powered diff", "Change tracking", "Side-by-side view"],
  },
  repair: {
    bestFor: ["Corrupted files", "Download errors", "Recovery attempts"],
    proFeatures: ["Deep repair mode", "Structure recovery", "Batch repair"],
  },
  metadata: {
    bestFor: ["Document audit", "Privacy check", "File information"],
    proFeatures: ["Bulk metadata edit", "Privacy scrubbing", "Custom properties"],
  },
  flatten: {
    bestFor: ["Form locking", "Print preparation", "Reducing complexity"],
    proFeatures: ["Selective flattening", "Layer control", "Batch processing"],
  },
};

function ToolCard({ 
  tool, 
  index, 
  onClick,
  onHover,
  isSelected,
}: { 
  tool: ToolConfig; 
  index: number; 
  onClick: () => void;
  onHover: (tool: ToolConfig | null) => void;
  isSelected: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 400, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover(tool);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const Icon = tool.icon;
  const description = toolDescriptions[tool.id] || tool.description;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.02, ease: [0.23, 1, 0.32, 1] }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <motion.div
        className={`relative h-full p-4 rounded-xl border transition-colors ${
          isSelected 
            ? "border-primary/40 bg-primary/5 dark:bg-primary/10" 
            : "border-border/30 dark:border-white/[0.06] bg-card/30 dark:bg-white/[0.02]"
        }`}
        whileHover={{ 
          y: -2, 
          borderColor: "rgba(59,130,246,0.35)",
        }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Inner glow on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 pointer-events-none rounded-xl"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            background: "radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center gap-2.5">
          {/* Icon */}
          <motion.div
            className="w-9 h-9 rounded-lg bg-primary/8 dark:bg-primary/12 flex items-center justify-center"
            animate={{ 
              scale: isHovered ? 1.05 : 1,
              boxShadow: isHovered 
                ? "0 0 16px rgba(59,130,246,0.3)" 
                : "0 0 0px rgba(59,130,246,0)"
            }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <Icon 
              className="w-4 h-4 text-primary" 
              strokeWidth={1.75} 
            />
          </motion.div>

          {/* Title */}
          <h3 className="text-xs font-semibold text-foreground tracking-tight leading-tight">
            {tool.name}
          </h3>

          {/* Description - compact */}
          <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
            {description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ContextualPanel({ tool }: { tool: ToolConfig | null }) {
  const details = tool ? toolDetails[tool.id] : null;
  const Icon = tool?.icon;

  return (
    <div className="sticky top-8 h-fit">
      <AnimatePresence mode="wait">
        {tool && details ? (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl border border-border/30 dark:border-white/[0.06] bg-card/40 dark:bg-white/[0.02] backdrop-blur-sm p-6 space-y-6"
          >
            {/* Tool header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {Icon && <Icon className="w-5 h-5 text-primary" strokeWidth={1.75} />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{tool.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{tool.subtitle}</p>
              </div>
            </div>

            {/* Best for section */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Best for
              </h4>
              <ul className="space-y-2">
                {details.bestFor.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-foreground/90">
                    <div className="w-1 h-1 rounded-full bg-primary/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro features */}
            <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pro Features
                </h4>
              </div>
              <ul className="space-y-2">
                {details.proFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary/70" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 transition-colors hover:bg-primary/90"
            >
              <Zap className="w-4 h-4" />
              Use {tool.name} Tool
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-dashed border-border/20 dark:border-white/[0.04] bg-card/20 dark:bg-white/[0.01] p-8 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <LayoutGrid className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground/70">
              Hover over a tool to see details
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1">
              Click to start using it
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro upgrade card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 p-5"
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary">Unlock Pro</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Batch processing • Unlimited files • Priority support
        </p>
      </motion.div>
    </div>
  );
}

export default function Tools() {
  const navigate = useNavigate();
  const [hoveredTool, setHoveredTool] = useState<ToolConfig | null>(null);
  
  // Flatten tool order and get configs
  const orderedTools = toolOrder.flat().map(id => getToolConfig(id)).filter(Boolean) as ToolConfig[];

  const handleToolClick = (tool: ToolConfig) => {
    navigate(`/tools/${tool.id}`);
  };

  return (
    <AppLayout>
      <div className="min-h-screen relative">
        {/* Centered content container with responsive padding */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="pt-10 pb-8"
          >
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Tools
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Edit, prepare, and secure your documents.
            </p>
          </motion.header>

          {/* Main layout: Grid + Contextual Panel */}
          <div className="pb-32">
            <div className="flex gap-8 lg:gap-10">
              {/* Tools grid - responsive columns with consistent gaps */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
                  {orderedTools.map((tool, index) => (
                    <ToolCard 
                      key={tool.id} 
                      tool={tool} 
                      index={index} 
                      onClick={() => handleToolClick(tool)}
                      onHover={setHoveredTool}
                      isSelected={hoveredTool?.id === tool.id}
                    />
                  ))}
                </div>
              </div>

              {/* Contextual panel - hidden on smaller screens */}
              <div className="hidden lg:block w-72 xl:w-80 shrink-0">
                <ContextualPanel tool={hoveredTool} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade gradient */}
        <div 
          className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
          style={{
            background: "linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background)) 10%, transparent 100%)",
          }}
        />
      </div>
    </AppLayout>
  );
}
