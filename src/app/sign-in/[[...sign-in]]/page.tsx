import DemoSignInPage from "./demo-sign-in";

const DEMO_MODE = process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default async function SignInPage() {
  if (DEMO_MODE) {
    return <DemoSignInPage />;
  }

  const { SignIn } = await import("@clerk/nextjs");
  return (
    <div className="aurora-bg flex min-h-screen items-center justify-center p-4">
      <SignIn
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
