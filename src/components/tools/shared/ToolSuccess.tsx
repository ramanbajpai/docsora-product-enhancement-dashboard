import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, Download, FileOutput, FileArchive, PenLine, Send, 
  FileSearch, ChevronDown, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FollowUpAction {
  label: string;
  description: string;
  path: string;
}

interface ToolSuccessProps {
  title: string;
  subtitle: string;
  fileName: string;
  downloadLabel?: string;
  resetLabel?: string;
  onReset: () => void;
  proFeatures?: string;
  followUpAction?: FollowUpAction;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ToolSuccess({ 
  title, 
  subtitle, 
  fileName, 
  downloadLabel = "Download document",
  resetLabel = "Process another file",
  onReset,
  proFeatures = "Batch processing & advanced options",
  followUpAction
}: ToolSuccessProps) {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const continueActions = [
    { icon: FileOutput, label: "Compress", path: "/compress", color: "text-blue-400" },
    { icon: FileArchive, label: "Convert", path: "/convert", color: "text-purple-400" },
    { icon: PenLine, label: "Sign", path: "/sign", color: "text-emerald-400" },
    { icon: Send, label: "Transfer", path: "/transfer", color: "text-orange-400" },
    { icon: FileSearch, label: "Track", path: "/track", color: "text-pink-400" },
  ];

  const moreTools = [
    { label: "Rotate Pages", path: "/tools/rotate" },
    { label: "Split PDF", path: "/tools/split" },
    { label: "Merge PDFs", path: "/tools/merge" },
    { label: "Add Watermark", path: "/tools/watermark" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: appleEasing }}
          className="relative mb-8"
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4, ease: appleEasing }}
            className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: appleEasing }}
          className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-2"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: appleEasing }}
          className="text-muted-foreground text-center mb-8"
        >
          {subtitle}
        </motion.p>

        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1, duration: 0.4, ease: appleEasing }}
              className="w-full mb-8"
            >
              <div 
                className="rounded-xl p-4 flex items-center gap-4"
                style={{
                  background: 'hsl(var(--card) / 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid hsl(var(--border) / 0.5)',
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileOutput className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                  <p className="text-xs text-muted-foreground">Ready for download</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: appleEasing }}
          className="w-full mb-4"
        >
          <Button
            size="lg"
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium"
          >
            <Download className="w-5 h-5 mr-2" />
            {downloadLabel}
          </Button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          {resetLabel}
        </motion.button>

        {/* Follow-up Action (e.g., Continue to Organize after Merge) */}
        {followUpAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.4, ease: appleEasing }}
            className="w-full mb-8"
          >
            <button
              onClick={() => navigate(followUpAction.path)}
              className="w-full p-4 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30 transition-all group text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {followUpAction.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {followUpAction.description}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ChevronDown className="w-4 h-4 text-primary -rotate-90" />
                </div>
              </div>
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4, ease: appleEasing }}
              className="w-full"
            >
              <p className="text-xs text-muted-foreground text-center mb-4">
                Continue with this document
              </p>
              
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {continueActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary/50 group-hover:bg-secondary flex items-center justify-center transition-colors">
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {action.label}
                    </span>
                  </motion.button>
                ))}

                <div className="relative">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.05 }}
                    onClick={() => setShowMoreTools(!showMoreTools)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary/50 group-hover:bg-secondary flex items-center justify-center transition-colors">
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showMoreTools ? 'rotate-180' : ''}`} />
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      More
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {showMoreTools && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full right-0 mb-2 w-48 rounded-xl overflow-hidden z-10"
                        style={{
                          background: 'hsl(var(--card) / 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid hsl(var(--border) / 0.5)',
                          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {moreTools.map((tool) => (
                          <button
                            key={tool.label}
                            onClick={() => navigate(tool.path)}
                            className="w-full px-4 py-3 text-sm text-left text-foreground hover:bg-secondary/50 transition-colors"
                          >
                            {tool.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.4, ease: appleEasing }}
              className="w-full mt-12"
            >
              <div 
                className="rounded-xl p-5 text-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.03) 100%)',
                  border: '1px solid hsl(var(--primary) / 0.2)',
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Unlock Pro</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {proFeatures}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  Go Pro →
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
