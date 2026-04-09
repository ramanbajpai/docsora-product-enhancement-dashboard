import { motion, useAnimationControls } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface SoraOrbProps {
  className?: string;
  size?: number;
  state?: "idle" | "thinking" | "responding";
}

const DOCSORA_BLUE = "217 82% 46%"; // #1255DA in HSL

const SoraOrb = ({ className = "", size = 19, state = "idle" }: SoraOrbProps) => {
  const s = size;
  const isSmall = s <= 24;

  // Speed multipliers per state
  const speed = state === "thinking" ? 0.6 : state === "responding" ? 0.8 : 1;
  const glowIntensity = state === "responding" ? 0.5 : state === "thinking" ? 0.35 : 0.2;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: s, height: s }}
    >
      {/* Ambient glow */}
      {!isSmall && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: s * 1.8,
            height: s * 1.8,
            background: `radial-gradient(circle, hsl(${DOCSORA_BLUE} / ${glowIntensity}), transparent 60%)`,
            filter: `blur(${s * 0.25}px)`,
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 4 * speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Orb body */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{ width: s, height: s }}
        animate={{
          scale: state === "responding" ? [1, 1.06, 1] : [1, 1.02, 1],
        }}
        transition={{
          duration: state === "responding" ? 2 : 3.5 * speed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Base fill */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at 38% 32%, hsl(210 100% 62%), transparent 55%),
              radial-gradient(circle at 62% 68%, hsl(225 85% 48%), transparent 50%),
              linear-gradient(155deg, hsl(205 100% 58%), hsl(${DOCSORA_BLUE}), hsl(230 75% 40%))
            `,
          }}
        />

        {/* Morphing blob A — primary drift */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s * 0.65,
            height: s * 0.65,
            background: `radial-gradient(circle, hsl(200 100% 72% / 0.75), transparent 60%)`,
            filter: `blur(${Math.max(s * 0.13, 2)}px)`,
            top: "8%",
            left: "12%",
          }}
          animate={{
            x: [0, s * 0.14, s * 0.04, -s * 0.08, 0],
            y: [0, s * 0.08, s * 0.18, s * 0.04, 0],
            scale: [1, 1.12, 0.88, 1.08, 1],
          }}
          transition={{
            duration: 5 * speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Morphing blob B — counter-drift */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s * 0.5,
            height: s * 0.5,
            background: `radial-gradient(circle, hsl(215 100% 78% / 0.6), transparent 55%)`,
            filter: `blur(${Math.max(s * 0.1, 2)}px)`,
            bottom: "10%",
            right: "8%",
          }}
          animate={{
            x: [0, -s * 0.1, -s * 0.04, s * 0.06, 0],
            y: [0, -s * 0.12, -s * 0.06, s * 0.04, 0],
            scale: [1, 0.85, 1.15, 0.92, 1],
          }}
          transition={{
            duration: 4.2 * speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Morphing blob C — deep accent, slow rotation */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s * 0.4,
            height: s * 0.4,
            background: `radial-gradient(circle, hsl(232 70% 52% / 0.55), transparent 55%)`,
            filter: `blur(${Math.max(s * 0.1, 2)}px)`,
            top: "35%",
            left: "30%",
          }}
          animate={{
            x: [0, s * 0.08, -s * 0.06, s * 0.1, 0],
            y: [0, s * 0.1, -s * 0.08, -s * 0.04, 0],
            scale: [0.9, 1.08, 0.95, 1.12, 0.9],
          }}
          transition={{
            duration: 6 * speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Internal light sweep — thinking indicator */}
        {state === "thinking" && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              background: [
                `radial-gradient(ellipse 60% 40% at 30% 40%, hsl(200 100% 80% / 0.3), transparent 60%)`,
                `radial-gradient(ellipse 60% 40% at 70% 60%, hsl(200 100% 80% / 0.3), transparent 60%)`,
                `radial-gradient(ellipse 60% 40% at 30% 40%, hsl(200 100% 80% / 0.3), transparent 60%)`,
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Glass bottom shadow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 100% 60% at 50% 115%, hsl(225 70% 35% / 0.35), transparent 45%),
              radial-gradient(ellipse 70% 35% at 50% -8%, hsl(0 0% 100% / 0.12), transparent 45%)
            `,
          }}
        />

        {/* Top specular highlight */}
        <div
          className="absolute rounded-full"
          style={{
            top: "7%",
            left: "18%",
            width: "42%",
            height: "28%",
            background: "radial-gradient(ellipse, hsl(0 0% 100% / 0.4), hsl(0 0% 100% / 0.08) 45%, transparent 70%)",
            filter: `blur(${Math.max(s * 0.03, 0.5)}px)`,
            transform: "rotate(-12deg)",
          }}
        />

        {/* Secondary edge highlight */}
        <motion.div
          className="absolute rounded-full"
          style={{
            bottom: "12%",
            right: "15%",
            width: "25%",
            height: "15%",
            background: "radial-gradient(ellipse, hsl(0 0% 100% / 0.15), transparent 65%)",
            filter: `blur(${Math.max(s * 0.03, 0.5)}px)`,
            transform: "rotate(20deg)",
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3.5 * speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Inner glass ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              inset 0 ${s * 0.04}px ${s * 0.08}px hsl(0 0% 100% / 0.18),
              inset 0 -${s * 0.02}px ${s * 0.05}px hsl(225 70% 30% / 0.25)
            `,
          }}
        />
      </motion.div>
    </div>
  );
};

export default SoraOrb;
