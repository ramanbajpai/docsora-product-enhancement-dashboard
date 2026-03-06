import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  RefreshCw,
  PenTool,
  FolderOpen,
  Languages,
  Send,
  LayoutGrid,
  ChevronLeft,
  Moon,
  Sun,
  Settings,
  LogOut,
  ChevronUp,
  Zap,
  User,
  Users,
  CreditCard,
  HelpCircle,
  ArrowUpRight,
  Shield,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/useTheme";
import { AICheckIcon } from "@/components/icons/AICheckIcon";
import CompressIcon from "@/components/icons/CompressIcon";
import TrackIcon from "@/components/icons/TrackIcon";


// Logo imports
import logoLight from "@/assets/docsora-logo-light.png";
import logoDark from "@/assets/docsora-logo-dark.png";
import markLight from "@/assets/docsora-mark-light.png";
import markDark from "@/assets/docsora-mark-dark.png";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { title: "Dashboard", icon: Home, path: "/" },
  { title: "AI Check", icon: AICheckIcon, path: "/ai-check" },
  { title: "Compress", icon: CompressIcon, path: "/compress" },
  { title: "Convert", icon: RefreshCw, path: "/convert" },
  { title: "Sign", icon: PenTool, path: "/sign" },
  { title: "Storage", icon: FolderOpen, path: "/storage" },
  { title: "Track", icon: TrackIcon, path: "/track" },
  { title: "Translate", icon: Languages, path: "/translate" },
  { title: "Transfer", icon: Send, path: "/transfer" },
  { title: "Tools", icon: LayoutGrid, path: "/tools" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored === "true";
  });
  

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click (anywhere on the page) + close on scroll
  useEffect(() => {
    if (!profileOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const insideDropdown = !!profileDropdownRef.current?.contains(target);
      const insideTrigger = !!profileTriggerRef.current?.contains(target);

      // Temporary debug logging (dev only)
      if (import.meta.env.DEV) {
        const el = event.target as HTMLElement | null;
        console.debug("[ProfileDropdown] pointerdown", {
          insideDropdown,
          insideTrigger,
          tag: el?.tagName,
          id: el?.id,
          className: el?.className,
        });
      }

      if (insideDropdown || insideTrigger) return;
      setProfileOpen(false);
    };

    const handleScroll = (event: Event) => {
      if (import.meta.env.DEV) {
        console.debug("[ProfileDropdown] scroll -> close", event.target);
      }
      setProfileOpen(false);
    };

    // capture=true so it works even if something stops propagation
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [profileOpen]);

  // Close profile dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    if (profileOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [profileOpen]);

  // Close profile dropdown on route change
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="sidebar-glass h-screen flex flex-col shrink-0 relative z-10"
    >
      {/* Ambient gradient overlay - very subtle */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-r-2xl">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Right edge separator with glow */}
      <div className="absolute inset-y-0 right-0 w-px">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent blur-sm" />
      </div>

      {/* Logo Section - More breathing room */}
      <motion.div 
        className={cn(
          "relative flex items-center h-20 px-5",
          collapsed && "justify-center px-3"
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Link to="/" className="flex items-center group">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <AnimatePresence mode="wait">
              {collapsed ? (
                <motion.img
                  key="mark"
                  src={theme === "dark" ? markDark : markLight}
                  alt="Docsora"
                  className="w-10 h-10 object-contain"
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              ) : (
                <motion.img
                  key="logo"
                  src={theme === "dark" ? logoDark : logoLight}
                  alt="Docsora"
                  className="h-9 w-auto object-contain"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto scrollbar-none">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          
          const NavContent = (
            <Link
              to={item.path}
              className={cn(
                "sidebar-nav-item relative flex items-center gap-3 rounded-xl transition-all duration-200 group",
                collapsed ? "justify-center p-3.5" : "px-4 py-3",
                isActive
                  ? "sidebar-nav-item-active"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {/* Active indicator handled by CSS .sidebar-nav-item-active */}
              
              {/* Icon with hover animation */}
              <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                whileTap={{ scale: 0.95 }}
                animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <item.icon className={cn(
                  "w-[19px] h-[19px] shrink-0 transition-all duration-200",
                  isActive 
                    ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]" 
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                )} />
              </motion.div>
              
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "relative z-10 text-[13px] font-medium whitespace-nowrap",
                      isActive ? "text-primary" : ""
                    )}
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Badge */}
              {item.badge && !collapsed && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "relative z-10 ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                    isActive 
                      ? "bg-primary/20 text-primary" 
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {item.badge}
                </motion.span>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    {NavContent}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  sideOffset={16} 
                  className="font-medium text-xs px-3 py-2 rounded-lg bg-popover/95 backdrop-blur-sm border-border/50 shadow-xl"
                >
                  {item.title}
                  {item.badge && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-primary/20 text-primary font-semibold">
                      {item.badge}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              {NavContent}
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-2">
        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />

        {/* Theme Toggle */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <motion.button
              onClick={toggleTheme}
              className={cn(
                "sidebar-footer-btn w-full flex items-center gap-3 rounded-xl transition-all duration-200",
                collapsed ? "justify-center p-3.5" : "px-4 py-3",
                "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              whileHover={{ x: collapsed ? 0 : 3 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                initial={false}
                animate={{ 
                  rotate: theme === "dark" ? 180 : 0,
                  scale: 1
                }}
                whileHover={{ scale: 1.15, rotate: theme === "dark" ? 200 : 20 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "dark" ? (
                  <Sun className="w-[18px] h-[18px]" strokeWidth={1.75} />
                ) : (
                  <Moon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                )}
              </motion.div>
              {!collapsed && (
                <motion.span 
                  className="text-[13px] font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </motion.span>
              )}
            </motion.button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" sideOffset={16} className="text-xs">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </TooltipContent>
          )}
        </Tooltip>

        {/* Collapse Toggle */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "sidebar-footer-btn w-full flex items-center gap-3 rounded-xl transition-all duration-200",
                collapsed ? "justify-center p-3.5" : "px-4 py-3",
                "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              whileHover={{ x: collapsed ? 0 : 3 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                animate={{ rotate: collapsed ? 180 : 0 }}
                whileHover={{ scale: 1.15 }}
                transition={{ duration: 0.25 }}
              >
                <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </motion.div>
              {!collapsed && (
                <motion.span 
                  className="text-[13px] font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  Collapse
                </motion.span>
              )}
            </motion.button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" sideOffset={16} className="text-xs">
              Expand
            </TooltipContent>
          )}
        </Tooltip>

        {/* Profile - Grounded at bottom */}
        <div className="relative pt-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <motion.button ref={profileTriggerRef}
                onClick={() => setProfileOpen(!profileOpen)}
                className={cn(
                  "sidebar-profile w-full flex items-center gap-3 rounded-xl transition-all duration-200",
                  collapsed ? "justify-center p-3" : "px-3 py-2.5",
                  "hover:bg-sidebar-accent/50",
                  profileOpen && "bg-sidebar-accent/70"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className={cn(
                    "relative shrink-0",
                    "w-8 h-8 rounded-full",
                    "bg-foreground/[0.06]",
                    "flex items-center justify-center"
                  )}
                >
                  <span className="text-foreground/70 text-xs font-medium">AC</span>
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-medium text-sidebar-foreground truncate">Alex Chen</p>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/15 text-primary border border-primary/20 leading-none">PRO</span>
                      </div>
                      <p className="text-[11px] text-sidebar-foreground/40 truncate">alex@company.com</p>
                    </div>
                    <motion.div
                      animate={{ rotate: profileOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronUp className="w-4 h-4 text-sidebar-foreground/30" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={16} className="text-xs">
                Alex Chen
              </TooltipContent>
            )}
          </Tooltip>

          {/* Profile Dropdown - Premium Enhanced */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                ref={profileDropdownRef}
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
                className={cn(
                  "absolute z-[9999] overflow-hidden",
                  "bg-popover border border-border/60 rounded-lg shadow-lg shadow-black/[0.08]",
                  collapsed
                    ? "left-full ml-3 bottom-0 w-64"
                    : "left-2 right-2 bottom-full mb-2 w-auto"
                )}
              >
                {/* User Identity Section */}
                <div className="p-3 pb-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-foreground/[0.06] flex items-center justify-center text-sm font-medium text-foreground/70 flex-shrink-0">
                      AC
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-[13px] font-medium text-foreground truncate leading-tight">Alex Chen</p>
                      <p className="text-[12px] text-muted-foreground/70 truncate leading-tight mt-0.5">alex@company.com</p>
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium mt-1.5 border bg-primary/10 text-primary border-primary/20">
                        Pro Plan
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border/50 mx-3" />

                {/* Account Section */}
                <div className="py-1.5">
                  <a
                    href="/settings/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] rounded-md mx-1.5 text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] transition-colors duration-150"
                  >
                    <User className="w-4 h-4 text-muted-foreground/70" strokeWidth={1.5} />
                    Profile
                  </a>
                  <a
                    href="/settings/account"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] rounded-md mx-1.5 text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] transition-colors duration-150"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground/70" strokeWidth={1.5} />
                    Account settings
                  </a>
                </div>

                {/* Divider */}
                <div className="h-px bg-border/50 mx-3" />

                {/* Workspace Section */}
                <div className="py-1.5">
                  <a
                    href="/settings/workspace"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] rounded-md mx-1.5 text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] transition-colors duration-150"
                  >
                    <Users className="w-4 h-4 text-muted-foreground/70" strokeWidth={1.5} />
                    Workspace & Team
                  </a>
                  <a
                    href="/settings/billing"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] rounded-md mx-1.5 text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] transition-colors duration-150"
                  >
                    <CreditCard className="w-4 h-4 text-muted-foreground/70" strokeWidth={1.5} />
                    Billing & subscription
                  </a>
                  <a
                    href="/settings/security"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] rounded-md mx-1.5 text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] transition-colors duration-150"
                  >
                    <Shield className="w-4 h-4 text-muted-foreground/70" strokeWidth={1.5} />
                    Security
                  </a>
                  <a
                    href="/settings/audit-logs"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] rounded-md mx-1.5 text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] transition-colors duration-150"
                  >
                    <ScrollText className="w-4 h-4 text-muted-foreground/70" strokeWidth={1.5} />
                    Audit & Logs
                  </a>
                </div>

                {/* Divider */}
                <div className="h-px bg-border/50 mx-3" />

                {/* Support Section */}
                <div className="py-1.5">
                  <a
                    href="/settings/help"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] rounded-md mx-1.5 text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] transition-colors duration-150"
                  >
                    <HelpCircle className="w-4 h-4 text-muted-foreground/70" strokeWidth={1.5} />
                    Help & support
                  </a>
                </div>

                {/* Divider */}
                <div className="h-px bg-border/50 mx-3" />

                {/* Logout Section */}
                <div className="py-1.5 pb-2">
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] rounded-md mx-1.5 text-destructive/80 hover:text-destructive hover:bg-destructive/[0.05] transition-colors duration-150 w-[calc(100%-12px)]"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.aside>
  );
}