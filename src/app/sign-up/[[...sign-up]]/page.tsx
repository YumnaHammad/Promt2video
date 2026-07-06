import { redirect } from "next/navigation";

const DEMO_MODE = process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default async function SignUpPage() {
  if (DEMO_MODE) {
    redirect("/sign-in");
  }

  const { SignUp } = await import("@clerk/nextjs");
  return (
    <div className="aurora-bg flex min-h-screen items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "glass border-border/50 shadow-2xl",
          },
        }}
      />
    </div>
  );
}
