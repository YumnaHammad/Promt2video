"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  LayoutTemplate,
  ShoppingCart,
  Ticket,
  Clapperboard,
  Settings,
  ScrollText,
  Shield,
  ChevronLeft,
  X,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/render-queue", label: "Render Queue", icon: Clapperboard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isCollapsed = isMobile ? false : collapsed;

  const NavLink = ({
    href,
    label,
    icon: Icon,
    exact,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
  }) => {
    const isActive = exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

    return (
      <Link
        href={href}
        onClick={onMobileClose}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="admin-sidebar-active"
            className="absolute inset-0 rounded-lg bg-primary/10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
        <Icon className="relative z-10 h-5 w-5 shrink-0" />
        {(!isCollapsed || isMobile) && (
          <span className="relative z-10 truncate">{label}</span>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-[var(--header-height)] items-center border-b border-border/50 px-4",
          isCollapsed && !isMobile ? "justify-center" : "justify-between"
        )}
      >
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onMobileClose}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-600 shadow-lg shadow-red-500/25">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">Admin Panel</span>
              <span className="text-[10px] text-muted-foreground">Prompt2Video AI</span>
            </div>
          )}
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMobileClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {(!isCollapsed || isMobile) && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Management
          </p>
        )}
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-border/50 p-3">
        <Link
          href="/dashboard"
          onClick={onMobileClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          {(!isCollapsed || isMobile) && <span>Back to App</span>}
        </Link>
        {!isMobile && (
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            className={cn("w-full", !isCollapsed && "justify-start")}
            onClick={() => setCollapsed((c) => !c)}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isCollapsed && "rotate-180"
              )}
            />
            {!isCollapsed && <span>Collapse</span>}
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
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] border-r border-border/50 lg:hidden"
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
        width: isCollapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
      }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="glass sticky top-0 hidden h-screen shrink-0 border-r border-border/50 lg:block"
    >
      {sidebarContent}
    </motion.aside>
  );
}
