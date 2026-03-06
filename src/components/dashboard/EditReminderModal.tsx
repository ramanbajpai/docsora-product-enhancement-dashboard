import { useState, useEffect, useMemo } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Reminder, 
  NotificationMethod,
  NewReminderData,
} from "@/hooks/useReminders";

interface EditReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder: Reminder | null;
  onUpdate: (id: string, data: Partial<NewReminderData>) => void;
  onDelete: (id: string) => void;
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

// Character limits
const TITLE_MIN = 3;
const TITLE_MAX = 40;
const TITLE_WARNING = 36;
const DESC_MAX = 240;
const DESC_WARNING = 216;

export function EditReminderModal({ 
  open, 
  onOpenChange,
  reminder,
  onUpdate,
  onDelete,
}: EditReminderModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState("09:00");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Notification state
  const [sendReminder, setSendReminder] = useState(false);
  const [reminderTiming, setReminderTiming] = useState("1-day");
  const [customValue, setCustomValue] = useState("1");
  const [customUnit, setCustomUnit] = useState("days");

  // Parse title and description from reminder note
  const parseNoteContent = (note: string | undefined) => {
    if (!note) return { title: "", description: "" };
    const lines = note.split('\n');
    return {
      title: lines[0] || "",
      description: lines.slice(1).join('\n') || "",
    };
  };

  // Populate form when reminder changes
  useEffect(() => {
    if (reminder) {
      const { title: parsedTitle, description: parsedDescription } = parseNoteContent(reminder.note || reminder.text);
      setTitle(parsedTitle || reminder.text);
      setDescription(parsedDescription);
      setDueDate(reminder.dueDate);
      setDueTime(reminder.dueTime || "09:00");
      setSendReminder(reminder.notificationMethod === "email" || reminder.notificationMethod === "both");
      setReminderTiming("1-day");
      setCustomValue("1");
      setCustomUnit("days");
      setShowDeleteConfirm(false);
    }
  }, [reminder]);

  const getNotificationMethod = (): NotificationMethod => {
    return sendReminder ? "email" : "in-app";
  };

  const handleSave = () => {
    if (!reminder || title.trim().length < TITLE_MIN) return;
    
    onUpdate(reminder.id, {
      type: reminder.type,
      linkedDocument: null,
      dueDate,
      dueTime,
      note: title + (description ? `\n${description}` : ""),
      notificationMethod: getNotificationMethod(),
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!reminder) return;
    onDelete(reminder.id);
    onOpenChange(false);
    setShowDeleteConfirm(false);
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

  if (!reminder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold tracking-tight">Edit Reminder</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 pb-6 space-y-6">
          {/* Title + Description (grouped together) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-reminder-title" className="text-sm font-medium">
                Reminder title
              </Label>
              <Input
                id="edit-reminder-title"
                value={title}
                onChange={handleTitleChange}
                placeholder="What do you need to remember?"
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
              <Label htmlFor="edit-reminder-description" className="text-sm font-medium">
                Description <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="edit-reminder-description"
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-3 w-full">
              <span className="text-sm text-muted-foreground flex-1">Delete this reminder?</span>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="text-sm text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1.5"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete reminder
              </button>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!isValid}>
                  Save reminder
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
