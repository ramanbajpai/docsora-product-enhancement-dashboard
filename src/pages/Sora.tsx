import { AppLayout } from "@/components/layout/AppLayout";
import SoraOrb from "@/components/icons/SoraOrb";
import { motion } from "framer-motion";

const Sora = () => {
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-10"
        >
          <SoraOrb size={100} state="idle" />
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
      </div>
    </AppLayout>
  );
};

export default Sora;
