import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, Star, Download, Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function AdminTemplatesPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const templates = await db.template.findMany({
    orderBy: { downloads: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      isPremium: true,
      isPublished: true,
      price: true,
      downloads: true,
      rating: true,
      sceneCount: true,
      duration: true,
      createdAt: true,
      _count: { select: { purchases: true, favorites: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-fluid-2xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Manage video templates, pricing, and visibility.
          </p>
        </div>
        <Button variant="gradient" disabled>
          <LayoutTemplate className="h-4 w-4" />
          Add Template
        </Button>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Template Catalog</CardTitle>
          <CardDescription>{templates.length} templates in store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Downloads</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr
                    key={template.id}
                    className="border-b border-border/30 transition-colors hover:bg-accent/30"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {template.sceneCount} scenes · {template.duration}s
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {template.category}
                    </td>
                    <td className="px-4 py-3">
                      {template.isPremium
                        ? formatCurrency(template.price)
                        : "Free"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        {template.downloads}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400" />
                        {template.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          template.isPublished
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {template.isPublished ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                        {template.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))}
                {templates.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No templates yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
