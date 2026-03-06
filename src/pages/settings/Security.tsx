import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  LogOut, 
  Key,
  FileText,
  AlertTriangle,
  Check,
  ShieldCheck,
  ExternalLink,
  BadgeCheck,
  Lock,
  Globe,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  device: string;
  deviceType: "desktop" | "mobile";
  location: string;
  lastActive: string;
  current: boolean;
}

const sessions: Session[] = [
  { id: "1", device: "Chrome on macOS", deviceType: "desktop", location: "San Francisco, CA", lastActive: "Now", current: true },
  { id: "2", device: "Safari on iPhone", deviceType: "mobile", location: "San Francisco, CA", lastActive: "2 hours ago", current: false },
  { id: "3", device: "Firefox on Windows", deviceType: "desktop", location: "New York, NY", lastActive: "Yesterday", current: false },
];

export default function Security() {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setupTwoFactorOpen, setSetupTwoFactorOpen] = useState(false);
  const [signOutAllOpen, setSignOutAllOpen] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = () => {
    // Simulate password change
    setPasswordDialogOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleToggleTwoFactor = (enabled: boolean) => {
    if (enabled) {
      setSetupTwoFactorOpen(true);
    } else {
      setTwoFactorEnabled(false);
    }
  };

  const handleSetupTwoFactor = () => {
    setTwoFactorEnabled(true);
    setSetupTwoFactorOpen(false);
  };

  const handleSignOutSession = (sessionId: string) => {
    console.log("Signing out session:", sessionId);
  };

  const handleSignOutAll = () => {
    setSignOutAllOpen(false);
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-foreground">Security</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your account security settings and active sessions
            </p>
          </div>

          {/* Password Section */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Key className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-foreground">Password</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Last changed 3 months ago
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
                Change password
              </Button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  twoFactorEnabled ? "bg-success/10" : "bg-muted"
                )}>
                  <Shield className={cn(
                    "w-5 h-5",
                    twoFactorEnabled ? "text-success" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <h2 className="text-base font-medium text-foreground">Two-factor authentication</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {twoFactorEnabled 
                      ? "Your account is protected with 2FA" 
                      : "Add an extra layer of security to your account"}
                  </p>
                </div>
              </div>
              <Switch 
                checked={twoFactorEnabled} 
                onCheckedChange={handleToggleTwoFactor}
              />
            </div>
          </div>

          {/* Active Sessions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-medium text-foreground">Active sessions</h2>
                <p className="text-sm text-muted-foreground">
                  Devices where you're currently signed in
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setSignOutAllOpen(true)}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out all devices
              </Button>
            </div>
            
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-medium">Device</TableHead>
                    <TableHead className="font-medium">Location</TableHead>
                    <TableHead className="font-medium">Last active</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            {session.deviceType === "desktop" ? (
                              <Monitor className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Smartphone className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {session.device}
                              {session.current && (
                                <span className="ml-2 text-xs text-primary font-normal">
                                  This device
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {session.location}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {session.lastActive}
                      </TableCell>
                      <TableCell>
                        {!session.current && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleSignOutSession(session.id)}
                          >
                            <LogOut className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Audit Log */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-foreground">Audit log</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    View a history of account activity and security events
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/settings/audit-logs">View audit log</Link>
              </Button>
            </div>
          </div>

          {/* Security & Compliance Card */}
          <div className="border border-border/60 rounded-lg overflow-hidden bg-gradient-to-b from-card to-muted/20">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-foreground">Security & Compliance</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Docsora is built with enterprise-grade security and compliance.
                  </p>
                </div>
              </div>

              {/* Compliance Badges */}
              <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                  <BadgeCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">ISO 27001</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">SOC 2 Type II</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">GDPR Compliant</span>
                </div>
              </div>

              <Separator className="mb-5 bg-border/50" />

              <p className="text-sm text-muted-foreground mb-4">
                Your data is protected using industry-standard security controls, audited processes, and global privacy regulations.
              </p>

              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground h-auto p-0 font-normal"
              >
                Learn more about our security & compliance
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="currentPassword" className="text-sm font-medium mb-2 block">
                Current password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium mb-2 block">
                New password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium mb-2 block">
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>
              Update password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Setup 2FA Dialog */}
      <Dialog open={setupTwoFactorOpen} onOpenChange={setSetupTwoFactorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up two-factor authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center mb-4">
              <span className="text-xs text-muted-foreground">QR Code Placeholder</span>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Or enter this code manually:</p>
              <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded">
                XXXX-XXXX-XXXX-XXXX
              </code>
            </div>
          </div>
          <div>
            <Label htmlFor="verifyCode" className="text-sm font-medium mb-2 block">
              Verification code
            </Label>
            <Input
              id="verifyCode"
              placeholder="Enter 6-digit code"
              className="text-center tracking-widest"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSetupTwoFactorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetupTwoFactor}>
              <Check className="w-4 h-4 mr-2" />
              Verify and enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Out All Dialog */}
      <Dialog open={signOutAllOpen} onOpenChange={setSignOutAllOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Sign out all devices?
            </DialogTitle>
            <DialogDescription>
              This will sign you out from all devices except this one. You'll need to sign in again on other devices.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSignOutAllOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSignOutAll}>
              Sign out all devices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
