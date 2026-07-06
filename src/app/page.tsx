import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { DemoVideo } from "@/components/landing/demo-video";
import { Features } from "@/components/landing/features";
import { TemplatesShowcase } from "@/components/landing/templates-showcase";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { getPublishedTemplates, mapTemplateRecord } from "@/lib/templates";
import type { TemplateListItem } from "@/lib/templates";

export const dynamic = "force-dynamic";

export default async function Home() {
  let showcaseTemplates: TemplateListItem[] = [];

  try {
    const { templates } = await getPublishedTemplates({ limit: 6 });
    showcaseTemplates = templates.map((template) => mapTemplateRecord(template));
  } catch {
    // DB may be unavailable during build or before first seed
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <DemoVideo />
        <Features />
        <TemplatesShowcase templates={showcaseTemplates} />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
