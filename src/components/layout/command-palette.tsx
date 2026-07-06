"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  LayoutTemplate,
  Store,
  Settings,
  KeyRound,
  CreditCard,
  Plus,
  Search,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const commands = [
  {
    group: "Navigation",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: "home overview" },
      { label: "Create Video", href: "/create", icon: Sparkles, keywords: "new generate" },
      { label: "Projects", href: "/projects", icon: FolderKanban, keywords: "folders" },
      { label: "Templates", href: "/templates", icon: LayoutTemplate, keywords: "presets" },
      { label: "Store", href: "/store", icon: Store, keywords: "marketplace buy" },
    ],
  },
  {
    group: "Settings",
    items: [
      { label: "Settings", href: "/settings", icon: Settings, keywords: "preferences profile" },
      { label: "API Keys", href: "/settings/api-keys", icon: KeyRound, keywords: "openai gemini" },
      { label: "Billing", href: "/billing", icon: CreditCard, keywords: "subscription plan" },
    ],
  },
  {
    group: "Actions",
    items: [
      { label: "New Video", href: "/create", icon: Plus, keywords: "create start" },
    ],
  },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    },
    [commandPaletteOpen, setCommandPaletteOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const navigate = (href: string) => {
    setCommandPaletteOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
        <Command
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3"
          loop
        >
          <div className="flex items-center border-b border-border/50 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Search commands, pages, actions..."
              className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            {commands.map((group) => (
              <Command.Group key={group.group} heading={group.group}>
                {group.items.map((item) => (
                  <Command.Item
                    key={`${group.group}-${item.label}`}
                    value={`${item.label} ${item.keywords}`}
                    onSelect={() => navigate(item.href)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                      "aria-selected:bg-accent aria-selected:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
          <div className="flex items-center justify-between border-t border-border/50 px-4 py-2 text-[10px] text-muted-foreground">
            <span>Navigate with ↑↓</span>
            <span>↵ to select</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
