import { motion } from "framer-motion";
import { Shield, Lock, Globe, CheckCircle2, Zap, FileCheck, Sparkles } from "lucide-react";

interface TrustFooterProps {
  variant: "ai-check" | "compress" | "convert" | "sign" | "transfer";
}

const certifications = [
  { icon: Shield, label: "SOC 2" },
  { icon: CheckCircle2, label: "ISO 27001" },
  { icon: Globe, label: "GDPR" },
  { icon: Lock, label: "Encrypted" },
];

const benefitsByVariant = {
  "ai-check": [
    { icon: Sparkles, text: "AI-powered analysis" },
    { icon: Zap, text: "Instant results" },
    { icon: Lock, text: "Private by default" },
  ],
  "compress": [
    { icon: FileCheck, text: "No visible loss" },
    { icon: Zap, text: "Results in seconds" },
    { icon: Lock, text: "Encrypted end-to-end" },
  ],
  "convert": [
    { icon: FileCheck, text: "Layouts preserved" },
    { icon: Zap, text: "Fast processing" },
    { icon: Lock, text: "Encrypted end-to-end" },
  ],
  "sign": [
    { icon: Shield, text: "Legally binding" },
    { icon: Shield, text: "eIDAS compliant" },
    { icon: Shield, text: "Audit trail included" },
  ],
  "transfer": [
    { icon: Shield, text: "End-to-end encrypted" },
    { icon: Lock, text: "Password protection" },
    { icon: Globe, text: "Up to 100GB" },
  ],
};

export function TrustFooter({ variant }: TrustFooterProps) {
  const benefits = benefitsByVariant[variant];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-12 flex flex-col items-center gap-4"
    >
      {/* Certifications row */}
      <div className="flex items-center gap-4 text-muted-foreground/40">
        {certifications.map((cert, i) => (
          <div key={cert.label} className="flex items-center gap-1">
            <cert.icon className="w-3 h-3" />
            <span className="text-[0.65rem] font-medium">{cert.label}</span>
          </div>
        ))}
      </div>

      {/* Benefits row */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-muted-foreground/35">
        {benefits.map((benefit, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <benefit.icon className="w-2.5 h-2.5" />
            <span className="text-[0.6rem]">{benefit.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default TrustFooter;
