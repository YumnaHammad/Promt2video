import { Suspense } from "react";
import CreatePage from "./create-form";

function CreateFallback() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-6 p-8">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-muted" />
      <div className="mx-auto h-8 w-48 rounded bg-muted" />
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );
}

export default function CreatePageWrapper() {
  return (
    <Suspense fallback={<CreateFallback />}>
      <CreatePage />
    </Suspense>
  );
}
