"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How does Prompt2Video work?",
    answer:
      "Simply describe your video idea in a text prompt. Our AI generates a script, selects or creates visuals, adds voiceover and captions, then renders a polished video ready for download. The entire process typically takes 2–5 minutes.",
  },
  {
    question: "What video formats and resolutions are supported?",
    answer:
      "We export MP4 videos in 16:9, 9:16, and 1:1 aspect ratios. Free plans include 720p exports. Starter plans unlock 1080p, and Pro plans support up to 4K resolution with priority rendering.",
  },
  {
    question: "Can I use my own AI API keys?",
    answer:
      "Yes! Pro and Enterprise plans let you bring your own API keys for OpenAI, Anthropic, Google, and other providers. This gives you full control over model selection and can reduce costs at scale.",
  },
  {
    question: "Are the assets royalty-free?",
    answer:
      "All stock assets, music, and AI-generated content included in your subscription are licensed for commercial use. Premium templates may have additional licensing terms listed on each template page.",
  },
  {
    question: "How do templates work?",
    answer:
      "Templates are pre-built video structures with designed scenes, transitions, and styling. Free templates are included with every plan. Premium templates can be purchased individually or accessed with a Pro subscription.",
  },
  {
    question: "Can I customize branding?",
    answer:
      "Pro plans include brand kits — upload your logo, colors, fonts, and intro/outro sequences. Enterprise plans add custom branding across the platform and white-label options.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Our Free plan gives you 5 videos per month with no credit card required. It's a full-featured trial of the platform with a watermark on exports. Upgrade anytime to remove limits and unlock premium features.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel anytime from your dashboard billing page. Your subscription remains active until the end of the billing period, and you won't be charged again. Exported videos remain yours forever.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium uppercase tracking-wider text-violet-400"
          >
            FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-fluid-3xl font-bold tracking-tight"
          >
            Frequently asked questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-fluid-base text-muted-foreground"
          >
            Everything you need to know about Prompt2Video.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Accordion.Root type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <Accordion.Item
                key={faq.question}
                value={`item-${i}`}
                className="overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm transition-colors data-[state=open]:border-border data-[state=open]:bg-card/50"
              >
                <Accordion.Header>
                  <Accordion.Trigger
                    className={cn(
                      "group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors",
                      "hover:text-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
                    )}
                  >
                    {faq.question}
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-violet-400" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {faq.answer}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </motion.div>
      </div>
    </section>
  );
}
