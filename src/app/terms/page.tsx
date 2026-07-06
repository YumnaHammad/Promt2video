import { MarketingPage } from "@/components/marketing/marketing-page";

export default function TermsPage() {
  return (
    <MarketingPage title="Terms of Service" description="Last updated July 2026.">
      <p>
        By using Prompt2Video you agree to use the platform responsibly and
        comply with applicable laws. You retain rights to content you create;
        you grant us a license to process and store it to operate the service.
      </p>
      <p>
        Subscriptions renew automatically unless canceled. Template purchases
        are one-time licenses for use within the platform. Abuse, spam, or
        illegal content may result in account suspension.
      </p>
    </MarketingPage>
  );
}
