import { Suspense } from "react";
import SignUpForm from "./SignUpForm";

export const dynamic = "force-dynamic";

export default function SignUp() {
  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      <Suspense
        fallback={
          <div className="h-[600px] w-full max-w-md animate-pulse rounded-2xl border border-(color-border) bg-(color-surface) p-8">
            <div className="mb-6 space-y-1">
              <div className="h-6 w-1/2 rounded" />
              <div className="h-4 w-1/3 rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-12 w-full rounded-xl" />
              <div className="h-12 w-full rounded-xl" />
              <div className="h-12 w-full rounded-xl" />
              <div className="h-12 w-full rounded-xl" />
              <div className="h-12 w-full rounded-xl" />
            </div>
          </div>
        }
      >
        <SignUpForm />
      </Suspense>
    </div>
  );
}
