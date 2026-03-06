import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface OnePageEditorProps {
  files: File[];
  onProcess: () => void;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function OnePageEditor({ files, onProcess }: OnePageEditorProps) {
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
        {/* Header - Left aligned */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: appleEasing }}
          className="mb-6"
        >
          <h1 className="text-2xl font-semibold text-foreground mb-1">PDF to One Page</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Combine all pages of your PDF into one continuous, scrollable page.</p>
          </div>
          {files.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full mt-3 w-fit">
              <FileText className="w-3.5 h-3.5" />
              <span>{files.length} {files.length === 1 ? 'file' : 'files'} selected</span>
            </div>
          )}
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
            {/* Document Preview Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3, ease: appleEasing }}
              className="flex justify-center mb-6"
            >
              <div className="w-28 h-48 rounded-lg overflow-hidden flex flex-col p-3" style={{
                background: 'hsl(var(--card) / 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid hsl(var(--border) / 0.5)',
                boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1)',
              }}>
                {/* Simulated continuous page lines */}
                <div className="flex-1 space-y-1.5 overflow-hidden">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-1.5 bg-neutral-200 rounded"
                      style={{ 
                        width: `${55 + Math.sin(i * 0.7) * 35}%`,
                        opacity: 0.4 + (i % 4) * 0.15
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Explanatory Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="text-sm text-muted-foreground text-center mb-6 leading-relaxed"
            >
              All pages will be merged into a single continuous page.<br />
              Original content and order are preserved.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3, ease: appleEasing }}
            >
              <Button
                onClick={onProcess}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              >
                Convert to One Page
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}