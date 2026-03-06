import { motion } from "framer-motion";
import { 
  FileText, Building2, Calendar, ChevronRight,
  Clock, CheckCircle2, AlertTriangle
} from "lucide-react";
import { Contract } from "@/pages/Track";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";

interface ContractsListProps {
  contracts: Contract[];
  selectedContract: Contract | null;
  onSelectContract: (contract: Contract) => void;
}

// System status colors only - calm and desaturated
const statusConfig: Record<Contract["status"], { label: string; className: string; icon: React.ReactNode }> = {
  active: { 
    label: "Active", 
    className: "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 border-emerald-500/15",
    icon: <CheckCircle2 className="w-3 h-3" />
  },
  expiring: { 
    label: "Expiring", 
    className: "bg-amber-500/8 text-amber-600 dark:text-amber-400 border-amber-500/15",
    icon: <AlertTriangle className="w-3 h-3" />
  },
  expired: { 
    label: "Expired", 
    className: "bg-red-500/8 text-red-600 dark:text-red-400 border-red-500/15",
    icon: <Clock className="w-3 h-3" />
  },
};

export function ContractsList({ contracts, selectedContract, onSelectContract }: ContractsListProps) {
  // Sort contracts: expiring soon first, then active, then expired
  const sortedContracts = [...contracts].sort((a, b) => {
    const aExpiry = differenceInDays(a.expiryDate, new Date());
    const bExpiry = differenceInDays(b.expiryDate, new Date());
    
    // Expired at bottom
    if (a.status === "expired" && b.status !== "expired") return 1;
    if (b.status === "expired" && a.status !== "expired") return -1;
    
    // Expiring soon at top
    if (a.status === "expiring" && b.status !== "expiring") return -1;
    if (b.status === "expiring" && a.status !== "expiring") return 1;
    
    // Then by expiry date
    return aExpiry - bExpiry;
  });

  if (contracts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No contracts yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Add your first contract to start tracking renewals and expiry dates.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-1">
      {sortedContracts.map((contract, index) => (
        <ContractListItem
          key={contract.id}
          contract={contract}
          isSelected={selectedContract?.id === contract.id}
          onClick={() => onSelectContract(contract)}
          index={index}
        />
      ))}
    </div>
  );
}

function ContractListItem({
  contract,
  isSelected,
  onClick,
  index,
}: {
  contract: Contract;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) {
  const status = statusConfig[contract.status];
  const daysUntilExpiry = differenceInDays(contract.expiryDate, new Date());
  const visibleTags = contract.tags.slice(0, 2);
  const overflowCount = contract.tags.length - 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.15 }}
      onClick={onClick}
      className={`group relative px-4 py-3.5 rounded-lg border cursor-pointer transition-all duration-150 ${
        isSelected
          ? "bg-primary/5 border-primary/20"
          : "bg-transparent border-transparent hover:bg-muted/30 hover:border-border/50"
      }`}
    >
      {/* Strict 3-column grid */}
      <div className="grid grid-cols-[1fr_120px_160px] items-center gap-6">
        
        {/* LEFT: Contract name + counterparty + tags */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-foreground truncate">
                {contract.name}
              </span>
              
              {/* User tags - neutral colors, max 2 visible */}
              {visibleTags.length > 0 && (
                <div className="hidden sm:flex items-center gap-1">
                  {visibleTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-5 bg-muted/30 text-muted-foreground border-border/50 font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {overflowCount > 0 && (
                    <span className="text-[10px] text-muted-foreground/60 ml-0.5">
                      +{overflowCount}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground truncate">
                {contract.company}
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE: ONE primary status pill only */}
        <div className="flex items-center justify-center">
          <Badge 
            variant="outline" 
            className={`${status.className} border text-xs font-medium gap-1 px-2.5 py-0.5`}
          >
            {status.icon}
            {status.label}
          </Badge>
        </div>

        {/* RIGHT: Expiry date, days remaining, action indicator */}
        <div className="flex items-center justify-end gap-3">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{format(contract.expiryDate, "MMM d, yyyy")}</span>
            </div>
            <span className={`text-[11px] ${
              daysUntilExpiry <= 0 
                ? "text-red-500/80" 
                : daysUntilExpiry <= 30 
                  ? "text-amber-500/80" 
                  : "text-muted-foreground/60"
            }`}>
              {daysUntilExpiry > 0 
                ? `${daysUntilExpiry} days left` 
                : daysUntilExpiry === 0 
                  ? "Expires today"
                  : `${Math.abs(daysUntilExpiry)}d overdue`
              }
            </span>
          </div>
          
          {/* Action indicator */}
          <ChevronRight className={`w-4 h-4 text-muted-foreground/40 transition-all duration-150 ${
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`} />
        </div>
      </div>
    </motion.div>
  );
}
