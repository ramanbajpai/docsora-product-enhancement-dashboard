import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetadataRemoveProps {
  files: File[];
  onProcess: () => void;
  onCancel: () => void;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function MetadataRemove({ onProcess, onCancel }: MetadataRemoveProps) {
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
          className="mb-8"
        >
          <h1 className="text-2xl font-semibold text-foreground mb-2">Remove Metadata</h1>
          <p className="text-sm text-muted-foreground">Your document content will remain unchanged.</p>
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
              background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
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
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Description */}
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                This helps protect privacy, anonymize files before sharing, and remove hidden information such as author details and timestamps.
              </p>
            </div>

            {/* What will be removed */}
            <div className="mb-6">
              <div className="border-t border-border/30 pt-4">
                <p className="text-xs text-muted-foreground/70 uppercase tracking-wide mb-3">What will be removed</p>
                <ul className="text-xs text-muted-foreground/80 space-y-1.5">
                  <li>Title, author, and subject</li>
                  <li>Keywords and descriptions</li>
                  <li>Creator and producer information</li>
                  <li>Creation and modification dates</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 h-10 text-foreground hover:text-foreground bg-secondary/40 border-border/50 hover:bg-secondary/70 hover:border-border/80 active:scale-[0.98] transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={onProcess}
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 active:scale-[0.98] transition-all"
              >
                Remove metadata
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
