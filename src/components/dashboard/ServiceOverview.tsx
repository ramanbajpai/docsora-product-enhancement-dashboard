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
    iconColor: "hsl(var(--primary) / 0.1)",
    glowColor: "transparent",
    route: "/ai-check",
  },
  {
    label: "Compressed",
    value: "1.04 MB",
    icon: <CompressIcon className="w-5 h-5" />,
    iconColor: "hsl(var(--primary) / 0.1)",
    glowColor: "transparent",
    route: "/compress",
  },
  {
    label: "Converted",
    value: "13 files",
    icon: <RefreshCw className="w-5 h-5" />,
    iconColor: "hsl(var(--primary) / 0.1)",
    glowColor: "transparent",
    route: "/convert",
  },
  {
    label: "Signed",
    value: "20 docs",
    icon: <PenTool className="w-5 h-5" />,
    iconColor: "hsl(var(--primary) / 0.1)",
    glowColor: "transparent",
    route: "/sign",
  },
  {
    label: "Stored",
    value: "247 files",
    icon: <FolderOpen className="w-5 h-5" />,
    iconColor: "hsl(var(--primary) / 0.1)",
    glowColor: "transparent",
    route: "/storage",
  },
  {
    label: "Tracked",
    value: "32 docs",
    icon: <TrackIcon className="w-5 h-5" />,
    iconColor: "hsl(var(--primary) / 0.1)",
    glowColor: "transparent",
    route: "/track",
  },
  {
    label: "Translated",
    value: "8 docs",
    icon: <Languages className="w-5 h-5" />,
    iconColor: "hsl(var(--primary) / 0.1)",
    glowColor: "transparent",
    route: "/translate",
  },
  {
    label: "Transferred",
    value: "119 files",
    icon: <Send className="w-5 h-5" />,
    iconColor: "hsl(var(--primary) / 0.1)",
    glowColor: "transparent",
    route: "/transfer",
  },
];

const iconTextColors = [
  "text-primary",
  "text-primary",
  "text-primary",
  "text-primary",
  "text-primary",
  "text-primary",
  "text-primary",
  "text-primary",
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

  const cardWidth = 172;
  const gap = 32;
  const scrollStep = cardWidth + gap;

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -scrollStep : scrollStep, behavior: "smooth" });
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

      <div className="relative -mx-6">
        {/* Left fade */}
        <div
          className={`pointer-events-none absolute left-0 top-0 bottom-0 w-5 z-10 transition-opacity duration-300 ${
            canScrollLeft ? "opacity-70" : "opacity-0"
          }`}
          style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }}
        />
        {/* Right fade */}
        <div
          className={`pointer-events-none absolute right-0 top-0 bottom-0 w-5 z-10 transition-opacity duration-300 ${
            canScrollRight ? "opacity-70" : "opacity-0"
          }`}
          style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }}
        />

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-8 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory px-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
        {services.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.06 * i }}
            onClick={() => navigate(s.route)}
            className="group flex-shrink-0 min-w-[172px] w-[172px] snap-start text-left transition-all duration-200 ease-out
                       active:scale-[0.97]"
            style={{
              background: "linear-gradient(180deg, hsl(var(--card)), hsl(var(--surface-2)))",
              border: "1px solid hsl(var(--border) / 0.5)",
              borderRadius: "14px",
              padding: "22px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            }}
            whileHover={{
              y: -4,
              boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
              transition: { duration: 0.2, ease: "easeOut" },
            }}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 
                          transition-all duration-200 ${iconTextColors[i]}`}
              style={{
                background: s.iconColor,
              }}
            >
              {s.icon}
            </div>
            <p className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase mb-1.5">
              {s.label}
            </p>
            <p className="text-2xl font-bold text-foreground tracking-tight leading-none">
              {s.value}
            </p>
          </motion.button>
        ))}
        </div>
      </div>
    </motion.div>
  );
}