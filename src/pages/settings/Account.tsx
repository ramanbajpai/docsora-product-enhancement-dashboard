import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  Clock,
  Shield,
  CheckCircle2,
  Lock,
  Mail,
  Bell,
  FileSignature,
  AlertTriangle,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock user plan - in production this would come from auth context
const userPlan: "Pro" | "Team" | "Enterprise" = "Pro";

export default function Account() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // General settings state
  const [workspaceName, setWorkspaceName] = useState("Acme Corporation");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState("12h");
  
  // Data & Compliance state
  const [dataRegion, setDataRegion] = useState("us");
  
  // Notifications state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    signingUpdates: true,
    securityAlerts: true,
    weeklyDigest: false,
    marketingEmails: false,
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    compactMode: false,
    autoSave: true,
    keyboardShortcuts: true,
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setHasChanges(false);
    toast({
      title: "Settings saved",
      description: "Your account settings have been updated.",
    });
  };

  const markChanged = () => setHasChanges(true);

  const isAdmin = userPlan === "Team" || userPlan === "Enterprise";

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Account settings
            </h1>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Manage your workspace, data compliance, and preferences
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/30 border border-border/30 p-1 h-auto">
              <TabsTrigger 
                value="general" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm"
              >
                General
              </TabsTrigger>
              <TabsTrigger 
                value="data-compliance" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm"
              >
                Data & Compliance
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm"
              >
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <div className="bg-card border border-border/40 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-base font-medium text-foreground mb-1">Workspace</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Configure your workspace identity and regional settings
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Workspace Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground/90">
                      Workspace name
                    </Label>
                    <Input
                      value={workspaceName}
                      onChange={(e) => { setWorkspaceName(e.target.value); markChanged(); }}
                      className="max-w-md bg-muted/20 border-border/40 focus:border-primary/50 focus:ring-primary/20"
                    />
                    <p className="text-xs text-muted-foreground/50">
                      This name appears across your workspace and in shared documents
                    </p>
                  </div>

                  {/* Default Language */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground/60" />
                      Default language
                    </Label>
                    <Select value={defaultLanguage} onValueChange={(v) => { setDefaultLanguage(v); markChanged(); }}>
                      <SelectTrigger className="max-w-md bg-muted/20 border-border/40 focus:border-primary/50 focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="en-gb">English (UK)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground/50">
                      Used for interface and system messages
                    </p>
                  </div>

                  {/* Date Format */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground/60" />
                      Date format
                    </Label>
                    <Select value={dateFormat} onValueChange={(v) => { setDateFormat(v); markChanged(); }}>
                      <SelectTrigger className="max-w-md bg-muted/20 border-border/40 focus:border-primary/50 focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Format */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground/90">
                      Time format
                    </Label>
                    <Select value={timeFormat} onValueChange={(v) => { setTimeFormat(v); markChanged(); }}>
                      <SelectTrigger className="max-w-md bg-muted/20 border-border/40 focus:border-primary/50 focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                        <SelectItem value="24h">24-hour (14:30)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Data & Compliance Tab */}
            <TabsContent value="data-compliance" className="space-y-6">
              <div className="bg-card border border-border/40 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-base font-medium text-foreground mb-1">Data residency</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Choose where your data is stored and processed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground/60" />
                    Data hosting region
                  </Label>
                  <Select 
                    value={dataRegion} 
                    onValueChange={(v) => { setDataRegion(v); markChanged(); }}
                  >
                    <SelectTrigger className="max-w-md bg-muted/20 border-border/40 focus:border-primary/50 focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States (US-East)</SelectItem>
                      <SelectItem value="eu">European Union (EU-West)</SelectItem>
                      <SelectItem value="uae">United Arab Emirates</SelectItem>
                      <SelectItem value="ap">Asia Pacific (Singapore)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground/50 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    Region changes require Enterprise plan
                  </p>
                </div>
              </div>

              {/* Encryption Status */}
              <div className="bg-card border border-border/40 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="text-base font-medium text-foreground mb-1">Encryption</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Your data security status
                  </p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      End-to-end encryption enabled
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      All data encrypted at rest (AES-256) and in transit (TLS 1.3)
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    Active
                  </Badge>
                </div>
              </div>

              {/* Compliance */}
              <div className="bg-card border border-border/40 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="text-base font-medium text-foreground mb-1">Compliance certifications</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Industry standards and regulatory compliance
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">GDPR</p>
                      <p className="text-xs text-muted-foreground/60">
                        EU General Data Protection Regulation compliant
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-muted/30 text-foreground/70 border-border/40">
                      Compliant
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">ISO 27001</p>
                      <p className="text-xs text-muted-foreground/60">
                        Information security management system certified
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-muted/30 text-foreground/70 border-border/40">
                      Certified
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">SOC Type II</p>
                      <p className="text-xs text-muted-foreground/60">
                        Security, availability, and confidentiality controls
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-muted/30 text-foreground/70 border-border/40">
                      Certified
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="bg-card border border-border/40 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-base font-medium text-foreground mb-1">Email notifications</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Configure which notifications you receive via email
                  </p>
                </div>

                <div className="space-y-4">
                  <NotificationToggle
                    icon={Mail}
                    title="Email alerts"
                    description="Important account and security notifications"
                    checked={notifications.emailAlerts}
                    onChange={(checked) => {
                      setNotifications(prev => ({ ...prev, emailAlerts: checked }));
                      markChanged();
                    }}
                  />

                  <NotificationToggle
                    icon={FileSignature}
                    title="Signing updates"
                    description="When documents are signed, viewed, or expire"
                    checked={notifications.signingUpdates}
                    onChange={(checked) => {
                      setNotifications(prev => ({ ...prev, signingUpdates: checked }));
                      markChanged();
                    }}
                  />

                  <NotificationToggle
                    icon={AlertTriangle}
                    title="Security alerts"
                    description="Login attempts, password changes, and suspicious activity"
                    checked={notifications.securityAlerts}
                    onChange={(checked) => {
                      setNotifications(prev => ({ ...prev, securityAlerts: checked }));
                      markChanged();
                    }}
                    important
                  />

                  <NotificationToggle
                    icon={Bell}
                    title="Weekly digest"
                    description="Summary of activity and upcoming deadlines"
                    checked={notifications.weeklyDigest}
                    onChange={(checked) => {
                      setNotifications(prev => ({ ...prev, weeklyDigest: checked }));
                      markChanged();
                    }}
                  />

                  <NotificationToggle
                    icon={Info}
                    title="Product updates"
                    description="New features and improvements"
                    checked={notifications.marketingEmails}
                    onChange={(checked) => {
                      setNotifications(prev => ({ ...prev, marketingEmails: checked }));
                      markChanged();
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <div className="bg-card border border-border/40 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-base font-medium text-foreground mb-1">Display preferences</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Customize your workspace experience
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">Compact mode</p>
                      <p className="text-xs text-muted-foreground/60">
                        Reduce spacing for denser information display
                      </p>
                    </div>
                    <Switch
                      checked={preferences.compactMode}
                      onCheckedChange={(checked) => {
                        setPreferences(prev => ({ ...prev, compactMode: checked }));
                        markChanged();
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">Auto-save drafts</p>
                      <p className="text-xs text-muted-foreground/60">
                        Automatically save document changes
                      </p>
                    </div>
                    <Switch
                      checked={preferences.autoSave}
                      onCheckedChange={(checked) => {
                        setPreferences(prev => ({ ...prev, autoSave: checked }));
                        markChanged();
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Keyboard shortcuts</p>
                      <p className="text-xs text-muted-foreground/60">
                        Enable keyboard shortcuts for common actions
                      </p>
                    </div>
                    <Switch
                      checked={preferences.keyboardShortcuts}
                      onCheckedChange={(checked) => {
                        setPreferences(prev => ({ ...prev, keyboardShortcuts: checked }));
                        markChanged();
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={cn(
                "min-w-[120px] transition-all duration-200",
                hasChanges 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Helper component for notification toggles
function NotificationToggle({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  important = false,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  important?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg mt-0.5",
          important ? "bg-destructive/10" : "bg-muted/30"
        )}>
          <Icon className={cn(
            "w-4 h-4",
            important ? "text-destructive/70" : "text-muted-foreground/60"
          )} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground/60">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
