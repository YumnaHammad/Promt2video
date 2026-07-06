"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutTemplate, Loader2, Search, Store } from "lucide-react";
import { toast } from "sonner";
import { TemplateCard } from "@/components/templates/template-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TemplateListItem } from "@/lib/templates";

interface TemplatesBrowserProps {
  mode: "templates" | "store";
  title: string;
  description: string;
}

export function TemplatesBrowser({
  mode,
  title,
  description,
}: TemplatesBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [purchases, setPurchases] = useState<
    { id: string; amount: number; template: TemplateListItem }[]
  >([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "free" | "premium">(
    mode === "store" ? "premium" : "all"
  );

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category) params.set("category", category);
      if (filter === "premium") params.set("premium", "true");
      if (filter === "free") params.set("premium", "false");

      const res = await fetch(`/api/templates?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load templates");
      }

      setTemplates(data.templates);
      setCategories(data.categories ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load templates"
      );
    } finally {
      setLoading(false);
    }
  }, [search, category, filter]);

  useEffect(() => {
    const timer = setTimeout(fetchTemplates, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchTemplates, search]);

  useEffect(() => {
    if (mode !== "store") return;

    fetch("/api/templates/purchases")
      .then((res) => res.json())
      .then((data) => {
        if (data.purchases) {
          setPurchases(
            data.purchases.map(
              (purchase: {
                id: string;
                amount: number;
                template: TemplateListItem;
              }) => ({
                id: purchase.id,
                amount: purchase.amount,
                template: {
                  ...purchase.template,
                  tags: [],
                  aspectRatio: "16:9",
                  downloads: 0,
                  canUse: true,
                  isOwned: true,
                },
              })
            )
          );
        }
      })
      .catch(() => {
        // Non-blocking
      });
  }, [mode]);

  useEffect(() => {
    const purchased = searchParams.get("purchased");
    if (purchased) {
      toast.success("Template purchased!", {
        description: "You can now use it to create videos.",
      });
      router.replace(mode === "store" ? "/store" : "/templates");
    }
  }, [searchParams, router, mode]);

  const handleFavorite = async (templateId: string) => {
    try {
      const res = await fetch(`/api/templates/${templateId}/favorite`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update favorite");
      }

      setTemplates((current) =>
        current.map((template) =>
          template.id === templateId
            ? { ...template, isFavorite: data.isFavorite }
            : template
        )
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update favorite"
      );
    }
  };

  const handleUse = (templateId: string) => {
    router.push(`/create?templateId=${templateId}`);
  };

  const handleBuy = async (templateId: string) => {
    try {
      const res = await fetch(`/api/templates/${templateId}/checkout`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Checkout failed");
      }

      if (data.demo) {
        toast.success(data.message ?? "Template unlocked in demo mode");
        await fetchTemplates();
        if (mode === "store") {
          const purchasesRes = await fetch("/api/templates/purchases");
          const purchasesData = await purchasesRes.json();
          if (purchasesData.purchases) {
            setPurchases(
              purchasesData.purchases.map(
                (purchase: {
                  id: string;
                  amount: number;
                  template: TemplateListItem;
                }) => ({
                  id: purchase.id,
                  amount: purchase.amount,
                  template: {
                    ...purchase.template,
                    tags: [],
                    aspectRatio: "16:9",
                    downloads: 0,
                    canUse: true,
                    isOwned: true,
                  },
                })
              )
            );
          }
        }
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-3 py-1 text-xs text-muted-foreground">
            {mode === "store" ? (
              <Store className="size-3.5 text-violet-400" />
            ) : (
              <LayoutTemplate className="size-3.5 text-violet-400" />
            )}
            {mode === "store" ? "Premium marketplace" : "Template library"}
          </div>
          <h1 className="text-fluid-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        </div>

        {mode === "templates" && (
          <Button variant="outline" onClick={() => router.push("/store")}>
            <Store className="size-4" />
            Browse store
          </Button>
        )}
      </div>

      {mode === "store" && purchases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My purchases</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => (
              <TemplateCard
                key={purchase.id}
                template={purchase.template}
                onUse={handleUse}
                showActions
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "free", "premium"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                filter === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              {value === "all" ? "All" : value === "free" ? "Free" : "Premium"}
            </button>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              !category
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            All categories
          </button>
          {categories.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setCategory(item.name)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                category === item.name
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              {item.name} ({item.count})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/50 py-16 text-center">
          <LayoutTemplate className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-medium">No templates found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search or filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onFavorite={handleFavorite}
              onUse={handleUse}
              onBuy={handleBuy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
