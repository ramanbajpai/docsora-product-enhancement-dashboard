import { motion } from "framer-motion";
import { ArrowRight, FileText, Send, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  title: string;
  action: string;
  type: "transfer" | "sign" | "convert" | "compress";
  time: string;
}

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    title: "Try Docsora.pdf",
    action: "Received from user@gmail.com",
    type: "transfer",
    time: "2 hours ago",
  },
  {
    id: "2",
    title: "Docsora Pitch Deck.pdf",
    action: "Sent for signature",
    type: "sign",
    time: "Yesterday",
  },
  {
    id: "3",
    title: "SF - Financial Report.docx",
    action: "Converted to PDF",
    type: "convert",
    time: "2 days ago",
  },
  {
    id: "4",
    title: "Project Assets.zip",
    action: "Compressed - saved 45%",
    type: "compress",
    time: "3 days ago",
  },
];

const typeConfig = {
  transfer: { icon: Send, color: "text-primary" },
  sign: { icon: PenTool, color: "text-success" },
  convert: { icon: FileText, color: "text-warning" },
  compress: { icon: FileText, color: "text-muted-foreground" },
};

export function RecentFiles() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-hint text-xs text-muted-foreground tracking-wider">
            History
          </span>
          <h2 className="text-lg font-semibold text-foreground mt-1">
            Recent Activity
          </h2>
        </div>
        <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
          View all
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-border">
          {mockActivity.map((item, index) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                className={cn(
                  "p-4 flex items-center gap-4 cursor-pointer group",
                  "hover:bg-surface-2/50 transition-colors duration-200"
                )}
              >
                <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                  <Icon className={cn("w-4 h-4", config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.action}
                  </p>
                </div>
                
                <span className="text-xs text-muted-foreground/70 shrink-0">
                  {item.time}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
