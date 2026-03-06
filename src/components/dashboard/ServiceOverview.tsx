import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileOutput, Minimize2, Send, ShieldCheck, PenLine,
  FileText, Languages, GitCompare, ChevronLeft, ChevronRight
} from "lucide-react";

interface ServiceCard {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  route: string;
}

const services: ServiceCard[] = [
  {
    label: "Converted",
    value: "13 files",
    icon: <FileOutput className="w-5 h-5" />,
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    route: "/convert",
  },
  {
    label: "Compressed",
    value: "1.04 MB saved",
    icon: <Minimize2 className="w-5 h-5" />,
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    route: "/compress",
  },
  {
    label: "Transferred",
    value: "119 files",
    icon: <Send className="w-5 h-5" />,
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    route: "/transfer",
  },
  {
    label: "AI Checks",
    value: "13 checks",
    icon: <ShieldCheck className="w-5 h-5" />,
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    route: "/ai-check",
  },
  {
    label: "Signed",
    value: "20 docs",
    icon: <PenLine className="w-5 h-5" />,
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    route: "/sign",
  },
  {
    label: "Translated",
    value: "8 docs",
    icon: <Languages className="w-5 h-5" />,
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    route: "/translate",
  },
  {
    label: "Compared",
    value: "5 pairs",
    icon: <GitCompare className="w-5 h-5" />,
    iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    route: "/tools/compare",
  },
  {
    label: "Stored",
    value: "247 files",
    icon: <FileText className="w-5 h-5" />,
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    route: "/storage",
  },
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
    el.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="mt-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          Overview
        </h2>
        <div className="flex gap-1">
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
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {services.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.06 * i }}
            onClick={() => navigate(s.route)}
            className="group flex-shrink-0 w-[160px] rounded-2xl border border-border bg-card p-4 
                       text-left transition-all duration-200 
                       hover:border-primary/20 hover:shadow-[0_2px_20px_-4px_hsl(var(--primary)/0.12)]
                       active:scale-[0.98]"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.iconBg} mb-3 
                            transition-transform duration-200 group-hover:scale-110`}>
              {s.icon}
            </div>
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="text-lg font-semibold text-foreground tracking-tight leading-tight">
              {s.value}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
