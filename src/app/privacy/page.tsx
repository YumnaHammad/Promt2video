import { MarketingPage } from "@/components/marketing/marketing-page";

export default function PrivacyPage() {
  return (
    <MarketingPage title="Privacy Policy" description="Last updated July 2026.">
      <p>
        We collect account information, usage data, and content you submit to
        generate videos. Your prompts and generated assets are stored to provide
        the service and improve reliability.
      </p>
      <p>
        We do not sell personal data. Third-party providers (AI, hosting,
        payments) process data only as needed to deliver the product. Contact
        privacy@prompt2video.ai for data requests.
      </p>
    </MarketingPage>
  );
}
