"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "@/components/templates/template-card";
import type { TemplateListItem } from "@/lib/templates";

interface TemplatesShowcaseProps {
  templates: TemplateListItem[];
}

export function TemplatesShowcase({ templates }: TemplatesShowcaseProps) {
  return (
    <section id="templates" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-medium uppercase tracking-wider text-violet-400"
            >
              Templates
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-fluid-3xl font-bold tracking-tight"
            >
              Start with a proven template
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-fluid-base text-muted-foreground"
            >
              Professional designs for every use case. Customize with your
              prompt and brand in seconds.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button variant="outline" asChild>
              <Link href="/templates">Browse all templates</Link>
            </Button>
          </motion.div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {templates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <TemplateCard
                template={{ ...template, canUse: true }}
                showActions={false}
                linkHref={`/create?templateId=${template.id}`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
