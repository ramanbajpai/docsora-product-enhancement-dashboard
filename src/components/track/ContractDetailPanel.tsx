import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Building2, Calendar, Users, Bell, FileText, Tag, 
  RefreshCw, Clock, CheckCircle2, AlertTriangle, Edit2,
  Plus, Trash2, Download, Upload
} from "lucide-react";
import { Contract } from "@/pages/Track";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

interface ContractDetailPanelProps {
  contract: Contract;
  onClose: () => void;
  onUpdate: (updated: Contract) => void;
}

const tagColors: Record<string, string> = {
  Vendor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Services: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Software: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  License: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Logistics: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Partnership: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Real Estate": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Lease: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Legal: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  NDA: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Cloud: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Infrastructure: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function ContractDetailPanel({ contract, onClose, onUpdate }: ContractDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "reminders">("overview");
  const daysUntilExpiry = differenceInDays(contract.expiryDate, new Date());
  const isExpiring = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

  const handleToggleReminder = (days: number) => {
    const updatedReminders = contract.reminders.map(r => 
      r.days === days ? { ...r, enabled: !r.enabled } : r
    );
    onUpdate({ ...contract, reminders: updatedReminders });
    toast.success(`Reminder ${updatedReminders.find(r => r.days === days)?.enabled ? "enabled" : "disabled"}`);
  };

  const timeline = [
    { action: "Contract created", date: contract.startDate, icon: <FileText className="w-3.5 h-3.5" /> },
    ...(contract.signedDate ? [{ action: "Contract signed", date: contract.signedDate, icon: <CheckCircle2 className="w-3.5 h-3.5" /> }] : []),
    { action: "Contract active", date: contract.startDate, icon: <Clock className="w-3.5 h-3.5" /> },
    { action: contract.status === "expired" ? "Contract expired" : "Contract expires", date: contract.expiryDate, icon: contract.status === "expired" ? <AlertTriangle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />, future: contract.status !== "expired" },
  ];

  return (
    <div className="h-[calc(100vh-200px)] sticky top-8 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-semibold text-foreground truncate mb-1">
              Contract Details
            </h2>
            <p className="text-sm text-muted-foreground truncate">{contract.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Company & Value */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span>{contract.company}</span>
          </div>
          {contract.value && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-foreground font-medium">{contract.value}</span>
            </>
          )}
        </div>

        {/* Warning Banner */}
        {isExpiring && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-sm text-amber-400">Expires in {daysUntilExpiry} days</span>
          </motion.div>
        )}

        {contract.status === "expired" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <span className="text-sm text-destructive">This contract has expired</span>
          </motion.div>
        )}
      </div>

      {/* Panel Tabs */}
      <div className="flex border-b border-border/50 px-6">
        {(["overview", "timeline", "reminders"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative py-3 px-4 text-sm capitalize transition-colors ${
              activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="contractPanelTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ duration: 0.2 }}
              />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Start Date
                  </div>
                  <p className="text-sm font-medium">{format(contract.startDate, "MMM d, yyyy")}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Expiry Date
                  </div>
                  <p className={`text-sm font-medium ${isExpiring ? "text-amber-400" : ""}`}>
                    {format(contract.expiryDate, "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              {/* Renewal Type */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Renewal Type</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {contract.renewalType}
                </Badge>
              </div>

              {/* Parties */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Parties ({contract.parties.length})
                  </label>
                </div>
                <div className="space-y-2">
                  {contract.parties.map((party, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{party.name}</p>
                        <p className="text-xs text-muted-foreground">{party.email}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {party.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    Tags
                  </label>
                  <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                    <Plus className="w-3 h-3" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {contract.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`${tagColors[tag] || "bg-muted/50"}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative">
                <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {timeline.map((event, i) => (
                    <div key={i} className={`flex items-start gap-3 relative ${event.future ? "opacity-50" : ""}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        event.future ? "bg-muted/50" : "bg-muted"
                      }`}>
                        {event.icon}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-sm text-foreground">{event.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.date, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "reminders" && (
            <motion.div
              key="reminders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Get notified before this contract expires.
              </p>
              
              {contract.reminders.map((reminder) => (
                <div
                  key={reminder.days}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <Bell className={`w-4 h-4 ${reminder.enabled ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm">{reminder.days} days before expiry</span>
                  </div>
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={() => handleToggleReminder(reminder.days)}
                  />
                </div>
              ))}

              <Button variant="outline" size="sm" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Custom Reminder
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 flex-1">
            <Upload className="w-3.5 h-3.5" />
            Upload Renewal
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 flex-1">
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
