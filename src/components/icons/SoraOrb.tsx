import { motion } from "framer-motion";

interface SoraOrbProps {
  className?: string;
  size?: number;
}

const SoraOrb = ({ className = "", size = 19 }: SoraOrbProps) => {
  const s = size;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: s, height: s }}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s * 1.6,
          height: s * 1.6,
          background: "radial-gradient(circle, hsl(var(--primary) / 0.25), transparent 65%)",
          filter: `blur(${s * 0.3}px)`,
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [0.95, 1.08, 0.95],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main orb container */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{ width: s, height: s }}
      >
        {/* Base gradient */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at 40% 35%, hsl(210 100% 65%), transparent 60%),
              radial-gradient(circle at 60% 65%, hsl(220 90% 50%), transparent 55%),
              linear-gradient(160deg, hsl(200 100% 60%), hsl(230 80% 45%))
            `,
          }}
        />

        {/* Swirling blob 1 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s * 0.7,
            height: s * 0.7,
            background: "radial-gradient(circle, hsl(200 100% 70% / 0.8), transparent 65%)",
            filter: `blur(${s * 0.12}px)`,
            top: "10%",
            left: "10%",
          }}
          animate={{
            x: [0, s * 0.15, s * 0.05, -s * 0.1, 0],
            y: [0, s * 0.1, s * 0.2, s * 0.05, 0],
            scale: [1, 1.15, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Swirling blob 2 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s * 0.55,
            height: s * 0.55,
            background: "radial-gradient(circle, hsl(215 100% 75% / 0.7), transparent 60%)",
            filter: `blur(${s * 0.1}px)`,
            bottom: "5%",
            right: "5%",
          }}
          animate={{
            x: [0, -s * 0.12, -s * 0.05, s * 0.08, 0],
            y: [0, -s * 0.15, -s * 0.08, s * 0.05, 0],
            scale: [1, 0.85, 1.2, 0.95, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Swirling blob 3 - deep accent */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s * 0.45,
            height: s * 0.45,
            background: "radial-gradient(circle, hsl(235 80% 55% / 0.6), transparent 60%)",
            filter: `blur(${s * 0.1}px)`,
            top: "30%",
            left: "25%",
          }}
          animate={{
            x: [0, s * 0.1, -s * 0.08, s * 0.12, 0],
            y: [0, s * 0.12, -s * 0.1, -s * 0.05, 0],
            scale: [0.9, 1.1, 1, 0.85, 0.9],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Glass overlay for depth */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 100% 80% at 50% 120%, hsl(220 80% 40% / 0.4), transparent 50%),
              radial-gradient(ellipse 80% 50% at 50% -10%, hsl(0 0% 100% / 0.15), transparent 50%)
            `,
          }}
        />

        {/* Top specular highlight - glass effect */}
        <div
          className="absolute rounded-full"
          style={{
            top: "8%",
            left: "18%",
            width: "45%",
            height: "30%",
            background: "radial-gradient(ellipse, hsl(0 0% 100% / 0.45), hsl(0 0% 100% / 0.1) 40%, transparent 70%)",
            filter: `blur(${s * 0.04}px)`,
            transform: "rotate(-15deg)",
          }}
        />

        {/* Subtle edge ring for glass feel */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              inset 0 ${s * 0.05}px ${s * 0.1}px hsl(0 0% 100% / 0.2),
              inset 0 -${s * 0.03}px ${s * 0.06}px hsl(220 80% 30% / 0.3)
            `,
          }}
        />
      </div>
    </div>
  );
};

export default SoraOrb;
