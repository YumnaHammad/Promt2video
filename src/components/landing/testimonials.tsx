"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  initials: string;
  rating: number;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "We went from spending days on video production to minutes. Prompt2Video has completely changed how our marketing team operates.",
    author: "Sarah Chen",
    role: "Head of Marketing",
    company: "Nexus AI",
    initials: "SC",
    rating: 5,
    gradient: "from-violet-500/10 to-fuchsia-500/5",
  },
  {
    quote:
      "The template library is incredible. I pick a style, write a prompt, and have a polished product demo ready for our landing page.",
    author: "Marcus Rivera",
    role: "Founder",
    company: "LaunchPad",
    initials: "MR",
    rating: 5,
    gradient: "from-blue-500/10 to-cyan-500/5",
  },
  {
    quote:
      "Being able to bring our own API keys on the Pro plan was a game-changer. Full control over quality and cost at enterprise scale.",
    author: "Emily Watson",
    role: "Creative Director",
    company: "Studio Eleven",
    initials: "EW",
    rating: 5,
    gradient: "from-amber-500/10 to-orange-500/5",
  },
  {
    quote:
      "Our social team creates 20+ short-form videos a week now. The AI voiceover and auto-captions alone save us hours every day.",
    author: "James Okonkwo",
    role: "Social Media Lead",
    company: "Brightwave",
    initials: "JO",
    rating: 5,
    gradient: "from-emerald-500/10 to-teal-500/5",
  },
  {
    quote:
      "I was skeptical about AI video tools, but the output quality genuinely surprised me. Clients can't tell it wasn't professionally edited.",
    author: "Lisa Park",
    role: "Agency Owner",
    company: "Pixel & Motion",
    initials: "LP",
    rating: 5,
    gradient: "from-rose-500/10 to-pink-500/5",
  },
  {
    quote:
      "The brand kit feature keeps everything on-brand across dozens of videos. It's like having a full production team in one tool.",
    author: "David Kim",
    role: "Brand Manager",
    company: "Orbit Commerce",
    initials: "DK",
    rating: 5,
    gradient: "from-indigo-500/10 to-violet-500/5",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/[0.02] via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium uppercase tracking-wider text-violet-400"
          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-fluid-3xl font-bold tracking-tight"
          >
            Loved by creators and teams
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-fluid-base text-muted-foreground"
          >
            See why thousands of marketers, founders, and agencies trust
            Prompt2Video.
          </motion.p>
        </div>

        <div className="mt-16 columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="mb-4 break-inside-avoid lg:mb-6"
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/50 bg-card/30 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-violet-500/5"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br",
          testimonial.gradient
        )}
      />
      <CardContent className="relative p-6">
        <Quote className="mb-3 size-5 text-violet-400/60" />
        <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
          &ldquo;{testimonial.quote}&rdquo;
        </p>

        <div className="mt-4 flex gap-0.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star
              key={i}
              className="size-3.5 fill-amber-400 text-amber-400"
            />
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-border/50 pt-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-semibold text-white">
            {testimonial.initials}
          </div>
          <div>
            <p className="text-sm font-medium">{testimonial.author}</p>
            <p className="text-xs text-muted-foreground">
              {testimonial.role} · {testimonial.company}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
