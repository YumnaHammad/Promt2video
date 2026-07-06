import { MarketingPage } from "@/components/marketing/marketing-page";

const updates = [
  {
    date: "July 2026",
    title: "Template Store & voice fallback",
    body: "Added premium template store, favorites, and more reliable Edge TTS voice generation.",
  },
  {
    date: "June 2026",
    title: "Video editor v1",
    body: "Scene timeline, voiceover controls, captions, and multi-platform export presets.",
  },
  {
    date: "May 2026",
    title: "Public beta launch",
    body: "AI script generation, asset pipeline, and Remotion rendering shipped to early users.",
  },
];

export default function ChangelogPage() {
  return (
    <MarketingPage title="Changelog" description="What's new in Prompt2Video.">
      <div className="space-y-8 not-prose">
        {updates.map((update) => (
          <div key={update.title} className="rounded-xl border border-border/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
              {update.date}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">{update.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{update.body}</p>
          </div>
        ))}
      </div>
    </MarketingPage>
  );
}
