import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Copy, Check, Shield, Zap, ArrowRight, Link as LinkIcon,
  Send, HardDrive, Languages, PenTool, Sparkles, RefreshCw,
  ChevronDown, Grid3X3, History, RotateCw,
  SplitSquareHorizontal, FileText, Trash2, GitCompare,
  FileOutput, Layers, Droplets, Edit3, Database, WrenchIcon,
  FileStack, Users
} from "lucide-react";
import { TransferFile, TransferSettings } from "@/pages/Transfer";
import { cn } from "@/lib/utils";

interface TransferSuccessProps {
  files: TransferFile[];
  settings: TransferSettings;
  transferLink: string;
  transferId: string;
  onStartOver: () => void;
}

const continueActions = [
  { icon: Sparkles, label: "AI Check", path: "/ai-check" },
  { icon: PenTool, label: "Sign", path: "/sign" },
  { icon: FileStack, label: "Compress", path: "/compress" },
  { icon: HardDrive, label: "Storage", path: "/storage" },
  { icon: Languages, label: "Translate", path: "/translate" },
  { icon: RefreshCw, label: "Convert", path: "/convert" },
  { icon: History, label: "Track", path: "/track" },
];

const toolsSubmenu = [
  { icon: RotateCw, label: "Rotate" },
  { icon: SplitSquareHorizontal, label: "Split" },
  { icon: FileText, label: "Merge" },
  { icon: Trash2, label: "Delete" },
  { icon: GitCompare, label: "Compare" },
  { icon: Shield, label: "Protect" },
  { icon: FileOutput, label: "Extract" },
  { icon: Layers, label: "PDF to One Page" },
  { icon: Droplets, label: "Watermark" },
  { icon: Grid3X3, label: "Organize" },
  { icon: Database, label: "Metadata" },
  { icon: WrenchIcon, label: "Repair" },
  { icon: Edit3, label: "Edit PDF" },
];

function CompletionAnimation() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative w-20 h-20 mx-auto"
    >
      {/* Glow pulse */}
      <motion.div
        className="absolute inset-[-10px] rounded-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0, 0.4, 0.15],
          scale: [0.8, 1.1, 1],
        }}
        transition={{ 
          duration: 1.2,
          times: [0, 0.4, 1],
          ease: "easeOut"
        }}
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.2), transparent 65%)",
          filter: "blur(12px)",
        }}
      />

      <svg className="w-full h-full" viewBox="0 0 80 80">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="hsl(var(--primary) / 0.08)"
          strokeWidth="2.5"
        />
        
        {/* Progress ring */}
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="hsl(var(--primary) / 0.5)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          style={{
            rotate: -90,
            transformOrigin: "center",
            filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.3))",
          }}
        />
        
        {/* Checkmark */}
        <motion.path
          d="M26 42 L36 52 L56 32"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ 
            pathLength: { delay: 0.5, duration: 0.35, ease: "easeOut" },
            opacity: { delay: 0.5, duration: 0.1 }
          }}
          style={{
            filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))",
          }}
        />
      </svg>
    </motion.div>
  );
}

function ContinueWorkflowSection() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.4 }}
      className="mb-6"
      ref={containerRef}
    >
      <h3 className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-3 text-center">
        Take this document to another service
      </h3>
      
      <div className={cn(
        "flex flex-wrap items-center justify-center gap-1 p-2 rounded-xl",
        "bg-muted/8 backdrop-blur-sm",
        "border border-border/30",
        toolsOpen && "rounded-b-none border-b-0"
      )}>
        {continueActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 + index * 0.04 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "group flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg",
              "text-muted-foreground/60 hover:text-foreground",
              "hover:bg-background/60",
              "transition-all duration-200",
              "hover:shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.15)]"
            )}
          >
            <div className="w-7 h-7 rounded-lg bg-muted/40 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:shadow-[0_0_12px_-2px_hsl(var(--primary)/0.3)]">
              <action.icon className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[9px] font-medium">{action.label}</span>
          </motion.button>
        ))}
        
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 + continueActions.length * 0.04 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setToolsOpen(!toolsOpen)}
          className={cn(
            "group flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg",
            "text-muted-foreground/60 hover:text-foreground",
            "hover:bg-background/60",
            "transition-all duration-200",
            "hover:shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.15)]",
            toolsOpen && "bg-background/60 text-foreground"
          )}
        >
          <div className={cn(
            "w-7 h-7 rounded-lg bg-muted/40 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:shadow-[0_0_12px_-2px_hsl(var(--primary)/0.3)]",
            toolsOpen && "bg-primary/10 shadow-[0_0_12px_-2px_hsl(var(--primary)/0.3)]"
          )}>
            <Grid3X3 className={cn("w-3.5 h-3.5 group-hover:text-primary transition-colors", toolsOpen && "text-primary")} />
          </div>
          <div className="flex items-center gap-0.5">
            <span className="text-[9px] font-medium">All tools</span>
            <ChevronDown className={cn("w-2.5 h-2.5 transition-transform duration-200", toolsOpen && "rotate-180")} />
          </div>
        </motion.button>
      </div>
      
      <AnimatePresence>
        {toolsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className={cn(
              "p-3 rounded-b-xl",
              "bg-background/80 backdrop-blur-xl",
              "border border-t-0 border-border/30",
              "max-h-[200px] overflow-y-auto",
              "[&::-webkit-scrollbar]:w-1.5",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:bg-border/40 [&::-webkit-scrollbar-thumb]:rounded-full"
            )}>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                {toolsSubmenu.map((tool, index) => (
                  <motion.button
                    key={tool.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => setToolsOpen(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg",
                      "text-muted-foreground/60 hover:text-foreground",
                      "hover:bg-muted/40",
                      "transition-all duration-150"
                    )}
                  >
                    <div className="w-6 h-6 rounded-md bg-muted/30 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-150 group-hover:shadow-[0_0_8px_-2px_hsl(var(--primary)/0.25)]">
                      <tool.icon className="w-3 h-3 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-[8px] font-medium text-center leading-tight">{tool.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TransferSuccess({
  files,
  settings,
  transferLink,
  onStartOver,
}: TransferSuccessProps) {
  const [copied, setCopied] = useState(false);
  const isEmailMethod = settings.deliveryMethod === 'email';
  const fileCount = files.length;
  const recipientCount = settings.recipients.length;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(transferLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4">
      {/* Completion Hero - All text in stable container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <CompletionAnimation />
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="text-xl font-semibold text-foreground tracking-tight mt-5 mb-2"
        >
          {isEmailMethod ? "Transfer sent" : "Your transfer is ready"}
        </motion.h1>
        
        {/* Subtitle - matching Compress style */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="text-sm text-muted-foreground"
        >
          {isEmailMethod ? (
            <>
              <span className="text-foreground font-medium">Sent to {recipientCount} {recipientCount === 1 ? 'recipient' : 'recipients'}</span>
              <span className="mx-2.5 text-muted-foreground/30">•</span>
              <span>Expires in {settings.expiryDays} days</span>
            </>
          ) : (
            <>
              <span className="text-foreground font-medium">{fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
              <span className="mx-2.5 text-muted-foreground/30">•</span>
              <span>Link expires in {settings.expiryDays} days</span>
            </>
          )}
        </motion.p>
      </motion.div>

      {/* Link container (for link method) or Recipients display (for email method) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.4 }}
        className="mb-6"
      >
        {isEmailMethod ? (
          // Recipients display
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/30 border border-border/20 max-w-md mx-auto">
            <Users className="w-4 h-4 text-primary/70 flex-shrink-0" />
            <span className="text-sm text-muted-foreground truncate">
              Sent to: {settings.recipients[0]}
              {recipientCount > 1 && (
                <span className="text-muted-foreground/60"> + {recipientCount - 1} more</span>
              )}
            </span>
          </div>
        ) : (
          // Link container - plain selectable text, no copy button
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary/30 border border-border/20 max-w-md mx-auto">
            <LinkIcon className="w-4 h-4 text-primary/70 flex-shrink-0" />
            <span className="text-sm text-muted-foreground truncate select-all cursor-text">
              {transferLink}
            </span>
          </div>
        )}
      </motion.div>

      {/* Primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="text-center mb-4"
      >
        {isEmailMethod ? (
          <Link to="/track">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative inline-flex items-center justify-center gap-3",
                "px-12 py-4 rounded-2xl",
                "text-base font-semibold text-primary-foreground",
                "bg-gradient-to-b from-primary via-primary to-primary/85",
                "shadow-[0_6px_32px_-6px_hsl(var(--primary)/0.5),0_2px_8px_-2px_hsl(var(--primary)/0.3)]",
                "transition-all duration-300",
                "hover:shadow-[0_10px_40px_-6px_hsl(var(--primary)/0.6),0_4px_16px_-4px_hsl(var(--primary)/0.4)]",
                "overflow-hidden group"
              )}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
              />
              <History className="w-5 h-5 relative z-10" />
              <span className="relative z-10">View in Track</span>
            </motion.button>
          </Link>
        ) : (
          <motion.button
            onClick={handleCopyLink}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative inline-flex items-center justify-center gap-3",
              "px-12 py-4 rounded-2xl",
              "text-base font-semibold text-primary-foreground",
              "bg-gradient-to-b from-primary via-primary to-primary/85",
              "shadow-[0_6px_32px_-6px_hsl(var(--primary)/0.5),0_2px_8px_-2px_hsl(var(--primary)/0.3)]",
              "transition-all duration-300",
              "hover:shadow-[0_10px_40px_-6px_hsl(var(--primary)/0.6),0_4px_16px_-4px_hsl(var(--primary)/0.4)]",
              "overflow-hidden group"
            )}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
            />
            {copied ? (
              <Check className="w-5 h-5 relative z-10" />
            ) : (
              <Copy className="w-5 h-5 relative z-10" />
            )}
            <span className="relative z-10">{copied ? 'Copied!' : 'Copy link'}</span>
          </motion.button>
        )}
      </motion.div>

      {/* Secondary CTAs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.4 }}
        className="text-center mb-8 space-y-2"
      >
        <button
          onClick={onStartOver}
          className="text-[12px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          New transfer
        </button>
        {!isEmailMethod && (
          <div>
            <Link 
              to="/track" 
              className="text-[11px] text-primary/60 hover:text-primary transition-colors"
            >
              View in Track
            </Link>
          </div>
        )}
      </motion.div>

      {/* Upgrade to Pro Banner - matching Compress */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.4 }}
        className="mb-8"
      >
        <div className="relative rounded-2xl overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.02) 50%, hsl(var(--primary) / 0.06) 100%)",
                "linear-gradient(225deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.08) 50%, hsl(var(--primary) / 0.02) 100%)",
                "linear-gradient(315deg, hsl(var(--primary) / 0.02) 0%, hsl(var(--primary) / 0.06) 50%, hsl(var(--primary) / 0.08) 100%)",
                "linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.02) 50%, hsl(var(--primary) / 0.06) 100%)",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          <div 
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.1), transparent)",
            }}
          />
          
          <div className="absolute inset-0 rounded-2xl border border-primary/15" />
          
          <div className="relative px-6 py-5 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 hsl(var(--primary) / 0)",
                      "0 0 20px 2px hsl(var(--primary) / 0.15)",
                      "0 0 0 0 hsl(var(--primary) / 0)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Zap className="w-5 h-5 text-primary" />
                </motion.div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground whitespace-nowrap">
                    Unlock Pro — advanced transfer controls
                  </h3>
                  <p className="text-xs text-muted-foreground/70 mt-0.5 whitespace-nowrap">
                    Password protection • Custom expiry • Download limits • Larger files
                  </p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl",
                  "text-sm font-semibold text-primary",
                  "bg-primary/8 hover:bg-primary/12",
                  "border border-primary/20 hover:border-primary/35",
                  "shadow-[0_2px_16px_-4px_hsl(var(--primary)/0.25)]",
                  "hover:shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.35)]",
                  "transition-all duration-250",
                  "overflow-hidden group shrink-0"
                )}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                />
                <span className="relative z-10">Go Pro</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:translate-x-0.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Continue Workflow Section */}
      <ContinueWorkflowSection />
    </div>
  );
}

export default TransferSuccess;
