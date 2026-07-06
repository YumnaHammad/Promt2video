import { MarketingPage } from "@/components/marketing/marketing-page";

export default function SecurityPage() {
  return (
    <MarketingPage title="Security" description="How we protect your data.">
      <p>
        Prompt2Video uses encrypted connections, secure authentication, and
        isolated storage for user assets. API keys are encrypted at rest and
        never exposed in client-side code.
      </p>
      <p>
        We follow industry best practices for access control, audit logging, and
        infrastructure hardening. Report security issues to security@prompt2video.ai.
      </p>
    </MarketingPage>
  );
}
