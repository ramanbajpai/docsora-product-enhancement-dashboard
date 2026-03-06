import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const USED_GB = 2.25;
const TOTAL_GB = 200;
const PERCENT = (USED_GB / TOTAL_GB) * 100;

const RADIUS = 52;
const STROKE = 5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const OFFSET = CIRCUMFERENCE - (PERCENT / 100) * CIRCUMFERENCE;

export function StorageStatus() {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
      onClick={() => navigate("/storage")}
      className="w-full text-left transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer"
      style={{
        background: "linear-gradient(180deg, hsl(var(--card)), hsl(var(--surface-2)))",
        border: "1px solid hsl(var(--border) / 0.5)",
        borderRadius: "14px",
        padding: "24px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
      }}
      whileHover={{
        y: -3,
        boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
        transition: { duration: 0.2, ease: "easeOut" },
      }}
    >
      <p className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase mb-5">
        Storage
      </p>

      {/* Radial progress */}
      <div className="flex justify-center mb-5">
        <div className="relative w-[124px] h-[124px]">
          <svg
            width="124"
            height="124"
            viewBox="0 0 124 124"
            className="transform -rotate-90"
          >
            {/* Background ring */}
            <circle
              cx="62"
              cy="62"
              r={RADIUS}
              fill="none"
              stroke="hsl(var(--border) / 0.3)"
              strokeWidth={STROKE}
            />
            {/* Progress ring */}
            <motion.circle
              cx="62"
              cy="62"
              r={RADIUS}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: OFFSET }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              style={{
                filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))",
              }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground leading-none">
              {Math.round(PERCENT)}%
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">used</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center">
        <p className="text-2xl font-bold text-foreground tracking-tight leading-none">
          {USED_GB} GB
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">
          of {TOTAL_GB} GB used
        </p>
      </div>
    </motion.button>
  );
}
