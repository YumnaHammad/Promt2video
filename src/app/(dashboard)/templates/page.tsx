import { Suspense } from "react";
import { TemplatesBrowser } from "@/components/templates/templates-browser";
import { Loader2 } from "lucide-react";

function TemplatesFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<TemplatesFallback />}>
      <TemplatesBrowser
        mode="templates"
        title="Templates"
        description="Browse free and premium video templates. Pick one, add your prompt, and generate a polished video in minutes."
      />
    </Suspense>
  );
}
