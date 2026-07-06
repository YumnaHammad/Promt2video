import Link from "next/link";
import { MarketingPage } from "@/components/marketing/marketing-page";

const posts = [
  {
    slug: "prompt-to-video-workflow",
    title: "From prompt to publish in under 10 minutes",
    excerpt: "A step-by-step walkthrough of our AI video pipeline.",
  },
  {
    slug: "template-marketplace",
    title: "Introducing the Template Store",
    excerpt: "Premium layouts you can buy once and reuse forever.",
  },
  {
    slug: "edge-tts-voiceover",
    title: "Free neural voiceover with Edge TTS",
    excerpt: "How we deliver studio voices without API keys.",
  },
];

export default function BlogPage() {
  return (
    <MarketingPage title="Blog" description="Tips, updates, and product news.">
      <div className="space-y-4 not-prose">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href="/changelog"
            className="block rounded-xl border border-border/50 p-5 transition-colors hover:border-border hover:bg-card/30"
          >
            <h2 className="text-lg font-semibold text-foreground">{post.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </MarketingPage>
  );
}
