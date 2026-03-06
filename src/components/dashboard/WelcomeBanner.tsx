import { motion } from "framer-motion";

interface WelcomeBannerProps {
  userName?: string;
}

export function WelcomeBanner({ userName = "there" }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="mb-6"
    >
      <h1 className="text-2xl font-semibold text-foreground tracking-tight">
        Hey {userName}
      </h1>
      <p className="text-muted-foreground mt-1">
        Let's keep you moving
      </p>
    </motion.div>
  );
}
