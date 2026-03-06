import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransferItem {
  id: string;
  fileName: string;
  sender: string;
  time: string;
  size: string;
  status: "sent" | "pending" | "failed";
}

const mockTransfers: TransferItem[] = [
  { id: "1", fileName: "Try Docsora.pdf", sender: "user@gmail.com", time: "2 hours ago", size: "4.2 MB", status: "sent" },
  { id: "2", fileName: "Project Assets.zip", sender: "alex@company.com", time: "Yesterday", size: "128 MB", status: "sent" },
  { id: "3", fileName: "Brand Guidelines.pdf", sender: "design@studio.io", time: "2 days ago", size: "12.8 MB", status: "pending" },
  { id: "4", fileName: "Q4 Report.xlsx", sender: "finance@corp.com", time: "3 days ago", size: "2.1 MB", status: "sent" },
];

const statusStyles: Record<TransferItem["status"], string> = {
  sent: "text-blue-400",
  pending: "text-amber-400",
  failed: "text-red-400",
};

export function RecentTransfers() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3 }}
      className="flex flex-col"
      style={{
        background: "linear-gradient(180deg, hsl(var(--card)), hsl(var(--surface-2)))",
        border: "1px solid hsl(var(--border) / 0.5)",
        borderRadius: "14px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          Recent Transfers
        </h3>
        <button className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
          View all
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="px-3 pb-3">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-6 px-5 pb-3 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
          <span>File</span>
          <span>From</span>
          <span className="w-16 text-right">Size</span>
          <span className="w-20 text-right">Time</span>
          <span className="w-16 text-right">Status</span>
        </div>

        {mockTransfers.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.35 + i * 0.04 }}
            className={cn(
              "grid grid-cols-[1fr_1fr_auto_auto_auto] gap-6 items-center px-5 py-3.5 rounded-lg cursor-pointer",
              "hover:bg-accent/50 transition-colors duration-150"
            )}
          >
            <span className="text-sm text-foreground truncate">{item.fileName}</span>
            <span className="text-sm text-muted-foreground truncate">{item.sender}</span>
            <span className="text-xs text-muted-foreground/70 w-16 text-right">{item.size}</span>
            <span className="text-xs text-muted-foreground/70 w-20 text-right">{item.time}</span>
            <span className={cn("text-xs font-medium capitalize w-16 text-right", statusStyles[item.status])}>
              {item.status}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
