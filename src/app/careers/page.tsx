import Link from "next/link";
import { MarketingPage } from "@/components/marketing/marketing-page";

const roles = [
  {
    title: "Full-stack Engineer",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Product Designer",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Developer Advocate",
    location: "Remote",
    type: "Contract",
  },
];

export default function CareersPage() {
  return (
    <MarketingPage
      title="Careers"
      description="Join us in making video creation accessible to everyone."
      ctaHref="mailto:careers@prompt2video.ai"
      ctaLabel="Email us"
    >
      <div className="space-y-4 not-prose">
        {roles.map((role) => (
          <div
            key={role.title}
            className="flex flex-col gap-2 rounded-xl border border-border/50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="font-semibold text-foreground">{role.title}</h2>
              <p className="text-sm text-muted-foreground">
                {role.location} · {role.type}
              </p>
            </div>
            <Link
              href="mailto:careers@prompt2video.ai"
              className="text-sm font-medium text-violet-400 hover:text-violet-300"
            >
              Apply →
            </Link>
          </div>
        ))}
      </div>
    </MarketingPage>
  );
}
