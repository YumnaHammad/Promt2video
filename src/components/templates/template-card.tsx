"use client";

import Link from "next/link";
import { Clock, Film, Heart, Lock, Play, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatDuration } from "@/lib/utils";
import type { TemplateListItem } from "@/lib/templates";

const categoryColors: Record<string, string> = {
  Marketing: "from-violet-600/40 to-fuchsia-600/30",
  Education: "from-blue-600/40 to-cyan-600/30",
  "Social Media": "from-pink-600/40 to-rose-600/30",
  Social: "from-pink-600/40 to-rose-600/30",
  Corporate: "from-slate-600/40 to-zinc-600/30",
  Product: "from-amber-600/40 to-orange-600/30",
  Entertainment: "from-indigo-600/40 to-purple-600/30",
  News: "from-red-600/40 to-orange-600/30",
};

interface TemplateCardProps {
  template: TemplateListItem;
  onFavorite?: (templateId: string) => void;
  onUse?: (templateId: string) => void;
  onBuy?: (templateId: string) => void;
  showActions?: boolean;
  linkHref?: string;
}

export function TemplateCard({
  template,
  onFavorite,
  onUse,
  onBuy,
  showActions = true,
  linkHref,
}: TemplateCardProps) {
  const gradient =
    categoryColors[template.category] ?? "from-violet-600/40 to-fuchsia-600/30";
  const locked = template.isPremium && !template.canUse;

  const cardBody = (
    <Card className="group overflow-hidden border-border/50 bg-card/30 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-violet-500/5">
      <div
        className={cn(
          "relative aspect-video overflow-hidden bg-gradient-to-br",
          gradient
        )}
      >
        {template.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="absolute inset-0 size-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Play className="size-5 fill-white text-white" />
          </div>
        </div>

        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-md bg-black/40 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
            {template.category}
          </span>
          {template.isPremium && (
            <span className="inline-flex items-center gap-1 rounded-md bg-violet-600/80 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
              <Lock className="size-2.5" />
              Premium
            </span>
          )}
        </div>

        {onFavorite && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onFavorite(template.id);
            }}
            className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60"
            aria-label={
              template.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className={cn(
                "size-4",
                template.isFavorite && "fill-rose-400 text-rose-400"
              )}
            />
          </button>
        )}

        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 text-xs text-white/90 backdrop-blur-sm">
          <Clock className="size-3" />
          {formatDuration(template.duration)}
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{template.name}</CardTitle>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {template.rating.toFixed(1)}
          </span>
        </div>
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Film className="size-3" />
            {template.sceneCount} scenes
          </span>
          <span className="text-xs font-medium text-violet-400">
            {template.isPremium ? `$${template.price.toFixed(0)}` : "Free"}
          </span>
        </div>

        {showActions && (
          <div className="flex gap-2">
            {locked ? (
              <Button
                size="sm"
                variant="gradient"
                className="flex-1"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onBuy?.(template.id);
                }}
              >
                <ShoppingBag className="size-3.5" />
                Buy template
              </Button>
            ) : (
              <Button
                size="sm"
                variant="gradient"
                className="flex-1"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onUse?.(template.id);
                }}
              >
                Use template
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (linkHref) {
    return (
      <Link href={linkHref} className="block">
        {cardBody}
      </Link>
    );
  }

  return cardBody;
}
