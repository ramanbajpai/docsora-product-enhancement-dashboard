import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import SoraOrb from "@/components/icons/SoraOrb";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type OrbState = "idle" | "thinking" | "responding";

const Sora = () => {
  const [orbState, setOrbState] = useState<OrbState>("idle");

  const cycleState = () => {
    if (orbState === "idle") setOrbState("thinking");
    else if (orbState === "thinking") setOrbState("responding");
    else setOrbState("idle");
  };

  const stateLabel: Record<OrbState, string> = {
    idle: "Listening",
    thinking: "Thinking…",
    responding: "Responding",
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-6">
        {/* Orb */}
        <motion.button
          onClick={cycleState}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-10 cursor-pointer focus:outline-none"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <SoraOrb size={100} state={orbState} />
        </motion.button>

        {/* State indicator */}
        <motion.div
          key={orbState}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            orbState === "idle" && "bg-muted-foreground/40",
            orbState === "thinking" && "bg-primary animate-pulse",
            orbState === "responding" && "bg-primary",
          )} />
          <span className="text-xs font-medium text-muted-foreground/60 tracking-wide uppercase">
            {stateLabel[orbState]}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-semibold text-foreground tracking-tight mb-3"
        >
          Sora
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-sm text-muted-foreground/60 text-center max-w-sm leading-relaxed"
        >
          The execution layer for documents, powered by AI. Coming soon.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-[11px] text-muted-foreground/30 mt-6"
        >
          Click the orb to cycle states
        </motion.p>
      </div>
    </AppLayout>
  );
};

export default Sora;
