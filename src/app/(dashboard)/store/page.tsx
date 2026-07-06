import { Suspense } from "react";
import { TemplatesBrowser } from "@/components/templates/templates-browser";
import { Loader2 } from "lucide-react";

function StoreFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<StoreFallback />}>
      <TemplatesBrowser
        mode="store"
        title="Template Store"
        description="Premium templates with cinematic layouts, motion graphics, and pro-grade transitions. Purchase once, use forever."
      />
    </Suspense>
  );
}
