import { motion } from "framer-motion";
import { Wrench, CheckCircle2, AlertTriangle, FileText, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RepairEditorProps {
  files: File[];
  onProcess: () => void;
}

const appleEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

const DETECTED_ISSUES = [
  {
    id: 'metadata',
    label: 'Corrupted metadata',
    description: 'Document properties and bookmarks may not display correctly in some viewers.',
    fixable: true,
  },
  {
    id: 'xref',
    label: 'Broken cross-references',
    description: 'Internal links and page references are inconsistent, causing navigation issues.',
    fixable: true,
  },
];

export function RepairEditor({ files, onProcess }: RepairEditorProps) {
  const fixableCount = DETECTED_ISSUES.filter(i => i.fixable).length;

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
          <h1 className="text-2xl font-semibold text-foreground mb-1">Repair Document</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Detect and fix common PDF issues</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
              <FileText className="w-3.5 h-3.5" />
              <span>{files.length} {files.length === 1 ? 'file' : 'files'} selected</span>
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
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3, ease: appleEasing }}
              className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Issues detected</p>
                <p className="text-xs text-muted-foreground">{fixableCount} fixable {fixableCount === 1 ? 'issue' : 'issues'} found</p>
              </div>
            </motion.div>

            {/* Issues List */}
            <div className="space-y-3 mb-5">
              {DETECTED_ISSUES.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.3, ease: appleEasing }}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{issue.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {issue.description}
                      </p>
                    </div>
                    {issue.fixable && (
                      <span className="flex items-center gap-1 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Fixable
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Reassurance Box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">What repair does</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Repairs corrupted or damaged PDF files by restoring internal file integrity, fixing broken objects, and recovering compatibility with PDF viewers — without changing visible content.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3, ease: appleEasing }}
            >
              <Button
                onClick={onProcess}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Repair document
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}