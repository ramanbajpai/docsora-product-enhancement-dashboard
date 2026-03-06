import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Download, 
  Filter,
  ChevronDown,
  Calendar as CalendarIcon,
  ShieldCheck,
  User,
  FileText,
  CreditCard,
  Send,
  FolderOpen,
  PenTool,
  LogIn,
  LogOut,
  Key,
  Shield,
  UserPlus,
  UserMinus,
  Settings,
  Upload,
  Eye,
  Trash2,
  Edit,
  Lock,
  X,
  Monitor,
  Smartphone,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, isWithinInterval, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";

// Types
interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  actionType: "security" | "document" | "sign" | "billing" | "user" | "transfer" | "storage";
  resource: string;
  resourceType: string;
  ip: string;
  device: string;
  deviceType: "desktop" | "mobile";
  location: string;
  source: "Web" | "Mobile" | "API";
  status: "success" | "failure" | "warning";
}

// Mock data
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "1",
    timestamp: "2026-01-12T14:32:15Z",
    user: { name: "Alex Chen", email: "alex@company.com" },
    action: "Signed in",
    actionType: "security",
    resource: "Account",
    resourceType: "session",
    ip: "192.168.1.45",
    device: "Chrome on macOS",
    deviceType: "desktop",
    location: "San Francisco, CA",
    source: "Web",
    status: "success",
  },
  {
    id: "2",
    timestamp: "2026-01-12T14:28:00Z",
    user: { name: "Sarah Miller", email: "sarah@company.com" },
    action: "Uploaded file",
    actionType: "storage",
    resource: "Q4_Financial_Report.pdf",
    resourceType: "file",
    ip: "10.0.0.122",
    device: "Safari on iPhone",
    deviceType: "mobile",
    location: "New York, NY",
    source: "Mobile",
    status: "success",
  },
  {
    id: "3",
    timestamp: "2026-01-12T13:45:22Z",
    user: { name: "Alex Chen", email: "alex@company.com" },
    action: "Created sign request",
    actionType: "sign",
    resource: "Employment_Contract_2026.pdf",
    resourceType: "document",
    ip: "192.168.1.45",
    device: "Chrome on macOS",
    deviceType: "desktop",
    location: "San Francisco, CA",
    source: "Web",
    status: "success",
  },
  {
    id: "4",
    timestamp: "2026-01-12T12:15:00Z",
    user: { name: "James Wilson", email: "james@company.com" },
    action: "Document signed",
    actionType: "sign",
    resource: "NDA_Agreement.pdf",
    resourceType: "document",
    ip: "172.16.0.55",
    device: "Firefox on Windows",
    deviceType: "desktop",
    location: "Chicago, IL",
    source: "Web",
    status: "success",
  },
  {
    id: "5",
    timestamp: "2026-01-12T11:30:45Z",
    user: { name: "Emma Davis", email: "emma@company.com" },
    action: "Enabled 2FA",
    actionType: "security",
    resource: "Two-factor authentication",
    resourceType: "security",
    ip: "10.0.0.89",
    device: "Chrome on Windows",
    deviceType: "desktop",
    location: "Austin, TX",
    source: "Web",
    status: "success",
  },
  {
    id: "6",
    timestamp: "2026-01-12T10:22:30Z",
    user: { name: "Alex Chen", email: "alex@company.com" },
    action: "Added seat",
    actionType: "billing",
    resource: "Pro Plan",
    resourceType: "subscription",
    ip: "192.168.1.45",
    device: "Chrome on macOS",
    deviceType: "desktop",
    location: "San Francisco, CA",
    source: "Web",
    status: "success",
  },
  {
    id: "7",
    timestamp: "2026-01-11T16:45:00Z",
    user: { name: "Sarah Miller", email: "sarah@company.com" },
    action: "Sent transfer",
    actionType: "transfer",
    resource: "Project_Assets.zip (2.4 GB)",
    resourceType: "transfer",
    ip: "10.0.0.122",
    device: "Chrome on macOS",
    deviceType: "desktop",
    location: "New York, NY",
    source: "Web",
    status: "success",
  },
  {
    id: "8",
    timestamp: "2026-01-11T15:30:00Z",
    user: { name: "Alex Chen", email: "alex@company.com" },
    action: "Invited user",
    actionType: "user",
    resource: "newuser@company.com",
    resourceType: "user",
    ip: "192.168.1.45",
    device: "Chrome on macOS",
    deviceType: "desktop",
    location: "San Francisco, CA",
    source: "Web",
    status: "success",
  },
  {
    id: "9",
    timestamp: "2026-01-11T14:00:00Z",
    user: { name: "James Wilson", email: "james@company.com" },
    action: "Failed login attempt",
    actionType: "security",
    resource: "Account",
    resourceType: "session",
    ip: "203.0.113.42",
    device: "Unknown",
    deviceType: "desktop",
    location: "Unknown",
    source: "Web",
    status: "failure",
  },
  {
    id: "10",
    timestamp: "2026-01-11T12:20:00Z",
    user: { name: "Emma Davis", email: "emma@company.com" },
    action: "Downloaded file",
    actionType: "storage",
    resource: "Brand_Guidelines_v2.pdf",
    resourceType: "file",
    ip: "10.0.0.89",
    device: "Chrome on Windows",
    deviceType: "desktop",
    location: "Austin, TX",
    source: "Web",
    status: "success",
  },
  {
    id: "11",
    timestamp: "2026-01-11T10:15:00Z",
    user: { name: "Sarah Miller", email: "sarah@company.com" },
    action: "Changed password",
    actionType: "security",
    resource: "Account password",
    resourceType: "security",
    ip: "10.0.0.122",
    device: "Safari on iPhone",
    deviceType: "mobile",
    location: "New York, NY",
    source: "Mobile",
    status: "success",
  },
  {
    id: "12",
    timestamp: "2026-01-10T17:45:00Z",
    user: { name: "Alex Chen", email: "alex@company.com" },
    action: "Sign request declined",
    actionType: "sign",
    resource: "Vendor_Agreement.pdf",
    resourceType: "document",
    ip: "192.168.1.45",
    device: "Chrome on macOS",
    deviceType: "desktop",
    location: "San Francisco, CA",
    source: "Web",
    status: "warning",
  },
  {
    id: "13",
    timestamp: "2026-01-10T14:30:00Z",
    user: { name: "Alex Chen", email: "alex@company.com" },
    action: "Upgraded plan",
    actionType: "billing",
    resource: "Pro Plan → Teams Plan",
    resourceType: "subscription",
    ip: "192.168.1.45",
    device: "Chrome on macOS",
    deviceType: "desktop",
    location: "San Francisco, CA",
    source: "Web",
    status: "success",
  },
  {
    id: "14",
    timestamp: "2026-01-10T11:00:00Z",
    user: { name: "James Wilson", email: "james@company.com" },
    action: "File deleted",
    actionType: "storage",
    resource: "Old_Draft_v1.docx",
    resourceType: "file",
    ip: "172.16.0.55",
    device: "Firefox on Windows",
    deviceType: "desktop",
    location: "Chicago, IL",
    source: "Web",
    status: "success",
  },
  {
    id: "15",
    timestamp: "2026-01-09T16:20:00Z",
    user: { name: "Alex Chen", email: "alex@company.com" },
    action: "Updated workspace settings",
    actionType: "user",
    resource: "Acme Corporation",
    resourceType: "workspace",
    ip: "192.168.1.45",
    device: "Chrome on macOS",
    deviceType: "desktop",
    location: "San Francisco, CA",
    source: "Web",
    status: "success",
  },
];

const actionIcons: Record<string, React.ElementType> = {
  "Signed in": LogIn,
  "Signed out": LogOut,
  "Failed login attempt": XCircle,
  "Changed password": Key,
  "Enabled 2FA": Shield,
  "Disabled 2FA": Shield,
  "Uploaded file": Upload,
  "Downloaded file": Download,
  "File deleted": Trash2,
  "File renamed": Edit,
  "Created sign request": PenTool,
  "Document signed": CheckCircle2,
  "Sign request declined": XCircle,
  "Sign request expired": Clock,
  "Sign request cancelled": XCircle,
  "Sent transfer": Send,
  "Transfer received": Send,
  "Transfer expired": Clock,
  "Added seat": UserPlus,
  "Removed seat": UserMinus,
  "Upgraded plan": CreditCard,
  "Downgraded plan": CreditCard,
  "Payment failed": XCircle,
  "Invited user": UserPlus,
  "Removed user": UserMinus,
  "Changed user role": Settings,
  "Updated workspace settings": Settings,
  "Session terminated": LogOut,
  "Password added to file": Lock,
};

const productAreas = [
  { value: "all", label: "All areas" },
  { value: "security", label: "Security" },
  { value: "storage", label: "Storage" },
  { value: "sign", label: "Sign" },
  { value: "transfer", label: "Transfer" },
  { value: "billing", label: "Billing" },
  { value: "user", label: "User & Workspace" },
];

const actionTypes = [
  { value: "all", label: "All actions" },
  { value: "Signed in", label: "Login" },
  { value: "Signed out", label: "Logout" },
  { value: "Changed password", label: "Password change" },
  { value: "Enabled 2FA", label: "2FA enabled" },
  { value: "Uploaded file", label: "File upload" },
  { value: "Downloaded file", label: "File download" },
  { value: "File deleted", label: "File deleted" },
  { value: "Created sign request", label: "Sign request created" },
  { value: "Document signed", label: "Document signed" },
  { value: "Sign request declined", label: "Sign declined" },
  { value: "Sent transfer", label: "Transfer sent" },
  { value: "Invited user", label: "User invited" },
  { value: "Added seat", label: "Seat added" },
  { value: "Upgraded plan", label: "Plan upgrade" },
];

const datePresets = [
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 days" },
  { value: "30days", label: "Last 30 days" },
  { value: "90days", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

const users = [
  { value: "all", label: "All users" },
  { value: "alex@company.com", label: "Alex Chen" },
  { value: "sarah@company.com", label: "Sarah Miller" },
  { value: "james@company.com", label: "James Wilson" },
  { value: "emma@company.com", label: "Emma Davis" },
];

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [productArea, setProductArea] = useState("all");
  const [actionType, setActionType] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [datePreset, setDatePreset] = useState("30days");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(log => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" ||
        log.user.name.toLowerCase().includes(searchLower) ||
        log.user.email.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.resource.toLowerCase().includes(searchLower) ||
        log.ip.includes(searchQuery);

      // Product area filter
      const matchesArea = productArea === "all" || log.actionType === productArea;

      // Action type filter
      const matchesAction = actionType === "all" || log.action === actionType;

      // User filter
      const matchesUser = selectedUser === "all" || log.user.email === selectedUser;

      // Date filter
      let matchesDate = true;
      if (dateRange?.from && dateRange?.to) {
        const logDate = parseISO(log.timestamp);
        matchesDate = isWithinInterval(logDate, { start: dateRange.from, end: dateRange.to });
      }

      return matchesSearch && matchesArea && matchesAction && matchesUser && matchesDate;
    });
  }, [searchQuery, productArea, actionType, selectedUser, dateRange]);

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    
    switch (preset) {
      case "today":
        setDateRange({ from: today, to: today });
        break;
      case "7days":
        setDateRange({ from: subDays(today, 7), to: today });
        break;
      case "30days":
        setDateRange({ from: subDays(today, 30), to: today });
        break;
      case "90days":
        setDateRange({ from: subDays(today, 90), to: today });
        break;
      case "custom":
        // Keep current range, calendar will open
        break;
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setProductArea("all");
    setActionType("all");
    setSelectedUser("all");
    setDatePreset("30days");
    setDateRange({ from: subDays(new Date(), 30), to: new Date() });
  };

  const hasActiveFilters = searchQuery !== "" || productArea !== "all" || actionType !== "all" || selectedUser !== "all" || datePreset !== "30days";

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || FileText;
    return Icon;
  };

  const getStatusBadge = (status: AuditLogEntry["status"]) => {
    const styles = {
      success: "bg-success/10 text-success border-success/20",
      failure: "bg-destructive/10 text-destructive border-destructive/20",
      warning: "bg-warning/10 text-warning border-warning/20",
    };
    return styles[status];
  };

  const getAreaBadge = (area: AuditLogEntry["actionType"]) => {
    const labels: Record<string, string> = {
      security: "Security",
      document: "Document",
      sign: "Sign",
      billing: "Billing",
      user: "User",
      transfer: "Transfer",
      storage: "Storage",
    };
    return labels[area] || area;
  };

  const handleExport = (format: "csv" | "pdf") => {
    // Simulate export
    const fileName = `Docsora_Audit_Log_${format === "csv" ? "CSV" : "PDF"}_${format === "csv" ? ".csv" : ".pdf"}`;
    console.log(`Exporting ${filteredLogs.length} logs as ${format.toUpperCase()}:`, fileName);
    // In production, this would trigger actual file download
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Audit & Logs</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Complete audit trail of all workspace activity
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download audit log
                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <p className="text-xs text-muted-foreground">
                    Export respects active filters
                  </p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filters Bar */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users, actions, files, IPs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              {/* User Filter */}
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[160px] h-9">
                  <User className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.value} value={user.value}>
                      {user.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Product Area Filter */}
              <Select value={productArea} onValueChange={setProductArea}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="All areas" />
                </SelectTrigger>
                <SelectContent>
                  {productAreas.map((area) => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action Type Filter */}
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {datePreset === "custom" && dateRange?.from && dateRange?.to ? (
                      <span>{format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}</span>
                    ) : (
                      <span>{datePresets.find(p => p.value === datePreset)?.label}</span>
                    )}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b border-border">
                    <div className="flex flex-wrap gap-1.5">
                      {datePresets.map((preset) => (
                        <Button
                          key={preset.value}
                          variant={datePreset === preset.value ? "default" : "ghost"}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleDatePresetChange(preset.value)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {datePreset === "custom" && (
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  )}
                </PopoverContent>
              </Popover>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 text-muted-foreground hover:text-foreground"
                  onClick={clearFilters}
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Clear
                </Button>
              )}
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Showing:</span>
                <span className="text-xs font-medium text-foreground">
                  {filteredLogs.length} of {mockAuditLogs.length} entries
                </span>
              </div>
            )}
          </div>

          {/* Audit Log Table */}
          <div className="border border-border rounded-lg overflow-hidden mb-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/30">
                  <TableHead className="font-medium w-[180px]">Timestamp</TableHead>
                  <TableHead className="font-medium">User</TableHead>
                  <TableHead className="font-medium">Action</TableHead>
                  <TableHead className="font-medium">Resource</TableHead>
                  <TableHead className="font-medium w-[200px]">IP / Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">No audit logs found</p>
                        <p className="text-xs mt-1">Try adjusting your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const ActionIcon = getActionIcon(log.action);
                    return (
                      <TableRow key={log.id} className="group">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          <div>
                            {format(parseISO(log.timestamp), "MMM d, yyyy")}
                          </div>
                          <div className="text-muted-foreground/70">
                            {format(parseISO(log.timestamp), "HH:mm:ss")} UTC
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                              {log.user.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{log.user.name}</p>
                              <p className="text-xs text-muted-foreground">{log.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center",
                              log.status === "success" && "bg-muted",
                              log.status === "failure" && "bg-destructive/10",
                              log.status === "warning" && "bg-warning/10"
                            )}>
                              <ActionIcon className={cn(
                                "w-3.5 h-3.5",
                                log.status === "success" && "text-muted-foreground",
                                log.status === "failure" && "text-destructive",
                                log.status === "warning" && "text-warning"
                              )} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{log.action}</p>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 mt-0.5 font-normal">
                                {getAreaBadge(log.actionType)}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-foreground truncate max-w-[200px]" title={log.resource}>
                            {log.resource}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">{log.resourceType}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.deviceType === "desktop" ? (
                              <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                            ) : (
                              <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="text-xs text-foreground font-mono">{log.ip}</p>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Globe className="w-3 h-3" />
                                <span>{log.location}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-8">
            <span>Showing {filteredLogs.length} entries</span>
            <span className="text-xs">
              Logs retained for 2 years per compliance requirements
            </span>
          </div>

          {/* Compliance Footer */}
          <div className="border border-border/60 rounded-lg overflow-hidden bg-gradient-to-b from-card to-muted/20">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Immutable Audit Trail
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Audit logs are immutable and maintained for compliance with ISO 27001, SOC 2 Type II, and GDPR requirements. 
                    All entries are cryptographically secured and cannot be modified or deleted.
                  </p>
                </div>
              </div>

              <Separator className="my-4 bg-border/50" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">ISO 27001</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">SOC 2 Type II</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">GDPR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
