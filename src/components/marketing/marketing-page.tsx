import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";

interface MarketingPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
}

export function MarketingPage({
  title,
  description,
  children,
  ctaHref = "/dashboard",
  ctaLabel = "Start creating",
}: MarketingPageProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-wider text-violet-400">
            Prompt2Video
          </p>
          <h1 className="mt-3 text-fluid-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          <div className="prose prose-invert mt-10 max-w-none text-muted-foreground">
            {children}
          </div>
          <div className="mt-12">
            <Button variant="gradient" asChild>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
