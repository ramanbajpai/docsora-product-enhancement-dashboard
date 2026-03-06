import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw, PenTool, FolderOpen, Languages, Send,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { AICheckIcon } from "@/components/icons/AICheckIcon";
import CompressIcon from "@/components/icons/CompressIcon";
import TrackIcon from "@/components/icons/TrackIcon";

interface ServiceCard {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
  glowColor: string;
  route: string;
}

const services: ServiceCard[] = [
  {
    label: "AI Checks",
    value: "13 checks",
    icon: <AICheckIcon className="w-5 h-5" />,
    iconColor: "rgba(16,185,129,0.12)",
    glowColor: "rgba(16,185,129,0.2)",
    route: "/ai-check",
  },
  {
    label: "Compressed",
    value: "1.04 MB",
    icon: <CompressIcon className="w-5 h-5" />,
    iconColor: "rgba(244,63,94,0.12)",
    glowColor: "rgba(244,63,94,0.2)",
    route: "/compress",
  },
  {
    label: "Converted",
    value: "13 files",
    icon: <RefreshCw className="w-5 h-5" />,
    iconColor: "rgba(59,130,246,0.12)",
    glowColor: "rgba(59,130,246,0.2)",
    route: "/convert",
  },
  {
    label: "Signed",
    value: "20 docs",
    icon: <PenTool className="w-5 h-5" />,
    iconColor: "rgba(234,179,8,0.12)",
    glowColor: "rgba(234,179,8,0.2)",
    route: "/sign",
  },
  {
    label: "Stored",
    value: "247 files",
    icon: <FolderOpen className="w-5 h-5" />,
    iconColor: "rgba(249,115,22,0.12)",
    glowColor: "rgba(249,115,22,0.2)",
    route: "/storage",
  },
  {
    label: "Tracked",
    value: "32 docs",
    icon: <TrackIcon className="w-5 h-5" />,
    iconColor: "rgba(6,182,212,0.12)",
    glowColor: "rgba(6,182,212,0.2)",
    route: "/track",
  },
  {
    label: "Translated",
    value: "8 docs",
    icon: <Languages className="w-5 h-5" />,
    iconColor: "rgba(139,92,246,0.12)",
    glowColor: "rgba(139,92,246,0.2)",
    route: "/translate",
  },
  {
    label: "Transferred",
    value: "119 files",
    icon: <Send className="w-5 h-5" />,
    iconColor: "rgba(99,102,241,0.12)",
    glowColor: "rgba(99,102,241,0.2)",
    route: "/transfer",
  },
];

const iconTextColors = [
  "text-emerald-500",
  "text-rose-500",
  "text-blue-500",
  "text-yellow-500",
  "text-orange-500",
  "text-cyan-500",
  "text-violet-500",
  "text-indigo-500",
];

export function ServiceOverview() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const navigate = useNavigate();

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="mt-8"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          Overview
        </h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => scroll("left")}
            className={`p-1.5 rounded-lg border border-border transition-all ${
              canScrollLeft
                ? "text-foreground hover:bg-accent"
                : "text-muted-foreground/30 cursor-default"
            }`}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`p-1.5 rounded-lg border border-border transition-all ${
              canScrollRight
                ? "text-foreground hover:bg-accent"
                : "text-muted-foreground/30 cursor-default"
            }`}
            disabled={!canScrollRight}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-8 overflow-x-auto pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {services.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.06 * i }}
            onClick={() => navigate(s.route)}
            className="group flex-shrink-0 w-[172px] text-left transition-all duration-200 ease-out
                       active:scale-[0.97]"
            style={{
              background: "linear-gradient(180deg, hsl(var(--card)), hsl(var(--surface-2)))",
              border: "1px solid hsl(var(--border) / 0.4)",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 2px 8px hsl(var(--glass-shadow) / 0.06)",
            }}
            whileHover={{
              y: -4,
              boxShadow: "0 8px 24px hsl(var(--glass-shadow) / 0.12)",
              transition: { duration: 0.2, ease: "easeOut" },
            }}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center mb-5 
                          transition-colors duration-200 ${iconTextColors[i]}`}
              style={{ background: s.iconColor }}
            >
              {s.icon}
            </div>
            <p className="text-[32px] font-bold text-foreground tracking-tight leading-none mb-1">
              {s.value.split(" ")[0]}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground/70 tracking-wide uppercase">
              {s.value.split(" ").slice(1).join(" ") || s.label}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}