import { motion } from "framer-motion";
import { Pen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetadataModeSelectProps {
  files: File[];
  onModeSelect: (mode: "update" | "remove") => void;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

const modes = [
  {
    id: "update" as const,
    title: "Update metadata",
    description: "Edit document details like title, author, subject, and keywords",
    icon: Pen,
  },
  {
    id: "remove" as const,
    title: "Remove metadata",
    description: "Permanently remove all metadata to protect privacy",
    icon: Trash2,
  },
];

export function MetadataModeSelect({ onModeSelect }: MetadataModeSelectProps) {
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
          className="mb-10 text-center"
        >
          <h1 className="text-2xl font-semibold text-foreground mb-2">Edit Metadata</h1>
          <p className="text-sm text-muted-foreground">Choose an action</p>
        </motion.div>

        {/* Mode Cards */}
        <div className="space-y-4">
          {modes.map((mode, index) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1, ease: appleEasing }}
              onClick={() => onModeSelect(mode.id)}
              className={cn(
                "relative w-full text-left rounded-2xl overflow-hidden p-5 transition-all duration-300",
                "hover:scale-[1.02] active:scale-[0.98]",
                "group"
              )}
              style={{
                background: 'hsl(var(--card) / 0.7)',
                backdropFilter: 'blur(40px)',
                border: '1px solid hsl(var(--border) / 0.5)',
                boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* Hover glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.05) 0%, transparent 70%)',
                }}
              />
              
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <mode.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-foreground mb-0.5">{mode.title}</h3>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
