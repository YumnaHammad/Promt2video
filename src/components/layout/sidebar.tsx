"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  LayoutTemplate,
  Store,
  Settings,
  KeyRound,
  CreditCard,
  ChevronLeft,
  Video,
  X,
  Home,
  Shield,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "Create", icon: Sparkles },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/store", label: "Store", icon: Store },
];

const bottomNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/api-keys", label: "API Keys", icon: KeyRound },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const demoUserId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("demo-user="))
      ?.split("=")[1];
    setIsAdmin(demoUserId === "demo_admin_user");
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onMobileClose?.();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, onMobileClose]);

  const collapsed = !isMobile && sidebarCollapsed;
  const showLabels = !collapsed || isMobile;

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const isActive =
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href));

    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        onClick={onMobileClose}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
          collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
          isActive
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-lg bg-primary/10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
        <Icon className="relative z-10 h-5 w-5 shrink-0" />
        <AnimatePresence mode="wait">
          {showLabels && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="relative z-10 truncate"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-[var(--header-height)] shrink-0 items-center border-b border-border/50 px-3",
          collapsed ? "justify-center" : "justify-between px-4"
        )}
      >
        <Link
          href="/dashboard"
          title="Dashboard"
          className={cn(
            "flex items-center gap-2.5",
            collapsed && "justify-center"
          )}
          onClick={onMobileClose}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-purple-500/25">
            <Video className="h-5 w-5 text-white" />
          </div>
          {showLabels && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex min-w-0 flex-col"
            >
              <span className="truncate text-sm font-bold tracking-tight">
                Prompt2Video
              </span>
              <span className="text-[10px] text-muted-foreground">AI Studio</span>
            </motion.div>
          )}
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMobileClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
        <div className="space-y-1">
          {showLabels && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Main
            </p>
          )}
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        <div className="mt-6 space-y-1">
          {showLabels && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </p>
          )}
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
      </nav>

      <div className="shrink-0 space-y-1 border-t border-border/50 p-3">
        <NavLink href="/" label="Back to site" icon={Home} />
        {isAdmin && (
          <NavLink href="/admin" label="Admin panel" icon={Shield} />
        )}

        {!isMobile && (
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className={cn("w-full", !collapsed && "justify-start")}
            onClick={toggleSidebar}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                collapsed && "rotate-180"
              )}
            />
            {!collapsed && <span>Collapse</span>}
          </Button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] border-r border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.aside
      animate={{
        width: collapsed
          ? "var(--sidebar-collapsed-width)"
          : "var(--sidebar-width)",
      }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="sticky top-0 z-20 hidden h-screen shrink-0 overflow-hidden border-r border-border/50 bg-card/40 backdrop-blur-xl lg:block"
    >
      {sidebarContent}
    </motion.aside>
  );
}
