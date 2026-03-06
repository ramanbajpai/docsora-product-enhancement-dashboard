import { ReactNode } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface ToolLayoutProps {
  title: string;
  description: string;
  fileCount: number;
  children: ReactNode;
  footer?: ReactNode;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ToolLayout({ title, description, fileCount, children, footer }: ToolLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start px-4 py-8">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
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

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: appleEasing }}
          className="mb-6"
        >
          <h1 className="text-2xl font-semibold text-foreground mb-1">{title}</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
              <FileText className="w-3.5 h-3.5" />
              <span>{fileCount} {fileCount === 1 ? 'file' : 'files'} selected</span>
            </div>
          </div>
        </motion.div>

        {/* Main Workspace Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: appleEasing }}
          className="relative"
        >
          {/* Card glow */}
          <div 
            className="absolute -inset-8 rounded-[40px] pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Glass Card */}
          <div 
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'hsl(var(--card) / 0.7)',
              backdropFilter: 'blur(40px)',
              border: '1px solid hsl(var(--border) / 0.5)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15)',
            }}
          >
            {children}
          </div>
        </motion.div>

        {/* Footer Actions */}
        {footer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: appleEasing }}
            className="mt-6"
          >
            {footer}
          </motion.div>
        )}
      </div>
    </div>
  );
}
