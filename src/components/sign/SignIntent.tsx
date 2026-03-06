import { useState } from "react";
import { motion } from "framer-motion";
import { User, Users, ChevronLeft } from "lucide-react";

interface SignIntentProps {
  file: File;
  onSelect: (intent: "only-me" | "multiple") => void;
  onBack: () => void;
}

const SignIntent = ({ file, onSelect, onBack }: SignIntentProps) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleSelect = (intent: "only-me" | "multiple") => {
    setSelectedCard(intent);
    setTimeout(() => onSelect(intent), 250);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] px-8">
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-background/70 backdrop-blur-xl z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Modal */}
      <motion.div
        className="relative z-50 w-full max-w-md"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Back */}
        <motion.button
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          onClick={onBack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Header */}
        <motion.h1
          className="text-3xl font-light text-foreground tracking-tight text-center mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Who will sign?
        </motion.h1>

        {/* Options */}
        <div className="space-y-4">
          {/* Only Me - Primary */}
          <motion.button
            className={`
              w-full text-left p-6 rounded-2xl border-2 transition-all duration-300
              ${selectedCard === "only-me" 
                ? "border-primary bg-primary/[0.03]" 
                : "border-border hover:border-primary/40 bg-card/50"
              }
            `}
            onClick={() => handleSelect("only-me")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-5">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300
                ${selectedCard === "only-me" ? "bg-primary/10" : "bg-muted/60"}
              `}>
                <User className={`w-5 h-5 transition-colors duration-300 ${
                  selectedCard === "only-me" ? "text-primary" : "text-muted-foreground"
                }`} />
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground mb-0.5">Only me</h3>
                <p className="text-sm text-muted-foreground">I'm the only signer</p>
              </div>
            </div>
          </motion.button>

          {/* Multiple - Secondary */}
          <motion.button
            className={`
              w-full text-left p-6 rounded-2xl border-2 transition-all duration-300
              ${selectedCard === "multiple" 
                ? "border-primary bg-primary/[0.03]" 
                : "border-border/60 hover:border-border bg-card/30"
              }
            `}
            onClick={() => handleSelect("multiple")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-5">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300
                ${selectedCard === "multiple" ? "bg-primary/10" : "bg-muted/40"}
              `}>
                <Users className={`w-5 h-5 transition-colors duration-300 ${
                  selectedCard === "multiple" ? "text-primary" : "text-muted-foreground/60"
                }`} />
              </div>
              <div>
                <h3 className={`text-base font-medium mb-0.5 transition-colors ${
                  selectedCard === "multiple" ? "text-foreground" : "text-foreground/70"
                }`}>Multiple signers</h3>
                <p className="text-sm text-muted-foreground/60">Invite others to sign</p>
              </div>
            </div>
          </motion.button>
        </div>

        {/* File info */}
        <motion.p
          className="text-center text-xs text-muted-foreground/50 mt-10 truncate max-w-xs mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {file.name}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SignIntent;