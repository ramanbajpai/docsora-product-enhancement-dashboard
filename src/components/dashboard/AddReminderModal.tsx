import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  NotificationMethod,
  NewReminderData,
} from "@/hooks/useReminders";

interface AddReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddReminder: (reminder: NewReminderData) => void;
  prefilledDocument?: string;
}

const timeOptions = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

const reminderTimingOptions = [
  { value: "at-time", label: "At due time" },
  { value: "30-min", label: "30 minutes before" },
  { value: "1-hour", label: "1 hour before" },
  { value: "1-day", label: "1 day before" },
  { value: "2-days", label: "2 days before" },
  { value: "1-week", label: "1 week before" },
  { value: "custom", label: "Custom…" },
];

const customUnitOptions = [
  { value: "minutes", label: "minutes" },
  { value: "hours", label: "hours" },
  { value: "days", label: "days" },
  { value: "weeks", label: "weeks" },
];

const placeholders = [
  "Follow up on NDA signature",
  "Check approval status",
  "Share contract with client",
  "Review document before deadline",
];

// Character limits
const TITLE_MIN = 3;
const TITLE_MAX = 40;
const TITLE_WARNING = 36;
const DESC_MAX = 240;
const DESC_WARNING = 216;

export function AddReminderModal({ 
  open, 
  onOpenChange, 
  onAddReminder,
}: AddReminderModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState("09:00");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  // Notification state
  const [sendReminder, setSendReminder] = useState(false);
  const [reminderTiming, setReminderTiming] = useState("1-day");
  const [customValue, setCustomValue] = useState("1");
  const [customUnit, setCustomUnit] = useState("days");

  // Rotating placeholder
  const [placeholderIndex] = useState(() => 
    Math.floor(Math.random() * placeholders.length)
  );

  const getNotificationMethod = (): NotificationMethod => {
    return sendReminder ? "email" : "in-app";
  };

  const handleSubmit = () => {
    if (title.trim().length < TITLE_MIN) return;
    
    onAddReminder({
      type: "custom",
      linkedDocument: null,
      dueDate,
      dueTime,
      note: title + (description ? `\n${description}` : ""),
      notificationMethod: getNotificationMethod(),
    });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(null);
    setDueTime("09:00");
    setSendReminder(false);
    setReminderTiming("1-day");
    setCustomValue("1");
    setCustomUnit("days");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= TITLE_MAX) {
      setTitle(value);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= DESC_MAX) {
      setDescription(value);
    }
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 99)) {
      setCustomValue(value);
    }
  };

  const isValid = title.trim().length >= TITLE_MIN;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px] gap-0 p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-lg font-semibold">Add Reminder</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Create a personal reminder to stay organized.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Title + Description (grouped together) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-title" className="text-sm font-medium">
                Reminder title
              </Label>
              <Input
                id="reminder-title"
                value={title}
                onChange={handleTitleChange}
                placeholder={placeholders[placeholderIndex]}
                className={cn(
                  "h-11",
                  title.length > 0 && title.length < TITLE_MIN && "border-destructive/50 focus-visible:ring-destructive/30"
                )}
                autoFocus
              />
              <p className={cn(
                "text-[10px] text-right transition-colors",
                title.length >= TITLE_WARNING ? "text-amber-500" : "text-muted-foreground"
              )}>
                {title.length} / {TITLE_MAX}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-description" className="text-sm font-medium">
                Description <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="reminder-description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Add context or instructions for yourself…"
                className="min-h-[72px] resize-none"
              />
              <p className={cn(
                "text-[10px] text-right transition-colors",
                description.length >= DESC_WARNING ? "text-amber-500" : "text-muted-foreground"
              )}>
                {description.length} / {DESC_MAX}
              </p>
            </div>
          </div>

          {/* Date & Time - Single combined picker */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Due date
            </Label>
            <div className="flex gap-3">
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 h-11 justify-start font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2.5 text-muted-foreground" />
                    {dueDate ? format(dueDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate || undefined}
                    onSelect={(date) => {
                      setDueDate(date || null);
                      setDatePickerOpen(false);
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Select value={dueTime} onValueChange={setDueTime}>
                  <SelectTrigger className="w-[100px] h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notifications (optional, expandable) */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Notifications <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            
            {/* Primary toggle */}
            <div 
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-colors",
                sendReminder ? "border-primary/30 bg-primary/5" : "border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Send me a reminder</span>
              </div>
              <Switch
                checked={sendReminder}
                onCheckedChange={setSendReminder}
              />
            </div>

            {/* Reminder timing selector - shown when reminder is ON */}
            {sendReminder && (
              <div className="space-y-3 pl-4 border-l-2 border-border ml-2">
                <Label className="text-xs text-muted-foreground">
                  Remind me
                </Label>
                <Select value={reminderTiming} onValueChange={setReminderTiming}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTimingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Custom timing inputs */}
                {reminderTiming === "custom" && (
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={customValue}
                      onChange={handleCustomValueChange}
                      className="w-16 h-10 text-center"
                      placeholder="1"
                    />
                    <Select value={customUnit} onValueChange={setCustomUnit}>
                      <SelectTrigger className="flex-1 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {customUnitOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">before</span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Choose when you want to be reminded before the due date.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Add reminder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
