import { format, isAfter } from "date-fns";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CustomDateRangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function CustomDateRangeDialog({
  open,
  onOpenChange,
  range,
  onRangeChange,
  onApply,
  onCancel,
}: CustomDateRangeDialogProps) {
  const isValidRange = !!(range?.from && range?.to && !isAfter(range.from, range.to));

  // Date selection: click start → click end (no backtracking). If end < start, auto-swap.
  const handleSelect = (newRange: DateRange | undefined) => {
    if (!newRange) {
      onRangeChange(undefined);
      return;
    }

    // When selecting a second date earlier than the start date, DayPicker resets the start.
    // Convert that second click into a swapped valid range.
    if (range?.from && !range?.to && newRange.from && !newRange.to && isAfter(range.from, newRange.from)) {
      onRangeChange({ from: newRange.from, to: range.from });
      return;
    }

    if (newRange.from && newRange.to && isAfter(newRange.from, newRange.to)) {
      onRangeChange({ from: newRange.to, to: newRange.from });
      return;
    }

    onRangeChange(newRange);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onCancel();
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="p-0 max-w-[320px] gap-0">
        <DialogTitle className="sr-only">Select date range</DialogTitle>
        
        {/* Header with date inputs */}
        <div className="p-4 border-b border-border">
          <div className="mb-3 pr-8">
            <h4 className="text-sm font-medium text-foreground">Select date range</h4>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex-1 px-3 py-2 rounded-md text-sm border transition-colors ${
              range?.from 
                ? "bg-background border-border text-foreground" 
                : "bg-muted/30 border-border/50 text-muted-foreground"
            }`}>
              {range?.from ? format(range.from, "MMM d, yyyy") : "Start date"}
            </div>
            <span className="text-muted-foreground text-sm">→</span>
            <div className={`flex-1 px-3 py-2 rounded-md text-sm border transition-colors ${
              range?.to 
                ? "bg-background border-border text-foreground" 
                : "bg-muted/30 border-border/50 text-muted-foreground"
            }`}>
              {range?.to ? format(range.to, "MMM d, yyyy") : "End date"}
            </div>
          </div>
        </div>

        {/* Single compact calendar */}
        <div className="p-2">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={1}
            disabled={(date) => isAfter(date, new Date())}
            initialFocus
            className="pointer-events-auto"
            classNames={{
              months: "flex flex-col",
              month: "space-y-3",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-muted rounded-md transition-colors",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-1",
              cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md transition-colors",
              day_range_end: "day-range-end",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-muted text-foreground",
              day_outside: "day-outside text-muted-foreground/50 aria-selected:bg-primary/30 aria-selected:text-muted-foreground",
              day_disabled: "text-muted-foreground/30",
              day_range_middle: "aria-selected:bg-primary/10 aria-selected:text-foreground",
              day_hidden: "invisible",
            }}
          />
        </div>

        {/* Helper text */}
        {!isValidRange && range?.from && (
          <p className="px-4 pb-2 text-xs text-muted-foreground">
            Click another date to complete the range.
          </p>
        )}

        {/* Footer actions */}
        <div className="p-3 border-t border-border flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={onApply} 
            disabled={!isValidRange}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
