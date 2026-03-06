import { motion } from "framer-motion";
import { 
  ArrowRight, 
  FileText, 
  Play,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InProgressItem {
  id: string;
  title: string;
  type: string;
  progress: number;
  lastAction: string;
  actionLabel: string;
}

const mockInProgress: InProgressItem[] = [
  {
    id: "1",
    title: "Employee Handbook 2024.docx",
    type: "AI Check",
    progress: 75,
    lastAction: "Reviewing suggestions",
    actionLabel: "Continue review",
  },
  {
    id: "2",
    title: "Partnership Agreement",
    type: "Signature",
    progress: 50,
    lastAction: "1 of 2 signed",
    actionLabel: "View status",
  },
];

export function InProgressWork() {
  if (mockInProgress.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-hint text-xs text-muted-foreground tracking-wider">
            Continue where you left off
          </span>
          <h2 className="text-lg font-semibold text-foreground mt-1">
            In Progress
          </h2>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {mockInProgress.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
            className={cn(
              "glass-card p-4 group cursor-pointer",
              "hover:shadow-md hover:border-primary/20 transition-all duration-200"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground truncate text-sm group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {item.type}
                  </p>
                </div>
              </div>
              <button className="p-1 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{item.lastAction}</span>
                <span className="text-foreground font-medium">{item.progress}%</span>
              </div>
              <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                />
              </div>
            </div>

            {/* Action */}
            <button className={cn(
              "w-full flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg",
              "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
              "transition-all duration-200"
            )}>
              <Play className="w-3.5 h-3.5" />
              {item.actionLabel}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
