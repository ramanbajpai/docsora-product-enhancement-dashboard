import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar, ChevronDown, Clock, AlertTriangle, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, subDays, startOfDay, endOfDay, isAfter } from "date-fns";
import { DateRange } from "react-day-picker";
import { CustomDateRangeDialog } from "@/components/track/CustomDateRangeDialog";

interface TrackFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isContracts?: boolean;
  isTransferSent?: boolean;
  isTransferReceived?: boolean;
  isSign?: boolean;
  onDateRangeChange?: (range: { from: Date; to: Date } | null) => void;
}

type DatePreset = "all" | "today" | "7days" | "30days" | "90days" | "custom";

export function TrackFilters({ searchQuery, setSearchQuery, isContracts = false, isTransferSent = false, isTransferReceived = false, isSign = false, onDateRangeChange }: TrackFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [savedViews] = useState([
    { id: "expiring", label: "Expiring Soon", icon: Clock },
    { id: "attention", label: "Needs Action", icon: AlertTriangle },
    { id: "high", label: "High Priority", icon: Bookmark },
  ]);

  // Date range state
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(undefined);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  // Get date range based on preset
  const getDateRangeFromPreset = (preset: DatePreset): { from: Date; to: Date } | null => {
    const now = new Date();
    switch (preset) {
      case "today":
        return { from: startOfDay(now), to: endOfDay(now) };
      case "7days":
        return { from: startOfDay(subDays(now, 7)), to: endOfDay(now) };
      case "30days":
        return { from: startOfDay(subDays(now, 30)), to: endOfDay(now) };
      case "90days":
        return { from: startOfDay(subDays(now, 90)), to: endOfDay(now) };
      case "custom":
        return customRange?.from && customRange?.to
          ? { from: startOfDay(customRange.from), to: endOfDay(customRange.to) }
          : null;
      default:
        return null;
    }
  };

  // Apply date filter when preset or custom range changes
  useEffect(() => {
    const range = getDateRangeFromPreset(datePreset);
    onDateRangeChange?.(range);
  }, [datePreset, customRange]);

  // Get button label
  const getDateButtonLabel = () => {
    switch (datePreset) {
      case "today":
        return "Today";
      case "7days":
        return "Last 7 days";
      case "30days":
        return "Last 30 days";
      case "90days":
        return "Last 90 days";
      case "custom":
        if (customRange?.from && customRange?.to) {
          return `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d")}`;
        }
        return "Custom range";
      default:
        return "Date";
    }
  };

  const handlePresetSelect = (preset: DatePreset) => {
    if (preset === "custom") {
      setTempRange(customRange);
      setIsCustomRangeOpen(true);
    } else {
      setDatePreset(preset);
      setCustomRange(undefined);
    }
  };

  const handleApplyCustomRange = () => {
    if (tempRange?.from && tempRange?.to && !isAfter(tempRange.from, tempRange.to)) {
      setCustomRange(tempRange);
      setDatePreset("custom");
      setIsCustomRangeOpen(false);
    }
  };

  const handleClearDateFilter = () => {
    setDatePreset("all");
    setCustomRange(undefined);
    setTempRange(undefined);
    setIsCustomRangeOpen(false);
  };

  

  return (
    <div className="mb-6 space-y-4">
      {/* Search and Filters Row */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isContracts ? "Search by contract name or company..." : isSign ? "Search by document name, sender, or recipient..." : isTransferReceived ? "Search by file name, sender, or email..." : "Search by file name, recipient, or email..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/30 border-border/50 focus:bg-background transition-colors"
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-muted/30 border-border/50 hover:bg-muted hover:text-foreground">
              <Filter className="w-4 h-4" />
              Status
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {isSign ? (
              // Sign-specific statuses
              <>
                <DropdownMenuCheckboxItem
                  checked={activeFilters.includes("action_required")}
                  onCheckedChange={() => toggleFilter("action_required")}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F5A524]" />
                    Action Required
                  </span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={activeFilters.includes("in_progress")}
                  onCheckedChange={() => toggleFilter("in_progress")}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    In Progress
                  </span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={activeFilters.includes("waiting_for_others")}
                  onCheckedChange={() => toggleFilter("waiting_for_others")}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                    Waiting for Others
                  </span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={activeFilters.includes("completed")}
                  onCheckedChange={() => toggleFilter("completed")}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    Completed
                  </span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={activeFilters.includes("declined")}
                  onCheckedChange={() => toggleFilter("declined")}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                    Declined
                  </span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={activeFilters.includes("expired")}
                  onCheckedChange={() => toggleFilter("expired")}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#991B1B]" />
                    Expired
                  </span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={activeFilters.includes("cancelled")}
                  onCheckedChange={() => toggleFilter("cancelled")}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6B7280]" />
                    Cancelled
                  </span>
                </DropdownMenuCheckboxItem>
              </>
            ) : (isTransferSent || isTransferReceived) ? (
              // Only Active and Expired for Transfer Sent and Received
              <>
                <DropdownMenuCheckboxItem
                  checked={activeFilters.includes("active")}
                  onCheckedChange={() => toggleFilter("active")}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={activeFilters.includes("expired")}
                  onCheckedChange={() => toggleFilter("expired")}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    Expired
                  </span>
                </DropdownMenuCheckboxItem>
              </>
            ) : (
              // Full status list for contracts
              <>
                <DropdownMenuCheckboxItem
                  checked={activeFilters.includes("active")}
                  onCheckedChange={() => toggleFilter("active")}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={activeFilters.includes("expiring")}
                  onCheckedChange={() => toggleFilter("expiring")}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Expiring Soon
                  </span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={activeFilters.includes("expired")}
                  onCheckedChange={() => toggleFilter("expired")}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    Expired
                  </span>
                </DropdownMenuCheckboxItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className={`gap-2 bg-muted/30 border-border/50 hover:bg-muted hover:text-foreground ${
                datePreset !== "all" ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <Calendar className="w-4 h-4" />
              {getDateButtonLabel()}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={datePreset === "all"}
              onCheckedChange={() => handlePresetSelect("all")}
            >
              All time
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={datePreset === "today"}
              onCheckedChange={() => handlePresetSelect("today")}
            >
              Today
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={datePreset === "7days"}
              onCheckedChange={() => handlePresetSelect("7days")}
            >
              Last 7 days
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={datePreset === "30days"}
              onCheckedChange={() => handlePresetSelect("30days")}
            >
              Last 30 days
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={datePreset === "90days"}
              onCheckedChange={() => handlePresetSelect("90days")}
            >
              Last 90 days
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={datePreset === "custom"}
              onCheckedChange={() => handlePresetSelect("custom")}
            >
              Custom range...
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CustomDateRangeDialog
          open={isCustomRangeOpen}
          onOpenChange={setIsCustomRangeOpen}
          range={tempRange}
          onRangeChange={setTempRange}
          onApply={handleApplyCustomRange}
          onCancel={() => setTempRange(customRange)}
        />

        {/* Saved Views - hide for transfer sent and received */}
        {!isTransferSent && !isTransferReceived && (
          <div className="flex items-center gap-2 ml-auto">
            {savedViews.map((view) => (
              <Button
                key={view.id}
                variant="ghost"
                size="sm"
                onClick={() => toggleFilter(view.id)}
                className={`gap-1.5 text-xs ${
                  activeFilters.includes(view.id)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <view.icon className="w-3.5 h-3.5" />
                {view.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {(activeFilters.length > 0 || datePreset !== "all") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20"
                onClick={() => toggleFilter(filter)}
              >
                {filter}
                <span className="ml-1">×</span>
              </Badge>
            ))}
            {datePreset !== "all" && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20"
                onClick={handleClearDateFilter}
              >
                {getDateButtonLabel()}
                <span className="ml-1">×</span>
              </Badge>
            )}
            <Button
              variant="link"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => {
                setActiveFilters([]);
                handleClearDateFilter();
              }}
            >
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
