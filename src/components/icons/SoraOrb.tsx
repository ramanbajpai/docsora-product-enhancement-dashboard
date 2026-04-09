import { motion } from "framer-motion";

interface SoraOrbProps {
  className?: string;
  size?: number;
  state?: "idle" | "thinking" | "responding";
}

const SoraOrb = ({ className = "", size = 19, state = "idle" }: SoraOrbProps) => {
  const s = size;
  const isSmall = s <= 24;
  const speed = state === "thinking" ? 0.55 : state === "responding" ? 0.7 : 1;
  const glowOpacity = state === "responding" ? 0.55 : state === "thinking" ? 0.4 : 0.25;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: s, height: s }}
    >
      {/* Outer ambient glow */}
      {!isSmall && (
        <>
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: s * 2,
              height: s * 2,
              background: `radial-gradient(circle, hsl(205 100% 65% / ${glowOpacity}), hsl(217 82% 46% / 0.08), transparent 60%)`,
              filter: `blur(${s * 0.3}px)`,
            }}
            animate={{
              opacity: [0.5, 0.85, 0.5],
              scale: [0.92, 1.08, 0.92],
            }}
            transition={{ duration: 4 * speed, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Secondary cool glow ring */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: s * 1.4,
              height: s * 1.4,
              background: `radial-gradient(circle, hsl(195 100% 75% / 0.15), transparent 55%)`,
              filter: `blur(${s * 0.15}px)`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1.05, 0.95, 1.05],
            }}
            transition={{ duration: 3 * speed, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Orb body */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: s,
          height: s,
          boxShadow: isSmall ? "none" : `
            0 0 ${s * 0.4}px hsl(205 100% 65% / 0.15),
            0 ${s * 0.05}px ${s * 0.15}px hsl(217 82% 46% / 0.2),
            inset 0 ${s * 0.04}px ${s * 0.1}px hsl(0 0% 100% / 0.2),
            inset 0 -${s * 0.03}px ${s * 0.08}px hsl(225 60% 30% / 0.3)
          `,
        }}
        animate={{
          scale: state === "responding" ? [1, 1.07, 1.02, 1.06, 1] : [1, 1.025, 1, 0.99, 1],
        }}
        transition={{
          duration: state === "responding" ? 2 : 4 * speed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Deep base layer */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              linear-gradient(155deg, hsl(200 100% 62%), hsl(217 82% 46%), hsl(230 70% 38%))
            `,
          }}
        />

        {/* Caustic light pool — light blue, drifts slowly */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s * 0.8,
            height: s * 0.8,
            background: `radial-gradient(circle, hsl(195 100% 78% / 0.7), hsl(200 100% 70% / 0.2) 50%, transparent 70%)`,
            filter: `blur(${Math.max(s * 0.14, 2)}px)`,
            top: "-5%",
            left: "5%",
          }}
          animate={{
            x: [0, s * 0.12, s * 0.2, s * 0.05, 0],
            y: [0, s * 0.15, s * 0.08, s * 0.2, 0],
            scale: [1, 1.15, 0.9, 1.1, 1],
            opacity: [0.7, 0.9, 0.6, 0.85, 0.7],
          }}
          transition={{ duration: 5.5 * speed, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bright cyan wisp — feels alive */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s * 0.5,
            height: s * 0.5,
            background: `radial-gradient(circle, hsl(190 100% 82% / 0.65), transparent 55%)`,
            filter: `blur(${Math.max(s * 0.1, 2)}px)`,
            top: "20%",
            right: "5%",
          }}
          animate={{
            x: [0, -s * 0.15, -s * 0.08, s * 0.05, 0],
            y: [0, s * 0.1, s * 0.2, s * 0.12, 0],
            scale: [0.8, 1.2, 1, 1.15, 0.8],
            opacity: [0.5, 0.8, 0.55, 0.75, 0.5],
          }}
          transition={{ duration: 4 * speed, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Deep blue counter-blob */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s * 0.55,
            height: s * 0.55,
            background: `radial-gradient(circle, hsl(220 90% 55% / 0.6), transparent 55%)`,
            filter: `blur(${Math.max(s * 0.12, 2)}px)`,
            bottom: "0%",
            right: "10%",
          }}
          animate={{
            x: [0, -s * 0.1, s * 0.08, -s * 0.05, 0],
            y: [0, -s * 0.18, -s * 0.06, -s * 0.12, 0],
            scale: [1, 0.85, 1.2, 0.9, 1],
          }}
          transition={{ duration: 4.8 * speed, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Light accent blob — surface shimmer */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s * 0.35,
            height: s * 0.35,
            background: `radial-gradient(circle, hsl(185 100% 85% / 0.5), transparent 55%)`,
            filter: `blur(${Math.max(s * 0.08, 1.5)}px)`,
            top: "40%",
            left: "15%",
          }}
          animate={{
            x: [0, s * 0.12, s * 0.05, -s * 0.08, 0],
            y: [0, -s * 0.06, s * 0.1, s * 0.04, 0],
            scale: [0.85, 1.1, 0.95, 1.15, 0.85],
            opacity: [0.4, 0.7, 0.5, 0.65, 0.4],
          }}
          transition={{ duration: 6 * speed, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Thinking: internal sweeping light */}
        {state === "thinking" && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              background: [
                `radial-gradient(ellipse 50% 35% at 25% 35%, hsl(195 100% 85% / 0.35), transparent 55%)`,
                `radial-gradient(ellipse 50% 35% at 75% 65%, hsl(195 100% 85% / 0.35), transparent 55%)`,
                `radial-gradient(ellipse 50% 35% at 25% 35%, hsl(195 100% 85% / 0.35), transparent 55%)`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Responding: bright expanding pulse */}
        {state === "responding" && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              opacity: [0, 0.25, 0],
              scale: [0.6, 1.1, 0.6],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: `radial-gradient(circle, hsl(195 100% 80% / 0.5), transparent 50%)`,
            }}
          />
        )}

        {/* Glass depth — bottom shadow + top light leak */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 100% 55% at 50% 118%, hsl(225 65% 32% / 0.4), transparent 45%),
              radial-gradient(ellipse 65% 30% at 50% -5%, hsl(195 100% 90% / 0.18), transparent 45%)
            `,
          }}
        />

        {/* Primary specular highlight — top-left glass reflection */}
        <motion.div
          className="absolute rounded-full"
          style={{
            top: "6%",
            left: "15%",
            width: "45%",
            height: "28%",
            background: "radial-gradient(ellipse, hsl(0 0% 100% / 0.5), hsl(195 100% 95% / 0.12) 45%, transparent 70%)",
            filter: `blur(${Math.max(s * 0.025, 0.5)}px)`,
            transform: "rotate(-10deg)",
          }}
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 3.5 * speed, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Secondary highlight — bottom-right subtle catch */}
        <motion.div
          className="absolute"
          style={{
            bottom: "10%",
            right: "12%",
            width: "22%",
            height: "12%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, hsl(195 100% 90% / 0.2), transparent 65%)",
            filter: `blur(${Math.max(s * 0.02, 0.5)}px)`,
            transform: "rotate(18deg)",
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4 * speed, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Glass rim — inner shadow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              inset 0 ${s * 0.04}px ${s * 0.1}px hsl(195 100% 90% / 0.2),
              inset 0 -${s * 0.025}px ${s * 0.06}px hsl(225 60% 25% / 0.3),
              inset ${s * 0.02}px 0 ${s * 0.06}px hsl(195 80% 80% / 0.08),
              inset -${s * 0.02}px 0 ${s * 0.06}px hsl(225 60% 40% / 0.08)
            `,
          }}
        />
      </motion.div>
    </div>
  );
};

export default SoraOrb;
