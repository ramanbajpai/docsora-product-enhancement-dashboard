import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  inApp: boolean;
}

const initialSettings: NotificationSetting[] = [
  {
    id: "signed",
    title: "Document signed",
    description: "When a document you sent is signed",
    email: true,
    inApp: true,
  },
  {
    id: "viewed",
    title: "Document viewed",
    description: "When someone views a document you shared",
    email: false,
    inApp: true,
  },
  {
    id: "approval",
    title: "Approval requested",
    description: "When you receive a document for approval",
    email: true,
    inApp: true,
  },
  {
    id: "delegation",
    title: "Delegation events",
    description: "When documents are delegated to or from you",
    email: true,
    inApp: true,
  },
  {
    id: "storage",
    title: "Storage activity",
    description: "When files are uploaded, moved, or deleted",
    email: false,
    inApp: true,
  },
];

export default function Notifications() {
  const [settings, setSettings] = useState<NotificationSetting[]>(initialSettings);

  const toggleSetting = (id: string, channel: "email" | "inApp") => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, [channel]: !s[channel] } : s
    ));
  };

  const allEmailEnabled = settings.every(s => s.email);
  const allInAppEnabled = settings.every(s => s.inApp);

  const toggleAllChannel = (channel: "email" | "inApp") => {
    const allEnabled = channel === "email" ? allEmailEnabled : allInAppEnabled;
    setSettings(settings.map(s => ({ ...s, [channel]: !allEnabled })));
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose how you want to be notified about activity
            </p>
          </div>

          {/* Channel Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border mb-2">
            <div />
            <div className="flex items-center gap-8">
              <button 
                onClick={() => toggleAllChannel("email")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
              <button 
                onClick={() => toggleAllChannel("inApp")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Monitor className="w-4 h-4" />
                <span>In-app</span>
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="divide-y divide-border">
            {settings.map((setting) => (
              <div 
                key={setting.id}
                className="flex items-center justify-between py-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mt-0.5">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      {setting.title}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {setting.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="w-[72px] flex justify-center">
                    <Switch
                      checked={setting.email}
                      onCheckedChange={() => toggleSetting(setting.id, "email")}
                    />
                  </div>
                  <div className="w-[72px] flex justify-center">
                    <Switch
                      checked={setting.inApp}
                      onCheckedChange={() => toggleSetting(setting.id, "inApp")}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quiet Hours (Future Feature) */}
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Bell className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Quiet hours
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Pause notifications during specific hours
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Coming soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
