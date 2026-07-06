"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  Command,
  Sparkles,
  PanelLeft,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/demo/user-menu";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMobileMenuOpen?: () => void;
}

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const { setCommandPaletteOpen, sidebarCollapsed, toggleSidebar } = useUIStore();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl md:gap-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMobileMenuOpen}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {sidebarCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={toggleSidebar}
          aria-label="Expand sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}

      <div className="flex flex-1 items-center gap-3">
        <motion.div
          animate={{ scale: searchFocused ? 1.01 : 1 }}
          className={cn(
            "relative hidden max-w-md flex-1 sm:block",
            searchFocused && "max-w-lg"
          )}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects, videos, templates..."
            className="h-9 cursor-pointer bg-muted/30 pl-9 pr-20"
            onFocus={() => {
              setSearchFocused(true);
              setCommandPaletteOpen(true);
            }}
            onBlur={() => setSearchFocused(false)}
            readOnly
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </motion.div>

        <Button
          variant="outline"
          size="sm"
          className="sm:hidden"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <Button
          variant="gradient"
          size="sm"
          className="hidden md:inline-flex"
          asChild
        >
          <a href="/create">
            <Sparkles className="h-4 w-4" />
            Create Video
          </a>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Open command palette"
        >
          <Command className="h-5 w-5" />
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}
