import { motion } from "framer-motion";
import { ArrowLeft, Download, CheckCircle2 } from "lucide-react";
import { ToolConfig } from "./toolConfig";

interface ToolActionPlaceholderProps {
  config: ToolConfig;
  files: File[];
  onBack: () => void;
}

export function ToolActionPlaceholder({ config, files, onBack }: ToolActionPlaceholderProps) {
  const Icon = config.icon;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Ambient Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[1200px] h-[1200px] rounded-full"
          style={{
            left: '-25%',
            top: '-35%',
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 55%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl mx-auto"
      >
        {/* Back button */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </motion.button>

        {/* Card */}
        <div 
          className="relative rounded-[28px] overflow-hidden border border-border/30 p-8 md:p-12"
          style={{
            background: 'hsl(var(--card) / 0.65)',
            backdropFilter: 'blur(60px)',
          }}
        >
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Icon className="w-7 h-7 text-primary" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              {config.title}
            </h2>

            {/* Files info */}
            <p className="text-muted-foreground mb-6">
              {files.length} file{files.length > 1 ? 's' : ''} uploaded
            </p>

            {/* File list */}
            <div className="w-full max-w-md space-y-2 mb-8">
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action placeholder */}
            <div className="w-full p-6 rounded-xl bg-secondary/30 border border-dashed border-border/50 mb-6">
              <p className="text-sm text-muted-foreground">
                Tool-specific controls will appear here
              </p>
            </div>

            {/* Process button */}
            <motion.button
              className="group relative h-12 px-8 rounded-xl font-medium text-sm overflow-hidden"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-primary rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/12 to-transparent rounded-xl" />
              <span className="relative flex items-center gap-2 text-primary-foreground font-medium">
                <Download className="w-4 h-4" />
                Process & Download
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
