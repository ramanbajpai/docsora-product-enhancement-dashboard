import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { ServiceOverview } from "@/components/dashboard/ServiceOverview";
import { CreateAccountModal } from "@/components/dashboard/CreateAccountModal";

export default function Index() {
  // For demo: always show modal (in real app, check auth state)
  const [showAuthGate, setShowAuthGate] = useState(true);
  const [isAuthenticated] = useState(false); // Would come from auth context

  // Lock scroll when modal is open
  useEffect(() => {
    if (showAuthGate && !isAuthenticated) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAuthGate, isAuthenticated]);

  const isGated = showAuthGate && !isAuthenticated;

  return (
    <AppLayout>
      {/* Dashboard Content - Blurred when gated */}
      <motion.div 
        className={`p-6 md:p-8 lg:p-10 max-w-5xl mx-auto transition-all duration-500 ${
          isGated ? "blur-md pointer-events-none select-none" : ""
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Minimal greeting */}
        <WelcomeBanner userName="Alex" />

      </motion.div>

      {/* Dark overlay when gated */}
      <AnimatePresence>
        {isGated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99] bg-black/40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Auth Gate Modal */}
      <CreateAccountModal 
        open={isGated} 
        onClose={() => setShowAuthGate(false)} 
      />
    </AppLayout>
  );
}
