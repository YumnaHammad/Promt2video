import { MarketingPage } from "@/components/marketing/marketing-page";

export default function AboutPage() {
  return (
    <MarketingPage
      title="About Prompt2Video"
      description="We're building the fastest way to go from idea to polished video."
    >
      <p>
        Prompt2Video AI combines script writing, visual generation, voiceover,
        and Remotion-based rendering into one streamlined workflow. Creators,
        marketers, and teams use it to ship professional videos without a
        production crew.
      </p>
      <p>
        Our mission is simple: make studio-quality video creation accessible to
        everyone with a prompt and a few clicks.
      </p>
    </MarketingPage>
  );
}
