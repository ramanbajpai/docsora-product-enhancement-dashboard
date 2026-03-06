import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignedDoc {
  id: string;
  fileName: string;
  sender: string;
  time: string;
  size: string;
  status: "signed" | "pending" | "sent";
}

const mockSigned: SignedDoc[] = [
  { id: "1", fileName: "Docsora Pitch Deck.pdf", sender: "You", time: "Yesterday", size: "8.4 MB", status: "signed" },
  { id: "2", fileName: "Partnership Agreement.pdf", sender: "legal@partner.co", time: "2 days ago", size: "1.2 MB", status: "pending" },
  { id: "3", fileName: "NDA - Project Alpha.pdf", sender: "You", time: "4 days ago", size: "420 KB", status: "signed" },
  { id: "4", fileName: "Contractor Agreement.pdf", sender: "hr@company.com", time: "1 week ago", size: "890 KB", status: "sent" },
];

const statusStyles: Record<SignedDoc["status"], string> = {
  signed: "text-emerald-400",
  pending: "text-amber-400",
  sent: "text-blue-400",
};

export function RecentSignedDocs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.35 }}
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
          Signed Documents
        </h3>
        <button className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
          View all
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="px-3 pb-3">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-6 px-5 pb-3 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
          <span>Document</span>
          <span>From</span>
          <span className="w-16 text-right">Size</span>
          <span className="w-20 text-right">Time</span>
          <span className="w-16 text-right">Status</span>
        </div>

        {mockSigned.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.4 + i * 0.04 }}
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
