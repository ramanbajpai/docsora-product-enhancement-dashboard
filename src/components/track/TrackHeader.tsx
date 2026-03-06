import { motion } from "framer-motion";
import { Send, PenTool, ArrowUpRight, ArrowDownLeft, FileText, Plus } from "lucide-react";
import { MainTab, TransferSubTab } from "@/pages/Track";
import { SignViewTab } from "@/components/track/sign/SignListRedesign";
import { Button } from "@/components/ui/button";

interface TrackHeaderProps {
  mainTab: MainTab;
  setMainTab: (tab: MainTab) => void;
  transferSubTab: TransferSubTab;
  setTransferSubTab: (tab: TransferSubTab) => void;
  signSubTab?: SignViewTab;
  setSignSubTab?: (tab: SignViewTab) => void;
  totalItems: number;
  onAddContract?: () => void;
}

export function TrackHeader({
  mainTab,
  setMainTab,
  transferSubTab,
  setTransferSubTab,
  signSubTab,
  setSignSubTab,
  totalItems,
  onAddContract,
}: TrackHeaderProps) {
  return (
    <div className="mb-8">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-foreground">Track</h1>

        {mainTab === "contracts" && (
          <Button onClick={onAddContract} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Contract
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center p-1 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/50">
          <TabButton
            active={mainTab === "transfer"}
            onClick={() => setMainTab("transfer")}
            icon={<Send className="w-4 h-4" />}
            label="Transfer"
          />
          <TabButton
            active={mainTab === "sign"}
            onClick={() => setMainTab("sign")}
            icon={<PenTool className="w-4 h-4" />}
            label="Sign"
          />
          <TabButton
            active={mainTab === "contracts"}
            onClick={() => setMainTab("contracts")}
            icon={<FileText className="w-4 h-4" />}
            label="Contracts"
          />
        </div>

        <span className="ml-4 text-sm text-muted-foreground">
          Showing {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Sub Tabs - For Transfer and Sign */}
      {mainTab === "transfer" && (
        <div className="flex items-center gap-1">
          <SubTabButton
            active={transferSubTab === "sent"}
            onClick={() => setTransferSubTab("sent")}
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            label="Sent"
            layoutId="transferSubTab"
          />
          <SubTabButton
            active={transferSubTab === "received"}
            onClick={() => setTransferSubTab("received")}
            icon={<ArrowDownLeft className="w-3.5 h-3.5" />}
            label="Received"
            layoutId="transferSubTab"
          />
        </div>
      )}

      {mainTab === "sign" && signSubTab && setSignSubTab && (
        <div className="flex items-center gap-1">
          <SubTabButton
            active={signSubTab === "sent"}
            onClick={() => setSignSubTab("sent")}
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            label="Sent"
            layoutId="signSubTab"
          />
          <SubTabButton
            active={signSubTab === "received"}
            onClick={() => setSignSubTab("received")}
            icon={<ArrowDownLeft className="w-3.5 h-3.5" />}
            label="Received"
            layoutId="signSubTab"
          />
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {active && (
        <motion.div
          layoutId="mainTabBg"
          className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50"
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function SubTabButton({
  active,
  onClick,
  icon,
  label,
  layoutId,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  layoutId: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
        active
          ? "text-primary font-medium"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {active && (
        <motion.div
          layoutId={layoutId}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
      {icon}
      <span>{label}</span>
    </button>
  );
}
