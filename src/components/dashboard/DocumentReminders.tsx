import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  FileText, 
  Plus,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReminders, Reminder } from "@/hooks/useReminders";
import { AddReminderModal } from "./AddReminderModal";
import { EditReminderModal } from "./EditReminderModal";
import { Button } from "@/components/ui/button";

interface ReminderItemProps {
  reminder: Reminder;
  onComplete: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  formatDueDate: (date: Date | null) => string | null;
}

function ReminderItem({ 
  reminder, 
  onComplete, 
  onEdit,
  formatDueDate 
}: ReminderItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const dueLabel = formatDueDate(reminder.dueDate);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCompleting(true);
    setTimeout(() => {
      onComplete(reminder.id);
    }, 300);
  };

  const getNotificationIcon = () => {
    if (reminder.notificationMethod === "both") {
      return (
        <div className="flex items-center gap-0.5">
          <Bell className="w-2.5 h-2.5" />
          <Mail className="w-2.5 h-2.5" />
        </div>
      );
    }
    if (reminder.notificationMethod === "email") {
      return <Mail className="w-3 h-3" />;
    }
    return <Bell className="w-3 h-3" />;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ 
        opacity: isCompleting ? 0 : 1, 
        x: 0,
        height: isCompleting ? 0 : "auto",
      }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "p-4 group cursor-pointer transition-colors",
        "hover:bg-surface-2",
        isCompleting && "overflow-hidden"
      )}
      onClick={() => onEdit(reminder)}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          onClick={handleComplete}
          className={cn(
            "w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 transition-all duration-200",
            "border-muted-foreground/30 hover:border-primary",
            "flex items-center justify-center",
            isCompleting && "bg-primary border-primary"
          )}
        >
          <Check className={cn(
            "w-3 h-3 transition-all duration-200",
            isCompleting ? "text-primary-foreground" : "text-transparent group-hover:text-primary/30"
          )} />
        </button>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              "text-sm font-medium text-foreground transition-all duration-200",
              isCompleting && "line-through text-muted-foreground"
            )}>
              {reminder.text}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <FileText className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {reminder.documentName}
            </span>
          </div>
        </div>

        {/* Due date, time & notification */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification method indicator */}
          <div className="text-muted-foreground/50" title={`Notify via ${reminder.notificationMethod}`}>
            {getNotificationIcon()}
          </div>
          
          {dueLabel && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span className={cn(dueLabel === "Today" && "font-medium text-foreground")}>
                {dueLabel}
              </span>
              {reminder.dueTime && (
                <>
                  <Clock className="w-3 h-3 ml-1" />
                  <span>{reminder.dueTime}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}


export function DocumentReminders() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  
  const {
    pendingReminders,
    completedReminders,
    showCompleted,
    setShowCompleted,
    addReminder,
    updateReminder,
    completeReminder,
    deleteReminder,
    formatDueDate,
  } = useReminders();

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setEditModalOpen(true);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-hint text-xs text-muted-foreground tracking-wider">
              Focus
            </span>
            <h2 className="text-lg font-semibold text-foreground mt-1">
              Reminders
            </h2>
          </div>
          <button 
            onClick={() => setAddModalOpen(true)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>


        <div className="glass-card divide-y divide-border overflow-hidden">
          {pendingReminders.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No reminders set</p>
              <button 
                onClick={() => setAddModalOpen(true)}
                className="text-sm text-primary hover:underline mt-2"
              >
                Add your first reminder
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {pendingReminders.map((reminder) => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  onComplete={completeReminder}
                  onEdit={handleEditReminder}
                  formatDueDate={formatDueDate}
                />
              ))}
            </AnimatePresence>
          )}

          {/* Completed reminders toggle */}
          {completedReminders.length > 0 && (
            <div className="px-4 py-3 bg-surface-1">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 w-full"
              >
                {showCompleted ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                {showCompleted ? "Hide" : "View"} completed ({completedReminders.length})
              </button>
              
              <AnimatePresence>
                {showCompleted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 space-y-2"
                  >
                    {completedReminders.map((reminder) => (
                      <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-xs text-muted-foreground/60"
                      >
                        <Check className="w-3 h-3" />
                        <span className="line-through truncate">{reminder.text}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.section>

      <AddReminderModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddReminder={addReminder}
      />

      <EditReminderModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        reminder={editingReminder}
        onUpdate={updateReminder}
        onDelete={deleteReminder}
      />
    </>
  );
}