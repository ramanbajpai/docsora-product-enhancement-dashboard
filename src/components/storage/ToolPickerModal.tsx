import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Sparkles, FileDown, ArrowLeftRight, PenTool, Send, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StorageFile } from "@/pages/Storage";
import { toolConfigs, ToolConfig } from "@/components/tools/toolConfig";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ToolPickerModalProps {
  file: StorageFile | null;
  isOpen: boolean;
  onClose: () => void;
}

// Suggested tools that appear at the top
const suggestedToolIds = ["rotate", "split", "merge", "compress", "convert", "sign"];

// Main service tools from sidebar
const mainServices = [
  { id: "ai-check", name: "AI Check", icon: Sparkles, description: "Verify document authenticity", route: "/ai-check" },
  { id: "compress", name: "Compress", icon: FileDown, description: "Reduce file size", route: "/compress" },
  { id: "convert", name: "Convert", icon: ArrowLeftRight, description: "Change file format", route: "/convert" },
  { id: "sign", name: "Sign", icon: PenTool, description: "Add signatures", route: "/sign" },
  { id: "transfer", name: "Transfer", icon: Send, description: "Send files securely", route: "/transfer" },
];

const ToolPickerModal = ({ file, isOpen, onClose }: ToolPickerModalProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const allTools = useMemo(() => Object.values(toolConfigs), []);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return allTools;
    const query = searchQuery.toLowerCase();
    return allTools.filter(
      tool => 
        tool.name.toLowerCase().includes(query) || 
        tool.description.toLowerCase().includes(query)
    );
  }, [searchQuery, allTools]);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return mainServices;
    const query = searchQuery.toLowerCase();
    return mainServices.filter(
      service => 
        service.name.toLowerCase().includes(query) || 
        service.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleToolSelect = (toolId: string) => {
    navigate(`/tools/${toolId}`);
    onClose();
  };

  const handleServiceSelect = (route: string) => {
    navigate(route);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-2xl max-h-[80vh] mx-4 glass-card-elevated rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Select a Tool</h2>
                    {file && (
                      <p className="text-sm text-muted-foreground">
                        For: {file.name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-surface-2 border-border/50"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 glassmorphic-scrollbar">
              {/* Main Services */}
              {filteredServices.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Services
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredServices.map((service) => (
                      <motion.button
                        key={service.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleServiceSelect(service.route)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-2/50 hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <service.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{service.name}</span>
                        <span className="text-xs text-muted-foreground text-center line-clamp-1">{service.description}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Tools */}
              {filteredTools.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    PDF Tools
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredTools.map((tool) => (
                      <motion.button
                        key={tool.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleToolSelect(tool.id)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-2/50 hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <tool.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{tool.name}</span>
                        <span className="text-xs text-muted-foreground text-center line-clamp-1">{tool.description}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {filteredTools.length === 0 && filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No tools found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ToolPickerModal;
