import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Settings, 
  Users, 
  CreditCard, 
  Shield,
  HelpCircle, 
  LogOut,
  ChevronDown,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileDropdownProps {
  userName?: string;
  userEmail?: string;
  plan?: "Free" | "Pro" | "Team" | "Enterprise";
}

// Dropdown items configuration
// Order: Profile, Account settings, Workspace & Team (conditional), Billing & subscription, Security, Help & support, Log out
const getDropdownItems = (plan: string) => {
  const items = [
    { icon: User, label: "Profile", href: "/settings/profile" },
    { icon: Settings, label: "Account settings", href: "/settings/account" },
  ];

  // Only show Workspace & Team for Team/Enterprise plans
  if (plan === "Team" || plan === "Enterprise") {
    items.push({ icon: Users, label: "Workspace & Team", href: "/settings/workspace" });
  }

  items.push(
    { icon: CreditCard, label: "Billing & subscription", href: "/settings/billing" },
    { icon: Shield, label: "Security", href: "/settings/security" },
    { icon: HelpCircle, label: "Help & support", href: "/settings/help" }
  );

  return items;
};

export function ProfileDropdown({ 
  userName = "User", 
  userEmail = "user@company.com",
  plan = "Pro"
}: ProfileDropdownProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const dropdownItems = getDropdownItems(plan);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const getPlanBadgeStyles = () => {
    switch (plan) {
      case "Pro":
        return "bg-primary/10 text-primary border-primary/20";
      case "Team":
        return "bg-primary/10 text-primary border-primary/20";
      case "Enterprise":
        return "bg-foreground/5 text-foreground border-foreground/10";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    navigate(href);
  };

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    href, 
    onClick 
  }: { 
    icon: typeof User; 
    label: string; 
    href?: string; 
    onClick?: () => void;
  }) => (
    <button
      onClick={() => {
        if (onClick) {
          onClick();
        }
        if (href) {
          handleNavigation(href);
        } else {
          setIsOpen(false);
        }
      }}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2 text-[13px] rounded-md mx-1.5",
        "text-foreground/80 hover:text-foreground",
        "hover:bg-foreground/[0.04] transition-colors duration-150",
        "cursor-pointer select-none"
      )}
      style={{ width: "calc(100% - 12px)" }}
    >
      <Icon className="w-4 h-4 text-muted-foreground/70" strokeWidth={1.5} />
      <span className="flex-1 text-left">{label}</span>
    </button>
  );

  return (
    <div className="relative">
      <motion.button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all duration-150",
          "hover:bg-foreground/[0.04]",
          isOpen && "bg-foreground/[0.04]"
        )}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-8 h-8 rounded-full bg-foreground/[0.06] flex items-center justify-center text-xs font-medium text-foreground/70">
          {getInitials(userName)}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[13px] font-medium text-foreground leading-tight">{userName}</p>
          <p className="text-[11px] text-muted-foreground/70 leading-tight">{plan} Plan</p>
        </div>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-200 hidden sm:block",
          isOpen && "rotate-180"
        )} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Invisible overlay to capture clicks anywhere - use high z-index */}
            <div 
              className="fixed inset-0 z-[9998]" 
              onPointerDown={() => setIsOpen(false)}
              aria-hidden="true"
              style={{ cursor: 'default' }}
            />
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "absolute right-0 top-full mt-1.5 z-[9999] w-64",
                "bg-popover border border-border/60 rounded-lg shadow-lg shadow-black/[0.08]",
                "overflow-hidden"
              )}
          >
            {/* User Identity Section */}
            <div className="p-3 pb-2.5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-foreground/[0.06] flex items-center justify-center text-sm font-medium text-foreground/70 flex-shrink-0">
                  {getInitials(userName)}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[13px] font-medium text-foreground truncate leading-tight">{userName}</p>
                  <p className="text-[12px] text-muted-foreground/70 truncate leading-tight mt-0.5">{userEmail}</p>
                  <div className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium mt-1.5 border",
                    getPlanBadgeStyles()
                  )}>
                    {plan} Plan
                  </div>
                </div>
              </div>
              
              {/* Upgrade CTA for Free users */}
              {plan === "Free" && (
                <button
                  onClick={() => handleNavigation("/settings/billing")}
                  className={cn(
                    "flex items-center justify-between w-full mt-3 px-3 py-2 rounded-md text-[12px] font-medium",
                    "bg-primary/[0.08] text-primary border border-primary/10",
                    "hover:bg-primary/[0.12] transition-colors duration-150"
                  )}
                >
                  <span>Upgrade to Pro</span>
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border/50 mx-3" />

            {/* Navigation Items */}
            <div className="py-1.5">
              {dropdownItems.map((item) => (
                <MenuItem key={item.label} {...item} />
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-border/50 mx-3" />

            {/* Logout Section */}
            <div className="py-1.5 pb-2">
              <button
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 text-[13px] rounded-md mx-1.5",
                  "text-destructive/80 hover:text-destructive",
                  "hover:bg-destructive/[0.05] transition-colors duration-150",
                  "cursor-pointer select-none"
                )}
                style={{ width: "calc(100% - 12px)" }}
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
