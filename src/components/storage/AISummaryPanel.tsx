import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Sparkles, ArrowUp, FileArchive, RefreshCw, PenTool, Loader2, Send } from "lucide-react";
import { StorageFile } from "@/pages/Storage";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AISummaryPanelProps {
  file: StorageFile | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const mockAISummary = {
  summary: [
    "Estelle Dary is a graphic designer specializing in branding, digital illustration, typography, and UI/UX design.",
    "She is currently a Senior Graphic Designer at Studio Shodwe since 2020 and was a Junior Graphic Designer at Larana, Inc. from 2018 to 2022.",
    "Dary has experience in creating visual content for marketing campaigns, social media, and websites.",
    "She is proficient in various design software and skilled in branding, UI/UX design, typography, motion graphics, and video editing.",
    "Dary has a strong background in collaboration and project management, producing promotional materials like posters and brochures.",
    "She holds a Bachelor's Degree in Graphic Design from the University of Borcelle (2014 - 2018) and has completed certifications in UI/UX design and advanced design software."
  ],
  metadata: {
    type: "Resume",
    keyDates: ["2014-2018", "2018-2022", "2020-present"],
    entities: ["Estelle Dary", "Studio Shodwe", "Larana, Inc.", "University of Borcelle"]
  }
};

const AISummaryPanel = ({ file, isOpen, onClose }: AISummaryPanelProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setChatMessages([]);
      setInputValue("");
    }
  }, [isOpen]);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(mockAISummary.summary.join("\n"));
    toast({
      title: "Summary copied",
      description: "AI summary has been copied to clipboard"
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Based on the document, I can help answer your question. This is a placeholder response that will be replaced with actual AI-powered document Q&A."
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && file && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-xl px-4"
          >
            <div className="bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">AI Summary</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {file.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0"
              >
                {/* AI Summary Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Document Summary
                    </span>
                  </div>
                  
                  <div className="space-y-2.5 pl-1">
                    {mockAISummary.summary.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="flex gap-3"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                        <p className="text-sm text-foreground/90 leading-relaxed">{point}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Suggested Actions */}
                <div className="pt-4 border-t border-border/30">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Suggested Actions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
                      <PenTool className="w-3.5 h-3.5" />
                      Send for signature
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
                      <FileArchive className="w-3.5 h-3.5" />
                      Compress
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Convert
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
                      <Send className="w-3.5 h-3.5" />
                      Transfer
                    </Button>
                  </div>
                </div>

                {/* Chat Messages */}
                {chatMessages.length > 0 && (
                  <div className="pt-4 border-t border-border/30 space-y-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Document Q&A
                    </p>
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-3",
                          message.role === "user" && "justify-end"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[85%] rounded-xl px-4 py-2.5 text-sm",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground"
                          )}
                        >
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Loading indicator */}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="bg-secondary rounded-xl px-4 py-2.5 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Input - Fixed at bottom */}
              <div className="shrink-0 border-t border-border/50 p-4 bg-card">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about this document…"
                    disabled={isLoading}
                    className={cn(
                      "w-full px-4 py-3 pr-12 rounded-xl text-sm",
                      "bg-secondary border border-border/50",
                      "text-foreground placeholder:text-muted-foreground/60",
                      "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                      "transition-all duration-200",
                      isLoading && "opacity-60 cursor-not-allowed"
                    )}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2",
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      "bg-primary text-primary-foreground",
                      "hover:bg-primary/90 transition-colors",
                      "disabled:opacity-40 disabled:cursor-not-allowed"
                    )}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border/50 bg-muted/30 shrink-0">
                <p className="text-xs text-muted-foreground">
                  Powered by <span className="text-primary font-medium">Docsora AI</span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleCopySummary}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Summary
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AISummaryPanel;
