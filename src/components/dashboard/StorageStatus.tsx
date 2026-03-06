import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const USED_GB = 2.25;
const TOTAL_GB = 200;
const PERCENT = (USED_GB / TOTAL_GB) * 100;

export function StorageStatus() {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      onClick={() => navigate("/storage")}
      className="flex flex-col gap-2 cursor-pointer group min-w-[180px]"
    >
      <p className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
        Storage
      </p>

      {/* Thin horizontal bar */}
      <div className="w-full h-[3px] rounded-full bg-border/40 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${PERCENT}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>

      <p className="text-xs text-muted-foreground leading-tight">
        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
          {USED_GB} GB
        </span>
        {" "}of {TOTAL_GB} GB used
      </p>
    </motion.button>
  );
}
