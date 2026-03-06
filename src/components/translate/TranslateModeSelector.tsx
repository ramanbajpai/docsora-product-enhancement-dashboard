import { motion } from "framer-motion";
import { FileText, Files, Columns } from "lucide-react";
import { TranslateMode } from "@/pages/Translate";

interface TranslateModeSelectorProps {
  mode: TranslateMode;
  onModeChange: (mode: TranslateMode) => void;
}

const modes = [
  {
    id: "text" as TranslateMode,
    label: "Text Translation",
    icon: FileText,
    description: "Quick text translation",
  },
  {
    id: "document" as TranslateMode,
    label: "Document Translation",
    icon: Files,
    description: "Translate full documents",
  },
  {
    id: "dual" as TranslateMode,
    label: "Dual-Language",
    icon: Columns,
    description: "Bilingual documents",
    badge: "Enterprise",
  },
];

export const TranslateModeSelector = ({
  mode,
  onModeChange,
}: TranslateModeSelectorProps) => {
  return (
    <div className="mb-8">
      <div className="inline-flex p-1 bg-muted/50 rounded-xl backdrop-blur-sm border border-border/50">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`
              relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              flex items-center gap-2
              ${mode === m.id 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {mode === m.id && (
              <motion.div
                layoutId="activeMode"
                className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <m.icon className="w-4 h-4" />
              {m.label}
              {m.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                  {m.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
