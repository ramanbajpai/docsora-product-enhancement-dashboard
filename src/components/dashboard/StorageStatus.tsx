import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const USED_GB = 2.25;
const TOTAL_GB = 200;
const PERCENT = (USED_GB / TOTAL_GB) * 100;

const SIZE = 52;
const RADIUS = 21;
const STROKE = 3.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const OFFSET = CIRCUMFERENCE - (PERCENT / 100) * CIRCUMFERENCE;

export function StorageStatus() {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      onClick={() => navigate("/storage")}
      className="flex items-center gap-4 cursor-pointer group"
    >
      {/* Radial ring */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none" stroke="hsl(var(--border) / 0.25)" strokeWidth={STROKE}
          />
          <motion.circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none" stroke="hsl(var(--primary))" strokeWidth={STROKE}
            strokeLinecap="round" strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: OFFSET }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-foreground leading-none">
            {Math.round(PERCENT)}%
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
          {USED_GB} GB <span className="text-muted-foreground font-normal">/ {TOTAL_GB} GB</span>
        </p>
        <p className="text-[11px] text-muted-foreground leading-tight mt-1">Storage</p>
      </div>
    </motion.button>
  );
}
