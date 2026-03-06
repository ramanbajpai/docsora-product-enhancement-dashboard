import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, ChevronDown, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MetadataFormProps {
  files: File[];
  onProcess: () => void;
  onCancel: () => void;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function MetadataForm({ files, onProcess, onCancel }: MetadataFormProps) {
  const [title, setTitle] = useState(files[0]?.name?.replace(/\.pdf$/i, "") || "");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
const [creator, setCreator] = useState("");
  const [producer, setProducer] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
    }
    setKeywordInput("");
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(keywordInput);
    } else if (e.key === "Backspace" && !keywordInput && keywords.length > 0) {
      setKeywords(keywords.slice(0, -1));
    }
  };

  const suggestKeywords = () => {
    // Simulate AI suggestions based on title
    const suggestions = ["document", "pdf", title.split(" ")[0]?.toLowerCase()].filter(Boolean);
    suggestions.forEach(s => {
      if (s && !keywords.includes(s)) {
        setKeywords(prev => [...prev, s]);
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          animate={{
            opacity: [0.08, 0.12, 0.08],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: appleEasing }}
          className="mb-6"
        >
          <h1 className="text-2xl font-semibold text-foreground mb-1">Update Metadata</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Edit document properties</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
              <FileText className="w-3.5 h-3.5" />
              <span>{files.length} {files.length === 1 ? 'file' : 'files'}</span>
            </div>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: appleEasing }}
          className="relative"
        >
          {/* Card glow */}
          <div 
            className="absolute -inset-6 rounded-[32px] pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          {/* Glass Card */}
          <div 
            className="relative rounded-2xl overflow-hidden p-6"
            style={{
              background: 'hsl(var(--card) / 0.7)',
              backdropFilter: 'blur(40px)',
              border: '1px solid hsl(var(--border) / 0.5)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Primary Metadata */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm text-foreground mb-2 block">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-background px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Document title"
                />
              </div>

              {/* Author */}
              <div>
                <label className="text-sm text-foreground mb-2 block">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-background px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Author name"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm text-foreground mb-2 block">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-background px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Document subject"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="text-sm text-foreground mb-2 block">Keywords</label>
                <div 
                  className={cn(
                    "min-h-10 rounded-lg border border-border bg-background px-3 py-2 flex flex-wrap gap-1.5 items-center",
                    "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors"
                  )}
                >
                  <AnimatePresence mode="popLayout">
                    {keywords.map((keyword) => (
                      <motion.span
                        key={keyword}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="hover:text-primary/70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                    onBlur={() => keywordInput && addKeyword(keywordInput)}
                    className="flex-1 min-w-[80px] bg-transparent text-sm outline-none"
                    placeholder={keywords.length === 0 ? "Add keywords..." : ""}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Section */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", showAdvanced && "rotate-180")} />
                Advanced metadata
              </button>
              
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: appleEasing }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-4">
                      {/* Creator */}
                      <div>
                        <label className="text-sm text-foreground mb-2 block">Creator</label>
                        <input
                          type="text"
                          value={creator}
                          onChange={(e) => setCreator(e.target.value)}
                          className="w-full h-10 rounded-lg border border-border bg-background px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                          placeholder="Application that created the document"
                        />
                      </div>

                      {/* Producer */}
                      <div>
                        <label className="text-sm text-foreground mb-2 block">Producer</label>
                        <input
                          type="text"
                          value={producer}
                          onChange={(e) => setProducer(e.target.value)}
                          className="w-full h-10 rounded-lg border border-border bg-background px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                          placeholder="PDF producer"
                        />
                      </div>

                      {/* Editable dates */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-foreground mb-2 block">Created</label>
                          <input
                            type="datetime-local"
                            value={createdDate}
                            onChange={(e) => setCreatedDate(e.target.value)}
                            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-foreground mb-2 block">Modified</label>
                          <input
                            type="datetime-local"
                            value={modifiedDate}
                            onChange={(e) => setModifiedDate(e.target.value)}
                            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 h-10 text-foreground hover:text-foreground bg-secondary/40 border-border/50 hover:bg-secondary/70 hover:border-border/80 active:scale-[0.98] transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={onProcess}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10"
              >
                Save metadata
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
