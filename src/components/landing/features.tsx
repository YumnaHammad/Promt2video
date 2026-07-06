"use client";

import { motion } from "framer-motion";
import {
  Wand2,
  Mic,
  Palette,
  Layers,
  Zap,
  Shield,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: Wand2,
    title: "Prompt to script",
    description:
      "Describe your video in natural language. Our AI writes a structured script with scenes, narration, and timing.",
    gradient: "from-violet-500/20 to-violet-600/5",
  },
  {
    icon: Palette,
    title: "AI-generated visuals",
    description:
      "Every scene gets custom visuals matched to your brand. Stock assets, AI images, and motion graphics included.",
    gradient: "from-fuchsia-500/20 to-fuchsia-600/5",
  },
  {
    icon: Mic,
    title: "Natural voiceover",
    description:
      "Choose from dozens of natural-sounding voices. Auto-synced captions and multi-language support built in.",
    gradient: "from-blue-500/20 to-blue-600/5",
  },
  {
    icon: Layers,
    title: "Professional templates",
    description:
      "Start from proven templates for product launches, tutorials, social ads, and more. Customize every detail.",
    gradient: "from-amber-500/20 to-amber-600/5",
  },
  {
    icon: Zap,
    title: "Lightning-fast rendering",
    description:
      "Powered by Remotion for pixel-perfect exports. 720p to 4K with priority queue for paid plans.",
    gradient: "from-emerald-500/20 to-emerald-600/5",
  },
  {
    icon: Shield,
    title: "Brand-safe output",
    description:
      "Brand kits, safe zones, and royalty-free assets ensure every export is on-brand and ready to publish.",
    gradient: "from-rose-500/20 to-rose-600/5",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-sm font-medium uppercase tracking-wider text-violet-400"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-3 text-fluid-3xl font-bold tracking-tight"
          >
            Everything you need to create videos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-4 text-fluid-base text-muted-foreground"
          >
            From first prompt to final export — one seamless workflow powered
            by the latest AI models.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <Card
      className={cn(
        "group relative h-full overflow-hidden border-border/50 bg-card/30 transition-all duration-300",
        "hover:border-border hover:bg-card/60 hover:shadow-lg hover:shadow-violet-500/5"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          feature.gradient
        )}
      />
      <CardHeader className="relative">
        <div className="mb-2 flex size-10 items-center justify-center rounded-xl border border-border/50 bg-background/50 transition-transform duration-300 group-hover:scale-110">
          <Icon className="size-5 text-violet-400" />
        </div>
        <CardTitle className="text-lg">{feature.title}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <CardDescription className="text-base leading-relaxed">
          {feature.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
