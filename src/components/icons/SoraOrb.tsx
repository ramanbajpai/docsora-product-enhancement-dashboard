import { motion } from "framer-motion";

interface SoraOrbProps {
  className?: string;
  size?: number;
}

const SoraOrb = ({ className = "", size = 19 }: SoraOrbProps) => {
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow pulse */}
      <motion.div
        className="absolute inset-[-3px] rounded-full"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)",
          filter: "blur(4px)",
        }}
      />

      {/* Inner orb */}
      <motion.div
        className="relative rounded-full w-full h-full"
        animate={{
          boxShadow: [
            "0 0 8px 2px hsl(var(--primary) / 0.3), inset 0 -2px 4px hsl(var(--primary) / 0.2)",
            "0 0 14px 4px hsl(var(--primary) / 0.45), inset 0 -2px 6px hsl(var(--primary) / 0.3)",
            "0 0 8px 2px hsl(var(--primary) / 0.3), inset 0 -2px 4px hsl(var(--primary) / 0.2)",
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: `
            radial-gradient(circle at 35% 30%, hsl(var(--primary) / 0.9), transparent 50%),
            radial-gradient(circle at 65% 70%, hsl(210 100% 60% / 0.7), transparent 50%),
            radial-gradient(circle at 50% 50%, hsl(var(--primary)), hsl(210 80% 35%))
          `,
        }}
      >
        {/* Specular highlight */}
        <div
          className="absolute rounded-full"
          style={{
            top: "15%",
            left: "25%",
            width: "35%",
            height: "25%",
            background: "radial-gradient(ellipse, hsl(0 0% 100% / 0.5), transparent 70%)",
            filter: "blur(1px)",
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default SoraOrb;
