import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  className?: string;
  index?: number;
}

export function StatsCard({
  title,
  value,
  unit,
  icon: Icon,
  className,
  index = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
      className={cn(
        "glass-card p-4 cursor-pointer group interactive-card",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-foreground tabular-nums">
            {value}
            {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
          </p>
          <p className="text-xs text-muted-foreground truncate">{title}</p>
        </div>
      </div>
    </motion.div>
  );
}
