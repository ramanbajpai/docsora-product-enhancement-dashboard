import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AddSeatsModal, SeatsAddedNudge } from "@/components/settings/AddSeatsModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Textarea } from "@/components/ui/textarea";
import { 
  UserPlus, MoreHorizontal, Copy, Check, Mail, Users, 
  Globe, Calendar, Shield, Crown, Lock, Sparkles,
  FileText, CreditCard, Settings, Send, RefreshCw, AlertCircle,
  Search, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  status: "Active" | "Invited" | "Suspended";
  lastActive: string;
  invitedDaysAgo?: number;
  avatar?: string;
}

const initialMembers: TeamMember[] = [
  { id: "1", name: "Alex Chen", email: "alex@company.com", role: "Owner", status: "Active", lastActive: "Now" },
  { id: "2", name: "Sarah Miller", email: "sarah@company.com", role: "Admin", status: "Active", lastActive: "2 hours ago" },
  { id: "3", name: "James Wilson", email: "james@company.com", role: "Member", status: "Active", lastActive: "Yesterday" },
  { id: "4", name: "Emma Davis", email: "emma@company.com", role: "Viewer", status: "Invited", lastActive: "—", invitedDaysAgo: 3 },
];

// Role permissions data
const rolePermissions = {
  Owner: {
    description: "Full control over workspace",
    permissions: [
      { icon: Users, label: "Manage all users and roles" },
      { icon: CreditCard, label: "Manage billing and subscriptions" },
      { icon: Settings, label: "Configure workspace settings" },
      { icon: FileText, label: "Access all documents and audit logs" },
      { icon: Send, label: "Send and sign documents" },
    ],
  },
  Admin: {
    description: "Elevated privileges for management",
    permissions: [
      { icon: Users, label: "Manage users (except Owner)" },
      { icon: Settings, label: "Configure workspace settings" },
      { icon: FileText, label: "Access audit logs" },
      { icon: Send, label: "Send and sign documents" },
    ],
  },
  Member: {
    description: "Standard workspace access",
    permissions: [
      { icon: FileText, label: "View and manage own documents" },
      { icon: Send, label: "Send and sign documents" },
    ],
  },
  Viewer: {
    description: "Read-only access",
    permissions: [
      { icon: FileText, label: "View shared documents only" },
    ],
  },
};

export default function Workspace() {
  const navigate = useNavigate();
  const [workspaceName, setWorkspaceName] = useState("Acme Corporation");
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("Member");
  const [inviteMessage, setInviteMessage] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Confirmation dialogs
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [memberToTransfer, setMemberToTransfer] = useState<TeamMember | null>(null);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const workspaceId = "ws_acme_8f3d2a1b";
  const workspaceRegion = "United States (US-East)";
  const workspaceCreated = "January 15, 2024";
  const workspaceOwner = members.find(m => m.role === "Owner");
  const currentUserRole: TeamMember["role"] = "Owner"; // Mock - would come from auth

  // Seat management
  const seatLimit = 5; // From plan
  const activeSeats = members.filter(m => m.status === "Active" || m.status === "Invited").length;
  const seatsRemaining = seatLimit - activeSeats;
  const isAtSeatLimit = seatsRemaining <= 0;
  const isNearSeatLimit = seatsRemaining === 1;

  // Add seats modal state
  const [addSeatsOpen, setAddSeatsOpen] = useState(false);
  const [showSeatsNudge, setShowSeatsNudge] = useState(false);
  const [highlightInviteButton, setHighlightInviteButton] = useState(false);

  // Handle seats added callback
  const handleSeatsAdded = () => {
    setShowSeatsNudge(true);
    setHighlightInviteButton(true);
    // Remove highlight after 5 seconds
    setTimeout(() => setHighlightInviteButton(false), 5000);
  };

  const canManageUsers = currentUserRole === "Owner" || currentUserRole === "Admin";
  const isOwner = currentUserRole === "Owner";

  // Filtered members with memoization for performance
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" || 
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower);
      
      // Role filter
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, roleFilter]);

  const hasActiveFilters = searchQuery !== "" || roleFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
  };

  const handleAddSeats = () => {
    setAddSeatsOpen(true);
  };

  const copyWorkspaceId = () => {
    navigator.clipboard.writeText(workspaceId);
    setCopied(true);
    toast.success("Workspace ID copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole as TeamMember["role"],
      status: "Invited",
      lastActive: "—",
      invitedDaysAgo: 0,
    };
    
    setMembers([...members, newMember]);
    setInviteEmail("");
    setInviteRole("Member");
    setInviteMessage("");
    setInviteOpen(false);
    toast.success("Invitation sent", { description: `Invite sent to ${inviteEmail}` });
  };

  const handleRoleChange = (memberId: string, newRole: TeamMember["role"]) => {
    setMembers(members.map(m => 
      m.id === memberId ? { ...m, role: newRole } : m
    ));
    toast.success("Role updated");
  };

  const handleSuspend = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    setMembers(members.map(m => 
      m.id === memberId ? { ...m, status: m.status === "Suspended" ? "Active" : "Suspended" } : m
    ));
    toast.success(member?.status === "Suspended" ? "Member reactivated" : "Member suspended");
  };

  const confirmRemove = (member: TeamMember) => {
    setMemberToRemove(member);
    setRemoveDialogOpen(true);
  };

  const handleRemove = () => {
    if (memberToRemove) {
      setMembers(members.filter(m => m.id !== memberToRemove.id));
      toast.success("Member removed", { description: `${memberToRemove.name} has been removed from the workspace` });
    }
    setRemoveDialogOpen(false);
    setMemberToRemove(null);
  };

  const handleResendInvite = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    setMembers(members.map(m => 
      m.id === memberId ? { ...m, invitedDaysAgo: 0 } : m
    ));
    toast.success("Invitation resent", { description: `New invite sent to ${member?.email}` });
  };

  const confirmTransferOwnership = (member: TeamMember) => {
    setMemberToTransfer(member);
    setTransferDialogOpen(true);
  };

  const handleTransferOwnership = () => {
    if (memberToTransfer) {
      setMembers(members.map(m => {
        if (m.id === memberToTransfer.id) return { ...m, role: "Owner" as const };
        if (m.role === "Owner") return { ...m, role: "Admin" as const };
        return m;
      }));
      toast.success("Ownership transferred", { description: `${memberToTransfer.name} is now the Workspace Owner` });
    }
    setTransferDialogOpen(false);
    setMemberToTransfer(null);
  };

  const getStatusBadge = (status: TeamMember["status"]) => {
    const styles = {
      Active: "bg-success/10 text-success border-success/20",
      Invited: "bg-warning/10 text-warning border-warning/20",
      Suspended: "bg-muted text-muted-foreground border-border",
    };
    return (
      <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", styles[status])}>
        {status}
      </span>
    );
  };

  const getRoleBadgeWithTooltip = (role: TeamMember["role"]) => {
    const styles = {
      Owner: "bg-primary/10 text-primary border-primary/20",
      Admin: "bg-foreground/5 text-foreground border-border",
      Member: "bg-foreground/5 text-muted-foreground border-border",
      Viewer: "bg-foreground/5 text-muted-foreground border-border",
    };
    
    const permissions = rolePermissions[role];
    
    return (
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium border cursor-help", styles[role])}>
            {role}
          </span>
        </HoverCardTrigger>
        <HoverCardContent className="w-72" align="start">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                {role === "Owner" && <Crown className="w-3.5 h-3.5 text-primary" />}
                {role === "Admin" && <Shield className="w-3.5 h-3.5 text-primary" />}
                {role}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">{permissions.description}</p>
            </div>
            <div className="space-y-1.5">
              {permissions.permissions.map((perm, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <perm.icon className="w-3 h-3 text-primary/70" />
                  <span>{perm.label}</span>
                </div>
              ))}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  const getLastActiveDisplay = (member: TeamMember) => {
    if (member.status === "Invited" && member.invitedDaysAgo !== undefined) {
      if (member.invitedDaysAgo === 0) {
        return <span className="text-muted-foreground/70">Invited today</span>;
      }
      return (
        <span className="text-muted-foreground/70">
          Invited {member.invitedDaysAgo} day{member.invitedDaysAgo !== 1 ? 's' : ''} ago
        </span>
      );
    }
    return <span className="text-muted-foreground">{member.lastActive}</span>;
  };

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-xl font-semibold text-foreground">Workspace & Team</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your workspace settings and team members
              </p>
            </div>

            {/* Workspace Info */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <div className="flex items-start gap-5 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="mb-3">
                    <Label htmlFor="workspaceName" className="text-sm font-medium text-foreground">
                      Workspace name
                    </Label>
                    <Input
                      id="workspaceName"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="max-w-sm mt-1.5"
                      disabled={!canManageUsers}
                    />
                  </div>
                  
                  {/* Workspace Owner */}
                  {workspaceOwner && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Crown className="w-3 h-3 text-primary" />
                      <span>Owned by <span className="text-foreground font-medium">{workspaceOwner.name}</span></span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
                <div>
                  <Label className="text-xs text-muted-foreground/70 mb-1 block">Workspace ID</Label>
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded truncate max-w-[120px]">
                      {workspaceId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyWorkspaceId}
                      className="h-6 w-6 p-0 text-foreground hover:bg-muted/30 hover:text-foreground flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-success" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground/70 mb-1 block">Plan tier</Label>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                    Pro Plan
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground/70 mb-1 block flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Data region
                  </Label>
                  <span className="text-xs text-foreground">{workspaceRegion}</span>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground/70 mb-1 block flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created
                  </Label>
                  <span className="text-xs text-muted-foreground">{workspaceCreated}</span>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="mb-6">
              {/* Premium Seats / Growth Card with Animated Glow */}
              <motion.div 
                className="relative p-5 rounded-xl mb-6 overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.02) 50%, hsl(var(--primary) / 0.06) 100%)",
                  }}
                  animate={{
                    background: [
                      "linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.02) 50%, hsl(var(--primary) / 0.06) 100%)",
                      "linear-gradient(135deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.08) 50%, hsl(var(--primary) / 0.04) 100%)",
                      "linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.02) 50%, hsl(var(--primary) / 0.06) 100%)",
                    ],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                
                {/* Inner glow from top */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.12), transparent)",
                  }}
                />
                
                {/* Outer glow effect */}
                <motion.div
                  className="absolute -inset-1 rounded-xl pointer-events-none"
                  animate={{
                    boxShadow: [
                      "0 0 20px 0 hsl(var(--primary) / 0.15), 0 0 40px -10px hsl(var(--primary) / 0.1)",
                      "0 0 30px 5px hsl(var(--primary) / 0.2), 0 0 60px -5px hsl(var(--primary) / 0.15)",
                      "0 0 20px 0 hsl(var(--primary) / 0.15), 0 0 40px -10px hsl(var(--primary) / 0.1)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Border glow */}
                <div className="absolute inset-0 rounded-xl border border-primary/25 pointer-events-none" />
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/8 to-primary/0 pointer-events-none"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 2,
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 hsl(var(--primary) / 0)",
                            "0 0 20px 2px hsl(var(--primary) / 0.2)",
                            "0 0 0 0 hsl(var(--primary) / 0)",
                          ],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Users className="w-5 h-5 text-primary" />
                      </motion.div>
                      <div>
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-lg font-semibold text-foreground">
                            {activeSeats} / {seatLimit} members active
                          </span>
                        </div>
                        <span className="text-sm font-medium text-amber-500 dark:text-amber-400">
                          {seatsRemaining} member slot{seatsRemaining !== 1 ? 's' : ''} remaining
                        </span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddSeats}
                      className={cn(
                        "relative inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg",
                        "text-sm font-semibold text-primary-foreground",
                        "bg-gradient-to-b from-primary to-primary/90",
                        "shadow-[0_2px_12px_-2px_hsl(var(--primary)/0.35),_0_1px_2px_0_hsl(var(--primary)/0.2)]",
                        "hover:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.45),_0_2px_4px_0_hsl(var(--primary)/0.25)]",
                        "transition-all duration-200",
                        "overflow-hidden group"
                      )}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 group-hover:opacity-100"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                          repeatDelay: 1,
                        }}
                      />
                      <UserPlus className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Add members</span>
                    </motion.button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 pl-[60px]">
                    Add more members to collaborate securely on Docsora in one workspace.
                  </p>
                </div>
              </motion.div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-medium text-foreground">Team members</h2>
                  <p className="text-sm text-muted-foreground">
                    {hasActiveFilters 
                      ? `${filteredMembers.length} of ${members.length} members`
                      : `${members.length} members`
                    }
                  </p>
                </div>
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <motion.div
                      animate={highlightInviteButton ? {
                        boxShadow: [
                          "0 0 0 0 hsl(var(--primary) / 0)",
                          "0 0 20px 4px hsl(var(--primary) / 0.4)",
                          "0 0 0 0 hsl(var(--primary) / 0)",
                        ],
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: highlightInviteButton ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                      className="rounded-lg"
                    >
                      <Button 
                        variant="outline" 
                        className={cn(
                          "h-10 px-5 rounded-lg text-sm font-medium transition-all duration-300",
                          highlightInviteButton && "border-primary ring-2 ring-primary/20 bg-primary/5"
                        )}
                        disabled={!canManageUsers}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite member
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Invite team member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your workspace
                      </DialogDescription>
                    </DialogHeader>
                    
                    {/* Seat Limit Warning */}
                    {isAtSeatLimit && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                        <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground font-medium">
                            You've reached your seat limit
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Add more seats to invite additional members.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 h-7 text-xs border-warning/30 text-warning hover:bg-warning/10 hover:text-warning"
                            onClick={() => {
                              setInviteOpen(false);
                              handleAddSeats();
                            }}
                          >
                            Add seats
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className={cn("space-y-4 py-4", isAtSeatLimit && "opacity-50 pointer-events-none")}>
                      <div>
                        <Label htmlFor="inviteEmail" className="text-sm font-medium mb-2 block">
                          Email address
                        </Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          placeholder="colleague@company.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          disabled={isAtSeatLimit}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole} disabled={isAtSeatLimit}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="inviteMessage" className="text-sm font-medium mb-2 block">
                          Personal message (optional)
                        </Label>
                        <Textarea
                          id="inviteMessage"
                          placeholder="Hey! I'd like you to join our workspace..."
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          className="resize-none"
                          rows={3}
                          disabled={isAtSeatLimit}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInvite} disabled={!inviteEmail || isAtSeatLimit}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send invite
                      </Button>
                    </DialogFooter>
                  </DialogContent>
              </Dialog>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="Owner">Owner</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>


                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                    Clear filters
                  </Button>
                )}
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-medium">Name</TableHead>
                      <TableHead className="font-medium">Role</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Last active</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <p className="text-sm text-muted-foreground">No matching team members found.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadgeWithTooltip(member.role)}</TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell className="text-sm">{getLastActiveDisplay(member)}</TableCell>
                        <TableCell>
                          {member.role !== "Owner" && canManageUsers ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-foreground hover:bg-muted/30 hover:text-foreground"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleRoleChange(member.id, "Admin")}>
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(member.id, "Member")}>
                                  Make Member
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(member.id, "Viewer")}>
                                  Make Viewer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {member.status === "Invited" && (
                                  <DropdownMenuItem onClick={() => handleResendInvite(member.id)}>
                                    <RefreshCw className="w-3.5 h-3.5 mr-2" />
                                    Resend invite
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleSuspend(member.id)}>
                                  {member.status === "Suspended" ? "Reactivate" : "Suspend"}
                                </DropdownMenuItem>
                                {isOwner && member.status === "Active" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => confirmTransferOwnership(member)}>
                                      <Crown className="w-3.5 h-3.5 mr-2" />
                                      Transfer ownership
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => confirmRemove(member)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  Remove member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : member.role === "Owner" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="h-8 w-8 flex items-center justify-center">
                                  <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Workspace Owner cannot be modified</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Future-Ready Indicators */}
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
                  <Sparkles className="w-3 h-3" />
                  <span>Advanced roles (coming soon)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
                  <Shield className="w-3 h-3" />
                  <span>SSO / SCIM provisioning (Enterprise)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Remove Member Confirmation */}
        <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove team member?</AlertDialogTitle>
              <AlertDialogDescription>
                {memberToRemove && (
                  <>
                    <span className="font-medium text-foreground">{memberToRemove.name}</span> will lose access to this workspace immediately. This action cannot be undone.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRemove}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Transfer Ownership Confirmation */}
        <AlertDialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Transfer workspace ownership?</AlertDialogTitle>
              <AlertDialogDescription>
                {memberToTransfer && (
                  <>
                    <span className="font-medium text-foreground">{memberToTransfer.name}</span> will become the new Workspace Owner with full control. You will be demoted to Admin. This action cannot be undone.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleTransferOwnership}>
                Transfer ownership
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipProvider>

      {/* Add Seats Modal */}
      <AddSeatsModal
        open={addSeatsOpen}
        onOpenChange={setAddSeatsOpen}
        currentSeats={seatLimit}
        seatsUsed={activeSeats}
        planName="Pro Plan"
        billingCycle="monthly"
        renewalDate="Feb 15, 2026"
        pricePerSeat={12}
        onSeatsAdded={handleSeatsAdded}
      />

      {/* Seats Added Nudge */}
      <SeatsAddedNudge
        show={showSeatsNudge}
        onDismiss={() => setShowSeatsNudge(false)}
      />
    </AppLayout>
  );
}
